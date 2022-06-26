import {ICard} from "./ICard";
import {CardType} from "./Card";
import {Step} from "./Step";
import {Version} from "./Version";
import {Note} from "./Note";

export class EmptyAdder implements ICard {
    private readonly version: Version;
    private readonly step: Step;

    constructor(version: Version, step: Step) {
        this.version = version;
        this.step = step;
    }

    getName(): String {
        return "";
    }

    createNewNext(): void {
        new Note("new note", this.step, this.version, true, true);
    }

    getType(): CardType {
        return CardType.Empty;
    }
}