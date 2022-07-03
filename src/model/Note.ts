import {ICard} from "./ICard";
import {Version} from "./Version";
import {IPath} from "./IPath";
import {Step} from "./Step";
import {CardType} from "./Card";
import {EmptyAdder} from "./EmptyAdder";
import {Serializer} from "./serialize/Serializer";
import {Deserializer} from "./serialize/Deserializer";
import {ISerialized} from "./serialize/ISerialized";

export class Note implements IPath, ICard {
    private readonly name: string;
    private step: Step;
    private version: Version;

    /** string that represents the whole hierarchical position, journey.step.note */
    private path: string = "";
    private positionInParent: number = 0;

    /** track the position only inside the version step */
    private positionInVersionStep: number = 0;

    /** Note path done with version: journey.version.positionInVersionStep */
    private pathWithVersion: string = "";

    constructor(
        name: string,
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

    getId(): string {
        return this.pathWithVersion;
    }

    canMoveInto(item: ICard): boolean {
        return (
            (item instanceof Note || item instanceof EmptyAdder)
            && item !== this && this.canDelete()
        );
    }

    moveInto(item: ICard): void {
        if (this.canMoveInto(item)) {
            if (item instanceof Note) {
                this.moveIntoNote(item);
            } else if (item instanceof EmptyAdder) {
                this.moveIntoEmptyAdder(item);
            }
        }
    }

    private moveIntoEmptyAdder(emptyAdder: EmptyAdder) {
        this.delete();
        // add note to the step and version specified by the adder
        this.moveToStepVersion(emptyAdder.getStep(), 1, emptyAdder.getVersion());
    }

    private moveIntoNote(note: Note) {
        const targetNote: Note = note;
        // detach the note from the current version & step
        this.delete();

        // attach it back into the new position
        this.moveToStepVersion(targetNote.getStep(), targetNote.getPositionInParent() + 1, targetNote.version);
    }

    /**
     * move into specific Step, position, and Version
     * @param step
     * @param positionInStep
     * @param version
     * @private
     */
    private moveToStepVersion(step: Step, positionInStep: number, version: Version) {
        this.step = step;
        this.step.add(this, positionInStep);

        this.version = version;
        this.version.addNote(this);
    }

    setPath(path: string): void {
        this.path = path;
    }

    getPath(): string {
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

    toStringVersion(): string {
        return this.pathWithVersion + "(" + this.name + ")";
    }

    getStep(): Step {
        return this.step;
    }

    getName(): string {
        return this.name;
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

    canDelete(): boolean {
        return true;
    }

    delete(): void {
        if (this.canDelete()) {
            this.version.deleteNote(this);
            this.step.deleteItem(this);
        }
    }

    toSerialized(serializer: Serializer): ISerialized {
        return {
            type: 'Note',
            value: {
                name: this.name,
                step: serializer.getObject(this.step),
                version: serializer.getObject(this.version),
                path: this.path,
                positionInParent: this.positionInParent,
                positionInVersionStep: this.positionInVersionStep,
                pathWithVersion: this.pathWithVersion
            }
        };
    }

    toObject(deserializer: Deserializer): object {
        throw new Error("not yet implemented");
    }

}