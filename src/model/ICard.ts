import {CardType} from "./Card";

export interface ICard {
    getName(): String;

    /** create new item next to the current one */
    createNewNext(): void;

    /** the type of card: journey, step, note, version */
    getType(): CardType;
}