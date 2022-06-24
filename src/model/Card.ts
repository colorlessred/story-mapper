import {ICard} from "./ICard";

/** the Card that composes the board. Made of anything that implements ICard,
 * like the hierarchical types (Journey, Step, Note), but also empty or button-like cards
 */
export class Card {
    baseElement: ICard;

    constructor(baseElement: ICard) {
        this.baseElement = baseElement;
    }

    toString(): String {
        return this.baseElement.getName();
    }
}