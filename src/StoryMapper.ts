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
    getItems(): T[] {
        return [...this.items];
    }

    setPosition(position: String) {
        if (this.position !== position) {
            this.position = position;
            // if there's any change it will recursively notify the children
            this.refreshAllChildrenPositions();
        }
    }

    getPosition() {
        return this.position;
    }

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

export class Step extends SmartArray<Note> implements ICard {
    constructor(journey?: Journey) {
        super();
        if (journey) {
            journey.push(this);
        }
    }

    getName(): String {
        return "step";
    }

    createNewNext(): void {
    }
}

export class Journey extends SmartArray<Step> implements ICard {
    constructor(allJourneys?: AllJourneys) {
        super();
        if (allJourneys) {
            allJourneys.push(this);
        }
    }

    getName(): String {
        return "journey"
    }

    createNewNext(): void {
    }
}

/** root object that contains all the journeys */
export class AllJourneys extends SmartArray<Journey> {
}

/** used by Version to track the Notes in each Step */
export class NotesInSteps {
    /** the keys are the position of the Step and the Note */
    private stepToNotes: Map<String, Map<String, Note>> = new Map();
    private maxSize = 0;
    private readonly arrayArray: Array<Array<Note>> = [];

    constructor(steps: Array<Step>, notes: Set<Note>) {
        steps.forEach((step) => {
            this.addStep(step)
        });
        notes.forEach((note) => {
            this.addNote(note)
        });
        this.arrayArray = this.computeArrayArray();
    }

    /** add all the steps, even the ones for which we have no notes */
    private addStep(step: Step) {
        this.stepToNotes.set(step.getPosition(), new Map());
    }

    /** add the notes, linking them to the proper steps */
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

export class Version implements IPosition, ICard {
    private readonly name: String;
    private notes: Set<Note> = new Set<Note>();
    private position: String = "";
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

    setPosition(position: String): void {
        this.position = position;
    }

    getPosition(): String {
        return this.position;
    }

    addNote(note: Note) {
        this.notes.add(note);
        this.rebuildInternalStructure();
    }

    toString(): String {
        return this.position + '(' + this.name + ')';
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

    getMaxNotesInStep(): number {
        if (this.notesInStep !== undefined) {
            return this.notesInStep.getMaxSize();
        } else {
            return 0;
        }
    }

    getName(): String {
        return this.name;
    }

    createNewNext(): void {
    }
}

export class AllVersions extends SmartArray<Version> {
}

export class Note implements IPosition, ICard {
    private readonly name: String;
    private readonly step: Step;
    private version: Version;
    /** string that represents the whole hierarchical position, journey.step.note */

    private position: String = "";
    /** track the position only inside the version step */
    private positionInVersionStep: number = 0;
    private positionInVersionStepPath: String = "";

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

    setPosition(position: String): void {
        this.position = position;
    }

    getPosition(): String {
        return this.position;
    }

    setPositionInVersionStep(position: number): void {
        this.positionInVersionStep = position;
        // name should be: journey.step.version.noteIn
        this.positionInVersionStepPath =
            [this.getStep().getPosition(), this.version.getPosition(), this.positionInVersionStep].join('.');
    }

    toString(): string {
        return this.position + "(" + this.name + ")";
    }

    toStringVersion(): String {
        return this.positionInVersionStepPath + "(" + this.name + ")";
    }

    getStep(): Step {
        return this.step;
    }

    getName(): String {
        return this.name;
    }

    createNewNext(): void {
    }
}

interface ICard {
    getName(): String;

    /** create new item next to the current one */
    createNewNext(): void;
}

class EmptyContent implements ICard {
    getName(): String {
        return "";
    }

    createNewNext(): void {
    }
}

/** the Card that composes the board. Made of anything that implements ICard,
 * like the hierarchical types (Journey, Step, Note), but also empty or button-like cards
 */
export class Card {
    baseElement: ICard;

    constructor(baseElement: ICard) {
        this.baseElement = baseElement;
    }

    toString(): String {
        return this.baseElement.getName();
    }
}

/** the global board from which we will build the UI */
export class Board {
    private cards: Array<Array<Card>> = [];
    private currentArray: Array<Card> = [];
    private startNewLine: boolean = false;

    /** add cards horizontally */
    addCard(card: Card) {
        if (this.startNewLine) {
            this.startNewLine = false;
            this.currentArray = [];
        }
        this.currentArray.push(card);
    }

    endLine() {
        // check that the line has the correct length
        if (this.cards.length > 0) {
            const columns = this.cards[0].length;
            if (this.currentArray.length != columns) {
                throw new Error(`The first row had ${columns} columns, but the current row has ${this.currentArray.length}`)
            }
        }
        this.cards.push(this.currentArray);
        this.startNewLine = true;
    }

    toString(): string {
        const out: String[] = [];
        out.push('[');
        this.cards.forEach((arrayCard) => {
            out.push('[');
            out.push(arrayCard.map((card) => card.toString()).join(','));
            out.push(']');
        });
        out.push(']');

        return out.join('');
    }

    getCards() {
        return this.cards;
    }
}

/** class the represents the full model */
export class StoryMapper {
    private allJourneys: AllJourneys = new AllJourneys();
    private allVersions: AllVersions = new AllVersions();

    addJourney(): Journey {
        return new Journey(this.allJourneys);
    }

    addVersion(name: String): Version {
        return new Version(name, this.allJourneys, this.allVersions);
    }

    deleteJourney(journey: Journey): void {
        // TODO
        throw new Error("not implemented");
    }

    deleteVersion(version: Version): void {
        // TODO
        throw new Error("not implemented");
    }

    addStep(journey: Journey): Step {
        return new Step(journey)
    }

    addNote(name: String, step: Step, version: Version): Note {
        return new Note(name, step, version, true, true);
    }

    /** loop over all the data and create the board */
    buildBoard(): Board {
        const board: Board = new Board();
        // version column
        board.addCard(new Card(new EmptyContent()));
        // row of journeys
        this.allJourneys.getItems().forEach((journey) => {
            journey.getItems().forEach((step, index) => {
                const card = (index === 0) ? new Card(journey) : new Card(new EmptyContent());
                board.addCard(card);
            });
        });
        board.endLine();
        // version column
        board.addCard(new Card(new EmptyContent()));
        // row of steps
        this.allJourneys.getItems().forEach((journey) => {
            journey.getItems().forEach((step) => {
                board.addCard(new Card(step));
            });
        });
        board.endLine();
        // versions
        this.allVersions.getItems().forEach((version) => {
            const notesInSteps = version.getNotesInSteps();
            /** longest notes in step */
            const rows = notesInSteps.getMaxSize();
            /** number of steps */
            const cols = notesInSteps.getStepsSize();
            const arrayArrayNotes = notesInSteps.getArrayArray();
            for (let row = 0; row < rows; row++) {
                if (row === 0) {
                    board.addCard(new Card(version));
                } else {
                    board.addCard(new Card(new EmptyContent()));
                }
                for (let col = 0; col < cols; col++) {
                    const arrayNotes: Note[] = arrayArrayNotes[col];
                    if (row < arrayNotes.length) {
                        const note: Note = arrayNotes[row];
                        board.addCard(new Card(note));
                    } else {
                        board.addCard(new Card(new EmptyContent()));
                    }
                }
                board.endLine();
            }
        });

        return board;
    }
}
