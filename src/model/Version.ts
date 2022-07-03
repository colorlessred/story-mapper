import {ICard} from "./ICard";
import {AllVersions} from "./AllVersions";
import {NotesInSteps} from "./NotesInSteps";
import {AllJourneys} from "./AllJourneys";
import {Note} from "./Note";
import {IPath} from "./IPath";
import {Step} from "./Step";
import {CardType} from "./Card";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";
import {Deserializer} from "./serialize/Deserializer";

/**
 * not a good design. The internal structure depends on the data on all journeys and versions.
 * These can change (e.g. when adding a new Journey), without the Version realising.
 * So we need to recompute it all every time we need to use the notesInStep object
 */
export class Version implements IPath, ICard {
    private readonly name: string;
    private notes: Set<Note> = new Set<Note>();
    private path: string = "";
    private positionInParent: number = 0;
    private readonly allJourneys: AllJourneys;
    private notesInStep: NotesInSteps;
    private readonly allVersions?: AllVersions;

    constructor(name: string, allJourneys: AllJourneys, allVersions?: AllVersions, position?: number) {
        this.name = name;
        this.allJourneys = allJourneys;

        if (allVersions) {
            this.allVersions = allVersions;
            if (position !== undefined) {
                allVersions.add(this, position);
            } else {
                allVersions.push(this);
            }
        }

        this.notesInStep = this.rebuildInternalStructure();
    }

    setPath(path: string): void {
        this.path = path;
    }

    getPath(): string {
        return this.path;
    }

    addNote(note: Note) {
        if (this.notes.has(note)) {
            throw new Error("cannot add, the Note is already in the Version");
        }
        this.notes.add(note);
        this.rebuildInternalStructure();
    }

    getId(): string {
        return `V${this.getPath()}`;
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
                const notes: string[] = [];
                array.forEach((note) => {
                    notes.push(note.toStringVersion());
                });
                out.push(notes.join(','));
                out.push(']');
            });
            out.push(']');
        }
        return out.join('');
    }

    /** track the Notes per Step */
    private rebuildInternalStructure(): NotesInSteps {
        // get all the steps starting from the top allJourneys object, which
        // needs to be the root of all the journeys
        const allSteps: Step[] = [];
        this.allJourneys.getItems().forEach((journey) => {
            journey.getItems().forEach((step) => {
                allSteps.push(step);
            });
        });
        this.notesInStep = new NotesInSteps(allSteps, this.notes);
        // return it so that it can be used in the constructor to avoid the "undefined" type
        return this.notesInStep;
    }

    getName(): string {
        return `V${this.getPath()}`;
    }

    createNewNext(): void {
        if (this.allVersions === undefined) {
            throw new Error("Cannot create new next Version if I don't know the AllVersions");
        }

        new Version("new Version", this.allJourneys, this.allVersions, this.positionInParent + 2);
    }

    getPositionInParent(): number {
        return this.positionInParent;
    }

    setPositionInParent(position: number): void {
        this.positionInParent = position;
    }

    getType(): CardType {
        return CardType.Version;
    }

    showControls(): boolean {
        return true;
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
                this.allVersions.move(this, version.getPositionInParent() + 1);
            }
        }
    }

    toSerialized(serializer: Serializer): ISerialized {
        return {
            type: 'Version',
            value: {
                name: this.name,
                notes: Array.from(this.notes.values()).map((note: Note) => {
                    return serializer.getObject(note);
                }),
                path: this.path,
                positionInParent: this.positionInParent,
                allJourneys: serializer.getObject(this.allJourneys),
                allVersions: serializer.getObject(this.allVersions)
            }
        };
    }

    toObject(deserializer: Deserializer): object {
        throw new Error("not yet implemented");
    }
}