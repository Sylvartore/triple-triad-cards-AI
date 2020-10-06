package sylvartore;


import java.io.*;
import java.net.*;
import java.util.Date;

public class Server implements Runnable {

    public void run() {
        try {
            int port = 8002;
            ServerSocket server = new ServerSocket(port);
            System.out.println("Server started, listening on: " + port);

            Socket clientSocket;
            Date date = new Date();
            while (true) {
                try {
                    clientSocket = server.accept();
                    ServerThread thread = new ServerThread(clientSocket);
                    thread.start();
                    System.out.println(date.toString() + " One client connected");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

