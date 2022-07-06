import React from "react";
import {Card} from "../Card";
import {StoryMapper} from "../../model/StoryMapper";

interface PropsControls {
    card: Card;
    storyMapper: StoryMapper;
}

export const Controls = ({card, storyMapper}: PropsControls) => {
    if (card.showControls()) {
        const createNewNext = () => {
            card.createNewNext();
            // building the board will trigger the page refresh
            storyMapper.buildBoard();
        };

        const deleteCard = () => {
            card.delete();
            storyMapper.buildBoard();
        };

        const deleteButton = (card.canDelete()) ? <button onClick={deleteCard}>-</button> : <></>;

        return (
            <>
                <button onClick={createNewNext}>+</button>
                {deleteButton}
            </>
        );
    } else {
        return (<></>);
    }
};