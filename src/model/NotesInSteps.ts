import {Note} from "./Note";
import {Step} from "./Step";

/** used by Version to track the Notes in each Step */
export class NotesInSteps {
    /** the keys are the position of the Step and the Note */
    private stepToNotes: Map<string, Map<string, Note>> = new Map();
    private maxSize = 0;
    private readonly arrayArray: Array<Array<Note>> = [];
    private steps: Step[] = [];

    constructor(steps: Array<Step>, notes: Set<Note>) {
        steps.forEach((step) => {
            this.addStep(step);
        });
        notes.forEach((note) => {
            this.addNote(note);
        });
        this.arrayArray = this.computeArrayArray();
    }

    /** add all the steps, even the ones for which we have no notes */
    private addStep(step: Step) {
        this.stepToNotes.set(step.getPath(), new Map());
        this.steps.push(step);
    }

    public getStep(stepNumber: number): Step {
        if (stepNumber < 0 || stepNumber >= this.steps.length) {
            throw new Error(`We have ${this.steps.length} steps, but asked for step number ${stepNumber}`);
        }
        return this.steps[stepNumber];
    }

    /** add the notes, linking them to the proper steps */
    private addNote(note: Note) {
        const stepPosition = note.getStep().getPath();
        let notes = this.stepToNotes.get(stepPosition);
        if (notes !== undefined) {
            notes.set(note.getPath(), note);
        }
    }

    /**
     * compute the Array of Array that contains the notes. It is NOT a rectangle matrix
     * the first array has one entry for each step
     * the second has one entry for each note in that step
     */
    private computeArrayArray(): Array<Array<Note>> {
        this.maxSize = 0;
        const out = new Array<Array<Note>>();
        // since the keys are the position paths, we sort them
        const sortedSteps = new Map([...this.stepToNotes].sort());
        sortedSteps.forEach((stepPositionToNote) => {
            const array = new Array<Note>();
            // keep track of the longest
            if (stepPositionToNote.size > this.maxSize) {
                this.maxSize = stepPositionToNote.size;
            }
            out.push(array);
            const sortedNotes = new Map([...stepPositionToNote].sort());
            let idx = 1;
            sortedNotes.forEach((note) => {
                array.push(note);
                note.setPositionInVersionStep(idx++);
            });
        });
        return out;
    }

    getArrayArray(): Array<Array<Note>> {
        return this.arrayArray;
    }

    getMaxSize(): number {
        return this.maxSize;
    }

    getStepsSize(): number {
        return this.stepToNotes.size;
    }
}