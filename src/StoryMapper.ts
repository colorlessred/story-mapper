interface IPosition {
    setPosition(position: String): void;
    getPosition(): String;
}

// node in tree
export class SmartArray<T extends IPosition> implements IPosition {
    items: T[] = [];
    itemsPosition: Map<T, number> = new Map<T, number>();
    position: String = "";

    private refreshAllChildrenPositions() {
        const prefix = (this.position === "") ? "" : this.position + ".";

        this.items.forEach((item, index) => {
            item.setPosition(prefix +
                // add 1 to have it 1-based
                (index + 1))
        });
    }

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

}

export class Journey extends SmartArray<Step> {

}

export class AllJourneys extends SmartArray<Journey> {

}

export class Version implements IPosition {
    notes: Set<Note> = new Set<Note>();
    position: String = "";
    name: String;

    constructor(name: String) {
        this.name = name;
    }

    setPosition(position: String): void { this.position = position; }
    getPosition(): String { return this.position; }
    addNote(note: Note) { this.notes.add(note); }

    toString(): String { return this.position + '(' + this.name + ')'; }
}

export class AllVersions extends SmartArray<Version> {

}

export class Note implements IPosition {
    name: String;
    step: Step;
    version: Version;
    position: String = "";

    constructor(name: String, step: Step, version: Version) {
        this.name = name;
        this.step = step;
        this.version = version;
    }

    setPosition(position: String): void { this.position = position; }
    getPosition(): String { return this.position; }

    toString(): String { return this.position + "(" + this.name + ")"; }
}

export class StoryMapper {
    journeys: AllJourneys = new AllJourneys();
    versions: AllVersions = new AllVersions();
}
