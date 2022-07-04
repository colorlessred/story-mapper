import {SmartArray} from "./SmartArray";
import {Note} from "./Note";
import {ICard} from "./ICard";
import {Journey} from "./Journey";
import {CardType} from "./Card";
import {ISerializable} from "./serialize/ISerializable";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";

export interface StepSerialized {
    journey: number | undefined;
    items: (number | undefined)[];
}

export class Step extends SmartArray<Note> implements ICard, ISerializable<StepSerialized> {
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

    toSerialized(serializer: Serializer): ISerialized<StepSerialized> {
        return {
            type: 'Step',
            value: {
                journey: serializer.getObject(this.journey),
                items: this.getItems().map(note => serializer.getObject(note))
            }
        };
    }

    getId(): string {
        return `S${this.getPath()}`;
    }

    setJourney(journey: Journey) {
        this.journey = journey;
    }

    getName(): string {
        // return `S${this.getPath()} (${this.size()})`;
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

    showControls(): boolean {
        return true;
    }

    private canDeleteFromJourney(): boolean {
        return (this.journey !== undefined) ? this.journey.canDeleteItem(this) : true;
    }

    /**
     * Step can be deleted if it's empty and if its Journey thinks it can be deleted
     */
    canDelete(): boolean {
        return this.isEmpty() && this.canDeleteFromJourney();
    }

    delete(): void {
        if (this.canDelete()) {
            if (this.journey !== undefined) {
                this.journey.deleteItem(this);
            }
        }
    }

    canMoveInto(card: ICard): boolean {
        return (card instanceof Step) && this.canDeleteFromJourney();
    }

    moveInto(card: ICard): void {
        if (this.canMoveInto(card)) {
            if (card instanceof Step) {
                const step: Step = card;
                // detach from journey
                if (this.journey !== undefined) {
                    this.journey.deleteItem(this);
                }
                if (step.journey !== undefined) {
                    this.journey = step.journey;
                    step.journey.add(this, step.getPositionInParent() + 1);
                }
            }
        }
    }
}