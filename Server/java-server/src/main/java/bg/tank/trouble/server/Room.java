package bg.tank.trouble.server;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

import com.corundumstudio.socketio.SocketIOClient;
import org.json.JSONObject;

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
            sendToOthers(playerId, server, "playersReady", playerId);
        }
    }

    public void sendToOthers(UUID sender, SocketIOServer server, String eventName, Object data) {
        System.out.println("PlayersReady");
        Collection<SocketIOClient> clients1 = server.getRoomOperations(name).getClients();
        for (SocketIOClient client : clients1) {
            System.out.println("Client : " + client.getSessionId());
        }

        server.getRoomOperations(name).getClients()
                .forEach(client -> {{
                    if(!client.getSessionId().equals(sender)){
                        System.out.println("Sending to fuckign stupid client");
                        client.sendEvent(eventName, data);
                    }
                }
                });
    }

    private Grid grid;
    private UUID players[];
}
