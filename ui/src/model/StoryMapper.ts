import {EmptyContent} from "./card/EmptyContent";
import {Card} from "../ui/Card";
import {Board} from "./Board";
import {Version} from "./card/Version";
import {AllVersions, AllVersionsSerialized} from "./AllVersions";
import {AllJourneys, AllJourneysSerialized} from "./AllJourneys";
import {Note} from "./card/Note";
import {Journey} from "./card/Journey";
import {Step} from "./card/Step";
import {EmptyAdder} from "./card/EmptyAdder";
import {NotesInSteps} from "./NotesInSteps";
import {ICard} from "./ICard";
import {ISerializable} from "./serialize/ISerializable";
import {Serializer} from "./serialize/Serializer";
import {ISerialized} from "./serialize/ISerialized";
import {Deserializer, DeserializerFunction} from "./serialize/Deserializer";
import {StoryMapperDeserializer} from "./StoryMapperDeserializer";

export interface StoryMapperSerialized {
    allJourneys?: number,
    allVersions?: number
}

/** class the represents the full model */
export class StoryMapper implements ISerializable<StoryMapperSerialized> {


    private allJourneys: AllJourneys = new AllJourneys();
    private allVersions: AllVersions = new AllVersions();

    private draggedCard?: Card;

    constructor() {
    }

    public getAllVersions(): AllVersions {
        return this.allVersions;
    }

    public setDraggedCard(card: Card) {
        this.draggedCard = card;
    }

    public getDraggedCard(): Card | undefined {
        return this.draggedCard;
    }

    private _boardRefreshHook: (board: Board) => void = (board: Board) => {
    };

    newJourney(): Journey {
        return Journey.createAndPush(this.allJourneys, new Step());
    }

    addVersion(name: string): Version {
        return Version.createAndPushVersion(name, this.allJourneys, this.allVersions);
    }

    addStep(journey: Journey): Step {
        return Step.createAndPush(journey);
    }

    addNote(name: string, step: Step, version: Version): Note {
        return Note.create(name, step, version, true, true);
    }

    /**
     * set the action that will be performed when the board is refreshed
     * @param fn
     */
    set boardRefreshHook(fn: (board: Board) => void) {
        this._boardRefreshHook = fn;
    }

    /** loop over all the data and create the board */
    buildBoard(callHooks: boolean = true): Board {
        const board: Board = new Board();
        // version column
        board.addCard(new Card(new EmptyContent()));
        // row of journeys
        const stepCards: Card[] = [];
        this.addJourneysToBoard(board, stepCards);
        board.endLine();
        // version column
        board.addCard(new Card(new EmptyContent()));
        // row of steps
        stepCards.forEach((card) => board.addCard(card));
        board.endLine();
        this.allVersions.items.forEach((version) => {
            this.addVersionToBoard(version, board);
        });

        if (callHooks) {
            // execute the hook. This can be used by the UI to cause the page refresh
            this._boardRefreshHook(board);
        }

        return board;
    }

    private addJourneysToBoard(board: Board, stepCards: Card[]) {
        this.allJourneys.items.forEach((journey, rowIndex) => {
            const itemsNum = journey.items.length;
            for (let colIndex = 0; colIndex < itemsNum; colIndex++) {
                const icard: ICard = (colIndex === 0) ? journey : new EmptyContent();
                board.addCard(new Card(icard));
                stepCards.push(new Card(journey.items[colIndex]));
            }
        });
    }

    private addVersionToBoard(version: Version, board: Board) {
        const notesInSteps: NotesInSteps = version.getNotesInSteps();
        /** longest notes in step, or 1 if none */
        const rows = Math.max(notesInSteps.getMaxSize(), 1);
        /** number of steps */
        const cols = notesInSteps.getStepsSize();
        const arrayArrayNotes = notesInSteps.getArrayArray();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (col === 0) {
                    if (row === 0) {
                        board.addCard(new Card(version));
                    } else {
                        board.addCard(new Card(new EmptyContent()));
                    }
                }
                const arrayNotes: Note[] = arrayArrayNotes[col];
                board.addCard(new Card(StoryMapper.getICard(row, arrayNotes, version, notesInSteps, col)));
            }
            board.endLine();
        }
    }

    private static getICard(row: number, arrayNotes: Note[], version: Version, notesInSteps: NotesInSteps, col: number): ICard {
        if (row < arrayNotes.length) {
            return arrayNotes[row];
        } else if (row === 0) {
            // first card in a version/step that has no notes
            // => create special card that allows for creation of
            // a note in this version/step
            return new EmptyAdder(version, notesInSteps.getStep(col));
        } else {
            return new EmptyContent();
        }
    }

    toSerialized(serializer: Serializer): ISerialized<StoryMapperSerialized> {
        return {
            type: StoryMapper.serializedTypeName(),
            value: {
                allJourneys: serializer.getObject(this.allJourneys),
                allVersions: serializer.getObject(this.allVersions)
            }
        };
    }

    public static serializedTypeName = () => 'StoryMapper';

    public static deserializerFunction = new DeserializerFunction<StoryMapperSerialized, StoryMapper>(
        (values: StoryMapperSerialized) => new StoryMapper()
        ,
        (object: StoryMapper, values: StoryMapperSerialized, deserializer: Deserializer) => {
            if (values.allVersions) {
                object.allVersions = deserializer.deserializeItem<AllVersionsSerialized, AllVersions>(values.allVersions);
            }
            if (values.allJourneys) {
                object.allJourneys = deserializer.deserializeItem<AllJourneysSerialized, AllJourneys>(values.allJourneys);
            }
        }
    );

    /**
     * NB!!!: this needs to be here, otherwise it references serializedTypeName which has not yet
     * been initialized and it fails at run time (really???)
     * @private
     */
    private static _deserializer: StoryMapperDeserializer = new StoryMapperDeserializer();

    /**
     * parse json and return StoryMapper
     * @param json
     */
    public static deserialize(json: string): StoryMapper {
        return StoryMapper._deserializer.deserialize(json);
    };

}
