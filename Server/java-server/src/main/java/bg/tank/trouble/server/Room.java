package bg.tank.trouble.server;

public class Room {

    static final int ROOM_LIMIT = 2;
    
    Room(String name) {
        this.name = name;
        this.playerCnt = 1;
        
        this.grid = new Grid();
    }

    private int playerCnt;

    private String name;
    

    public String getName() {
        return name;
    }

    public boolean tryToJoin() {
        if (playerCnt < ROOM_LIMIT) {
            playerCnt++;
            return true;
        }
        return false;
    }
    
    private Grid grid;
}
