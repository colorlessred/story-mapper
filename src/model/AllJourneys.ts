import {SmartArray} from "./SmartArray";
import {Journey} from "./Journey";

/** root object that contains all the journeys */
export class AllJourneys extends SmartArray<Journey> {
    /**
     * add Journey. It must have some Step linked,
     * otherwise we would have a board missing a column
     * @param journey
     * @param position
     */
    add(journey: Journey, position: number) {
        if (journey.isEmpty()) {
            throw new Error("Cannot add Journey that has no Steps");
        }
        super.add(journey, position);
    }
}