import React, {useState} from 'react';
import './App.css';
import {StoryMapper} from "../model/StoryMapper";
import {CardUI} from "./card/CardUI";
import {Card} from "./Card";
import {Board} from "../model/Board";

const Row = (arrayCard: Card[], index: number, storyMapper: StoryMapper) => {
    return (<tr key={`row-${index}`}>
        {arrayCard.map((card) => <CardUI card={card} storyMapper={storyMapper}></CardUI>)}
    </tr>);
};

interface Props {
    storyMapper: StoryMapper;
}

const getRandomName = () => {
    return "note" + Math.floor(Math.random() * 1000);
};

export function BoardUI({storyMapper}: Props) {
    const [board, setBoard] = useState<Board>(storyMapper.buildBoard(false));

    const refresh = (board: Board) => {
        setBoard(board);
    };

    storyMapper.boardRefreshHook = refresh;

    const populateBoard = () => {
        const j1 = storyMapper.newJourney();
        const j2 = storyMapper.newJourney();
        const s1 = storyMapper.addStep(j1);
        const s2 = storyMapper.addStep(j2);
        const s3 = storyMapper.addStep(j1);
        const v1 = storyMapper.addVersion("v1");
        const v2 = storyMapper.addVersion("v2");
        storyMapper.addNote(getRandomName(), s1, v1);
        storyMapper.addNote(getRandomName(), s2, v1);
        storyMapper.addNote(getRandomName(), s1, v2);
        storyMapper.addNote(getRandomName(), s1, v2);
        storyMapper.addNote(getRandomName(), s2, v1);
        storyMapper.addNote(getRandomName(), s3, v2);
        storyMapper.buildBoard();
    };

    return (
        <>
            <table className="board">
                <tbody>
                {board.getCards().map((arrayCard, index) => Row(arrayCard, index, storyMapper))}
                </tbody>
            </table>
            <button onClick={populateBoard}>populate board</button>
        </>
    );
}

