import {ICard} from "./ICard";
import {AllVersions} from "./AllVersions";
import {NotesInSteps} from "./NotesInSteps";
import {AllJourneys} from "./AllJourneys";
import {Note} from "./Note";
import {IPath} from "./IPath";
import {Step} from "./Step";
import {CardType} from "./Card";

/**
 * not a good design. The internal structure depends on the data on all journeys and versions.
 * These can change (e.g. when adding a new Journey), without the Version realising.
 * So we need to recompute it all every time we need to use the notesInStep object
 */
export class Version implements IPath, ICard {
    private readonly name: String;
    private notes: Set<Note> = new Set<Note>();
    private path: String = "";
    private positionInParent: number = 0;
    private readonly allJourneys: AllJourneys;
    private notesInStep: NotesInSteps;
    private readonly allVersions?: AllVersions;

    constructor(name: String, allJourneys: AllJourneys, allVersions?: AllVersions, position?: number) {
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

    setPath(path: String): void {
        this.path = path;
    }

    getPath(): String {
        return this.path;
    }

    addNote(note: Note) {
        this.notes.add(note);
        this.rebuildInternalStructure();
    }

    toString(): String {
        return this.path + '(' + this.name + ')';
    }

    /** string representation of Notes in all the Steps */
    toStringNotesInStep(): String {
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
    toStringNotesWithVersionNumber(): String {
        this.rebuildInternalStructure();
        const out: String[] = [];
        if (this.notesInStep) {
            out.push('[');
            this.notesInStep.getArrayArray().forEach((array) => {
                out.push('[');
                const notes: String[] = [];
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

    getName(): String {
        return this.name;
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
}