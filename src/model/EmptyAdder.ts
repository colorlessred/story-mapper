import {ICard} from "./ICard";
import {CardType} from "./Card";
import {Step} from "./Step";
import {Version} from "./Version";
import {Note} from "./Note";

export class EmptyAdder implements ICard {
    private readonly version: Version;
    private readonly step: Step;

    constructor(version: Version, step: Step) {
        this.version = version;
        this.step = step;
    }

    getStep(): Step {
        return this.step
    }

    getVersion(): Version {
        return this.version;
    }

    getId(): string {
        return [CardType[this.getType()],
            this.version.getPositionInParent(),
            this.step.getPositionInParent()
        ].join('.');
    }

    getName(): string {
        return "";
    }

    createNewNext(): void {
        Note.create("new note", this.step, this.version, true, true);
    }

    getType(): CardType {
        return CardType.Adder;
    }

    showControls(): boolean {
        return true;
    }

    canDelete(): boolean {
        return false;
    }

    delete(): void {
    }

    canMoveInto(card: ICard): boolean {
        return false;
    }

    moveInto(card: ICard): void {
        throw new Error("not yet implemented");
    }

}