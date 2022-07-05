import {ISerialized} from "./ISerialized";
import {ISerializable} from "./ISerializable";

interface ArrayOfSerialized<T> extends Array<ISerialized<T>> {

}

/**
 * the deserializer needs to function, one to return a basic object without references,
 * and one to add the references
 */
export class DeserializerFunction<T, S extends ISerializable<T>> {
    /**
     * create basic version of S that doesn't have external references
     */
    basic: (values: T) => S;
    /**
     * add the external references to the object already created by "basic"
     */
    withReferences: (object: S, values: T, deserializer: Deserializer) => void;

    /**
     * optional function to be executed after all the references have been built
     */
    finalize?: (object: S) => void;

    constructor(
        basic: (values: T) => S,
        withReferences: (object: S, values: T, deserializer: Deserializer) => void,
        finalize?: (object: S) => void) {
        this.basic = basic;
        this.withReferences = withReferences;
        this.finalize = finalize;
    }
}

/**
 * class that can turn the serialized JSON into the proper objects.
 * The actual work of instantiating the objects is done by the DeserializerFunction entries
 * added with addDeserializer
 */
export class Deserializer {
    /**
     * store functions that turn the serialized json into the original object
     * @private
     */
    private readonly deserializerTypes: Map<string, DeserializerFunction<any, any>> = new Map();

    /**
     * items so far deserialized
     * @private
     */
    private readonly dItems: Map<number, ISerializable<any> | undefined> = new Map();

    /**
     * array that contains all the serialized objects. The first item in the array is the
     * root object
     * @private
     */
    private readonly items: ArrayOfSerialized<any>;

    /**
     * instantiate Deserializer from JSON string
     * @param json
     */
    constructor(json: string) {
        this.items = JSON.parse(json);
    }

    /**
     * add a deserializer for a particular type
     */
    addDeserializer<T, S extends ISerializable<T>>(type: string, deserializerType: DeserializerFunction<T, S>) {
        this.deserializerTypes.set(type, deserializerType);
    }

    /**
     * turn an entry in the array created from the JSON, into a proper object,
     * by looking up the type of deserializer we need
     * @param id
     */
    public deserializeItem<T, S extends ISerializable<T>>(id: number): S {
        let dItem: any | undefined = this.dItems.get(id);

        if (dItem === undefined) {
            const sItem: ISerialized<T> = this.items[id];
            // get the appropriate deserializer
            const type = sItem.type;
            const deserializerType: DeserializerFunction<T, S> | undefined = this.deserializerTypes.get(type);
            if (deserializerType === undefined) {
                throw new Error(`Don't have deserializer function for type "${type}"`);
            }
            // first get a basic version that doesn't need recursive calls to the
            // deserializer, thus avoiding risk of infinite loops
            const deserialized: S = deserializerType.basic(sItem.value);
            // store for future reference, so if the dependency graph comes back looking for this
            // object, it will find it in the stored deserialized items
            this.dItems.set(id, deserialized);

            // then add the values that need other references
            deserializerType.withReferences(deserialized, sItem.value, this);
            dItem = deserialized;
        }
        return dItem;
    }

    /**
     * deserialize, starting from the first element of the array as root
     */
    deserialize<T, S extends ISerializable<T>>(): S {
        // deserialize the first element, which is always the root
        // this will trigger the deserialization of all the needed dependencies
        return this.deserializeItem<T, S>(0);
    }
}