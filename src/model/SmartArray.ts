import {IPath} from "./IPath";

/**
 * Node in the journey-step-note tree
 */
export class SmartArray<T extends IPath> implements IPath {
    private items: T[] = [];
    /**
     * track where the items are, to remove them efficiently
     * the position is zero-based
     * @private
     */
    private itemsPosition: Map<T, number> = new Map<T, number>();

    /**
     * represent hierarchical path. When a parent is modified it will trigger the modification
     * of all its children
     * @private
     */
    private path: string = "";
    private positionInParent: number = 0;

    public isEmpty(): boolean {
        return this.items.length === 0;
    }

    public getItemPosition(item: T): number | undefined {
        return this.itemsPosition.get(item);
    }

    public alreadyContains(item: T) {
        return this.itemsPosition.has(item);
    }

    private refreshInternalModel() {
        const prefix = (this.path === "") ? "" : this.path + ".";
        this.itemsPosition = new Map<T, number>();

        this.items.forEach((item, index) => {
            this.itemsPosition.set(item, index);
            const oneBasedIndex = index + 1;
            item.setPath(prefix + oneBasedIndex);
            item.setPositionInParent(index);
        });
    }

    /** return shallow copy */
    getItems(): T[] {
        return [...this.items];
    }

    setPath(path: string) {
        if (this.path !== path) {
            this.path = path;
            // if there's any change it will recursively notify the children
            this.refreshInternalModel();
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
        if (this.alreadyContains(item)) {
            throw new Error("Cannot add item already present");
        }
        if (position > 0) {
            const zeroBasedPosition: number = position - 1;
            this.items.splice(zeroBasedPosition, 0, item);
            // since we might be moving various children, refresh them all
            this.refreshInternalModel();
        }
    }

    /**
     * move an existing item to a new position
     * this will shift the elements to its right
     * @param item
     * @param newPosition
     */
    move(item: T, newPosition: number) {
        if (!this.alreadyContains(item)) {
            throw new Error("Cannot move item that is not already present");
        }
        this.deleteItem(item);
        this.add(item, newPosition);
        // NB: this will trigger the recomputation of the children position twice.
        // maybe as future improvement pass a flag to say if such recomputation should be
        // triggered or not
    }

    /**
     * delete one item and refresh the children paths
     * @param item
     */
    deleteItem(item: T) {
        const position = this.itemsPosition.get(item);
        if (position !== undefined) {
            const size = this.size();
            this.items.splice(position, 1);
            if (this.size() !== (size - 1)) {
                throw new Error(`deleting position ${position}, before deletion the size was ${size} and after deletion is it is ${this.size()}`);
            }
            // since we might be moving various children, refresh them all
            this.refreshInternalModel();
        } else {
            throw new Error("item to remove doesn't belong to this SmartArray");
        }
    }

    toString(): string {
        const itemsString = this.items.toString();
        return `[${itemsString}]`;
    }

    getPositionInParent(): number {
        return this.positionInParent;
    }

    setPositionInParent(position: number): void {
        this.positionInParent = position;
    }

    /**
     * true if the child item can be deleted. Specific behaviours can be implemented in the
     * overrides
     * @param item
     */
    canDeleteItem(item: T): boolean {
        return this.itemsPosition.has(item);
    }

    /**
     * number of items contained
     */
    size(): number {
        return this.items.length;
    }

    has(item: T): boolean {
        return this.itemsPosition.has(item);
    }
}