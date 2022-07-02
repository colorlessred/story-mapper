import {StoryMapper} from "../model/StoryMapper";
import {SmartArray} from "../model/SmartArray";
import {Version} from "../model/Version";
import {AllVersions} from "../model/AllVersions";
import {NotesInSteps} from "../model/NotesInSteps";
import {AllJourneys} from "../model/AllJourneys";
import {Note} from "../model/Note";
import {Journey} from "../model/Journey";
import {Step} from "../model/Step";
import {Board} from "../model/Board";
import {Card} from "../model/Card";
import {EmptyAdder} from "../model/EmptyAdder";

describe("Smart Array", () => {
    const aj = new AllJourneys();

    describe("push", () => {
        const sa = new SmartArray<Version>();
        sa.push(new Version("a", aj));
        sa.push(new Version("b", aj));
        it('toString', () => {
            expect(sa.toString()).toEqual("[1(a),2(b)]");
        });
    });

    describe("remove", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        sa.push(new Version("b", aj));
        sa.deleteItem(a);
        it('toString', () => {
            expect(sa.toString()).toEqual("[1(b)]");
        });
    });

    describe("item positions no deletions", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        const b = new Version("b", aj);
        sa.push(b);
        it('toString', () => {
            expect(sa.toString()).toEqual("[1(a),2(b)]");
        });
        it('position first', () => {
            expect(sa.getItemPosition(a)).toEqual(0);
        });
        it('position second', () => {
            expect(sa.getItemPosition(b)).toEqual(1);
        });
    });

    describe("item positions with deletions", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        const b = new Version("b", aj);
        sa.push(b);
        sa.deleteItem(a);
        it('position second item after deletion', () => {
            expect(sa.getItemPosition(b)).toEqual(0);
        });
        it('position deleted item', () => {
            expect(sa.getItemPosition(a)).toEqual(undefined);
        });
    });

    describe("add", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        sa.push(new Version("b", aj));

        it('add 0', () => {
            sa.add(new Version("c", aj), 1);
            expect(sa.toString()).toEqual("[1(c),2(a),3(b)]");
        });
        it('add end', () => {
            sa.add(new Version("d", aj), 10);
            expect(sa.toString()).toEqual("[1(c),2(a),3(b),4(d)]");
        });
        it('add middle', () => {
            sa.add(new Version("e", aj), 2);
            expect(sa.toString()).toEqual("[1(c),2(e),3(a),4(b),5(d)]");
        });

        it('add invalid position', () => {
            sa.add(new Version("f", aj), 0);
            // unchanged result
            expect(sa.toString()).toEqual("[1(c),2(e),3(a),4(b),5(d)]");
        });
    });

    describe("move", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        sa.push(new Version("b", aj));
        const c = new Version("c", aj);
        sa.push(c);

        it('move middle', () => {
            sa.move(a, 2);
            expect(sa.toString()).toEqual("[1(b),2(a),3(c)]");
        });
    });

    describe("addNext b after a in [a]", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        sa.addNextTo(new Version("b", aj), a);

        it('next', () => {
            expect(sa.toString()).toEqual("[1(a),2(b)]");
        });

    });

    describe("addNext c after a in [a,b]", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        sa.push(new Version("b", aj));
        sa.addNextTo(new Version("c", aj), a);

        it('next', () => {
            expect(sa.toString()).toEqual("[1(a),2(c),3(b)]");
        });

    });

});

describe("tree, no version", () => {

    describe("basic", () => {
        const aj = new AllJourneys();
        const v = new Version("version 1", aj);
        const s = new Step();
        const j = new Journey(aj, s);

        const n = new Note("a", s, v, true);

        it('result', () => {
            expect(aj.toString()).toEqual("[[[1.1.1(a)]]]");
        });
        it('add second', () => {
            s.push(new Note("b", s, v));
            expect(aj.toString()).toEqual("[[[1.1.1(a),1.1.2(b)]]]");
        });
        it('remove first', () => {
            s.deleteItem(n);
            expect(aj.toString()).toEqual("[[[1.1.1(b)]]]");
        });
    });

    describe("move", () => {
        it("result", () => {
            const aj = new AllJourneys();
            const v = new Version("version 1", aj);
            const s = new Step();
            const j = new Journey(aj, s);
            new Note("a", s, v, true);
            expect(aj.toString()).toEqual("[[[1.1.1(a)]]]");
        });


        it("add second journey", () => {
            const aj = new AllJourneys();
            const v = new Version("version 1", aj);
            const s = new Step();
            const j = new Journey(aj, s);
            new Note("a", s, v, true);
            const j2 = new Journey(aj, new Step());

            expect(aj.toString()).toEqual("[[[1.1.1(a)]],[[]]]");
        });

        it('move second journey', () => {
            const aj = new AllJourneys();
            const v = new Version("version 1", aj);
            const s = new Step();
            const j = new Journey(aj, s);
            new Note("a", s, v, true);
            const j2 = new Journey(aj, new Step());

            aj.move(j2, 1);
            expect(aj.toString()).toEqual("[[[]],[[2.1.1(a)]]]");
            expect(j2.getPositionInParent()).toEqual(0);
        });
    });
});

