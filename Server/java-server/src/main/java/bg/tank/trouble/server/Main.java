package bg.tank.trouble.server;

import com.corundumstudio.socketio.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;

public class Main {

    public static void main(String[] args) throws IOException, UnrecoverableKeyException, CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {

        Configuration httpConfig = new Configuration();

        httpConfig.setHostname(args[0]);
        httpConfig.setPort(8080);

        Configuration socketConfig = new Configuration();
        socketConfig.setHostname(args[0]);

        socketConfig.setPort(6969);
        socketConfig.setKeyStorePassword("mypassword");
        String keystoreFilename = "./mycert.keystore";
        FileInputStream fIn = new FileInputStream(keystoreFilename);
        socketConfig.setKeyStore(fIn);

        /* set multithreading configuration */
        socketConfig.setBossThreads(1);
        socketConfig.setWorkerThreads(Runtime.getRuntime().availableProcessors() - 1);

        System.out.println(Runtime.getRuntime().availableProcessors() - 1);

        TankTroubleHttpServer httpServer = new TankTroubleHttpServer(httpConfig);

        TankTroubleSocketServer socketServer = new TankTroubleSocketServer(socketConfig);


    }
}
