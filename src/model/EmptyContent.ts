import {ICard} from "./ICard";
import {CardType} from "./Card";

export class EmptyContent implements ICard {
    getName(): String {
        return "";
    }

    createNewNext(): void {
    }

    getType(): CardType {
        return CardType.Adder;
    }
}