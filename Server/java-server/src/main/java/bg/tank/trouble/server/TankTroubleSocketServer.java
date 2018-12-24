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
		currentRoom = null;
		playerToRoom = new HashMap<UUID, Room>();
		server.start();

	}

	private synchronized void addConnectionListener() {
		server.addConnectListener(new ConnectListener() {
			public void onConnect(SocketIOClient socketIOClient) {
				if (currentRoom == null || !currentRoom.tryToJoin()) {
					currentRoom = new Room(UUID.randomUUID().toString());
				}

				/* 
				 * maybe we can give the responsibility for that socket to
				 * the room it is in. Client socket object is limited though
				 * and we can't give it handlers
				 */
				playerToRoom.put(socketIOClient.getSessionId(), currentRoom);
				socketIOClient.joinRoom(currentRoom.getName());
			}
		});
	}

	private void addPlayerReadyEventListener() {
		server.addEventListener("playerReady", String.class, new DataListener<String>() {
			public void onData(SocketIOClient socketIOClient, String s, AckRequest ackRequest) throws Exception {

			}
		});
	}

	private void addPlayerMoveEventListener() {
		server.addEventListener("playerMove", PlayerMove.class, new DataListener<PlayerMove>() {
			public void onData(SocketIOClient socketIOClient, PlayerMove playerMove, AckRequest ackRequest)
					throws Exception {
				// System.out.println("playerMove");
				// System.out.println(playerMove.getAngle() + ' ' + playerMove.getPlayer() + " "
				// + playerMove.getCoords().getX() + " " + playerMove.getCoords().getY());
				Room room = playerToRoom.get(socketIOClient.getSessionId());
				server.getRoomOperations(room.getName()).sendEvent("update", "CHLEN");
				System.out.println("player " + socketIOClient.getSessionId() + " moves in room " + room.getName());
			}
		});
	}

	@Override
	public void finalize() {
		server.getAllClients().clear();
		server.stop();
	}
}
