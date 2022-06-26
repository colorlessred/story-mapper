import {ICard} from "./ICard";

/** the Card that composes the board. Made of anything that implements ICard,
 * like the hierarchical types (Journey, Step, Note), but also empty or button-like cards
 */
export class Card {
    baseElement: ICard;

    constructor(baseElement: ICard) {
        this.baseElement = baseElement;
    }

    getType(): String {
        return CardType[this.baseElement.getType()];
    }

    toString(): String {
        return this.baseElement.getName();
    }

    createNewNext():void {
        this.baseElement.createNewNext();
    }
}

export enum CardType {Empty, Journey, Step, Note, Version};