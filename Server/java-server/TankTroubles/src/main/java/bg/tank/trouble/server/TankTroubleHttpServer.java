package bg.tank.trouble.server;

import com.corundumstudio.socketio.Configuration;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class TankTroubleHttpServer {

    private HttpServer server;

    TankTroubleHttpServer(Configuration cfg) throws IOException {
        String host = cfg.getHostname();
        int port = cfg.getPort();
        server = HttpServer.create(new InetSocketAddress(host, port), 0);
        getRootContext();
        server.start();
    }

    private void getRootContext() {
        HttpContext context = server.createContext("/");
        context.setHandler(new HttpHandler() {
            public void handle(HttpExchange httpExchange) throws IOException {
                File data = new File("./data.html");
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
}
