import {SmartArray} from "./SmartArray";
import {ICard} from "./ICard";
import {AllJourneys} from "./AllJourneys";
import {Step} from "./Step";

export class Journey extends SmartArray<Step> implements ICard {
    allJourneys: AllJourneys;

    constructor(allJourneys: AllJourneys, addToAllJourneys: boolean = false, position?: number) {
        super();
        this.allJourneys = allJourneys;
        if (addToAllJourneys) {
            if (position === undefined) {
                allJourneys.push(this);
            } else {
                allJourneys.add(this, position);
            }
        }
    }

    getName(): String {
        return "j" + this.getPath();
    }

    createNewNext(): Journey {
        const out: Journey = new Journey(this.allJourneys, false);
        this.allJourneys.addNextTo(out, this);
        return out;
    }
}