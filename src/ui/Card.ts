import {ICard} from "../model/ICard";
import {CommonCardData} from "../model/CommonCardData";

/** the Card that composes the board. Made of anything that implements ICard,
 * like the hierarchical types (Journey, Step, Note), but also empty or button-like cards
 */
export class Card {
    private readonly _baseElement: ICard;
    /**
     * unique key used by React
     * @private
     */
    private key: string = "";

    constructor(baseElement: ICard) {
        this._baseElement = baseElement;
    }

    get baseElement() {
        return this._baseElement;
    }

    setKey(key: string) {
        this.key = key;
    }

    public getKey(): string {
        return this.key;
    }

    get commonCardData(): CommonCardData {
        return this._baseElement.commonCardData;
    }

    get type(): string {
        return CardType[this._baseElement.type];
    }

    get visiblePath(): string {
        return this._baseElement.visiblePath;
    }

    toString(): string {
        return this._baseElement.commonCardData.title;
    }

    createNewNext(): void {
        this._baseElement.createNewNext();
    }

    showControls(): boolean {
        return this._baseElement.canShowControls();
    }

    canDelete(): boolean {
        return this._baseElement.canDelete();
    }

    delete(): void {
        this._baseElement.delete();
    }

    get id(): string {
        return this._baseElement.id;
    }

    canMoveInto(card: Card): boolean {
        return this._baseElement.canMoveInto(card._baseElement);
    }

    moveInto(card: Card): void {
        this._baseElement.moveInto(card._baseElement);
    }
}

export enum CardType {Empty, Adder, Journey, Step, Note, Version};
