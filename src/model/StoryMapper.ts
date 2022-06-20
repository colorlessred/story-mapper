import {EmptyContent} from "./EmptyContent";
import {Card} from "./Card";
import {Board} from "./Board";
import {Version} from "./Version";
import {AllVersions} from "./AllVersions";
import {AllJourneys} from "./AllJourneys";
import {Note} from "./Note";
import {Journey} from "./Journey";
import {Step} from "./Step";
import {EmptyAdder} from "./EmptyAdder";
import {NotesInSteps} from "./NotesInSteps";
import {ICard} from "./ICard";

/** class the represents the full model */
export class StoryMapper {
    private allJourneys: AllJourneys = new AllJourneys();
    private allVersions: AllVersions = new AllVersions();

    private draggedCard?: Card;

    public setDraggedCard(card: Card) {
        this.draggedCard = card;
    }

    public getDraggedCard(): Card | undefined {
        return this.draggedCard;
    }

    private boardRefreshHook: (board: Board) => void = (board: Board) => {
    };

    newJourney(): Journey {
        return new Journey(this.allJourneys, new Step());
    }

    addVersion(name: string): Version {
        return new Version(name, this.allJourneys, this.allVersions);
    }

    addStep(journey: Journey): Step {
        return new Step(journey);
    }

    addNote(name: string, step: Step, version: Version): Note {
        return new Note(name, step, version, true, true);
    }

    /**
     * set the action that will be performed when the board is refreshed
     * @param fn
     */
    setBoardRefreshHook(fn: (board: Board) => void): void {
        this.boardRefreshHook = fn;
    }

    /** loop over all the data and create the board */
    buildBoard(callHooks: boolean = true): Board {
        const board: Board = new Board();
        // version column
        board.addCard(new Card(new EmptyContent()));
        // row of journeys
        const stepCards: Card[] = [];
        this.allJourneys.getItems().forEach((journey, rowIndex) => {
            const itemsNum = journey.getItems().length;
            for (let colIndex = 0; colIndex < itemsNum; colIndex++) {
                if (colIndex === 0) {
                    board.addCard(new Card(journey));
                } else {
                    board.addCard(new Card(new EmptyContent()));
                }
                if (colIndex < itemsNum) {
                    stepCards.push(new Card(journey.getItems()[colIndex]));
                } else {
                    stepCards.push(new Card(new EmptyContent()));
                }
            }
        });
        board.endLine();
        // version column
        board.addCard(new Card(new EmptyContent()));
        // row of steps
        stepCards.forEach((card) => board.addCard(card));
        board.endLine();
        // versions
        this.allVersions.getItems().forEach((version) => {
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
                    if (row < arrayNotes.length) {
                        const note: Note = arrayNotes[row];
                        board.addCard(new Card(note));
                    } else if (row === 0) {
                        // first card in a version/step that has no notes
                        // => create special card that allows for creation of
                        // a note in this version/step
                        const card: ICard = new EmptyAdder(version, notesInSteps.getStep(col));
                        board.addCard(new Card(card));
                    } else {
                        board.addCard(new Card(new EmptyContent()));
                    }
                }
                board.endLine();
            }
        });

        if (callHooks) {
            // execute the hook. This can be used by the UI to cause the page refresh
            this.boardRefreshHook(board);
        }

        return board;
    }
}
