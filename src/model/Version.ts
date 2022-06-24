import {ICard} from "./ICard";
import {AllVersions} from "./AllVersions";
import {NotesInSteps} from "./NotesInSteps";
import {AllJourneys} from "./AllJourneys";
import {Note} from "./Note";
import {IPath} from "./IPath";
import {Step} from "./Step";

export class Version implements IPath, ICard {
    private readonly name: String;
    private notes: Set<Note> = new Set<Note>();
    private path: String = "";
    private positionInParent: number = 0;
    private allJourneys: AllJourneys;
    private notesInStep: NotesInSteps;

    constructor(name: String, allJourneys: AllJourneys, allVersions?: AllVersions) {
        this.name = name;
        this.allJourneys = allJourneys;

        if (allVersions) {
            allVersions.push(this);
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
        if (this.notesInStep) {
            return this.notesInStep.getArrayArray().toString();
        } else {
            return "";
        }
    }

    getNotesInSteps() {
        return this.notesInStep
    }

    /** build string representation that uses the position in the version step */
    toStringNotesWithVersionNumber(): String {
        const out: String[] = [];
        if (this.notesInStep) {
            out.push('[');
            this.notesInStep.getArrayArray().forEach((array) => {
                out.push('[');
                const notes: String[] = [];
                array.forEach((note) => {
                    notes.push(note.toStringVersion());
                })
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
                allSteps.push(step)
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
    }

    getPositionInParent(): number {
        return this.positionInParent;
    }

    setPositionInParent(position: number): void {
        this.positionInParent = position;
    }
}