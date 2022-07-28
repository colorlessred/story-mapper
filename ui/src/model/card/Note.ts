import {ICard} from "../ICard";
import {Version, VersionSerialized} from "./Version";
import {IPath} from "../IPath";
import {Step, StepSerialized} from "./Step";
import {CardType} from "../../ui/Card";
import {EmptyAdder} from "./EmptyAdder";
import {Serializer} from "../serialize/Serializer";
import {ISerialized} from "../serialize/ISerialized";
import {ISerializable} from "../serialize/ISerializable";
import {Deserializer, DeserializerFunction} from "../serialize/Deserializer";
import {CommonCardData, CommonCardDataSerialized} from "../CommonCardData";

export interface NoteSerialized {
    commonCardData: number,
    step: number,
    version: number
}

export class Note implements IPath, ICard, ISerializable<NoteSerialized> {

    private _step?: Step;
    private _version?: Version;

    /** string that represents the whole hierarchical position, journey.step.note */
    private _path: string = "";
    private _positionInParent: number = 0;

    /** track the position only inside the version step */
    private positionInVersionStep: number = 0;

    /** Note path done with version: journey.version.positionInVersionStep */
    private pathWithVersion: string = "";

    private _commonCardData = new CommonCardData();

    get commonCardData(): CommonCardData {
        return this._commonCardData;
    }

    set commonCardData(value: CommonCardData) {
        this._commonCardData = value;
    }

    public static create(title: string,
                         step: Step,
                         version: Version,
                         pushInStep: boolean = false,
                         addToVersion: boolean = false): Note {
        const note = new Note();
        note.commonCardData.title = title;
        note.step = step;
        note.version = version;
        if (pushInStep) {
            step.push(note);
        }

        if (addToVersion) {
            version.addNote(note);
        }
        return note;
    }

    set step(step: Step) {
        this._step = step;
    }

    set version(version: Version) {
        this._version = version;
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

        if (targetNote._version) {
            // detach the note from the current version & step
            this.delete();

            // attach it back into the new position
            this.moveToStepVersion(targetNote.getStep(), targetNote.positionInParent + 1, targetNote._version);
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
        this._step = step;
        this._step.add(this, positionInStep);

        this._version = version;
        this._version.addNote(this);
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
        if (this._version) {
            this.pathWithVersion =
                [this.getStep().path, this._version.path, this.positionInVersionStep].join('.');
        } else {
            throw new Error("Note doesn't have a version");
        }
    }

    toString(): string {
        return this.path + "(" + this.commonCardData.title + ")";
    }

    toStringVersion(): string {
        return this.pathWithVersion + "(" + this.commonCardData.title + ")";
    }

    getStep(): Step {
        if (this._step) {
            return this._step;
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
        return (this._step !== undefined && this._version !== undefined);
    }

    createNewNext(): void {
        if (this._step && this._version) {
            const newNote = Note.create("a", this._step, this._version, false, true);
            this._step.add(newNote, this.positionInParent + 2);
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
        if (this._version && this._step) {
            if (this.canDelete()) {
                this._version.deleteNote(this);
                this._step.deleteItem(this);
            }
        } else {
            throw new Error("Note doesn't have version and/or step");
        }
    }

    toSerialized(serializer: Serializer): ISerialized<NoteSerialized> {
        return {
            type: Note.serializedTypeName(),
            value: {
                commonCardData: serializer.getObject(this.commonCardData),
                step: serializer.getObject(this._step),
                version: serializer.getObject(this._version)
            }
        };
    }

    public static serializedTypeName = () => 'Note';

    public static deserializerFunction = new DeserializerFunction<NoteSerialized, Note>(
        (values: NoteSerialized) => new Note(),
        (object: Note, values: NoteSerialized, deserializer: Deserializer) => {
            object.step = deserializer.deserializeItem<StepSerialized, Step>(values.step);
            object.version = deserializer.deserializeItem<VersionSerialized, Version>(values.version);
            object.commonCardData = deserializer.deserializeItem<CommonCardDataSerialized, CommonCardData>(values.commonCardData);
        }
    );
}