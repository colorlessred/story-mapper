import {SmartArray} from "./SmartArray";
import {ICard} from "./ICard";
import {AllJourneys} from "./AllJourneys";
import {Step} from "./Step";
import {CardType} from "./Card";

export class Journey extends SmartArray<Step> implements ICard {
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

    /**
     * Handy method to return first step, since it's often created implicitly
     */
    getFirstStep(): Step {
        if (this.isEmpty()) {
            throw new Error("Journey doesn't have a step");
        }
        return this.getItems()[0];
    }

    getName(): String {
        return "j" + this.getPath();
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
}