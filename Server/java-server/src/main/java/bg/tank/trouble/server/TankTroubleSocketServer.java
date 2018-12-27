package bg.tank.trouble.server;

import com.corundumstudio.socketio.*;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class TankTroubleSocketServer {

	private SocketIOServer server;
	private Map<UUID, Room> playerToRoom;
	private Room currentRoom;

	TankTroubleSocketServer(Configuration cfg) {
		server = new SocketIOServer(cfg);
		addConnectionListener();
		addPlayerMoveEventListener();
		addPlayerReadyEventListener();
		addFireBulletEventListener();
		currentRoom = new Room(UUID.randomUUID().toString());
		playerToRoom = new HashMap<UUID, Room>();
		server.start();

	}

	private void addConnectionListener() {
		server.addConnectListener(new ConnectListener() {
			public void onConnect(SocketIOClient socketIOClient) {
				/*
				 * this handled adding client to a room before
				 * could be used later 
				 */

				System.out.println("Player: " + socketIOClient.getSessionId() + " connected");
				socketIOClient.sendEvent("gridReady", currentRoom.getGridInfo());
			}
		});
		
		
	}

	private synchronized void addPlayerReadyEventListener() {
		server.addEventListener("playerReady", String.class, new DataListener<String>() {
			public void onData(SocketIOClient socketIOClient, String s, AckRequest ackRequest) throws Exception {
				/* 
				 * maybe we can give the responsibility for that socket to
				 * the room it is in. Client socket object is limited though
				 * and we can't give it handlers
				 */
	
				/*
				 * consider using s for player identification in the playerToRoom map
				 */
				currentRoom.addPlayer(socketIOClient.getSessionId());
				System.out.println("Player: " + socketIOClient.getSessionId() + " is ready");
				playerToRoom.put(socketIOClient.getSessionId(), currentRoom);
				socketIOClient.joinRoom(currentRoom.getName());
				// try returning JSONObject directly; maybe needs to be String-ed

				
				if (currentRoom.isReadyToStart()) {
					currentRoom.startGame(server);
					currentRoom = new Room(UUID.randomUUID().toString());
				}
			}
		});
	}

	private void addPlayerMoveEventListener() {
		server.addEventListener("playerMove", PlayerMove.class, new DataListener<PlayerMove>() {
			public void onData(SocketIOClient socketIOClient, PlayerMove playerMove, AckRequest ackRequest)
					throws Exception {
				Room room = playerToRoom.get(socketIOClient.getSessionId());
				room.sendToOthers(socketIOClient.getSessionId(), server, "playerMove", playerMove);
				System.out.println("player " + socketIOClient.getSessionId() + " moves in room " + room.getName());
			}
		});
	}
	
	private void addFireBulletEventListener() {
		server.addEventListener("fireBullet", String.class, new DataListener<String>() {
			public void onData(SocketIOClient socketIOClient, String s, AckRequest ackRequest)
					throws Exception {
				// System.out.println("playerMove");
				// System.out.println(playerMove.getAngle() + ' ' + playerMove.getPlayer() + " "
				// + playerMove.getCoords().getX() + " " + playerMove.getCoords().getY());
				Room room = playerToRoom.get(socketIOClient.getSessionId());
				room.sendToOthers(socketIOClient.getSessionId(), server, "fireBullet", "");
				System.out.println("player " + socketIOClient.getSessionId() + " fired in room " + room.getName());
				
			}
		});
	}

	@Override
	public void finalize() {
		server.getAllClients().clear();
		server.stop();
	}
}
