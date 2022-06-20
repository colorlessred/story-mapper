import {SmartArray} from "./StoryMapper";

describe("Smart Array", () => {
    const a = "a";

    describe("push", () => {
        const sa = new SmartArray<String>();
        sa.push(a);
        sa.push("b");
        it('toString', () => {
            expect(sa.toString()).toEqual("[a,b]")
        })
    })

    describe("remove", () => {
        const sa = new SmartArray<String>();
        sa.push(a);
        sa.push("b");
        sa.remove(a);
        it('toString', () => {
            expect(sa.toString()).toEqual("[b]")
        })
    });

    describe("add", () => {
        const sa = new SmartArray<String>();
        sa.push(a);
        sa.push("b");

        it('add 0', () => {
            sa.add("c", 0);
            expect(sa.toString()).toEqual("[c,a,b]")
        });
        it('add end', () => {
            sa.add("e", 10);
            expect(sa.toString()).toEqual("[c,a,b,e]")
        });
        it('add middle', () => {
            sa.add("x", 1);
            expect(sa.toString()).toEqual("[c,x,a,b,e]")
        });
    });

});