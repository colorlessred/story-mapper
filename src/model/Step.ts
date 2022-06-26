import {SmartArray} from "./SmartArray";
import {Note} from "./Note";
import {ICard} from "./ICard";
import {Journey} from "./Journey";
import {CardType} from "./Card";

export class Step extends SmartArray<Note> implements ICard {
    private journey?: Journey;

    constructor(journey?: Journey, position?: number) {
        super();
        if (journey) {
            this.journey = journey;
            if (position !== undefined) {
                journey.add(this, position);
            } else {
                journey.push(this);
            }
        }
    }

    setJourney(journey: Journey) {
        this.journey = journey;
    }

    getName(): String {
        return `S${this.getPath()}`;
    }

    createNewNext(): void {
        if (this.journey === undefined) {
            throw new Error("cannot create next Step since I don't know the journey");
        }
        new Step(this.journey, this.getPositionInParent() + 2);
    }

    getType(): CardType {
        return CardType.Step;
    }
}