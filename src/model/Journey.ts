import {SmartArray} from "./SmartArray";
import {ICard} from "./ICard";
import {AllJourneys} from "./AllJourneys";
import {Step} from "./Step";
import {CardType} from "./Card";
import {ISerializable} from "./serialize/ISerializable";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";

export interface JourneySerialized {
    allJourneys?: number;
    steps: (number | undefined)[];
}

export class Journey extends SmartArray<Step> implements ICard, ISerializable<JourneySerialized> {
    allJourneys: AllJourneys;

    /**
     * a journey should always have a step, so we take it as input in the
     * constructor. position is 1-based
     * @param allJourneys
     * @param step
     * @param position
     */
    constructor(allJourneys: AllJourneys, step: Step, position?: number) {
        super();
        this.push(step);
        step.setJourney(this);
        this.allJourneys = allJourneys;
        if (position !== undefined) {
            this.allJourneys.add(this, position);
        } else {
            this.allJourneys.push(this);
        }
    }

    toSerialized(serializer: Serializer): ISerialized<JourneySerialized> {
        return {
            type: 'Journey',
            value: {
                allJourneys: serializer.getObject(this.allJourneys),
                steps: this.getItems().map(step => serializer.getObject(step))
            }
        };
    }

    /**
     * Handy method to return first step, since it's often created implicitly
     */
    getFirstStep(): Step {
        if (this.isEmpty()) {
            throw new Error("Journey doesn't have a step");
        }
        return this.getItems()[0];
    }

    getName(): string {
        return `J${this.getPath()}`;
    }

    getId(): string {
        return `J${this.getPath()}`;
    }

    /**
     * create journey with empty step
     */
    createNewNext(): void {
        // position in parent is zero-based, while adding we use 1-based, so it needs "+2"
        new Journey(this.allJourneys, new Step(), this.getPositionInParent() + 2);
    }

    getType(): CardType {
        return CardType.Journey;
    }

    showControls(): boolean {
        return true;
    }

    /**
     * journey can be deleted if it has just one empty step
     */
    canDelete(): boolean {
        return (this.size() === 1) && (this.getFirstStep().isEmpty());
    }

    delete(): void {
        if (this.canDelete()) {
            this.deleteItem(this.getFirstStep());
        }
    }

    /**
     * cannot delete if it's the only Step
     * @param item
     */
    canDeleteItem(item: Step): boolean {
        return this.has(item) && this.size() > 1;
    }

    canMoveInto(card: ICard): boolean {
        return card instanceof Journey;
    }

    moveInto(card: ICard): void {
        if (this.canMoveInto(card) && card instanceof Journey) {
            this.allJourneys.move(this, card.getPositionInParent() + 1);
        }
    }
}