import {Serializer} from "../model/serialize/Serializer";
import {ISerializable} from "../model/serialize/ISerializable";


describe('serializer', () => {
    it('class with primitives', () => {
        class TestClass implements ISerializable {
            fieldString: string;
            fieldBoolean: boolean;
            fieldNumber: number;

            constructor(fieldString: string, fieldBoolean: boolean, fieldNumber: number) {
                this.fieldString = fieldString;
                this.fieldBoolean = fieldBoolean;
                this.fieldNumber = fieldNumber;
            }

            toSerialized(serializer: Serializer): Object {
                return {
                    fieldString: this.fieldString,
                    fieldBoolean: this.fieldBoolean,
                    fieldNumber: this.fieldNumber
                };
            }
        }

        const a = new TestClass("abc", true, 1234);
        const serializer = new Serializer(a);

        expect(serializer.getJson()).toEqual(
            "{\"root\":{\"fieldString\":\"abc\",\"fieldBoolean\":true,\"fieldNumber\":1234},\"references\":[]}");
    });

    it('class with references', () => {
        class TestClass implements ISerializable {
            name: string;
            parent?: TestClass;

            constructor(name: string, parent?: TestClass) {
                this.name = name;
                this.parent = parent;
            }

            setParent(parent: TestClass) {
                this.parent = parent;
            }

            toSerialized(serializer: Serializer): Object {
                return {
                    name: this.name,
                    parent: serializer.getObject(this.parent)
                };
            }
        }

        const a = new TestClass("a");
        const b = new TestClass("b", a);
        const c = new TestClass("c", b);
        // circular dependency
        a.setParent(c);

        const serializer = new Serializer(a);
        const json = serializer.getJson();
        console.log(json);
        expect(json).toEqual(
            "{\"root\":{\"name\":\"a\",\"parent\":0},\"references\":[{\"name\":\"c\",\"parent\":1}," +
            "{\"name\":\"b\",\"parent\":2},{\"name\":\"a\",\"parent\":0}]}");
    });

});