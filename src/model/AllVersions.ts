import {SmartArray} from "./SmartArray";
import {Version} from "./Version";
import {ISerializable} from "./serialize/ISerializable";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";

export interface AllVersionsSerialized {
    versions: (number | undefined)[];
}

export class AllVersions extends SmartArray<Version> implements ISerializable<AllVersionsSerialized> {
    toSerialized(serializer: Serializer): ISerialized<AllVersionsSerialized> {
        return {
            type: 'AllVersions',
            value: {
                versions: this.getItems().map(version => serializer.getObject(version))
            }
        };
    }
}