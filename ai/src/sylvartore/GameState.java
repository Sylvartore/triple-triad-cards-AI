package sylvartore;

import java.util.Arrays;

public class GameState {
    int current;
    int[] cardsOwner;
    int[] cardsTile;
    int[] tilesCard;

    public GameState(int current, int[] cardsOwner, int[] cardsTile, int[] tilesCard) {
        this.current = current;
        this.cardsOwner = cardsOwner;
        this.cardsTile = cardsTile;
        this.tilesCard = tilesCard;
    }

    @Override
    public String toString() {
        return "State{" +
                "current=" + current +
                ", cardsOwner=" + Arrays.toString(cardsOwner) +
                ", cardsTile=" + Arrays.toString(cardsTile) +
                ", tilesCard=" + Arrays.toString(tilesCard) +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GameState gameState = (GameState) o;
        if (current != gameState.current) return false;
        if (!Arrays.equals(cardsOwner, gameState.cardsOwner)) return false;
        if (!Arrays.equals(cardsTile, gameState.cardsTile)) return false;
        return Arrays.equals(tilesCard, gameState.tilesCard);
    }
}