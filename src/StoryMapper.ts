export class Version {
    name: String;
    steps:Map<number,Step> = new Map();

    constructor(name:String){
        this.name = name;
    }

    addNote(note:Note){

    }
}

// the
export class Step {
    sequenceNumber: number;

    constructor(id:number){
        this.sequenceNumber = id;
    }
}

// the note that describes the actual work
export class Note {
    step: Step;

    constructor(step:Step){
        this.step = step;
    }
}

