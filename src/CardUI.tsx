import React from 'react';
import './App.css';
import {Card} from "./StoryMapper";

interface Props {
    card: Card;
}

export const CardUI = ({card}: Props) => {
    return (
        <td>{card.toString()}</td>
    )
}