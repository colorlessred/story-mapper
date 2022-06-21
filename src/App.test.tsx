import { SmartArray, Version, Journey, Step, Note, AllJourneys } from "./StoryMapper";

describe("Smart Array", () => {
  const a = "a";

  describe("push", () => {
    const sa = new SmartArray<Version>();
    sa.push(new Version("a"));
    sa.push(new Version("b"));
    it('toString', () => {
      expect(sa.toString()).toEqual("[1(a),2(b)]")
    })
  })

  describe("remove", () => {
    const sa = new SmartArray<Version>();
    const a = new Version("a");
    sa.push(a);
    sa.push(new Version("b"));
    sa.remove(a);
    it('toString', () => {
      expect(sa.toString()).toEqual("[1(b)]")
    })
  });

  describe("add", () => {
    const sa = new SmartArray<Version>();
    const a = new Version("a");
    sa.push(a);
    sa.push(new Version("b"));

    it('add 0', () => {
      sa.add(new Version("c"), 1);
      expect(sa.toString()).toEqual("[1(c),2(a),3(b)]")
    });
    it('add end', () => {
      sa.add(new Version("d"), 10);
      expect(sa.toString()).toEqual("[1(c),2(a),3(b),4(d)]")
    });
    it('add middle', () => {
      sa.add(new Version("e"), 2);
      expect(sa.toString()).toEqual("[1(c),2(e),3(a),4(b),5(d)]")
    });

    it('add invalid position', () => {
      sa.add(new Version("f"), 0);
      // unchanged result
      expect(sa.toString()).toEqual("[1(c),2(e),3(a),4(b),5(d)]")
    })
  });

  describe("move", () => {
    const sa = new SmartArray<Version>();
    const a = new Version("a");
    sa.push(a);
    sa.push(new Version("b"));
    const c = new Version("c");
    sa.push(c);

    it('move middle', () => {
      sa.move(a,2);
      expect(sa.toString()).toEqual("[1(b),2(a),3(c)]");
    });
  });


});

describe("tree, no version", () => {
  describe("basic", () => {
    const v = new Version("version 1");
    const aj = new AllJourneys();
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
    const v = new Version("version 1");
    const aj = new AllJourneys();
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