import {ISerialized} from "./ISerialized";
import {ISerializable} from "./ISerializable";

interface ArrayOfSerialized<T> extends Array<ISerialized<T>> {

}

/**
 * function that given a generic type T that represents the serialized data,
 * it returns the appropriate object that can be serialized to T
 */
export type DeserializerFunction<T, S extends ISerializable<T>> = (values: T, deserializer: Deserializer) => S;

export class Deserializer {
    /**
     * store functions that turn the serialized json into the original object
     * @private
     */
    private readonly deserializerFunctions: Map<string, DeserializerFunction<any, any>> = new Map();

    /**
     * items so far deserialized
     * @private
     */
    private readonly dItems: Map<number, ISerializable<any> | undefined> = new Map();
    private readonly items: ArrayOfSerialized<any>;

    constructor(json: string) {
        this.items = JSON.parse(json);
    }

    /**
     * add a deserializer for a particular type
     * @param type
     * @param deserializerFunction
     */
    addDeserializer<T, S extends ISerializable<T>>(type: string, deserializerFunction: DeserializerFunction<T, S>) {
        this.deserializerFunctions.set(type, deserializerFunction);
    }

    public deserializeItem<T, S extends ISerializable<T>>(id: number | undefined): S | undefined {
        if (id === undefined) {
            return undefined;
        }
        let dItem: any | undefined = this.dItems.get(id);

        if (dItem === undefined) {
            const sItem: ISerialized<T> = this.items[id];
            // get the appropriate deserializer
            const type = sItem.type;
            const deserializerFunction: DeserializerFunction<T, S> | undefined = this.deserializerFunctions.get(type);
            if (deserializerFunction === undefined) {
                throw new Error(`Don't have deserializer function for type "${type}"`);
            }
            const deserialized: S = deserializerFunction(sItem.value, this);
            // store for future reference
            this.dItems.set(id, deserialized);
            dItem = deserialized;
        }
        return dItem;
    }

    deserialize(): ISerializable<any> | undefined {
        // deserialize the first element, which is always the root
        // this will trigger the deserialization of all the needed dependencies
        return this.deserializeItem(0);
    }

    public toObject(): object {
        return {};
    }
}