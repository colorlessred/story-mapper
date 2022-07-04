import {SmartArray} from "./SmartArray";
import {Journey} from "./Journey";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";
import {ISerializable} from "./serialize/ISerializable";

export interface AllJourneysSerialized {
    journeys: (number | undefined)[];
}

/** root object that contains all the journeys */
export class AllJourneys extends SmartArray<Journey> implements ISerializable<AllJourneysSerialized> {
    /**
     * add Journey. It must have some Step linked,
     * otherwise we would have a board missing a column
     * position is 1-based
     */
    add(journey: Journey, position: number) {
        if (journey.isEmpty()) {
            throw new Error("Cannot add Journey that has no Steps");
        }
        super.add(journey, position);
    }

    toSerialized(serializer: Serializer): ISerialized<AllJourneysSerialized> {
        return {
            type: 'AllJourneys',
            value: {
                journeys: this.getItems().map(journey => serializer.getObject(journey))
            }
        };
    }
}