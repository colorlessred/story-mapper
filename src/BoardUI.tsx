import React, {useRef, useState} from 'react';
import './App.css';
import {StoryMapper} from "./model/StoryMapper";
import {CardUI} from "./CardUI";
import {Card} from "./model/Card";
import {Board} from "./model/Board";

const Row = (arrayCard: Card[], index: number) => {
    console.log("row " + index);
    return (<tr key={`row-${index}`}>
        {arrayCard.map((card) => <CardUI card={card}></CardUI>)}
    </tr>)
}

interface Props {
    storyMapper: StoryMapper
}

export function BoardUI({storyMapper}: Props) {

    const [board, setBoard] = useState<Board>(storyMapper.buildBoard());

    const populateBoard = () => {
        const oldBoard = storyMapper.buildBoard();
        console.log(`old: ${oldBoard.getCards().length}`);
        const j1 = storyMapper.addJourney();
        const j2 = storyMapper.addJourney();
        const s1 = storyMapper.addStep(j1);
        const s2 = storyMapper.addStep(j2);
        const s3 = storyMapper.addStep(j1);
        const v1 = storyMapper.addVersion("v1");
        const v2 = storyMapper.addVersion("v2");
        storyMapper.addNote("note", s1, v1);
        storyMapper.addNote("note", s2, v1);
        storyMapper.addNote("note", s1, v2);
        storyMapper.addNote("note", s1, v2);
        storyMapper.addNote("note", s2, v1);
        const newBoard = storyMapper.buildBoard();

        // console.log(`new: ${newBoard.getCards().length}`);
        // console.log(newBoard.toString());
        setBoard(newBoard);
    }

    return (
        <>
            <table className="board">
                <tbody>
                {board.getCards().map((arrayCard, index) => Row(arrayCard, index))}
                </tbody>
            </table>
            <button onClick={populateBoard}>populate board</button>
        </>
    )
}

