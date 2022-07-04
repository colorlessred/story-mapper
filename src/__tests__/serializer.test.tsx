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
            '[{"type":"StoryMapper","value":{"allJourneys":1,"allVersions":7}},{"type":"AllJourneys","value":{"journeys":[2,11]}},{"type":"Journey","value":{"allJourneys":1,"steps":[3,12,13]}},{"type":"Step","value":{"journey":2,"notes":[4,6]}},{"type":"Note","value":{"name":"a","step":3,"version":5}},{"type":"Version","value":{"name":"v1","notes":[4,6],"allJourneys":1,"allVersions":7}},{"type":"Note","value":{"name":"b","step":3,"version":5}},{"type":"AllVersions","value":{"versions":[5,8]}},{"type":"Version","value":{"name":"v2","notes":[9],"allJourneys":1,"allVersions":7}},{"type":"Note","value":{"name":"c","step":10,"version":8}},{"type":"Step","value":{"journey":11,"notes":[9]}},{"type":"Journey","value":{"allJourneys":1,"steps":[10]}},{"type":"Step","value":{"journey":2,"notes":[]}},{"type":"Step","value":{"journey":2,"notes":[]}}]');
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

            setParent(parent: TestClass | undefined) {
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
        const dFunTestClass = new DeserializerFunction<TestClassSerialized, TestClass>(
            (values: TestClassSerialized) => {
                return new TestClass(
                    values.name
                );
            },
            (object: TestClass, values: TestClassSerialized, deserializer: Deserializer) => {
                const parent = deserializer.deserializeItem<TestClassSerialized, TestClass>(values.parent);
                object.setParent(parent);
            }
        );

        deserializer.addDeserializer('TestClass', dFunTestClass);

        const checkAndReturnParent = (obj: TestClass | undefined, name: string): TestClass | undefined => {
            if (obj === undefined) {
                throw new Error(`${name} should not be undefined`);
            }
            expect(obj.name).toEqual(name);
            return obj.parent;
        };

        const a: TestClass | undefined = deserializer.deserialize<TestClassSerialized, TestClass>();
        const c = checkAndReturnParent(a, "a");
        const b = checkAndReturnParent(c, "c");
        const aNew = checkAndReturnParent(b, "b");
        expect(aNew).toBe(a);
    });
});