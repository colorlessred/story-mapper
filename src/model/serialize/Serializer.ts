import {ISerializable} from "./ISerializable";

export class Serializer {
    /**
     * store the serialized objects
     * @private
     */
    private readonly references: (any | undefined)[] = [];
    /**
     * maps the object into its position in the references array
     * @private
     */
    private readonly objectToId: Map<any, number> = new Map<any, number>();
    private readonly root: Object;

    constructor(object: ISerializable) {
        this.root = object.toSerialized(this);
    }

    /**
     * return a JSON representation of the serialized objects
     */
    public getJson(): string {
        return JSON.stringify(
            {
                root: this.root,
                references: this.references
            });
    }

    /**
     * try and get the id of the object from the stored references. If it's not there
     * it will serialize it, store it, and return the id;
     * @param object
     */
    public getObject(object?: ISerializable): number | undefined {
        if (object === undefined) {
            return undefined;
        }
        let id = this.objectToId.get(object);
        if (id === undefined) {
            // to be able to map even circular dependencies, first store the
            // undefined mapping
            const newId = this.references.length;
            this.objectToId.set(object, newId);
            this.references.push(undefined);

            // push the serialized object into the references
            this.references[newId] = object.toSerialized(this);
            this.objectToId.set(object, newId);

            id = newId;
        }
        return id;
    }

    public getObjectFromReference(id: number): any {
        if (id < 0 || id >= this.references.length) {
            throw new Error(`wrong id (${id}). Must be between 0 and ${this.references.length - 1} inclusive`);
        }
        return this.references[id];
    }
}