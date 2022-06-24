import {SmartArray} from "./SmartArray";
import {ICard} from "./ICard";
import {AllJourneys} from "./AllJourneys";
import {Step} from "./Step";

export class Journey extends SmartArray<Step> implements ICard {
    allJourneys: AllJourneys;

    constructor(allJourneys: AllJourneys, position?: number) {
        super();
        this.allJourneys = allJourneys;
        if (position === undefined) {
            allJourneys.push(this);
        } else {
            allJourneys.add(this, position);
        }
    }

    getName(): String {
        return "j" + this.getPath();
    }

    createNewNext(): Journey {
        return new Journey(this.allJourneys);
    }
}