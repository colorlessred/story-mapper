import { SmartArray, Version, Journey, Step, Note, AllJourneys, NotesInSteps } from "./StoryMapper";

describe("Smart Array", () => {
  const a = "a";
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


});

describe("tree, no version", () => {

  describe("basic", () => {
    const aj = new AllJourneys();
    const v = new Version("version 1", aj);
    const j = new Journey();
    aj.push(j);
    const s = new Step();
    j.push(s);
    const n = new Note("a", s, v);
    s.push(n);

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
    const aj = new AllJourneys();
    const v = new Version("version 1", aj);
    const j = new Journey();
    aj.push(j);
    const s = new Step();
    j.push(s);
    const n = new Note("a", s, v);
    s.push(n);

    it('result', () => {
      expect(aj.toString()).toEqual("[[[1.1.1(a)]]]");
    });
    const j2 = new Journey();
    it('add second journey', () => {
      aj.push(j2);
      expect(aj.toString()).toEqual("[[[1.1.1(a)]],[]]");
    });
    it('move second journey', () => {
      aj.move(j2, 1);
      expect(aj.toString()).toEqual("[[],[[2.1.1(a)]]]");
    })
  });
});

describe("NotesInStep", () => {
  const aj = new AllJourneys();
  const j = new Journey();
  const v = new Version("a", aj);
  const s1 = new Step();
  j.push(s1);
  const s2 = new Step();
  j.push(s2);
  const s3 = new Step();
  j.push(s3);

  const notes: Set<Note> = new Set<Note>([
    new Note("a", s1, v, true),
    new Note("b", s1, v, true),
    new Note("c", s3, v, true),
    new Note("d", s1, v, true)
  ]);

  const nis = new NotesInSteps(j.getItems(), notes);

  it("arrayArray", () => {
    expect(nis.getArrayArray().toString()).toEqual("1.1(a),1.2(b),1.3(d)" +
      // double comma because s2 doesn't have any item
      ",,3.1(c)");
  })
  it("size", () => {
    expect(nis.getMaxSize()).toEqual(3);
  })
});