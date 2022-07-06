import {ICard} from "../../ICard";
import {CardType} from "../../Card";
import {CommonCardData} from "../CommonCardData";

export class EmptyContent implements ICard {
    private readonly _commonCardData = new CommonCardData();

    get commonCardData(): CommonCardData {
        return this._commonCardData;
    }

    get id(): string {
        return CardType[this.type];
    }

    get visiblePath(): string {
        return "";
    }

    get type(): CardType {
        return CardType.Empty;
    }

    createNewNext(): void {
    }

    delete() {
    }

    moveInto(card: ICard) {
    }

    canShowControls(): boolean {
        return false;
    }

    canDelete(): boolean {
        return false;
    }

    canMoveInto(card: ICard): boolean {
        return false;
    }
}