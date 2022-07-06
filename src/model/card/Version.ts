import {ICard} from "../../ICard";
import {AllVersions, AllVersionsSerialized} from "../AllVersions";
import {NotesInSteps} from "../NotesInSteps";
import {AllJourneys, AllJourneysSerialized} from "../AllJourneys";
import {Note, NoteSerialized} from "./Note";
import {IPath} from "../IPath";
import {Step} from "./Step";
import {CardType} from "../../Card";
import {Serializer} from "../serialize/Serializer";
import {ISerialized} from "../serialize/ISerialized";
import {ISerializable} from "../serialize/ISerializable";
import {Deserializer, DeserializerFunction} from "../serialize/Deserializer";
import {CommonCardData, CommonCardDataSerialized} from "../CommonCardData";

export interface VersionSerialized {
    name: string,
    notes: (number | undefined)[],
    allJourneys?: number,
    allVersions?: number;
    commonCardData: number;
}

/**
 * not a good design. The internal structure depends on the data on all journeys and versions.
 * These can change (e.g. when adding a new Journey), without the Version realising.
 * So we need to recompute it all every time we need to use the notesInStep object
 */
export class Version implements IPath, ICard, ISerializable<VersionSerialized> {
    private readonly name: string;
    private notes: Set<Note> = new Set<Note>();
    private _path: string = "";
    private _positionInParent: number = 0;
    private allJourneys?: AllJourneys;
    private notesInStep: NotesInSteps;
    private allVersions?: AllVersions;

    private _commonCardData = new CommonCardData();

    get commonCardData(): CommonCardData {
        return this._commonCardData;
    }

    set commonCardData(value: CommonCardData) {
        this._commonCardData = value;
    }

    static createAndPush(name: string, allJourneys: AllJourneys): Version {
        const version = new Version(name);
        version.setAllJourneys(allJourneys);
        return version;
    }

    static createAndPushVersion(name: string, allJourneys: AllJourneys, allVersions: AllVersions): Version {
        const version = Version.createAndPush(name, allJourneys);
        version.setAllVersions(allVersions);
        allVersions.push(version);
        return version;
    }

    constructor(name: string) {
        this.name = name;
        this.notesInStep = this.rebuildInternalStructure();
    }

    setAllJourneys(allJourneys: AllJourneys) {
        this.allJourneys = allJourneys;
        this.rebuildInternalStructure();
    }

    setAllVersions(allVersions: AllVersions) {
        this.allVersions = allVersions;
        this.rebuildInternalStructure();
    }

    set path(path: string) {
        this._path = path;
    }

    get path(): string {
        return this._path;
    }

    addNote(note: Note) {
        if (this.notes.has(note)) {
            throw new Error("cannot add, the Note is already in the Version");
        }
        this.notes.add(note);
        if (note.isReady()) {
            this.rebuildInternalStructure();
        }
    }

    get id(): string {
        return `V${this.path}`;
    }

    toString(): string {
        return this.path + '(' + this.name + ')';
    }

    /** string representation of Notes in all the Steps */
    toStringNotesInStep(): string {
        this.rebuildInternalStructure();
        if (this.notesInStep) {
            return this.notesInStep.getArrayArray().toString();
        } else {
            return "";
        }
    }

    getNotesInSteps() {
        this.rebuildInternalStructure();
        return this.notesInStep;
    }

    /** build string representation that uses the position in the version step */
    toStringNotesWithVersionNumber(): string {
        this.rebuildInternalStructure();
        const out: string[] = [];
        if (this.notesInStep) {
            out.push('[');
            this.notesInStep.getArrayArray().forEach((array) => {
                out.push('[');
                out.push(array.map(note => note.toStringVersion()).join(','));
                out.push(']');
            });
            out.push(']');
        }
        return out.join('');
    }

    /** track the Notes per Step */
    public rebuildInternalStructure(): NotesInSteps {
        // console.log(`Rebuild internal structures on Version ${this.name}`);
        // get all the steps starting from the top allJourneys object, which
        // needs to be the root of all the journeys
        const allSteps: Step[] = [];
        if (this.allJourneys !== undefined) {
            this.allJourneys.items.forEach((journey) => {
                journey.items.forEach((step) => {
                    allSteps.push(step);
                });
            });
        }
        this.notesInStep = new NotesInSteps(allSteps, this.notes);
        // return it so that it can be used in the constructor to avoid the "undefined" type
        return this.notesInStep;
    }

    createNewNext(): void {
        if (this.allVersions === undefined) {
            throw new Error("Cannot create new next Version if I don't know the AllVersions");
        }

        const version = new Version("new Version");
        if (this.allJourneys) {
            version.setAllJourneys(this.allJourneys);
        }
        version.setAllVersions(this.allVersions);
        this.allVersions.add(version, this.positionInParent + 2);
    }

    get positionInParent(): number {
        return this._positionInParent;
    }

    set positionInParent(position: number) {
        this._positionInParent = position;
    }

    get type(): CardType {
        return CardType.Version;
    }

    canShowControls(): boolean {
        return true;
    }

    get visiblePath(): string {
        return this.path;
    }

    canDelete(): boolean {
        return this.notes.size === 0;
    }

    delete(): void {
        if (this.canDelete() && this.allVersions !== undefined) {
            this.allVersions.deleteItem(this);
        }
    }

    deleteNote(note: Note) {
        if (this.notes.has(note)) {
            this.notes.delete(note);
            this.rebuildInternalStructure();
        }
    }

    canMoveInto(card: ICard): boolean {
        return card instanceof Version;
    }

    moveInto(card: ICard): void {
        if (this.canMoveInto(card)
            && card instanceof Version
            && this.allVersions !== undefined) {
            const version: Version = card;
            // must be in the same "board" to make sense
            if (this.allVersions === version.allVersions) {
                this.allVersions.move(this, version.positionInParent + 1);
            }
        }
    }

    toSerialized(serializer: Serializer): ISerialized<VersionSerialized> {
        return {
            type: Version.serializedTypeName(),
            value: {
                name: this.name,
                notes: Array.from(this.notes.values()).map(note => serializer.getObject(note)),
                allJourneys: serializer.getObject(this.allJourneys),
                allVersions: serializer.getObject(this.allVersions),
                commonCardData: serializer.getObject(this.commonCardData),
            }
        };
    }

    public static serializedTypeName = () => 'Version';

    public static deserializerFunction = new DeserializerFunction<VersionSerialized, Version>(
        (values: VersionSerialized) => {
            return new Version(values.name);
        },
        (object: Version, values: VersionSerialized, deserializer: Deserializer) => {
            if (values.allJourneys !== undefined) {
                object.setAllJourneys(deserializer.deserializeItem<AllJourneysSerialized, AllJourneys>(values.allJourneys));
            }
            if (values.allVersions !== undefined) {
                object.setAllVersions(deserializer.deserializeItem<AllVersionsSerialized, AllVersions>(values.allVersions));
            }
            values.notes.forEach(note => {
                if (note !== undefined) {
                    object.addNote(deserializer.deserializeItem<NoteSerialized, Note>(note));
                }
            });
            object.commonCardData = deserializer.deserializeItem<CommonCardDataSerialized, CommonCardData>(values.commonCardData);
        },
        (object: Version) => {
            // rebuild at the end, because it might not have been done since the Notes where not ready (missing their Step)
            object.rebuildInternalStructure();
        }
    );
}