import React from 'react';
import './App.css';
import {Card} from "./model/Card";
import {StoryMapper} from "./model/StoryMapper";

interface Props {
    card: Card;
    storyMapper: StoryMapper;
}

export const CardUI = ({card, storyMapper}: Props) => {

    const createNewNext = () => {
        card.createNewNext();
        // building the board will trigger the page refresh
        storyMapper.buildBoard();
    }

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
    )
}