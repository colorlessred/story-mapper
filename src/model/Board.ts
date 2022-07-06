import {Card} from "../Card";
import {Utils} from "./Utils";

/** the global board from which we will build the UI */
export class Board {
    private cards: Array<Array<Card>> = [];
    /** the current line being built */
    private currentArray: Array<Card> = [];
    private startNewLine: boolean = false;

    /** add cards horizontally */
    addCard(card: Card) {
        if (this.startNewLine) {
            this.startNewLine = false;
            this.currentArray = [];
        }
        // compute key from row and column
        const row = this.cards.length;
        const col = this.currentArray.length;
        card.setKey(`${row}.${col}`);
        this.currentArray.push(card);
    }

    endLine() {
        // check that the line has the correct length
        if (this.cards.length > 0) {
            const columns = this.cards[0].length;
            if (this.currentArray.length != columns) {
                throw new Error(`The first row had ${columns} columns, but the ` +
                    `current row (index ${this.cards.length}) has ${this.currentArray.length}`);
            }
        }
        this.cards.push(this.currentArray);
        this.startNewLine = true;
    }

    toString(): string {
        const out: string[] = [];
        out.push('[');
        this.cards.forEach((arrayCard) => {
            out.push('[' + arrayCard.map((card) => card.getId()).join(',') + ']');
        });
        out.push(']');

        return out.join('');
    }

    getCards(): Array<Array<Card>> {
        return [...this.cards];
    }

    getCard(row: number, column: number): Card {
        const cardsRow: Card[] = Utils.getFromArray(this.cards, row);
        return Utils.getFromArray(cardsRow, column);
    }
}