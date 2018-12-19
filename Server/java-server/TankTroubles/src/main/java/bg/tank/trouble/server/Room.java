package bg.tank.trouble.server;

public class Room {

    Room(int roomLimit, String name) {
        this.roomLimit = roomLimit;
        this.name = name;
        playerCnt = 1;
    }

    private int roomLimit;

    private int playerCnt;

    private String name;

    public String getName() {
        return name;
    }

    public boolean tryToJoin() {
        if (playerCnt < roomLimit) {
            playerCnt++;
            return true;
        }
        return false;
    }
}
