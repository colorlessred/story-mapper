import {ICard} from "./ICard";
import {CardType} from "./Card";

export class EmptyContent implements ICard {
    getName(): string {
        return "";
    }

    getId(): string {
        return CardType[this.getType()];
    }

    createNewNext(): void {
    }

    getType(): CardType {
        return CardType.Empty;
    }

    showControls(): boolean {
        return false;
    }

    canDelete(): boolean {
        return false;
    }

    delete(): void {
    }

    canMoveInto(card: ICard): boolean {
        return false;
    }

    moveInto(card: ICard): void {
    }
}