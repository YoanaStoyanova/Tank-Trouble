package bg.tank.trouble.server;

import com.corundumstudio.socketio.Configuration;

import java.io.IOException;

public class Main {

    public static void main(String[] args) throws IOException {

        Configuration httpConfig = new Configuration();
        httpConfig.setHostname("localhost");
        httpConfig.setPort(8080);

        Configuration socketConfig = new Configuration();
        socketConfig.setHostname("localhost");
        socketConfig.setPort(6969);

        TankTroubleHttpServer httpServer = new TankTroubleHttpServer(httpConfig);

        TankTroubleSocketServer socketServer = new TankTroubleSocketServer(socketConfig);


    }
}
