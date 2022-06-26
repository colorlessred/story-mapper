import React from 'react';
import './App.css';
import {Card} from "./model/Card";
import {StoryMapper} from "./model/StoryMapper";

interface PropsControls {
    card: Card;
    storyMapper: StoryMapper;
}

const Controls = ({card, storyMapper}: PropsControls) => {
    if (card.showControls()) {
        const createNewNext = () => {
            card.createNewNext();
            // building the board will trigger the page refresh
            storyMapper.buildBoard();
        };

        return (
            <button onClick={createNewNext}>+</button>
        );
    } else {
        return (<></>);
    }
};

interface PropsCardUI {
    card: Card;
    storyMapper: StoryMapper;
}

export const CardUI = ({card, storyMapper}: PropsCardUI) => {
    return (
        <td className={`card card${card.getType()}`}>
            <div className="content">
                <div className="cardContent">
                    {card.toString()}
                </div>
                <div className="controls">
                    <Controls card={card} storyMapper={storyMapper}/>
                </div>
            </div>
        </td>
    );
};