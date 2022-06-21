interface IParent<T> {
    setParent(parent: T): void;

    getParent(): T | undefined;
}

export class SmartArray<T extends IParent<R>, R, S> implements IParent<S> {
    items: T[] = [];
    itemsPosition: Map<T, number> = new Map<T, number>();
    parent?: S;

    setParent(parent: S) {
        this.parent = parent;
    }

    getParent(): S | undefined {
        return this.parent;
    }

    push(item: T) {
        this.add(item, this.items.length);
    }

    add(item: T, position: number) {
        this.items.splice(position, 0, item);
        this.itemsPosition.set(item, position);
        item.setParent(this);
    }

    remove(item: T) {
        const pos = this.itemsPosition.get(item);
        if (pos !== undefined) {
            this.items.splice(pos, 1)
        }
    }

    toString(): String {
        return "[" + this.items.toString() + "]";
    }
}

export class Step extends SmartArray<Note, Step, Journey> {

}

export class Journey extends SmartArray<Step, Journey, AllJourneys> {

}

export class AllJourneys extends SmartArray<Journey, AllJourneys, AllJourneys> {

}

export class Version implements IParent<AllVersions> {
    notes: Set<Note> = new Set<Note>();
    allVersions: AllVersions | undefined;

    getParent(): AllVersions | undefined {
        return this.allVersions;
    }

    setParent(parent: AllVersions): void {
        this.allVersions = parent;
    }
}

export class AllVersions extends SmartArray<Version, AllVersions, AllVersions> {

}

export class Note implements IParent<Step> {
    name: String;
    step: Step;
    version: Version;

    constructor(name: String, step: Step, version: Version) {
        this.name = name;
        this.step = step;
        this.version = version;
    }

    getParent(): Step | undefined {
        return this.step;
    }

    setParent(parent: Step): void {
        this.step = parent;
    }
}

export class StoryMapper {
    journeys: AllJourneys = new AllJourneys();
    versions: AllVersions = new AllVersions();


}