describe("NotesInStep", () => {
    const aj = new AllJourneys();
    const s1 = new Step();
    const j = new Journey(aj, s1);
    const v = new Version("a", aj);
    new Step(j); // step2
    const s3 = new Step(j);

    const notes: Set<Note> = new Set<Note>([
        new Note("a", s1, v, true),
        new Note("b", s1, v, true),
        new Note("c", s3, v, true),
        new Note("d", s1, v, true)
    ]);

    const nis = new NotesInSteps(j.getItems(), notes);

    it("arrayArray", () => {
        expect(nis.getArrayArray().toString()).toEqual("1.1.1(a),1.1.2(b),1.1.3(d)" +
            // double comma because s2 doesn't have any item
            ",,1.3.1(c)");
    });
    it("size", () => {
        expect(nis.getMaxSize()).toEqual(3);
    });

    it("steps size", () => {
        expect(nis.getStepsSize()).toEqual(3);
    });
});

describe("version logic", () => {
    const aj = new AllJourneys();
    const s1 = new Step();
    const j = new Journey(aj, s1);
    const s2 = new Step(j);
    const s3 = new Step(j);

    const av = new AllVersions();
    const v1 = new Version("a", aj, av);
    const v2 = new Version("b", aj, av);

    new Note("a", s1, v1, true, true);
    new Note("b", s1, v1, true, true);
    new Note("c", s1, v1, true, true);
    new Note("d", s1, v2, true, true);
    new Note("e", s2, v2, true, true);
    new Note("f", s3, v1, true, true);
    new Note("g", s3, v2, true, true);

    it('notes in string v1', () => {
        expect(v1.toStringNotesInStep()).toEqual("1.1.1(a),1.1.2(b),1.1.3(c),,1.3.1(f)");
    });

    it('notes in string v2', () => {
        expect(v2.toStringNotesInStep()).toEqual("1.1.4(d),1.2.1(e),1.3.2(g)");
    });

    it('notes in string v1, version name', () => {
        expect(v1.toStringNotesWithVersionNumber()).toEqual("[[1.1.1.1(a),1.1.1.2(b),1.1.1.3(c)][][1.3.1.1(f)]]");
    });

    it('notes in string v2, version name', () => {
        expect(v2.toStringNotesWithVersionNumber()).toEqual("[[1.1.2.1(d)][1.2.2.1(e)][1.3.2.1(g)]]");
    });

    it('steps size', () => {
        expect(v2.getNotesInSteps().getStepsSize()).toEqual(3);
    });

});

describe("story mapper", () => {
    const sm = new StoryMapper();
    const j1 = sm.newJourney();
    const j2 = sm.newJourney();
    const s1_1 = j1.getFirstStep();
    const s1_2 = new Step(j1);
    const s1_3 = new Step(j1);
    const s2_1 = j2.getFirstStep();

    const v1 = sm.addVersion("v1");
    const v2 = sm.addVersion("v2");
    /**
     *       11   12   13   21
     * v1    a    b    f
     *       c
     * v2         g         d
     *                      e
     */
    new Note("a", s1_1, v1, true, true);
    new Note("b", s1_2, v1, true, true);
    new Note("c", s1_2, v1, true, true);
    new Note("d", s2_1, v2, true, true);
    new Note("e", s2_1, v2, true, true);
    new Note("f", s1_3, v1, true, true);
    new Note("g", s1_2, v2, true, true);

    let hookCalled = false;

    sm.setBoardRefreshHook(() => {
        hookCalled = true;
    });

    it('board', () => {
        expect(hookCalled).toEqual(false);
        expect(sm.buildBoard().toString());
        expect(hookCalled).toEqual(true);
        expect(j1.getPositionInParent()).toEqual(0);
        expect(s1_1.getPositionInParent()).toEqual(0);
        expect(s1_2.getPositionInParent()).toEqual(1);
        expect(s1_3.getPositionInParent()).toEqual(2);
        expect(s1_1.getPositionInParent()).toEqual(0);
    });
});

