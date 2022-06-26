import {CardType} from "./Card";

export interface ICard {
    getName(): String;

    /** create new item next to the current one */
    createNewNext(): void;

    /**
     * return true if the controls need to be shown
     */
    showControls(): boolean;

    /** the type of card: journey, step, note, version */
    getType(): CardType;

    // /** the unique key used by React */
    // getKey(): String;
}