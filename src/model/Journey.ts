import {SmartArray} from "./SmartArray";
import {ICard} from "./ICard";
import {AllJourneys} from "./AllJourneys";
import {Step, StepSerialized} from "./Step";
import {CardType} from "./Card";
import {ISerializable} from "./serialize/ISerializable";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";
import {Deserializer, DeserializerFunction} from "./serialize/Deserializer";

export interface JourneySerialized {
    allJourneys?: number;
    steps: number [];
}

export class Journey extends SmartArray<Step> implements ICard, ISerializable<JourneySerialized> {
    private allJourneys?: AllJourneys;

    static createAndPush(allJourneys: AllJourneys, step: Step): Journey {
        const journey = new Journey();
        journey.setStep(step);
        journey.setAllJourneys(allJourneys);
        allJourneys.push(journey);
        return journey;
    }

    setAllJourneys(allJourneys: AllJourneys) {
        this.allJourneys = allJourneys;
    }

    setStep(step: Step) {
        this.push(step);
        step.setJourney(this);
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
        const journey = new Journey();
        journey.setStep(new Step());
        if (this.allJourneys !== undefined) {
            journey.setAllJourneys(this.allJourneys);
            this.allJourneys.add(journey, this.getPositionInParent() + 2);
        }
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
        if (this.canMoveInto(card) && card instanceof Journey && this.allJourneys !== undefined) {
            this.allJourneys.move(this, card.getPositionInParent() + 1);
        }
    }

    toSerialized(serializer: Serializer): ISerialized<JourneySerialized> {
        return {
            type: Journey.serializedTypeName(),
            value: {
                allJourneys: serializer.getObject(this.allJourneys),
                steps: this.getItems().map(step => serializer.getObject(step))
            }
        };
    }


    public static serializedTypeName = () => 'Journey';

    public static deserializerFunction = new DeserializerFunction<JourneySerialized, Journey>(
        (values: JourneySerialized) => new Journey(),
        (object: Journey, values: JourneySerialized, deserializer: Deserializer) => {
            values.steps.forEach(stepId => {
                const step = deserializer.deserializeItem<StepSerialized, Step>(stepId);
                object.push(step);
            });
        }
    );
}