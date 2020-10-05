package sylvartore;

import java.io.*;
import java.net.Socket;
import java.util.Date;
import java.util.HashMap;
import java.util.Scanner;

public class ServerThread extends Thread {

    private final Socket client;
    private BufferedReader in;
    private PrintWriter out;
    private AI ai;
    private boolean clientClosed;

    public ServerThread(Socket client) {
        this.client = client;
        this.clientClosed = false;
    }

    public void run() {
        try {
            in = new BufferedReader(new InputStreamReader(client.getInputStream()));
            out = new PrintWriter(client.getOutputStream());
            ai = new AI();
            String line;

            listening:
            while ((line = in.readLine()) != null) {
                String[] msg = parseMsg(line);
                if (msg == null) continue;
                String action = msg[0];
                String data = msg[1];
                String response;
                switch (action) {
                    case "getBestMove":
                        System.out.println("request received: " + action);
                        response = getBestMove(data);
                        sendToClient(response);
                        System.out.println("data delivered: " + response);
                        break;
                    case "disconnect":
                        disconnect();
                        break listening;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String[] parseMsg(String line)  {
        String[] msg = line.split(";");
        if (msg.length == 1) {
            String action = msg[0];
            return new String[]{action, null};
        } else if (msg.length == 2) {
            String action = msg[0];
            String rawData = msg[1];
            return new String[]{action, rawData};
        } else {
            sendToClient(errorMsgBuilder("Invalid msg format"));
            return null;
        }
    }

    private String getBestMove(String rawData)  {
        int current = -1;
        int[] cardsOwner = null, cardsTile = null, tilesCard = null, cardId = null;
        int[][] cardAttributes = null;
        String[] pairs = rawData.split("&");
        for (String pair : pairs) {
            String[] keyValuePair = pair.split("=");
            String key = keyValuePair[0];
            String value = keyValuePair[1];
            switch (key) {
                case "current":
                    current = Integer.parseInt(value);
                    if(current !=0 && current !=1)   return errorMsgBuilder("Invalid current value");
                    break;
                case "cardsOwner":
                    cardsOwner = parseIntArray(value);
                    if(cardsOwner.length!=10)   return errorMsgBuilder("Invalid cardsOwner value");
                    break;
                case "cardsTile":
                    cardsTile = parseIntArray(value);
                    if(cardsTile.length!=10)   return errorMsgBuilder("Invalid cardsTile value");
                    break;
                case "cardId":
                    cardId = parseIntArray(value);
                    if(cardId.length!=10)   return errorMsgBuilder("Invalid cardId value");
                    break;
                case "tilesCard":
                    tilesCard = parseIntArray(value);
                    if(tilesCard.length!=9)   return errorMsgBuilder( "Invalid tilesCard value");
                    break;
                case "cardAttributes":
                    cardAttributes = parseCardAttributes(value);
                    if(cardAttributes == null)   return errorMsgBuilder( "Invalid cardAttributes value");
                    break;
                default:
                    return errorMsgBuilder( "Invalid data key");
            }
        }
        GameState state = new GameState(current, cardsOwner, cardsTile, tilesCard);
        int[] best = ai.getBestMove(state, cardId, cardAttributes);
        return responseBuilder("bestMove", "{\"score\":" + best[0] + ",\"cardIndex\":" + best[1] + ",\"tileIndex\":" + best[2] + "}") ;
    }

    private int[] parseIntArray(String str) {
        String[] ints = str.split(",");
        int[] arr = new int[ints.length];
        for (int i = 0; i < arr.length; i++) {
            arr[i] = Integer.parseInt(ints[i]);
        }
        return arr;
    }

    private int[][] parseCardAttributes(String str) {
        String[] ints = str.split(",");
        if (ints.length != 40) return null;
        int[][] cardAttributes = new int[10][4];
        for (int j = 0, i = 0; j < 10; j++) {
            for (int k = 0; k < 4; k++, i++) {
                cardAttributes[j][k] = Integer.parseInt(ints[i]);
            }
        }
        return cardAttributes;
    }

    private String errorMsgBuilder(String errMsg){
        return responseBuilder("error", "\"" + errMsg + "\"");
    }

    private String responseBuilder(String action, String data){
        return "{\"action\": \""+action + "\", \"data\":"+ data + " }";
    }

    private void sendToClient(String response) {
        if(clientClosed) return;
        out.write(response + "\n");
        out.flush();
    }

    private void disconnect() throws IOException {
        in.close();
        out.close();
        client.close();
        clientClosed = true;
        System.out.println(new Date().toString() + " One client disconnected");
    }
}
