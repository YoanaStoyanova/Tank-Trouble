package bg.tank.trouble.server;

import com.corundumstudio.socketio.*;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class TankTroubleSocketServer {

    static final int ROOM_LIMIT = 2;
    private SocketIOServer server;

    private Map<UUID, Room> playerToRoom;

    private Room currentRome;

    TankTroubleSocketServer(Configuration cfg) {
        server = new SocketIOServer(cfg);
        addConnectionListener();
        addPlayerMoveEventListener();
        currentRome = null;
        playerToRoom = new HashMap<UUID, Room>();
        server.start();

    }

    private void addConnectionListener() {
        server.addConnectListener(new ConnectListener() {
            public void onConnect(SocketIOClient socketIOClient) {

                if (currentRome == null || !currentRome.tryToJoin()) {
                    currentRome = new Room(ROOM_LIMIT, UUID.randomUUID().toString());
                }

                playerToRoom.put(socketIOClient.getSessionId(), currentRome);
                socketIOClient.joinRoom(currentRome.getName());
            }
        });
    }

    private void addPlayerMoveEventListener() {
        server.addEventListener("playerMove", PlayerMove.class, new DataListener<PlayerMove>() {
            public void onData(SocketIOClient socketIOClient, PlayerMove playerMove, AckRequest ackRequest) throws Exception {
                // System.out.println("playerMove");
                //System.out.println(playerMove.getAngle() + ' ' + playerMove.getPlayer() + " " + playerMove.getCoords().getX() + " " + playerMove.getCoords().getY());
                Room room = playerToRoom.get(socketIOClient.getSessionId());
                server.getRoomOperations(room.getName()).sendEvent("update", "CHLEN");
                System.out.println("player " + socketIOClient.getSessionId()
                        + " moves in room " + room.getName());
            }
        });
    }

    @Override
    public void finalize() {
        server.getAllClients().clear();
        server.stop();
    }
}
