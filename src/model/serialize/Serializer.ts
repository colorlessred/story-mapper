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

    constructor(object: ISerializable<any>) {
        this.getObject(object);
    }

    /**
     * return a JSON representation of the serialized objects
     */
    public getJson(): string {
        const json = JSON.stringify(this.references);
        console.log(json);
        return json;
    }

    /**
     * try and get the id of the object from the stored references. If it's not there
     * it will serialize it, store it, and return the id;
     * @param object
     */
    public getObject(object?: ISerializable<any>): number {
        let id = this.objectToId.get(object);
        if (id === undefined) {
            // to be able to map even circular dependencies, first store the
            // undefined mapping
            const newId = this.references.length;
            this.objectToId.set(object, newId);
            this.references.push(undefined);

            // push the serialized object into the references
            if (object !== undefined) {
                this.references[newId] = object.toSerialized(this);
            }
            this.objectToId.set(object, newId);

            id = newId;
        }
        return id;
    }
}