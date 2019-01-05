package bg.tank.trouble.server;

import com.corundumstudio.socketio.Configuration;

import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;

public class Main {

    public static void main(String[] args) throws IOException, UnrecoverableKeyException, CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {

        Configuration httpConfig = new Configuration();
        httpConfig.setHostname("0.0.0.0");
        httpConfig.setPort(8080);

        Configuration socketConfig = new Configuration();
        socketConfig.setHostname("0.0.0.0");
        socketConfig.setPort(6969);

        /* set multithreading configuration */
        socketConfig.setBossThreads(1);
        socketConfig.setWorkerThreads(Runtime.getRuntime().availableProcessors() - 1);

        System.out.println(Runtime.getRuntime().availableProcessors() - 1);

        TankTroubleHttpServer httpServer = new TankTroubleHttpServer(httpConfig);

        TankTroubleSocketServer socketServer = new TankTroubleSocketServer(socketConfig);


    }
}
