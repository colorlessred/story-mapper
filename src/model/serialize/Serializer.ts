import {ISerializable} from "./ISerializable";
import {ISerialized} from "./ISerialized";

export class Serializer {
    /**
     * store the serialized objects
     * @private
     */
    private readonly references: ISerialized[] = [];
    private readonly objectToId: Map<any, number> = new Map<any, number>();

    /**
     * storey object and return a numeric id that identifies it
     * @param object
     */
    public getReference(object: ISerializable): number {
        let id = this.objectToId.get(object);
        if (id === undefined) {
            id = this.references.length;
            // push the serialized object into the references
            this.references.push(object.toSerialized(this));
            this.objectToId.set(object, id);
        }
        return id;
    }

    public getObjectFromReference(id: number): ISerialized {
        if (id < 0 || id >= this.references.length) {
            throw new Error(`wrong id (${id}). Must be between 0 and ${this.references.length - 1} inclusive`);
        }
        return this.references[id];
    }
}