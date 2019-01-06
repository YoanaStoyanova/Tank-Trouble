package bg.tank.trouble.server;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.corundumstudio.socketio.SocketIOServer;

public class Room {

	static final int ROOM_LIMIT = 2;

	Room(String name) {
		this.name = name;
		this.playerCnt = 0;

		this.grid = new Grid();
		this.players = new ArrayList<UUID>(ROOM_LIMIT);
		this.idToPlayerName = new HashMap<UUID, String>();
	}
	
	public int getPlayerCnt() {
		return playerCnt;
	}

	public Grid getGridInfo() {
		return grid;//.getGridJSON();
	}

	private int playerCnt;

	private String name;

	public String getName() {
		return name;
	}

	public boolean isReadyToStart() {
		/*
		 * Must be called in locked conditions
		 */
		return playerCnt == ROOM_LIMIT;
	}

	public void addPlayer(UUID playerId, String playerName) {
		/*
		 * Must be called in locked conditions
		 */
		players.add(playerId);
		++playerCnt;
		idToPlayerName.put(playerId, playerName);
	}

	public void startGame(SocketIOServer server) {
		System.out.println("Starting game");
		grid.changeToRunning();
		for (UUID playerId : players) {
			System.out.println("Sending playersReady from " + 
					playerId + " -> " + idToPlayerName.get(playerId));
			
			sendToOthers(playerId, server, "playersReady", idToPlayerName.get(playerId));
		}
	}

	public void sendToOthers(UUID sender, SocketIOServer server, String eventName, Object data) {
		server.getRoomOperations(name).getClients().forEach(client -> {
			if (!client.getSessionId().equals(sender)) {
				client.sendEvent(eventName, data);
			}
		});
	}
	
	public void removePlayer(UUID playerId) {
		/*
		 * Must be called in locked conditions
		 */
		if(!players.remove(playerId)) {
			System.out.println("Couldn't find player to remove: " + playerId);
		}
		--playerCnt;
	}

	private Grid grid;
	private ArrayList<UUID> players;
	private Map<UUID, String> idToPlayerName;
}
