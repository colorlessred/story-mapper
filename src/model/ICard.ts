import {CardType} from "./Card";

export interface ICard {
    getName(): string;

    getId(): string;

    /** create new item next to the current one */
    createNewNext(): void;

    /**
     * return true if the controls need to be shown
     */
    showControls(): boolean;

    /** the type of card: journey, step, note, version */
    getType(): CardType;

    /** return true if the item can be deleted */
    canDelete(): boolean;

    /**
     * delete card
     */
    delete(): void;

    /**
     * true if the item can be "moved into" card, used by UI's drag&drop
     * @param card
     */
    canMoveInto(card: ICard): boolean;

    /**
     * move card into another
     * @param card
     */
    moveInto(card: ICard): void;
}