import {Deserializer, DeserializerFunction} from "./serialize/Deserializer";
import {AllVersions} from "./AllVersions";
import {Version} from "./card/Version";
import {AllJourneys} from "./AllJourneys";
import {Journey} from "./card/Journey";
import {Step} from "./card/Step";
import {Note} from "./card/Note";
import {CommonCardData} from "./CommonCardData";
import {StoryMapper} from "./StoryMapper";
import {ISerializable} from "./serialize/ISerializable";

export class StoryMapperDeserializer {
    private deserializer: Deserializer = new Deserializer();

    constructor() {
        const add = <T, S extends ISerializable<T>>(typeName: string, deserializerType: DeserializerFunction<T, S>) => {
            this.deserializer.addDeserializer(typeName, deserializerType);
        };

        // console.log(StoryMapper.serializedTypeName());
        add(StoryMapper.serializedTypeName(), StoryMapper.deserializerFunction);
        // add('StoryMapper', StoryMapper.deserializerFunction);
        add(AllVersions.serializedTypeName(), AllVersions.deserializerFunction);
        add(Version.serializedTypeName(), Version.deserializerFunction);
        add(AllJourneys.serializedTypeName(), AllJourneys.deserializerFunction);
        add(Journey.serializedTypeName(), Journey.deserializerFunction);
        add(Step.serializedTypeName(), Step.deserializerFunction);
        add(Note.serializedTypeName(), Note.deserializerFunction);
        add(CommonCardData.serializedTypeName(), CommonCardData.deserializerFunction);
    }

    public deserialize(json: string): StoryMapper {
        return this.deserializer.deserialize(json);
    }

}