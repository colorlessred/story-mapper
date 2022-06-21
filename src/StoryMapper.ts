interface IPosition {
    setPosition(position: String): void;
    getPosition(): String;
}

// node in tree
export class SmartArray<T extends IPosition> implements IPosition {
    private items: T[] = [];
    private itemsPosition: Map<T, number> = new Map<T, number>();
    private position: String = "";

    private refreshAllChildrenPositions() {
        const prefix = (this.position === "") ? "" : this.position + ".";

        this.items.forEach((item, index) => {
            item.setPosition(prefix +
                // add 1 to have it 1-based
                (index + 1))
        });
    }

    /** return shallow copy */
    getItems(): T[] { return [...this.items]; }

    setPosition(position: String) {
        if (this.position !== position) {
            this.position = position;
            // if there's any change it will recursively notify the children
            this.refreshAllChildrenPositions();
        }
    }

    getPosition() { return this.position; }

    push(item: T) {
        this.add(item,
            // +1 because add() takes 1-based indexes
            this.items.length + 1);
    }

    /** position is 1-based */
    add(item: T, position: number) {
        if (position > 0) {
            const zeroBasedPosition = position - 1;
            this.items.splice(zeroBasedPosition, 0, item);
            this.itemsPosition.set(item, zeroBasedPosition);
            // since we might be moving various children, refresh them all
            this.refreshAllChildrenPositions();
        }
    }

    // move an existing item to a new position
    // this will shift the elements to its right
    move(item: T, newPosition: number) {
        this.remove(item);
        this.add(item, newPosition);
        // NB: this will retrigger the computation of the children position twice.
        // maybe as future improvement pass a flag to say if such recomputation should be
        // triggered or not
    }

    remove(item: T) {
        const position = this.itemsPosition.get(item);
        if (position !== undefined) {
            this.items.splice(position, 1)
            // since we might be moving various children, refresh them all
            this.refreshAllChildrenPositions();
        }
    }

    toString(): String {
        return "[" + this.items.toString() + "]";
    }
}

export class Step extends SmartArray<Note> {
    constructor(journey?: Journey) {
        super();
        if (journey) {
            journey.push(this);
        }
    }
}

export class Journey extends SmartArray<Step> {
    constructor(allJourneys?: AllJourneys) {
        super();
        if (allJourneys) {
            allJourneys.push(this);
        }
    }
}

export class AllJourneys extends SmartArray<Journey> {

}

/** used by Version to track the Notes in each Step */
export class NotesInSteps {
    /** the keys are the position of the Step and the Note */
    private stepToNotes: Map<String, Map<String, Note>> = new Map();
    private maxSize = 0;
    private arrayArray: Array<Array<Note>> = new Array();

    constructor(steps: Array<Step>, notes: Set<Note>) {
        steps.forEach((step) => { this.addStep(step) });
        notes.forEach((note) => { this.addNote(note) });
        this.arrayArray = this.computeArrayArray();
    }

    /** add step. Used to add them all first */
    private addStep(step: Step) {
        this.stepToNotes.set(step.getPosition(), new Map());
    }

    private addNote(note: Note) {
        const stepPosition = note.getStep().getPosition();
        let notes = this.stepToNotes.get(stepPosition);
        if (notes !== undefined) {
            notes.set(note.getPosition(), note);
        }
    }

    /** 
     * compute the Array of Array that contains the notes. It is NOT a rectangle matrix
     * the first array has one entry for each step
     * the second has one entry for each note in that step
     */
    private computeArrayArray(): Array<Array<Note>> {
        this.maxSize = 0;
        const matrix = new Array<Array<Note>>();
        const sortedSteps = new Map([...this.stepToNotes].sort());
        sortedSteps.forEach((value) => {
            const array = new Array<Note>();
            // keep track of the longest
            if (value.size > this.maxSize) {
                this.maxSize = value.size;
            }
            matrix.push(array);
            const sortedNotes = new Map([...value].sort());
            sortedNotes.forEach((value) => {
                array.push(value);
            });
        });
        return matrix;
    }

    getArrayArray(): Array<Array<Note>> { return this.arrayArray; }

    getMaxSize(): number { return this.maxSize; }
}

export class Version implements IPosition {
    private notes: Set<Note> = new Set<Note>();
    private position: String = "";
    private name: String;
    private allJourneys: AllJourneys;
    private notesInStep: NotesInSteps | undefined;

    constructor(name: String, allJourneys: AllJourneys, allVersions?: AllVersions) {
        this.name = name;
        this.allJourneys = allJourneys;

        if (allVersions !== undefined) {
            allVersions.push(this);
        }

        this.rebuildInternalStructure();
    }

    setPosition(position: String): void { this.position = position; }
    getPosition(): String { return this.position; }
    addNote(note: Note) {
        this.notes.add(note);
        this.rebuildInternalStructure();
    }

    toString(): String { return this.position + '(' + this.name + ')'; }

    toStringNotesInStep(): String {
        if (this.notesInStep) {
            return this.notesInStep.getArrayArray().toString();
        } else {
            return "";
        }
    }

    /** track the Notes per Step */
    private rebuildInternalStructure() {
        const allSteps: Step[] = [];
        this.allJourneys.getItems().forEach((journey) => {
            journey.getItems().forEach((step) => { allSteps.push(step) });
        });
        this.notesInStep = new NotesInSteps(allSteps, this.notes);
    }

    getMaxNotesInStep(): number {
        if (this.notesInStep !== undefined) {
            return this.notesInStep.getMaxSize();
        } else {
            return 0;
        }
    }
}

export class AllVersions extends SmartArray<Version> {

}

export class Note implements IPosition {
    private name: String;
    private step: Step;
    private version: Version;
    private position: String = "";

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

    setPosition(position: String): void { this.position = position; }
    getPosition(): String { return this.position; }

    toString(): String { return this.position + "(" + this.name + ")"; }

    getStep(): Step { return this.step; }
}

export class StoryMapper {
    private journeys: AllJourneys = new AllJourneys();
    private versions: AllVersions = new AllVersions();
}
