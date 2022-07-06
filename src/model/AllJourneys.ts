import {SmartArray} from "./SmartArray";
import {Journey, JourneySerialized} from "./card/Journey";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";
import {ISerializable} from "./serialize/ISerializable";
import {Deserializer, DeserializerFunction} from "./serialize/Deserializer";

export interface AllJourneysSerialized {
    journeys: number [];
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
            type: AllJourneys.serializedTypeName(),
            value: {
                journeys: this.items.map(journey => serializer.getObject(journey))
            }
        };
    }

    public static serializedTypeName = () => 'AllJourneys';

    public static deserializerFunction = new DeserializerFunction<AllJourneysSerialized, AllJourneys>(
        (values: AllJourneysSerialized) => new AllJourneys(),
        (object: AllJourneys, values: AllJourneysSerialized, deserializer: Deserializer) => {
            values.journeys.forEach(journeyId => {
                const journey = deserializer.deserializeItem<JourneySerialized, Journey>(journeyId);
                object.push(journey);
            });
        }
    );
}