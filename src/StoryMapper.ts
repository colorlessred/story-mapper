export class SmartArray<T> {
    items: T[] = [];

    push(item: T) {
        this.items.push(item);
    }

    add(item: T, position: number) {
        this.items.splice(position, 0, item);
    }

    remove(item: T) {
        this.items = this.items.filter((a: T) => a !== item);
    }

    toString(): String {
        return "[" + this.items.toString() + "]";
    }
}

// allow to maintain items in a list and reorder them
interface ISortable {
    getPosition(): number;

    getName(): String;
}

class Sortable implements ISortable {
    position: number;
    name: String;

    constructor(position: number, name: String) {
        this.position = position;
        this.name = name;
    }

    getPosition(): number {
        return this.position;
    }

    getName(): String {
        return this.name;
    }
}

class SortableSet<T extends Sortable> {
    items: Set<T> = new Set<T>();
    list: T[] = [];
    // track if list needs to be rebuilt
    dirty: boolean = false;

    add(item: T) {
        this.dirty = true;
        this.items.add(item);
    }

    remove(item: T): void {
        this.dirty = true;
        this.items.delete(item);
    }

    getList(): T[] {
        if (this.dirty) {
            // recompute list only when needed
            this.dirty = false;
            this.list = Array.from(this.items).sort((a: T, b: T) => a.position - b.position);
        }
        return this.list;
    }

}

// the note that describes the actual work
export class Note extends Sortable {
    step: Step;
    version: Version;

    constructor(position: number, name: String, step: Step, version: Version) {
        super(position, name);
        this.step = step;
        this.version = version;
    }
}

class SortableSetSortable extends SortableSet<Note> implements ISortable {
    sortable: Sortable;

    constructor(position: number, name: String) {
        super();
        this.sortable = new Sortable(position, name);
    }

    add(note: Note) {
        this.add(note);
    }

    getName(): String {
        return this.sortable.getName();
    }

    getPosition(): number {
        return this.sortable.getPosition();
    }
}

class Version extends SortableSetSortable {
}

class Step extends SortableSetSortable {
}

