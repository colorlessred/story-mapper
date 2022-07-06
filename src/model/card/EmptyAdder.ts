import {ICard} from "../../ICard";
import {CardType} from "../../Card";
import {Step} from "./Step";
import {Version} from "./Version";
import {Note} from "./Note";
import {CommonCardData} from "../CommonCardData";

export class EmptyAdder implements ICard {
    private readonly _version: Version;
    private readonly _step: Step;
    private readonly _commonCardData = new CommonCardData();

    constructor(version: Version, step: Step) {
        this._version = version;
        this._step = step;
    }

    get commonCardData(): CommonCardData {
        return this._commonCardData;
    }

    get step(): Step {
        return this._step;
    }

    get version(): Version {
        return this._version;
    }

    get id(): string {
        return [CardType[this.type],
            this._version.positionInParent,
            this._step.positionInParent
        ].join('.');
    }

    get visiblePath(): string {
        return "";
    }

    get type(): CardType {
        return CardType.Adder;
    }

    createNewNext() {
        Note.create("new note", this._step, this._version, true, true);
    }

    delete() {
    }

    moveInto(card: ICard) {
        throw new Error("not yet implemented");
    }

    canShowControls(): boolean {
        return true;
    }

    canDelete(): boolean {
        return false;
    }

    canMoveInto(card: ICard): boolean {
        return false;
    }
}