package bg.tank.trouble.server;

import java.io.FileInputStream;

public class FireCoords {

    private Double x;

    private Double y;

    private Double angle;

    private Boolean isPlayerOne;

    public FireCoords() {

    }

    public Double getX() {
        return x;
    }

    public Double getY() {
        return y;
    }

    public Double getAngle() {
        return angle;
    }

    public Boolean getIsPlayerOne() {
        return isPlayerOne;
    }

    public void setX(Double x) {
        this.x = x;
    }

    public void setY(Double y) {
        this.y = y;
    }

    public void setAngle(Double angle) {
        this.angle = angle;
    }

    public void setIsPlayerOne(Boolean isPlayerOne) {
        this.isPlayerOne = isPlayerOne;
    }
}
