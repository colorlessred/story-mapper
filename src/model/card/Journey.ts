import {SmartArray} from "../SmartArray";
import {ICard} from "../../ICard";
import {AllJourneys, AllJourneysSerialized} from "../AllJourneys";
import {Step, StepSerialized} from "./Step";
import {CardType} from "../../Card";
import {ISerializable} from "../serialize/ISerializable";
import {Serializer} from "../serialize/Serializer";
import {ISerialized} from "../serialize/ISerialized";
import {Deserializer, DeserializerFunction} from "../serialize/Deserializer";
import {CommonCardData} from "../CommonCardData";

export interface JourneySerialized {
    allJourneys?: number;
    steps: number [];
}

export class Journey extends SmartArray<Step> implements ICard, ISerializable<JourneySerialized> {
    private _allJourneys?: AllJourneys;
    private readonly _commonCardData = new CommonCardData();

    static createAndPush(allJourneys: AllJourneys, step: Step): Journey {
        const journey = new Journey();
        journey.step = step;
        journey.allJourneys = allJourneys;
        allJourneys.push(journey);
        return journey;
    }

    get commonCardData(): CommonCardData {
        return this._commonCardData;
    }

    set allJourneys(allJourneys: AllJourneys) {
        this._allJourneys = allJourneys;
    }

    set step(step: Step) {
        this.push(step);
        step.setJourney(this);
    }

    /**
     * Handy method to return first step, since it's often created implicitly
     */
    get firstStep(): Step {
        if (this.isEmpty()) {
            throw new Error("Journey doesn't have a step");
        }
        return this.items[0];
    }

    get visiblePath(): string {
        return this.path;
    }

    get id(): string {
        return `J${this.path}`;
    }

    get type(): CardType {
        return CardType.Journey;
    }

    /**
     * create journey with empty step
     */
    createNewNext(): void {
        // position in parent is zero-based, while adding we use 1-based, so it needs "+2"
        const journey = new Journey();
        journey.step = new Step();
        if (this._allJourneys !== undefined) {
            journey.allJourneys = this._allJourneys;
            this._allJourneys.add(journey, this.positionInParent + 2);
        }
    }

    canShowControls(): boolean {
        return true;
    }

    /**
     * journey can be deleted if it has just one empty step
     */
    canDelete(): boolean {
        return (this.size() === 1) && (this.firstStep.isEmpty());
    }

    delete(): void {
        if (this.canDelete()) {
            this.deleteItem(this.firstStep);
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
        if (this.canMoveInto(card) && card instanceof Journey && this._allJourneys !== undefined) {
            this._allJourneys.move(this, card.positionInParent + 1);
        }
    }

    toSerialized(serializer: Serializer): ISerialized<JourneySerialized> {
        return {
            type: Journey.serializedTypeName(),
            value: {
                allJourneys: serializer.getObject(this._allJourneys),
                steps: this.items.map(step => serializer.getObject(step))
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
            if (values.allJourneys) {
                object.allJourneys = deserializer.deserializeItem<AllJourneysSerialized, AllJourneys>(values.allJourneys);
            }
        }
    );
}