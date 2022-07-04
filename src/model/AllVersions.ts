import {SmartArray} from "./SmartArray";
import {Version, VersionSerialized} from "./Version";
import {ISerializable} from "./serialize/ISerializable";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";
import {Deserializer, DeserializerFunction} from "./serialize/Deserializer";

export interface AllVersionsSerialized {
    versions: number [];
}

export class AllVersions extends SmartArray<Version> implements ISerializable<AllVersionsSerialized> {
    toSerialized(serializer: Serializer): ISerialized<AllVersionsSerialized> {
        return {
            type: AllVersions.serializedTypeName(),
            value: {
                versions: this.getItems().map(version => serializer.getObject(version))
            }
        };
    }

    public static serializedTypeName = () => 'AllVersions';

    public static deserializerFunction = new DeserializerFunction<AllVersionsSerialized, AllVersions>(
        (values: AllVersionsSerialized) => new AllVersions(),
        (object: AllVersions, values: AllVersionsSerialized, deserializer: Deserializer) => {
            values.versions.forEach(versionId => {
                const version = deserializer.deserializeItem<VersionSerialized, Version>(versionId);
                object.push(version);
            });
        }
    );
}