package bg.tank.trouble.server;

import com.corundumstudio.socketio.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;

public class Main {

	final static int SOCKET_IO_BOSSTHREADS = 1;
	final static int SOCKET_IO_WORKERTHREADS = 20;
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
        socketConfig.setBossThreads(SOCKET_IO_BOSSTHREADS);
        socketConfig.setWorkerThreads(SOCKET_IO_WORKERTHREADS);

        TankTroubleHttpServer httpServer = new TankTroubleHttpServer(httpConfig);
        TankTroubleSocketServer socketServer = new TankTroubleSocketServer(socketConfig);
    }
}
