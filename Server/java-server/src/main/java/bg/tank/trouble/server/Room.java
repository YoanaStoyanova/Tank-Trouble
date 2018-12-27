package bg.tank.trouble.server;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

import com.corundumstudio.socketio.SocketIOClient;
import org.json.JSONObject;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;

public class Room {

    static final int ROOM_LIMIT = 2;

    Room(String name) {
        this.name = name;
        this.playerCnt = 0;

        this.grid = new Grid();
        this.players = new UUID[ROOM_LIMIT];
    }


    public JSONObject getGridInfo() {
        return grid.getGridJSON();
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


    public void addPlayer(UUID playerId) {
        /*
         * Must be called in locked conditions
         */
        players[playerCnt++] = playerId;
    }

    public void startGame(SocketIOServer server) {
    	System.out.println("Starting game");
    	grid.changeToRunning();
    	for (UUID playerId : players) {
    		System.out.println("Sending playersReady from " + playerId);
			sendToOthers(playerId, server, "playersReady", playerId);
		}
    }

    public void sendToOthers(UUID sender, SocketIOServer server, String eventName, Object data) {    	
      server.getRoomOperations(name).getClients().forEach(client -> {
			if (!client.getSessionId().equals(sender)) {
				client.sendEvent(eventName, data);
			}
      });
    }

    private Grid grid;
    private UUID players[];
}
