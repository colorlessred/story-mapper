import {CardType} from "../ui/Card";
import {CommonCardData} from "./CommonCardData";

/**
 * something that can be displayed on the UI as a card.
 *
 * There are multiple cases for the implementers:
 * - coming from the tree: Journey, Step, Note
 * - the Version
 * - the UI-only items like EmptyContent and EmptyAdder
 */
export interface ICard {
    /**
     * all the common card data encapsulated in one object
     */
    get commonCardData(): CommonCardData;

    /**
     * get path string to be shown on the UI. This might be different from
     * the internal path of the journey-step-note tree
     */
    get visiblePath(): string;

    /**
     * unique identified of the card. Useful for the tests, for things that might not have a proper path
     * like the EmptyContent card
     */
    get id(): string;

    /** the type of card: journey, step, note, version */
    get type(): CardType;

    /** create new item next to the current one */
    createNewNext(): void;

    /**
     * return true if the controls need to be shown
     */
    canShowControls(): boolean;


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