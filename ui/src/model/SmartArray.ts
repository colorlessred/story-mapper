import {IPath} from "./IPath";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";

export interface SmartArraySerialized {
}

/**
 * Node in the journey-step-note tree
 */
export class SmartArray<T extends IPath> implements IPath {

    private _items: T[] = [];
    /**
     * track where the items are, to remove them efficiently
     * the position is zero-based
     * @private
     */
    private _itemsPosition: Map<T, number> = new Map<T, number>();

    /**
     * represent hierarchical path. When a parent is modified it will trigger the modification
     * of all its children
     * @private
     */
    private _path: string = "";
    private _positionInParent: number = 0;

    toSerialized(serializer: Serializer): ISerialized<SmartArraySerialized> {
        throw new Error("SmartArray should never be serialized directly");
    }

    public isEmpty(): boolean {
        return this._items.length === 0;
    }

    public getItemPosition(item: T): number | undefined {
        return this._itemsPosition.get(item);
    }

    public alreadyContains(item: T) {
        return this._itemsPosition.has(item);
    }

    private refreshInternalModel() {
        const prefix = (this._path === "") ? "" : this._path + ".";
        this._itemsPosition = new Map<T, number>();

        this._items.forEach((item, index) => {
            this._itemsPosition.set(item, index);
            const oneBasedIndex = index + 1;
            item.path = prefix + oneBasedIndex;
            item.positionInParent = index;
        });
    }

    /** return shallow copy */
    get items(): T[] {
        return [...this._items];
    }

    set path(path: string) {
        if (this._path !== path) {
            this._path = path;
            // if there's any change it will recursively notify the children
            this.refreshInternalModel();
        }
    }

    get path() {
        return this._path;
    }

    push(item: T) {
        this.add(item,
            // +1 because add() takes 1-based indexes
            this._items.length + 1);
    }

    /**
     * add the newItem next to the existingItem
     * @param newItem
     * @param existingItem
     */
    addNextTo(newItem: T, existingItem: T) {
        const positionExisting = this._itemsPosition.get(existingItem);
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
            this._items.splice(zeroBasedPosition, 0, item);
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
        const position = this._itemsPosition.get(item);
        if (position !== undefined) {
            const size = this.size();
            this._items.splice(position, 1);
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
        const itemsString = this._items.toString();
        return `[${itemsString}]`;
    }

    get positionInParent(): number {
        return this._positionInParent;
    }

    set positionInParent(position: number) {
        this._positionInParent = position;
    }

    /**
     * true if the child item can be deleted. Specific behaviours can be implemented in the
     * overrides
     * @param item
     */
    canDeleteItem(item: T): boolean {
        return this._itemsPosition.has(item);
    }

    /**
     * number of items contained
     */
    size(): number {
        return this._items.length;
    }

    has(item: T): boolean {
        return this._itemsPosition.has(item);
    }
}