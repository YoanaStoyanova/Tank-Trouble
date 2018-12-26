package bg.tank.trouble.server;

import com.corundumstudio.socketio.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import jdk.nashorn.api.scripting.JSObject;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;

public class TankTroubleHttpServer {

    private HttpServer server;

    TankTroubleHttpServer(Configuration cfg) throws IOException {
        String host = cfg.getHostname();
        int port = cfg.getPort();
        server = HttpServer.create(new InetSocketAddress(host, port), 0);
        getLoginContext();
        getGameRoomContext();
        add();
        getRootContext();
        server.start();
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

    private void add() {
        HttpHandler httpHandler = new HttpHandler() {
            public void handle(HttpExchange httpExchange) throws IOException {
                URI uri = httpExchange.getRequestURI();
                //System.out.println("looking for: " + uri.getPath());
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
                System.out.println(pl.getEmail());
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("id", pl.id);
                jsonObject.put("goTo", "gameRoom");

                String response = jsonObject.toString();

                httpExchange.sendResponseHeaders(200, response.length());
                OutputStream os = httpExchange.getResponseBody();
                os.write(response.getBytes());
                os.close();

            }
        };

        context.setHandler(handler);

    }

    private void getGameRoomContext(){
        HttpContext context = server.createContext("/gameRoom");

        HttpHandler handler = new HttpHandler() {
            public void handle(HttpExchange httpExchange) throws IOException {
                URI uri = httpExchange.getRequestURI();
                System.out.println("looking for: " + uri.getPath());
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
            }
        };

        context.setHandler(handler);
    }
}
