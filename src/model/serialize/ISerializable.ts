import {Serializer} from "./Serializer";

/**
 * build a serializable object that contains just the minimal needed data and no
 * external references.
 * - T: the serialized type
 */
export interface ISerializable {
    toSerialized(serializer: Serializer): object;
}