package bg.tank.trouble.server;

import com.corundumstudio.socketio.*;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class TankTroubleSocketServer {

   private SocketIOServer server;
   private Map<UUID, Room> playerToRoom;
   private Map<UUID, Player> socketClientIdToPlayer;
   private Room currentRoom;

   TankTroubleSocketServer(Configuration cfg) {
      server = new SocketIOServer(cfg);
      addConnectionListener();
      addDisconnectListener();
      addPlayerMoveEventListener();
      addPlayerReadyEventListener();
      addFireBulletEventListener();
      addPlayerNameEventListener();
      addPlayerLeaveEventListener();
      addGameOverEventListener();

      currentRoom = new Room(UUID.randomUUID().toString());
      playerToRoom = new HashMap<>();
      socketClientIdToPlayer = new HashMap<>();
      server.start();

   }

   private void addConnectionListener() {
      server.addConnectListener(new ConnectListener() {
         public void onConnect(SocketIOClient socketIOClient) {
            /*
             * this handled adding client to a room before could be used later
             */

            System.out.println("Player: " + socketIOClient.getSessionId() + " connected");

            System.out.println("gridInfo: " + currentRoom.getGridInfo());
            socketIOClient.sendEvent("gridReady", currentRoom.getGridInfo());
         }
      });

   }

   private void addDisconnectListener() {
      server.addDisconnectListener(new DisconnectListener() {
         @Override
         public synchronized void onDisconnect(SocketIOClient client) {
            UUID clientId = client.getSessionId();

            System.out.println("disconnected: " + clientId);
            Room room = playerToRoom.get(clientId);
            if (room == null) {
               System.out.println("Room has been deleted");
            } else {
               room.removePlayer(clientId);
            }
            socketClientIdToPlayer.remove(clientId);
            playerToRoom.remove(clientId);
            /* references to this room should be 0 now so it must get destroyed */
         }
      });
   }

   private void addPlayerLeaveEventListener() {
      server.addEventListener("leave", String.class, new DataListener<String>() {
         public synchronized void onData(SocketIOClient client, String s, AckRequest ackRequest) throws Exception {
            System.out.println("left: " + client.getSessionId());
         }
      });
   }

   private void addPlayerReadyEventListener() {
      server.addEventListener("playerReady", String.class, new DataListener<String>() {
         public synchronized void onData(SocketIOClient socketIOClient, String s, AckRequest ackRequest)
               throws Exception {
            /*
             * maybe we can give the responsibility for that socket to the room it is in.
             * Client socket object is limited though and we can't give it handlers
             */

            /*
             * consider using s for player identification in the playerToRoom map
             */

            UUID clientId = socketIOClient.getSessionId();
            if (socketClientIdToPlayer.get(clientId) == null) {
               System.out.println("No record for player " + clientId);
               return;
            }

            currentRoom.addPlayer(clientId, socketClientIdToPlayer.get(clientId).getName());

            /*
             * Start from 1 since client side expects starting from 1
             */
            socketIOClient.sendEvent("playerId", currentRoom.getPlayerCnt());

            System.out.println("Player: " + clientId + " is ready");
            playerToRoom.put(clientId, currentRoom);
            socketIOClient.joinRoom(currentRoom.getName());
            // try returning JSONObject directly; maybe needs to be String-ed

            if (currentRoom.isReadyToStart()) {
               currentRoom.startGame(server);
               currentRoom = new Room(UUID.randomUUID().toString());
            }
         }
      });
   }

   private void addPlayerNameEventListener() {
      server.addEventListener("playerName", Player.class, new DataListener<Player>() {
         public synchronized void onData(SocketIOClient socketIOClient, Player player, AckRequest ackRequest)
               throws Exception {
            /*
             * The need to remember the names here is coming from the fact that this event
             * is sent before the 'playerReady' event
             *
             * This means that if we get playerReady but we have no entry for the player
             * name something is really fkd up
             */

            System.out.println("Got playerName from: " + player.getName() + " id: " + player.getId() + " totalScore " + player.getTotalScore());
            socketClientIdToPlayer.put(socketIOClient.getSessionId(), player);
         }
      });
   }

   private void addPlayerMoveEventListener() {
      server.addEventListener("playerMove", PlayerMove.class, new DataListener<PlayerMove>() {
         public void onData(SocketIOClient socketIOClient, PlayerMove playerMove, AckRequest ackRequest)
               throws Exception {
            Room room = playerToRoom.get(socketIOClient.getSessionId());

            if (room == null) {
               System.out.println("Room has been deleted");
               return;
            }
            room.sendToOthers(socketIOClient.getSessionId(), server, "playerMove", playerMove);
         }
      });
   }

   private void addFireBulletEventListener() {
      server.addEventListener("fireBullet", FireCoords.class, new DataListener<FireCoords>() {
         public void onData(SocketIOClient socketIOClient, FireCoords fireCoords, AckRequest ackRequest) throws Exception {
            Room room = playerToRoom.get(socketIOClient.getSessionId());
            System.out.println("Firing bullet from:" + socketIOClient.getSessionId());
            room.sendToOthers(socketIOClient.getSessionId(), server, "fireBullet", fireCoords);
         }
      });
   }

   private void addGameOverEventListener() {
      server.addEventListener("gameOver", DeadPlayer.class, new DataListener<DeadPlayer>() {
         @Override
         public void onData(SocketIOClient socketIOClient, DeadPlayer deadPlayer, AckRequest ackRequest) throws Exception {
            System.out.println("GAME OVEEER");
            System.out.println(deadPlayer.getId() + " " + deadPlayer.getKey());
            Room room = playerToRoom.get(socketIOClient.getSessionId());

            UUID winnerId = room.getOtherPlayers(socketIOClient.getSessionId(), server).get(0);
            System.out.println("winner uuid: " + winnerId);
            Player winner = socketClientIdToPlayer.get(winnerId);
            System.out.println("Winner player info " + winner.getName() +" " +  winner.getTotalScore());
            winner.setTotalScore(winner.getTotalScore() + 1);
            DBConnector.saveOrUpdate(winner);
            room.sendBroadCastEvent(server,"endOfGame", deadPlayer);
         }
      });
   }

   @Override
   public void finalize() {
      server.getAllClients().clear();
      server.stop();
   }
}
