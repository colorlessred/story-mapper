import {Serializer} from "../model/serialize/Serializer";
import {ISerializable} from "../model/serialize/ISerializable";
import {StoryMapper} from "../model/StoryMapper";
import {Step} from "../model/Step";
import {Note} from "../model/Note";
import {Deserializer, DeserializerFunction} from "../model/serialize/Deserializer";
import {ISerialized} from "../model/serialize/ISerialized";

describe('serializer', () => {
    it('class with primitives', () => {
        interface TestClassSerializable {
            fieldString: string,
            fieldBoolean: boolean,
            fieldNumber: number
        }

        class TestClass implements ISerializable<TestClassSerializable> {
            fieldString: string;
            fieldBoolean: boolean;
            fieldNumber: number;

            constructor(fieldString: string, fieldBoolean: boolean, fieldNumber: number) {
                this.fieldString = fieldString;
                this.fieldBoolean = fieldBoolean;
                this.fieldNumber = fieldNumber;
            }

            toSerialized(serializer: Serializer): ISerialized<TestClassSerializable> {
                return {
                    type: 'TestClass',
                    value: {
                        fieldString: this.fieldString,
                        fieldBoolean: this.fieldBoolean,
                        fieldNumber: this.fieldNumber
                    }
                };
            }

            // toObject(deserializer: Deserializer): object {
            //     return {};
            // }
        }

        const a = new TestClass("abc", true, 1234);
        const serializer = new Serializer(a);

        expect(serializer.getJson()).toEqual(
            '[{"type":"TestClass","value":{"fieldString":"abc","fieldBoolean":true,"fieldNumber":1234}}]'
        );
    });

    it('class with references', () => {
        interface TestClassSerializable {
            name: string,
            parent: number | undefined
        }

        class TestClass implements ISerializable<TestClassSerializable> {
            name: string;
            parent?: TestClass;

            constructor(name: string, parent?: TestClass) {
                this.name = name;
                this.parent = parent;
            }

            setParent(parent: TestClass) {
                this.parent = parent;
            }

            toSerialized(serializer: Serializer): ISerialized<TestClassSerializable> {
                return {
                    type: 'TestClass',
                    value: {
                        name: this.name,
                        parent: serializer.getObject(this.parent)
                    }
                };
            }

            // toObject(deserializer: Deserializer): ISerializable<TestClassSerializable> {
            //     return {
            //         type: "null",
            //         value: {
            //             name: "",
            //             parent: 0
            //         }
            //     };
            // }
        }

        const a = new TestClass("a");
        const b = new TestClass("b", a);
        const c = new TestClass("c", b);
        // circular dependency
        a.setParent(c);

        const serializer = new Serializer(a);
        const json = serializer.getJson();
        // console.log(json);
        expect(json).toEqual(
            '[{"type":"TestClass","value":{"name":"a","parent":1}},{"type":"TestClass","value":{"name":"c","parent":2}},{"type":"TestClass","value":{"name":"b","parent":0}}]');
    });

    it('serialized map', () => {
        const sm = new StoryMapper();
        const j1 = sm.newJourney();
        const j2 = sm.newJourney();
        const s1_1 = j1.getFirstStep();
        new Step(j1);
        new Step(j1);
        const s2_1 = j2.getFirstStep();
        const v1 = sm.addVersion("v1");
        const v2 = sm.addVersion("v2");
        new Note("a", s1_1, v1, true, true);
        new Note("b", s1_1, v1, true, true);
        new Note("c", s2_1, v2, true, true);

        const serializer = new Serializer(sm);
        const json = serializer.getJson();
        // console.log(json);
        expect(json).toEqual(
            '[{"type":"StoryMapper","value":{"allJourneys":1,"allVersions":7}},{"type":"SmartArray","value":{"path":"","positionInParent":0,"items":[2,13]}},{"type":"SmartArray","value":{"path":"1","positionInParent":0,"items":[3,11,12]}},{"type":"SmartArray","value":{"path":"1.1","positionInParent":0,"items":[4,6]}},{"type":"Note","value":{"name":"a","step":3,"version":5,"path":"1.1.1","positionInParent":0,"positionInVersionStep":1,"pathWithVersion":"1.1.1.1"}},{"type":"Version","value":{"name":"v1","notes":[4,6],"path":"1","positionInParent":0,"allJourneys":1,"allVersions":7}},{"type":"Note","value":{"name":"b","step":3,"version":5,"path":"1.1.2","positionInParent":1,"positionInVersionStep":2,"pathWithVersion":"1.1.1.2"}},{"type":"SmartArray","value":{"path":"","positionInParent":0,"items":[5,8]}},{"type":"Version","value":{"name":"v2","notes":[9],"path":"2","positionInParent":1,"allJourneys":1,"allVersions":7}},{"type":"Note","value":{"name":"c","step":10,"version":8,"path":"2.1.1","positionInParent":0,"positionInVersionStep":1,"pathWithVersion":"2.1.2.1"}},{"type":"SmartArray","value":{"path":"2.1","positionInParent":0,"items":[9]}},{"type":"SmartArray","value":{"path":"1.2","positionInParent":1,"items":[]}},{"type":"SmartArray","value":{"path":"1.3","positionInParent":2,"items":[]}},{"type":"SmartArray","value":{"path":"2","positionInParent":1,"items":[10]}}]');
    });
});

describe("deserialize", () => {
    it('class with references', () => {
        interface TestClassSerialized {
            name: string;
            parent?: number;
        }

        class TestClass implements ISerializable<TestClassSerialized> {
            name: string;
            parent?: TestClass;

            constructor(name: string, parent?: TestClass) {
                this.name = name;
                this.parent = parent;
            }

            toSerialized(serializer: Serializer): ISerialized<TestClassSerialized> {
                return {
                    type: 'TestClass',
                    value: {
                        name: this.name,
                        parent: serializer.getObject(this.parent)
                    }
                };
            }
        }

        const json = '[{"type":"TestClass","value":{"name":"a","parent":1}},{"type":"TestClass","value":{"name":"c","parent":2}},{"type":"TestClass","value":{"name":"b","parent":0}}]';
        const deserializer = new Deserializer(json);
        const dFunTestClass: DeserializerFunction<TestClassSerialized, TestClass> =
            (values: TestClassSerialized, deserializer: Deserializer) => {
                console.log(`building instance for ${values.name}`);
                return new TestClass(
                    values.name,
                    deserializer.deserializeItem<TestClassSerialized, TestClass>(values.parent)
                );
            };
        deserializer.addDeserializer('TestClass', dFunTestClass);
        deserializer.deserialize();
    });
});