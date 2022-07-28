import {ISerializable} from "./serialize/ISerializable";
import {ISerialized} from "./serialize/ISerialized";
import {Serializer} from "./serialize/Serializer";
import {Deserializer, DeserializerFunction} from "./serialize/Deserializer";

export interface CommonCardDataSerialized {
    title: string;
    content: string;
    editMode: boolean;
}

/**
 * encapsulate common data needed by all the visible cards
 */
export class CommonCardData implements ISerializable<CommonCardDataSerialized> {

    /**
     * card title. Short enough to be displayed on the card
     */
    private _title: string = "";
    /**
     * the card content. The longer text that can be shown on the card itself
     */
    private _content: string = "";

    /**
     * true if we are editing the card
     * @private
     */
    private _editMode: boolean = false;

    get content(): string {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get editMode(): boolean {
        return this._editMode;
    }

    set editMode(value: boolean) {
        this._editMode = value;
    }

    public static serializedTypeName = () => 'CommonCardData';

    toSerialized(serializer: Serializer): ISerialized<CommonCardDataSerialized> {
        return {
            type: CommonCardData.serializedTypeName(),
            value: {
                title: this.title,
                content: this.content,
                editMode: this.editMode
            }
        };
    }

    public static deserializerFunction = new DeserializerFunction<CommonCardDataSerialized, CommonCardData>(
        (values: CommonCardDataSerialized) => {
            const commonCardData = new CommonCardData();
            commonCardData.title = values.title;
            commonCardData.content = values.content;
            commonCardData.editMode = values.editMode;
            return commonCardData;
        },
        (object: CommonCardData, values: CommonCardDataSerialized, deserializer: Deserializer) => {
        }
    );


}