describe("add next", () => {
    function prep(): [StoryMapper, Journey, Journey, Step, Step, Version, Version] {
        const sm = new StoryMapper();
        const j1 = sm.newJourney();
        const j2 = sm.newJourney();
        const s1_1 = j1.getFirstStep();
        const s1_2 = new Step(j1);
        const s1_3 = new Step(j1);
        const s2_1 = j2.getFirstStep();
        const v1 = sm.addVersion("v1");
        const v2 = sm.addVersion("v2");
        return [sm, j1, j2, s1_1, s1_2, v1, v2];
    }

    describe("default story map", () => {
            const [sm] = prep();
            it('board', () => {
                expect(sm.buildBoard().toString())
                    .toEqual(
                        "[[Empty,J1,Empty,Empty,J2]" +
                        "[Empty,S1.1,S1.2,S1.3,S2.1]" +
                        "[V1,Adder.0.0,Adder.0.1,Adder.0.2,Adder.0.0]" +
                        "[V2,Adder.1.0,Adder.1.1,Adder.1.2,Adder.1.0]]");
            });
        }
    );

    describe("create last journey", () => {
        const [sm, j1, j2] = prep();
        j2.createNewNext();
        // j2 is last so there will be a j3 created
        it('board', () => {
            expect(sm.buildBoard().toString())
                .toEqual("[[Empty,J1,Empty,Empty,J2,J3]" +
                    "[Empty,S1.1,S1.2,S1.3,S2.1,S3.1]" +
                    "[V1,Adder.0.0,Adder.0.1,Adder.0.2,Adder.0.0,Adder.0.0]" +
                    "[V2,Adder.1.0,Adder.1.1,Adder.1.2,Adder.1.0,Adder.1.0]]");
        });
    });

    describe("create next journey", () => {
        const [sm, j1, j2] = prep();
        j1.createNewNext();
        // it will create one intermediate entry between j1 and j2
        it('board', () => {
            expect(sm.buildBoard().toString())
                .toEqual("[[Empty,J1,Empty,Empty,J2,J3]" +
                    "[Empty,S1.1,S1.2,S1.3,S2.1,S3.1]" +
                    "[V1,Adder.0.0,Adder.0.1,Adder.0.2,Adder.0.0,Adder.0.0]" +
                    "[V2,Adder.1.0,Adder.1.1,Adder.1.2,Adder.1.0,Adder.1.0]]");
        });
    });

    describe("create next journey, with notes", () => {
        const [sm, j1, j2, s1_1, s1_2, v1, v2] = prep();
        new Note("n", s1_1, v1, true, true);
        j1.createNewNext();
        // it will create one intermediate entry between j1 and j2
        it('board', () => {
            expect(sm.buildBoard().toString())
                .toEqual("[[Empty,J1,Empty,Empty,J2,J3]" +
                    "[Empty,S1.1,S1.2,S1.3,S2.1,S3.1]" +
                    "[V1,1.1.1.1,Adder.0.1,Adder.0.2,Adder.0.0,Adder.0.0]" +
                    "[V2,Adder.1.0,Adder.1.1,Adder.1.2,Adder.1.0,Adder.1.0]]");
        });
    });

    describe("version", () => {
        const [sm, j1, j2, s1_1, s1_2, v1, v2] = prep();
        v1.createNewNext();
        it('board', () => {
            expect(sm.buildBoard().toString())
                .toEqual(
                    "[[Empty,J1,Empty,Empty,J2][Empty,S1.1,S1.2,S1.3,S2.1]" +
                    "[V1,Adder.0.0,Adder.0.1,Adder.0.2,Adder.0.0]" +
                    "[V2,Adder.1.0,Adder.1.1,Adder.1.2,Adder.1.0]" +
                    "[V3,Adder.2.0,Adder.2.1,Adder.2.2,Adder.2.0]]");
        });
    });
});

