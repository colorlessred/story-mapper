import {SmartArray} from "./SmartArray";
import {ICard} from "./ICard";
import {AllJourneys} from "./AllJourneys";
import {Step} from "./Step";

export class Journey extends SmartArray<Step> implements ICard {
    allJourneys: AllJourneys;

    constructor(allJourneys: AllJourneys) {
        super();
        this.allJourneys = allJourneys;
    }

    getName(): String {
        return "j" + this.getPath();
    }

    createNewNext(): Journey {
        const journey: Journey = new Journey(this.allJourneys);
        new Step(journey);
        this.allJourneys.addNextTo(journey, this);
        return journey;
    }
}