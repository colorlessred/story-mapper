import {Serializer} from "./Serializer";
import {Deserializer} from "./Deserializer";
import {ISerialized} from "./ISerialized";

/**
 * build a serializable object that contains just the minimal needed data and no
 * external references.
 * - T: the serialized type
 */
export interface ISerializable<T> {
    toSerialized(serializer: Serializer): ISerialized<T>;

    // toObject(deserializer: Deserializer): ISerializable<T>;
}