describe("delete", () => {
    function prep(): [StoryMapper, Journey, Journey, Version, Version] {
        const sm = new StoryMapper();
        const j1 = sm.newJourney();
        const j2 = sm.newJourney();
        const s1_1 = j1.getFirstStep();
        const s1_2 = new Step(j1);
        const s1_3 = new Step(j1);
        const s2_1 = j2.getFirstStep();
        const v1 = sm.addVersion("v1");
        const v2 = sm.addVersion("v2");
        const n = new Note("a", s1_1, v1, true, true);
        return [sm, j1, j2, v1, v2];
    }

    const DEFAULT_SM: string = "[[Empty,J1,Empty,Empty,J2]" +
        "[Empty,S1.1,S1.2,S1.3,S2.1]" +
        "[V1,1.1.1.1,Adder.0.1,Adder.0.2,Adder.0.0]" +
        "[V2,Adder.1.0,Adder.1.1,Adder.1.2,Adder.1.0]]";

    it('default', () => {
        // default case without any modifications
        const [sm, j1] = prep();
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
    });

    it('delete note', () => {
        const [sm, j1] = prep();
        const N1_1_1_1: Note = j1.getFirstStep().getItems()[0];
        expect(N1_1_1_1.canDelete()).toEqual(true);
        N1_1_1_1.delete();
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,Empty,Empty,J2]" +
            "[Empty,S1.1,S1.2,S1.3,S2.1]" +
            "[V1,Adder.0.0,Adder.0.1,Adder.0.2,Adder.0.0]" +
            "[V2,Adder.1.0,Adder.1.1,Adder.1.2,Adder.1.0]]");
    });

    it('delete empty step', () => {
        const [sm, j1] = prep();
        const S1_2 = j1.getItems()[1];
        expect(S1_2.canDelete()).toEqual(true);
        S1_2.delete();
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,Empty,J2]" +
            "[Empty,S1.1,S1.2,S2.1]" +
            "[V1,1.1.1.1,Adder.0.1,Adder.0.0]" +
            "[V2,Adder.1.0,Adder.1.1,Adder.1.0]]");
    });

    it('delete non-empty step', () => {
        const [sm, j1] = prep();
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
        const S1_1 = j1.getItems()[0];
        expect(S1_1.canDelete()).toEqual(false);
        S1_1.delete();
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
    });

    it('delete journey with just one empty step', () => {
        // this is a somewhat special case. The journey cannot be empty, since there's always one step
        // but if the step can be deleted, so we can delete the journey AND the step
        const [sm, j1, j2] = prep();
        expect(j2.canDelete()).toEqual(true);
        j2.delete();
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,Empty,Empty]" +
            "[Empty,S1.1,S1.2,S1.3]" +
            "[V1,1.1.1.1,Adder.0.1,Adder.0.2]" +
            "[V2,Adder.1.0,Adder.1.1,Adder.1.2]]");
    });

    it('delete journey with non empty steps', () => {
        const [sm, j1, j2] = prep();
        expect(j1.canDelete()).toEqual(false);
        j1.delete();
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
    });

    it('delete empty version', () => {
        const [sm, j1, j2, v1, v2] = prep();
        expect(v2.canDelete()).toEqual(true);
        v2.delete();
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,Empty,Empty,J2]" +
            "[Empty,S1.1,S1.2,S1.3,S2.1]" +
            "[V1,1.1.1.1,Adder.0.1,Adder.0.2,Adder.0.0]]");
    });

    it('delete non empty version', () => {
        const [sm, j1, j2, v1, v2] = prep();
        expect(v1.canDelete()).toEqual(false);
        v1.delete();
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
    });
});

