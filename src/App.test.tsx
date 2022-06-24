import {
    StoryMapper
} from "./model/StoryMapper";
import {SmartArray} from "./model/SmartArray";
import {Version} from "./model/Version";
import {AllVersions} from "./model/AllVersions";
import {NotesInSteps} from "./model/NotesInSteps";
import {AllJourneys} from "./model/AllJourneys";
import {Note} from "./model/Note";
import {Journey} from "./model/Journey";
import {Step} from "./model/Step";

describe("Smart Array", () => {
    const aj = new AllJourneys();

    describe("push", () => {
        const sa = new SmartArray<Version>();
        sa.push(new Version("a", aj));
        sa.push(new Version("b", aj));
        it('toString', () => {
            expect(sa.toString()).toEqual("[1(a),2(b)]")
        })
    })

    describe("remove", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        sa.push(new Version("b", aj));
        sa.remove(a);
        it('toString', () => {
            expect(sa.toString()).toEqual("[1(b)]")
        })
    });

    describe("add", () => {
        const sa = new SmartArray<Version>();
        const a = new Version("a", aj);
        sa.push(a);
        sa.push(new Version("b", aj));

        it('add 0', () => {
            sa.add(new Version("c", aj), 1);
            expect(sa.toString()).toEqual("[1(c),2(a),3(b)]")
        });
        it('add end', () => {
            sa.add(new Version("d", aj), 10);
            expect(sa.toString()).toEqual("[1(c),2(a),3(b),4(d)]")
        });
        it('add middle', () => {
            sa.add(new Version("e", aj), 2);
            expect(sa.toString()).toEqual("[1(c),2(e),3(a),4(b),5(d)]")
        });

        it('add invalid position', () => {
            sa.add(new Version("f", aj), 0);
            // unchanged result
            expect(sa.toString()).toEqual("[1(c),2(e),3(a),4(b),5(d)]")
        })
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
        const j = new Journey(aj, true);
        const s = new Step(j);
        const n = new Note("a", s, v, true);

        it('result', () => {
            expect(aj.toString()).toEqual("[[[1.1.1(a)]]]");
        });
        it('add second', () => {
            s.push(new Note("b", s, v));
            expect(aj.toString()).toEqual("[[[1.1.1(a),1.1.2(b)]]]");
        });
        it('remove first', () => {
            s.remove(n);
            expect(aj.toString()).toEqual("[[[1.1.1(b)]]]");
        });
    });

    describe("move", () => {


        it("result", () => {
            const aj = new AllJourneys();
            const v = new Version("version 1", aj);
            const j = new Journey(aj, true);
            const s = new Step(j);
            new Note("a", s, v, true);
            expect(aj.toString()).toEqual("[[[1.1.1(a)]]]");
        });


        it("add second journey", () => {
            const aj = new AllJourneys();
            const v = new Version("version 1", aj);
            const j = new Journey(aj, true);
            const s = new Step(j);
            new Note("a", s, v, true);
            const j2 = new Journey(aj, true);
            expect(aj.toString()).toEqual("[[[1.1.1(a)]],[]]");
        });

        it('move second journey', () => {
            const aj = new AllJourneys();
            const v = new Version("version 1", aj);
            const j = new Journey(aj, true);
            const s = new Step(j);
            new Note("a", s, v, true);
            const j2 = new Journey(aj, true);
            aj.move(j2, 1);
            expect(aj.toString()).toEqual("[[],[[2.1.1(a)]]]");
            expect(j2.getPositionInParent()).toEqual(0);
        })
    });
});

describe("NotesInStep", () => {
    const aj = new AllJourneys();
    const j = new Journey(aj, true);
    const v = new Version("a", aj);
    const s1 = new Step(j);
    new Step(j);
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
    })
    it("size", () => {
        expect(nis.getMaxSize()).toEqual(3);
    })

    it("steps size", () => {
        expect(nis.getStepsSize()).toEqual(3);
    })
});

describe("version logic", () => {
    const aj = new AllJourneys();
    const j = new Journey(aj, true);
    const s1 = new Step(j);
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
    })

    it('notes in string v2', () => {
        expect(v2.toStringNotesInStep()).toEqual("1.1.4(d),1.2.1(e),1.3.2(g)");
    })

    it('notes in string v1, version name', () => {
        expect(v1.toStringNotesWithVersionNumber()).toEqual("[[1.1.1.1(a),1.1.1.2(b),1.1.1.3(c)][][1.3.1.1(f)]]");
    })

    it('notes in string v2, version name', () => {
        expect(v2.toStringNotesWithVersionNumber()).toEqual("[[1.1.2.1(d)][1.2.2.1(e)][1.3.2.1(g)]]");
    })

    it('steps size', () => {
        expect(v2.getNotesInSteps().getStepsSize()).toEqual(3);
    })

});

describe("story mapper", () => {
    const sm = new StoryMapper();
    const j1 = sm.addJourney();
    const j2 = sm.addJourney();
    const s1_1 = new Step(j1);
    const s1_2 = new Step(j1);
    const s1_3 = new Step(j1);
    const s2_1 = new Step(j2);
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


    it('board', () => {
        expect(sm.buildBoard().toString())
            .toEqual("[[,j1,,,j2][,s1.1,s1.2,s1.3,s2.1][v1,a,b,f,][,,c,,][v2,,g,,d][,,,,e]]");
        expect(j1.getPositionInParent()).toEqual(0);
        expect(s1_1.getPositionInParent()).toEqual(0);
        expect(s1_2.getPositionInParent()).toEqual(1);
        expect(s1_3.getPositionInParent()).toEqual(2);
        expect(s1_1.getPositionInParent()).toEqual(0);
    });
});

describe("add next", () => {
    function prep(): [StoryMapper, Journey, Journey] {
        const sm = new StoryMapper();
        const j1 = sm.addJourney();
        const j2 = sm.addJourney();
        const s1_1 = new Step(j1);
        const s1_2 = new Step(j1);
        const s1_3 = new Step(j1);
        const s2_1 = new Step(j2);
        const v1 = sm.addVersion("v1");
        const v2 = sm.addVersion("v2");
        return [sm, j1, j2];
    }

    describe("journey", () => {
            const [sm] = prep();
            it('board', () => {
                expect(sm.buildBoard().toString())
                    .toEqual("[[,j1,,,j2][,s1.1,s1.2,s1.3,s2.1]]");
            })
        }
    );

    describe("create last journey", () => {
        const [sm, j1, j2] = prep();
        j2.createNewNext();
        // j2 is last so there will be a j3 created
        it('board', () => {
            expect(sm.buildBoard().toString())
                .toEqual("[[,j1,,,j2,j3][,s1.1,s1.2,s1.3,s2.1,]]");
        });
    });

    describe("create next journey", () => {
        const [sm, j1, j2] = prep();
        j1.createNewNext();
        // it will create one intermediate entry between j1 and j2
        it('board', () => {
            expect(sm.buildBoard().toString())
                // TO FIX
                .toEqual("[[,j1,,,j2,j3][,s1.1,s1.2,s1.3,,s3.1]]");
        });
    });

});