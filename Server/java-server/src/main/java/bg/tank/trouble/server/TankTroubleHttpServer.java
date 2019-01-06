package bg.tank.trouble.server;

import com.corundumstudio.socketio.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.*;
import org.json.JSONObject;
import java.util.concurrent.Executors;

import javax.net.ssl.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.security.*;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;

public class TankTroubleHttpServer {

    private HttpsServer server;

    TankTroubleHttpServer(Configuration cfg) throws IOException, UnrecoverableKeyException, CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
        String host = cfg.getHostname();
        int port = cfg.getPort();
        SSLContext sslContext = loadCert();
        server = HttpsServer.create(new InetSocketAddress(host, port), 0);
        configureSSLContext(sslContext);
        getLoginContext();
        getGameRoomContext();
        getStaticContext();
        getRootContext();
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println(server.getHttpsConfigurator().getSSLContext());
    }

    private void configureSSLContext(SSLContext sslContext) {
        server.setHttpsConfigurator(new HttpsConfigurator(sslContext) {
            public void configure(HttpsParameters params) {
                try {
                    // initialise the SSL context
                    SSLContext c = SSLContext.getDefault();
                    SSLEngine engine = c.createSSLEngine();
                    params.setNeedClientAuth(false);
                    params.setCipherSuites(engine.getEnabledCipherSuites());
                    params.setProtocols(engine.getEnabledProtocols());
                    // get the default parameters
                    SSLParameters defaultSSLParameters = c.getDefaultSSLParameters();
                    params.setSSLParameters(defaultSSLParameters);
                } catch (Exception ex) {
                    ex.printStackTrace();
                    System.out.println("Failed to create HTTPS server");
                }
            }
        });
    }

    private SSLContext loadCert() throws IOException, KeyStoreException, CertificateException, NoSuchAlgorithmException, UnrecoverableKeyException, KeyManagementException {
        // load certificate
        String keystoreFilename = "./mycert.keystore";
        char[] storepass = "mypassword".toCharArray();
        char[] keypass = "mypassword".toCharArray();
        String alias = "mycert";
        FileInputStream fIn = new FileInputStream(keystoreFilename);
        KeyStore keystore = KeyStore.getInstance("pkcs12");
        keystore.load(fIn, storepass);
        // display certificate
        Certificate cert = keystore.getCertificate(alias);
        System.out.println(cert);
        // setup the key manager factory
        KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
        kmf.init(keystore, keypass);
        // setup the trust manager factory
        TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
        tmf.init(keystore);
        // create ssl context
        SSLContext sslContext = SSLContext.getInstance("SSL");
        sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

        return sslContext;


    }

    private void getRootContext() {
        HttpContext context = server.createContext("/");
        context.setHandler(new HttpHandler() {
            public void handle(HttpExchange httpExchange) throws IOException {
                System.out.println("Reqest uri : " + httpExchange.getRequestURI());
                File data = new File("./index.html");
                httpExchange.sendResponseHeaders(200, data.length());
                OutputStream os = httpExchange.getResponseBody();
                FileInputStream fs = new FileInputStream(data);
                final byte[] buffer = new byte[0x10000];
                int count = 0;
                while ((count = fs.read(buffer)) >= 0) {
                    os.write(buffer, 0, count);
                }
                fs.close();
                os.close();
            }
        });
    }

    private void getStaticContext() {
        HttpHandler httpHandler = new HttpHandler() {
            public void handle(HttpExchange httpExchange) throws IOException {
                URI uri = httpExchange.getRequestURI();

                String path = "." + uri.getPath();
                File data = new File(path).getCanonicalFile();
                if (!data.isFile()) {
                    throw new FileNotFoundException();
                }
                httpExchange.sendResponseHeaders(200, data.length());
                OutputStream os = httpExchange.getResponseBody();
                FileInputStream fs = new FileInputStream(data);
                final byte[] buffer = new byte[0x10000];
                int count = 0;
                while ((count = fs.read(buffer)) >= 0) {
                    os.write(buffer, 0, count);
                }
                fs.close();
                os.close();
                System.out.println("got : " + uri.getPath());
            }
        };
        HttpContext context = server.createContext("/static", httpHandler);

    }

    private void getLoginContext() {
        HttpContext context = server.createContext("/login");

        HttpHandler handler = new HttpHandler() {
            public void handle(HttpExchange httpExchange) throws IOException {
                System.out.println(httpExchange.getRequestBody());
                ObjectMapper mapper = new ObjectMapper();
                Player pl = mapper.readValue(httpExchange.getRequestBody(), Player.class);
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("id", pl.id);
                jsonObject.put("goTo", "gameRoom");

                String response = jsonObject.toString();

                httpExchange.sendResponseHeaders(200, response.length());
                OutputStream os = httpExchange.getResponseBody();
                System.out.println("starting to write after login");
                os.write(response.getBytes());
                os.close();
                System.out.println("closing stream after login");

            }
        };

        context.setHandler(handler);

    }

    private void getGameRoomContext() {
        HttpContext context = server.createContext("/gameRoom");

        HttpHandler handler = new HttpHandler() {
            public void handle(HttpExchange httpExchange) throws IOException {
                URI uri = httpExchange.getRequestURI();
                String path = "." + uri.getPath();
                File data = new File("./startGame.html").getCanonicalFile();

                if (!data.isFile()) {
                    throw new FileNotFoundException();
                }
                httpExchange.sendResponseHeaders(200, data.length());

                OutputStream os = httpExchange.getResponseBody();

                FileInputStream fs = new FileInputStream(data);
                final byte[] buffer = new byte[0x10000];
                int count = 0;
                while ((count = fs.read(buffer)) >= 0) {
                    os.write(buffer, 0, count);
                }
                fs.close();
                os.close();
                System.out.println("Getting game room finished: " + uri.getPath());
            }
        };

        context.setHandler(handler);
    }
}