describe("move", () => {
    function prep(): [StoryMapper, Journey, Journey, Version, Version] {
        const sm = new StoryMapper();
        const j1 = sm.newJourney();
        const j2 = sm.newJourney();
        const s1_1 = j1.getFirstStep();
        const s1_2 = new Step(j1);
        const s1_3 = new Step(j1);
        const s2_1 = j2.getFirstStep();
        const v1 = sm.addVersion("v1");
        const v2 = sm.addVersion("v2");
        new Note("a", s1_1, v1, true, true);
        new Note("b", s1_1, v1, true, true);
        new Note("c", s2_1, v2, true, true);
        return [sm, j1, j2, v1, v2];
    }

    const DEFAULT_SM: string = "[[Empty,J1,Empty,Empty,J2]" +
        "[Empty,S1.1,S1.2,S1.3,S2.1]" +
        "[V1,1.1.1.1,Adder.0.1,Adder.0.2,Adder.0.0]" +
        "[Empty,1.1.1.2,Empty,Empty,Empty]" +
        "[V2,Adder.1.0,Adder.1.1,Adder.1.2,2.1.2.1]]";

    it('default', () => {
        // default case without any modifications
        const [sm, j1] = prep();
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
    });

    it('move note, same steps', () => {
        const [sm, j1] = prep();
        const [n1, n2] = j1.getFirstStep().getItems();
        expect(n1.canMoveInto(n2)).toEqual(true);
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
        expect(n1.getPositionInParent()).toEqual(0);
        expect(n2.getPositionInParent()).toEqual(1);
        n2.moveInto(n1);
        // check they reversed position
        expect(n1.getPositionInParent()).toEqual(1);
        expect(n2.getPositionInParent()).toEqual(0);
        // the resulting paths are the same because they have been regenerated
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
        // check they swapped
        const [n2after, n1after] = j1.getFirstStep().getItems();
        expect(n1).toEqual(n1after);
        expect(n2).toEqual(n2after);
    });

    it('move note, different step and version', () => {
        const [sm, j1, j2] = prep();
        const [n1, n2] = j1.getFirstStep().getItems();
        const [n3] = j2.getFirstStep().getItems();
        expect(sm.buildBoard().toString()).toEqual(DEFAULT_SM);
        expect(n3.canMoveInto(n1)).toEqual(true);
        expect(n1.getPositionInParent()).toEqual(0);
        expect(n3.getPositionInParent()).toEqual(0);

        n1.moveInto(n3);
        // // the resulting paths are the same because they have been regenerated
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,Empty,Empty,J2]" +
            "[Empty,S1.1,S1.2,S1.3,S2.1]" +
            "[V1,1.1.1.1,Adder.0.1,Adder.0.2,Adder.0.0]" +
            "[V2,Adder.1.0,Adder.1.1,Adder.1.2,2.1.2.1]" +
            "[Empty,Empty,Empty,Empty,2.1.2.2]" +
            "]");
        // check
        const [n2after] = j1.getFirstStep().getItems();
        const [n1after, n3after] = j2.getFirstStep().getItems();
        expect(n1.getName()).toEqual(n1after.getName());
        expect(n2.getName()).toEqual(n2after.getName());
        expect(n3.getName()).toEqual(n3after.getName());
    });

    it('move step, different journeys', () => {
        const [sm, j1, j2] = prep();
        const s1 = j1.getFirstStep();
        const s2 = j2.getFirstStep();
        expect(s1.canMoveInto(s2)).toEqual(true);
        // s2 cannot be removed from j2, since it's the only one
        expect(s2.canMoveInto(s1)).toEqual(false);
        s1.moveInto(s2);
        // // the resulting paths are the same because they have been regenerated
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,Empty,J2,Empty]" +
            "[Empty,S1.1,S1.2,S2.1,S2.2]" +
            "[V1,Adder.0.0,Adder.0.1,2.1.1.1,Adder.0.1]" +
            "[Empty,Empty,Empty,2.1.1.2,Empty]" +
            "[V2,Adder.1.0,Adder.1.1,Adder.1.0,2.2.2.1]]");
    });

    it('move journey', () => {
        const [sm, j1, j2] = prep();
        expect(j1.canMoveInto(j2)).toEqual(true);
        expect(j2.canMoveInto(j1)).toEqual(true);
        j2.moveInto(j1);
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,J2,Empty,Empty]" +
            "[Empty,S1.1,S2.1,S2.2,S2.3]" +
            "[V1,Adder.0.0,2.1.1.1,Adder.0.1,Adder.0.2]" +
            "[Empty,Empty,2.1.1.2,Empty,Empty]" +
            "[V2,1.1.2.1,Adder.1.0,Adder.1.1,Adder.1.2]]");
    });

    it('move version', () => {
        const [sm, j1, j2, v1, v2] = prep();
        expect(v1.canMoveInto(v2)).toEqual(true);
        expect(v2.canMoveInto(v1)).toEqual(true);
        v2.moveInto(v1);
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,Empty,Empty,J2]" +
            "[Empty,S1.1,S1.2,S1.3,S2.1]" +
            "[V1,Adder.0.0,Adder.0.1,Adder.0.2,2.1.1.1]" +
            "[V2,1.1.2.1,Adder.1.1,Adder.1.2,Adder.1.0]" +
            "[Empty,1.1.2.2,Empty,Empty,Empty]]");
    });

    it('move into adder', () => {
        const [sm, j1, j2, v1, v2] = prep();
        const board: Board = sm.buildBoard();
        const note: Card = board.getCard(2, 1);
        const adder: Card = board.getCard(2, 2);
        expect(note.getBaseElement() instanceof Note).toBeTruthy();
        expect(adder.getBaseElement() instanceof EmptyAdder).toBeTruthy();
        expect(note.getId()).toEqual("1.1.1.1");
        expect(adder.getId()).toEqual("Adder.0.1");
        expect(note.canMoveInto(adder)).toBeTruthy();
        note.moveInto(adder);
        expect(sm.buildBoard().toString()).toEqual(
            "[[Empty,J1,Empty,Empty,J2]" +
            "[Empty,S1.1,S1.2,S1.3,S2.1]" +
            "[V1,1.1.1.1,1.2.1.1,Adder.0.2,Adder.0.0]" +
            "[V2,Adder.1.0,Adder.1.1,Adder.1.2,2.1.2.1]]");

    })

});