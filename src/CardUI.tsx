import React from 'react';
import './App.css';
import {Card} from "./model/Card";

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