// node in the journey-step-note tree
import {IPath} from "./IPath";

export class SmartArray<T extends IPath> implements IPath {
    private items: T[] = [];
    private itemsPosition: Map<T, number> = new Map<T, number>();
    private path: String = "";
    private positionInParent: number = 0;

    private refreshAllChildrenPaths() {
        const prefix = (this.path === "") ? "" : this.path + ".";

        this.items.forEach((item, index) => {
            item.setPath(prefix +
                // add 1 to have it 1-based
                (index + 1))
        });
    }

    /** return shallow copy */
    getItems(): T[] {
        return [...this.items];
    }

    setPath(path: String) {
        if (this.path !== path) {
            this.path = path;
            // if there's any change it will recursively notify the children
            this.refreshAllChildrenPaths();
        }
    }

    getPath() {
        return this.path;
    }

    push(item: T) {
        this.add(item,
            // +1 because add() takes 1-based indexes
            this.items.length + 1);
    }

    /** position is 1-based */
    add(item: T, position: number) {
        if (position > 0) {
            const zeroBasedPosition: number = position - 1;
            this.items.splice(zeroBasedPosition, 0, item);
            this.itemsPosition.set(item, zeroBasedPosition);
            // since we might be moving various children, refresh them all
            this.refreshAllChildrenPaths();
        }
    }

    // move an existing item to a new position
    // this will shift the elements to its right
    move(item: T, newPosition: number) {
        this.remove(item);
        this.add(item, newPosition);
        // NB: this will trigger the recomputation of the children position twice.
        // maybe as future improvement pass a flag to say if such recomputation should be
        // triggered or not
    }

    remove(item: T) {
        const position = this.itemsPosition.get(item);
        if (position !== undefined) {
            this.items.splice(position, 1)
            // since we might be moving various children, refresh them all
            this.refreshAllChildrenPaths();
        }
    }

    toString(): String {
        return "[" + this.items.toString() + "]";
    }

    getPositionInParent(): number {
        return this.positionInParent;
    }

    setPositionInParent(position: number): void {
        this.positionInParent = position;
    }
}