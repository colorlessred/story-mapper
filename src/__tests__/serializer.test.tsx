import {Serializer} from "../model/serialize/Serializer";
import {ISerializable} from "../model/serialize/ISerializable";
import {StoryMapper, StoryMapperSerialized} from "../model/StoryMapper";
import {Step} from "../model/card/Step";
import {Note} from "../model/card/Note";
import {Deserializer, DeserializerFunction} from "../model/serialize/Deserializer";
import {ISerialized} from "../model/serialize/ISerialized";
import {AllVersions} from "../model/AllVersions";
import {Version} from "../model/card/Version";
import {AllJourneys} from "../model/AllJourneys";
import {Journey} from "../model/card/Journey";
import {stringify} from "flatted";
import {CommonCardData} from "../model/CommonCardData";

const logAndCompare = (actual: string, expected: string) => {
    if (actual !== expected) {
        console.log(`{ actual: ${actual}, expected: ${expected}}`);
    }
    expect(actual).toEqual(expected);
};

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

        logAndCompare(
            serializer.getJson(),
            '[{"type":"TestClass","value":{"fieldString":"abc","fieldBoolean":true,"fieldNumber":1234}}]');
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
        const s1_1 = j1.firstStep;
        Step.createAndPush(j1);
        Step.createAndPush(j1);
        const s2_1 = j2.firstStep;
        const v1 = sm.addVersion("v1");
        const v2 = sm.addVersion("v2");
        Note.create("a", s1_1, v1, true, true);
        Note.create("b", s1_1, v1, true, true);
        Note.create("c", s2_1, v2, true, true);

        const serializer = new Serializer(sm);
        logAndCompare(
            serializer.getJson(),
            '[{"type":"StoryMapper","value":{"allJourneys":1,"allVersions":9}},{"type":"AllJourneys","value":{"journeys":[2,14]}},{"type":"Journey","value":{"allJourneys":1,"steps":[3,20,22],"commonCardData":24}},{"type":"Step","value":{"journey":2,"notes":[4,7],"commonCardData":19}},{"type":"Note","value":{"commonCardData":5,"step":3,"version":6}},{"type":"CommonCardData","value":{"title":"a","content":"","editMode":false}},{"type":"Version","value":{"name":"v1","notes":[4,7],"allJourneys":1,"allVersions":9,"commonCardData":18}},{"type":"Note","value":{"commonCardData":8,"step":3,"version":6}},{"type":"CommonCardData","value":{"title":"b","content":"","editMode":false}},{"type":"AllVersions","value":{"versions":[6,10]}},{"type":"Version","value":{"name":"v2","notes":[11],"allJourneys":1,"allVersions":9,"commonCardData":17}},{"type":"Note","value":{"commonCardData":12,"step":13,"version":10}},{"type":"CommonCardData","value":{"title":"c","content":"","editMode":false}},{"type":"Step","value":{"journey":14,"notes":[11],"commonCardData":16}},{"type":"Journey","value":{"allJourneys":1,"steps":[13],"commonCardData":15}},{"type":"CommonCardData","value":{"title":"","content":"","editMode":false}},{"type":"CommonCardData","value":{"title":"","content":"","editMode":false}},{"type":"CommonCardData","value":{"title":"","content":"","editMode":false}},{"type":"CommonCardData","value":{"title":"","content":"","editMode":false}},{"type":"CommonCardData","value":{"title":"","content":"","editMode":false}},{"type":"Step","value":{"journey":2,"notes":[],"commonCardData":21}},{"type":"CommonCardData","value":{"title":"","content":"","editMode":false}},{"type":"Step","value":{"journey":2,"notes":[],"commonCardData":23}},{"type":"CommonCardData","value":{"title":"","content":"","editMode":false}},{"type":"CommonCardData","value":{"title":"","content":"","editMode":false}}]');
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

            public static deserializerFunction = new DeserializerFunction<TestClassSerialized, TestClass>(
                (values: TestClassSerialized) => {
                    return new TestClass(
                        values.name
                    );
                },
                (object: TestClass, values: TestClassSerialized, deserializer: Deserializer) => {
                    if (values.parent !== undefined) {
                        const parent = deserializer.deserializeItem<TestClassSerialized, TestClass>(values.parent);
                        object.setParent(parent);
                    }
                }
            );
        }

        const json = '[{"type":"TestClass","value":{"name":"a","parent":1}},{"type":"TestClass","value":{"name":"c","parent":2}},{"type":"TestClass","value":{"name":"b","parent":0}}]';
        const deserializer = new Deserializer(json);

        deserializer.addDeserializer('TestClass', TestClass.deserializerFunction);

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

        // check the full equivalence via another serializer
        expect(stringify(aNew)).toEqual(stringify(a));
    });

    it('StoryMap', () => {
        const sm = new StoryMapper();
        const j1 = sm.newJourney();
        const j2 = sm.newJourney();
        const s1_1 = j1.firstStep;
        Step.createAndPush(j1);
        Step.createAndPush(j1);
        const s2_1 = j2.firstStep;
        const v1 = sm.addVersion("v1");
        const v2 = sm.addVersion("v2");
        Note.create("a", s1_1, v1, true, true).commonCardData.title = 'title n1';
        Note.create("b", s1_1, v1, true, true);
        Note.create("c", s2_1, v2, true, true);

        const json = new Serializer(sm).getJson();

        // deserialize
        const deserializer = new Deserializer(json);
        // TODO: better way to add these? "static interface"?
        deserializer.addDeserializer(StoryMapper.serializedTypeName(), StoryMapper.deserializerFunction);
        deserializer.addDeserializer(AllVersions.serializedTypeName(), AllVersions.deserializerFunction);
        deserializer.addDeserializer(Version.serializedTypeName(), Version.deserializerFunction);
        deserializer.addDeserializer(AllJourneys.serializedTypeName(), AllJourneys.deserializerFunction);
        deserializer.addDeserializer(Journey.serializedTypeName(), Journey.deserializerFunction);
        deserializer.addDeserializer(Step.serializedTypeName(), Step.deserializerFunction);
        deserializer.addDeserializer(Note.serializedTypeName(), Note.deserializerFunction);
        deserializer.addDeserializer(CommonCardData.serializedTypeName(), CommonCardData.deserializerFunction);

        const sm2 = deserializer.deserialize<StoryMapperSerialized, StoryMapper>();

        const allVersions1 = sm.getAllVersions().items;
        const allVersions2 = sm2.getAllVersions().items;

        expect(allVersions2.length).toEqual(allVersions1.length);
        for (let i = 0; i < allVersions1.length; i++) {
            const v1 = allVersions1[i];
            const v2 = allVersions2[i];
            logAndCompare(v2.toStringNotesWithVersionNumber(), v1.toStringNotesWithVersionNumber());
        }

        // reserialize and check we get back the same JSON
        logAndCompare(new Serializer(sm2).getJson(), json);

        // compare the serialized version with another serializer that gets also all the
        // internal structures, to make sure the internal state is rebuilt correctly
        logAndCompare(stringify(sm2), stringify(sm));
    });
});