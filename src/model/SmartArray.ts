import {IPath} from "./IPath";

/**
 * Node in the journey-step-note tree
 */
export class SmartArray<T extends IPath> implements IPath {
    private items: T[] = [];
    /**
     * track where the items are, to remove them efficiently
     * @private
     */
    private itemsPosition: Map<T, number> = new Map<T, number>();
    /**
     * represent hierarchical path. When a parent is modified it will trigger the modification
     * of all its children
     * @private
     */
    private path: String = "";
    private positionInParent: number = 0;

    public isEmpty(): boolean {
        return this.items.length === 0
    }

    private refreshAllChildrenPaths() {
        const prefix = (this.path === "") ? "" : this.path + ".";

        this.items.forEach((item, index) => {
            const oneBasedIndex = index + 1;
            item.setPath(prefix + oneBasedIndex);
            item.setPositionInParent(index);
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

    /**
     * add the newItem next to the existingItem
     * @param newItem
     * @param existingItem
     */
    addNextTo(newItem: T, existingItem: T) {
        const positionExisting = this.itemsPosition.get(existingItem);
        if (positionExisting !== undefined) {
            // positionExisting is zero-based, while the param
            // in add() is one-based, so we need the "+2" to
            // get the next position
            this.add(newItem, positionExisting + 2);
        } else {
            throw new Error("item doesn't belong to this SmartArray");
        }
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
        } else {
            throw new Error("item to remove doesn't belong to this SmartArray");
        }
    }

    toString(): String {
        const itemsString = this.items.toString();
        return `[${itemsString}]`;
    }

    getPositionInParent(): number {
        return this.positionInParent;
    }

    setPositionInParent(position: number): void {
        this.positionInParent = position;
    }
}