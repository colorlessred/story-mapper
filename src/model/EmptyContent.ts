import {ICard} from "./ICard";

export class EmptyContent implements ICard {
    getName(): String {
        return "";
    }

    createNewNext(): void {
    }
}