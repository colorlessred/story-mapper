import {SmartArray} from "./SmartArray";
import {Note} from "./Note";
import {ICard} from "./ICard";
import {Journey} from "./Journey";
import {CardType} from "./Card";

export class Step extends SmartArray<Note> implements ICard {
    constructor(journey?: Journey) {
        super();
        if (journey) {
            journey.push(this);
        }
    }

    getName(): String {
        return "s" + this.getPath();
    }

    createNewNext(): void {
    }

    getType(): CardType {
        return CardType.Step;
    }
}