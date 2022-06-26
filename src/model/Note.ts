import {ICard} from "./ICard";
import {Version} from "./Version";
import {IPath} from "./IPath";
import {Step} from "./Step";
import {CardType} from "./Card";

export class Note implements IPath, ICard {
    private readonly name: String;
    private readonly step: Step;
    private version: Version;
    /** string that represents the whole hierarchical position, journey.step.note */
    private path: String = "";
    private positionInParent: number = 0;

    /** track the position only inside the version step */
    private positionInVersionStep: number = 0;

    /** Note path done with version: journey.version.positionInVersionStep */
    private pathWithVersion: String = "";

    constructor(
        name: String,
        step: Step,
        version: Version,
        pushInStep: boolean = false,
        addToVersion: boolean = false) {

        this.name = name;
        this.step = step;
        this.version = version;

        if (pushInStep) {
            step.push(this);
        }

        if (addToVersion) {
            version.addNote(this);
        }
    }

    setPath(path: String): void {
        this.path = path;
    }

    getPath(): String {
        return this.path;
    }

    setPositionInVersionStep(position: number): void {
        this.positionInVersionStep = position;
        // name should be: journey.step.version.noteIn
        this.pathWithVersion =
            [this.getStep().getPath(), this.version.getPath(), this.positionInVersionStep].join('.');
    }

    toString(): string {
        return this.path + "(" + this.name + ")";
    }

    toStringVersion(): String {
        return this.pathWithVersion + "(" + this.name + ")";
    }

    getStep(): Step {
        return this.step;
    }

    getName(): String {
        return `N${this.pathWithVersion}`;
    }

    createNewNext(): void {
        const newNote = new Note("new note", this.step, this.version, false, true);
        this.step.add(newNote, this.getPositionInParent() + 2);
    }

    getPositionInParent(): number {
        return this.positionInParent;
    }

    setPositionInParent(position: number): void {
        this.positionInParent = position;
    }

    getType(): CardType {
        return CardType.Note;
    }

    showControls(): boolean {
        return true;
    }
}