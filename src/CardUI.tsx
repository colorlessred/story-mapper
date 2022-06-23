import React from 'react';
import './App.css';
import {Card} from "./StoryMapper";

interface Props {
    card: Card;
}

export const CardUI = ({card}: Props) => {
    return (
        <td className="card">
            <div className="content">
                <div className="cardContent">
                    {card.toString()}
                </div>
                <div className="controls">
                    +
                </div>
            </div>
        </td>
    )
}