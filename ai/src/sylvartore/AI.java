package sylvartore;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class AI {
    private int[] visited;

    public AI() {
        visited = new int[9];
    }

    public int[] getBestMove(GameState state, int[] cardId, int[][] cardAttributes) {
        int max = -5;
        int bestMoveCardIndex = -1;
        int bestMoveTileIndex = -1;
        Arrays.fill(visited, 0);
        int side = state.current;
        for (Integer[] move : getAllMoves(state)) {
            ArrayList<int[]> operations = getOperations(move[0], move[1], state, cardId, cardAttributes);
            stateTransition(operations, state);
            int utility = min(state, -5, 5, cardId, side, cardAttributes);
            stateRollback(operations, state);
            if (max == -5 || utility > max) {
                max = utility;
                bestMoveCardIndex = move[0];
                bestMoveTileIndex = move[1];
            }
        }
        return new int[] {max, bestMoveCardIndex, bestMoveTileIndex};
    }

    private ArrayList<int[]> getOperations(int cardIndex, int tileIndex, GameState state, int[] cardId, int[][] cardAttributes) {
        ArrayList<int[]> operations = new ArrayList<>();
        operations.add(new int[]{0, cardIndex, tileIndex});
        takeoverSettlement(cardIndex, tileIndex, state, cardId, cardAttributes, operations);
        return operations;
    }

    private void takeoverSettlement(int cardIndex, int tileIndex, GameState state, int[] cardId, int[][] cardAttributes, ArrayList<int[]> operations) {
        rulePlus(cardIndex, tileIndex, state, cardId, cardAttributes, operations);
        ruleBasic(cardIndex, tileIndex, state, cardId, cardAttributes, operations);
    }

    private void rulePlus(int cardIndex, int tileIndex, GameState state, int[] cardId, int[][] cardAttributes, ArrayList<int[]> operations) {
        HashMap<Integer, Integer[]> map = new HashMap<>();
        Arrays.fill(visited, 0);
        visited[tileIndex] = 1;
        for (int direction = 0; direction < 4; direction++) {
            int targetTileIndex = Get[direction][tileIndex];
            if (targetTileIndex == -1) continue;
            int targetCardIndex = state.tilesCard[targetTileIndex];
            if (targetCardIndex == -1) continue;
            int key = cardAttributes[cardId[cardIndex]][direction] +
                    cardAttributes[cardId[targetCardIndex]][Counter[direction]];
            if (map.containsKey(key)) {
                if (state.cardsOwner[targetCardIndex] != state.current) {
                    operations.add(new int[]{1, targetCardIndex, state.current});
                    combo(targetCardIndex, targetTileIndex, state, cardId, cardAttributes, operations);
                }
                Integer[] stored = map.get(key);
                if (state.cardsOwner[stored[0]] != state.current) {
                    operations.add(new int[]{1, stored[0], state.current});
                    combo(stored[0], stored[1], state, cardId, cardAttributes, operations);
                }
            } else {
                map.put(key, new Integer[]{targetCardIndex, targetTileIndex});
            }
        }
    }

    private void combo(int cardIndex, int tileIndex, GameState state, int[] cardId, int[][] cardAttributes, ArrayList<int[]> operations) {
        if (visited[tileIndex] == 1) return;
        for (int direction = 0; direction < 4; direction++) {
            int targetTileIndex = Get[direction][tileIndex];
            if (targetTileIndex == -1) continue;
            int targetCardIndex = state.tilesCard[targetTileIndex];
            if (targetCardIndex == -1 || state.cardsOwner[targetCardIndex] == state.current) continue;
            if (cardAttributes[cardId[cardIndex]][direction] >
                    cardAttributes[cardId[targetCardIndex]][Counter[direction]]) {
                visited[tileIndex] = 1;
                operations.add(new int[]{1, targetCardIndex, state.current});
                combo(targetCardIndex, targetTileIndex, state, cardId, cardAttributes, operations);
            }
        }
    }

    private void ruleBasic(int cardIndex, int tileIndex, GameState state, int[] cardId, int[][] cardAttributes, ArrayList<int[]> operations) {
        for (int direction = 0; direction < 4; direction++) {
            int targetTileIndex = Get[direction][tileIndex];
            if (targetTileIndex == -1) continue;
            int targetCardIndex = state.tilesCard[targetTileIndex];
            if (targetCardIndex == -1 || state.cardsOwner[targetCardIndex] == state.current) continue;
            if (cardAttributes[cardId[cardIndex]][direction] >
                    cardAttributes[cardId[targetCardIndex]][Counter[direction]]) {
                operations.add(new int[]{1, targetCardIndex, state.current});
            }
        }
    }

    private void stateTransition(ArrayList<int[]> operations, GameState state) {
        for (int[] operation : operations) {
            if (operation[0] == 0) {
                state.cardsTile[operation[1]] = operation[2];
                state.tilesCard[operation[2]] = operation[1];
            } else {
                state.cardsOwner[operation[1]] = operation[2];
            }
        }
        state.current = state.current == 1 ? 0 : 1;
    }

    private void stateRollback(ArrayList<int[]> operations, GameState state) {
        for (int[] operation : operations) {
            if (operation[0] == 0) {
                state.cardsTile[operation[1]] = -1;
                state.tilesCard[operation[2]] = -1;
            } else {
                state.cardsOwner[operation[1]] = operation[2] == 1 ? 0 : 1;
            }
        }
        state.current = state.current == 1 ? 0 : 1;
    }


    private int min(GameState state, int alpha, int beta, int[] cardId, int side, int[][] cardAttributes) {
        if (terminateTest(state)) return evaluateScore(state, side);
        int value = 5;
        for (Integer[] move : getAllMoves(state)) {
            ArrayList<int[]> operations = getOperations(move[0], move[1], state, cardId, cardAttributes);
            stateTransition(operations, state);
            int utility = max(state, alpha, beta, cardId, side, cardAttributes);
            stateRollback(operations, state);
            if (utility < value) value = utility;
            if (utility <= alpha) return utility;
            if (utility < beta) beta = utility;
        }
        return value;
    }

    private int max(GameState state, int alpha, int beta, int[] cardId, int side, int[][] cardAttributes) {
        if (terminateTest(state)) return evaluateScore(state, side);
        int value = -5;
        for (Integer[] move : getAllMoves(state)) {
            ArrayList<int[]> operations = getOperations(move[0], move[1], state, cardId, cardAttributes);
            stateTransition(operations, state);
            int utility = min(state, alpha, beta, cardId, side, cardAttributes);
            stateRollback(operations, state);
            if (utility > value) value = utility;
            if (utility >= beta) return utility;
            if (utility > alpha) alpha = utility;
        }
        return value;
    }

    private ArrayList<Integer[]> getAllMoves(GameState state) {
        ArrayList<Integer[]> res = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            if (state.cardsOwner[i] == state.current && state.cardsTile[i] == -1) {
                for (int j = 0; j < 9; j++) {
                    if (state.tilesCard[j] == -1)
                        res.add(new Integer[]{i, j});
                }
            }
        }
        return res;
    }

    private boolean terminateTest(GameState state) {
        for (int cardIndex : state.tilesCard) {
            if (cardIndex == -1) return false;
        }
        return true;
    }

    private int evaluateScore(GameState state, int side) {
        int score = -5;
        for (int owner : state.cardsOwner) {
            if (owner == side) score++;
        }
        return score;
    }

    public static final int[][] Get = new int[][]{
            {-1, 0, 1, -1, 3, 4, -1, 6, 7},
            {-1, -1, -1, 0, 1, 2, 3, 4, 5},
            {1, 2, -1, 4, 5, -1, 7, 8, -1},
            {3, 4, 5, 6, 7, 8, -1, -1, -1}};

    public static final int[] Counter = new int[] {2, 3, 0, 1};
}


