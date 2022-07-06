import {ICard} from "../../ICard";
import {Version, VersionSerialized} from "./Version";
import {IPath} from "../IPath";
import {Step, StepSerialized} from "./Step";
import {CardType} from "../../Card";
import {EmptyAdder} from "./EmptyAdder";
import {Serializer} from "../serialize/Serializer";
import {ISerialized} from "../serialize/ISerialized";
import {ISerializable} from "../serialize/ISerializable";
import {Deserializer, DeserializerFunction} from "../serialize/Deserializer";
import {CommonCardData} from "../CommonCardData";

export interface NoteSerialized {
    name: string,
    step: number,
    version: number
}

export class Note implements IPath, ICard, ISerializable<NoteSerialized> {
    private readonly name: string;
    private step?: Step;
    private version?: Version;

    /** string that represents the whole hierarchical position, journey.step.note */
    private _path: string = "";
    private _positionInParent: number = 0;

    /** track the position only inside the version step */
    private positionInVersionStep: number = 0;

    /** Note path done with version: journey.version.positionInVersionStep */
    private pathWithVersion: string = "";

    private readonly _commonCardData = new CommonCardData();

    get commonCardData(): CommonCardData {
        return this._commonCardData;
    }

    public static create(name: string,
                         step: Step,
                         version: Version,
                         pushInStep: boolean = false,
                         addToVersion: boolean = false): Note {
        const note = new Note(name);
        note.setStep(step);
        note.setVersion(version);
        if (pushInStep) {
            step.push(note);
        }

        if (addToVersion) {
            version.addNote(note);
        }
        return note;
    }

    constructor(name: string) {
        this.name = name;
    }

    setStep(step: Step) {
        this.step = step;
    }

    setVersion(version: Version) {
        this.version = version;
    }

    getTitle(): string {
        return "some note title";
    }

    get visiblePath(): string {
        return this.pathWithVersion;
    }

    get id(): string {
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
        this.moveToStepVersion(emptyAdder.step, 1, emptyAdder.version);
    }

    private moveIntoNote(note: Note) {
        const targetNote: Note = note;

        if (targetNote.version) {
            // detach the note from the current version & step
            this.delete();

            // attach it back into the new position
            this.moveToStepVersion(targetNote.getStep(), targetNote.positionInParent + 1, targetNote.version);
        } else {
            throw new Error("target note doesn't have a version");
        }
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

    set path(path: string) {
        this._path = path;
    }

    get path(): string {
        return this._path;
    }

    setPositionInVersionStep(position: number): void {
        this.positionInVersionStep = position;
        // name should be: journey.step.version.noteIn
        if (this.version) {
            this.pathWithVersion =
                [this.getStep().path, this.version.path, this.positionInVersionStep].join('.');
        } else {
            throw new Error("Note doesn't have a version");
        }
    }

    toString(): string {
        return this.path + "(" + this.name + ")";
    }

    toStringVersion(): string {
        return this.pathWithVersion + "(" + this.name + ")";
    }

    getStep(): Step {
        if (this.step) {
            return this.step;
        } else {
            throw new Error("Note doesn't have a step");
        }
    }

    /**
     * true if the Note is ready to be used
     */
    isReady(): boolean {
        // this is fairly ugly. To be deserialized the Note needs to have a constructor
        // with only primitives. But a note without its Step and Version shouldn't really be
        // used by other classes
        return (this.step !== undefined && this.version !== undefined);
    }

    createNewNext(): void {
        if (this.step && this.version) {
            const newNote = Note.create("new note", this.step, this.version, false, true);
            this.step.add(newNote, this.positionInParent + 2);
        } else {
            throw new Error("Note doesn't have step and/or version");
        }
    }

    get positionInParent(): number {
        return this._positionInParent;
    }

    set positionInParent(position: number) {
        this._positionInParent = position;
    }

    get type(): CardType {
        return CardType.Note;
    }

    canShowControls(): boolean {
        return true;
    }

    canDelete(): boolean {
        return true;
    }

    delete(): void {
        if (this.version && this.step) {
            if (this.canDelete()) {
                this.version.deleteNote(this);
                this.step.deleteItem(this);
            }
        } else {
            throw new Error("Note doesn't have version and/or step");
        }
    }

    toSerialized(serializer: Serializer): ISerialized<NoteSerialized> {
        return {
            type: Note.serializedTypeName(),
            value: {
                name: this.name,
                step: serializer.getObject(this.step),
                version: serializer.getObject(this.version)
            }
        };
    }

    public static serializedTypeName = () => 'Note';

    public static deserializerFunction = new DeserializerFunction<NoteSerialized, Note>(
        (values: NoteSerialized) => {
            return new Note(values.name);
        },
        (object: Note, values: NoteSerialized, deserializer: Deserializer) => {
            object.setStep(deserializer.deserializeItem<StepSerialized, Step>(values.step));
            object.setVersion(deserializer.deserializeItem<VersionSerialized, Version>(values.version));
        }
    );
}