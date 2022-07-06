import {SmartArray} from "../SmartArray";
import {Note, NoteSerialized} from "./Note";
import {ICard} from "../ICard";
import {Journey, JourneySerialized} from "./Journey";
import {CardType} from "../../ui/Card";
import {ISerializable} from "../serialize/ISerializable";
import {Serializer} from "../serialize/Serializer";
import {ISerialized} from "../serialize/ISerialized";
import {Deserializer, DeserializerFunction} from "../serialize/Deserializer";
import {CommonCardData, CommonCardDataSerialized} from "../CommonCardData";

export interface StepSerialized {
    journey: number | undefined;
    notes: number[];
    commonCardData: number;
}

export class Step extends SmartArray<Note> implements ICard, ISerializable<StepSerialized> {
    private journey?: Journey;
    private _commonCardData = new CommonCardData();

    get commonCardData(): CommonCardData {
        return this._commonCardData;
    }

    set commonCardData(value: CommonCardData) {
        this._commonCardData = value;
    }

    public static createAndPush(journey: Journey): Step {
        const step = new Step();
        step.setJourney(journey);
        journey.push(step);
        return step;
    }

    constructor() {
        super();
    }

    toSerialized(serializer: Serializer): ISerialized<StepSerialized> {
        return {
            type: Step.serializedTypeName(),
            value: {
                journey: serializer.getObject(this.journey),
                notes: this.items.map(note => serializer.getObject(note)),
                commonCardData: serializer.getObject(this.commonCardData),
            }
        };
    }

    public static serializedTypeName = () => 'Step';

    public static deserializerFunction = new DeserializerFunction<StepSerialized, Step>(
        (values: StepSerialized) => new Step(),
        (object: Step, values: StepSerialized, deserializer: Deserializer) => {
            if (values.journey) {
                object.setJourney(deserializer.deserializeItem<JourneySerialized, Journey>(values.journey));
            }
            if (values.notes) {
                values.notes.forEach((noteId) => {
                    const note = deserializer.deserializeItem<NoteSerialized, Note>(noteId);
                    object.push(note);
                });
            }
            object.commonCardData = deserializer.deserializeItem<CommonCardDataSerialized, CommonCardData>(values.commonCardData);
        }
    );

    get id(): string {
        return `S${this.path}`;
    }

    setJourney(journey: Journey) {
        this.journey = journey;
    }

    get visiblePath(): string {
        return this.path;
    }

    createNewNext(): void {
        if (this.journey === undefined) {
            throw new Error("cannot create next Step since I don't know the journey");
        }
        const step = new Step();
        step.setJourney(this.journey);
        this.journey.add(step, this.positionInParent + 2);
    }

    get type(): CardType {
        return CardType.Step;
    }

    canShowControls(): boolean {
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
                    step.journey.add(this, step.positionInParent + 1);
                }
            }
        }
    }
}