import {ICard} from "./ICard";
import {CommonCardData} from "./model/CommonCardData";

/** the Card that composes the board. Made of anything that implements ICard,
 * like the hierarchical types (Journey, Step, Note), but also empty or button-like cards
 */
export class Card {
    private readonly baseElement: ICard;
    /**
     * unique key used by React
     * @private
     */
    private key: string = "";

    constructor(baseElement: ICard) {
        this.baseElement = baseElement;
    }

    getBaseElement() {
        return this.baseElement;
    }

    setKey(key: string) {
        this.key = key;
    }

    public getKey(): string {
        return this.key;
    }

    get commonCardData(): CommonCardData {
        return this.baseElement.commonCardData;
    }

    //
    // getContent(): string {
    //     return this.baseElement.getCommonCardData().content;
    // }
    //
    // getTitle(): string {
    //     return this.baseElement.getCommonCardData().title;
    // }

    get type(): string {
        return CardType[this.baseElement.type];
    }

    get visiblePath(): string {
        return this.baseElement.visiblePath;
    }

    toString(): string {
        return this.baseElement.commonCardData.title;
    }

    createNewNext(): void {
        this.baseElement.createNewNext();
    }

    showControls(): boolean {
        return this.baseElement.canShowControls();
    }

    canDelete(): boolean {
        return this.baseElement.canDelete();
    }

    delete(): void {
        this.baseElement.delete();
    }

    getId(): string {
        return this.baseElement.id;
    }

    canMoveInto(card: Card): boolean {
        return this.baseElement.canMoveInto(card.baseElement);
    }

    moveInto(card: Card): void {
        this.baseElement.moveInto(card.baseElement);
    }
}

export enum CardType {Empty, Adder, Journey, Step, Note, Version};
