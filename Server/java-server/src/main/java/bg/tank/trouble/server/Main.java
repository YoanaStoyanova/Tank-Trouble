package bg.tank.trouble.server;

import com.corundumstudio.socketio.Configuration;

import java.io.IOException;

public class Main {

    public static void main(String[] args) throws IOException {

        Configuration httpConfig = new Configuration();
        httpConfig.setHostname(args[0]);
        httpConfig.setPort(8080);

        Configuration socketConfig = new Configuration();
        socketConfig.setHostname(args[0]);
        socketConfig.setPort(6969);

        /* set multithreading configuration */
        socketConfig.setBossThreads(1);
        socketConfig.setWorkerThreads(Runtime.getRuntime().availableProcessors() - 1);

        System.out.println(Runtime.getRuntime().availableProcessors() - 1);

        TankTroubleHttpServer httpServer = new TankTroubleHttpServer(httpConfig);

        TankTroubleSocketServer socketServer = new TankTroubleSocketServer(socketConfig);


    }
}
