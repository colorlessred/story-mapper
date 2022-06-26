import React from 'react';
import './App.css';
import {Card} from "./model/Card";
import {StoryMapper} from "./model/StoryMapper";

interface PropsControls {

}

const Controls = ({}: PropsControls) => {

};


interface PropsCardUI {
    card: Card;
    storyMapper: StoryMapper;

}

export const CardUI = ({card, storyMapper}: PropsCardUI) => {

    const createNewNext = () => {
        card.createNewNext();
        // building the board will trigger the page refresh
        storyMapper.buildBoard();
    };

    return (
        <td className={`card card${card.getType()}`}>
            <div className="content">
                <div className="cardContent">
                    {card.toString()}
                </div>
                <div className="controls">
                    <button onClick={createNewNext}>+</button>
                </div>
            </div>
        </td>
    );
};