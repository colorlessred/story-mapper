import {Serializer} from "./Serializer";
import {ISerialized} from "./ISerialized";

/**
 * build a serializable object that contains just the minimal needed data and no
 * external references.
 * - T: the serialized type
 */
export interface ISerializable<T> {
    toSerialized(serializer: Serializer): ISerialized<T>;
}