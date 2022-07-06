import React from 'react';
import './App.css';
import {Card} from "./Card";
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

interface PropsCardUI {
    card: Card;
    storyMapper: StoryMapper;
}

export const CardUI = ({card, storyMapper}: PropsCardUI) => {
    const dragStartHandler = (event: React.DragEvent) => {
        storyMapper.setDraggedCard(card);
        console.log(`started drag for ${card.getId()}`);
    };

    const dragOverHandler = (event: React.DragEvent) => {
        const draggedCard = storyMapper.getDraggedCard();
        if (draggedCard !== undefined) {
            if (draggedCard.canMoveInto(card)) {
                event.preventDefault();
                // console.log(`card ${event.dataTransfer.getData('card')} drag over ${card.getId()}`);
            }
        }
    };

    const dropHandler = (event: React.DragEvent) => {
        const draggedCard = storyMapper.getDraggedCard();
        if (draggedCard !== undefined) {
            if (draggedCard.canMoveInto(card)) {
                draggedCard.moveInto(card);
                storyMapper.buildBoard();
            }
        }
    };

    return (
        <td className={`card card${card.type}`}
            draggable={true}
            onDragStart={dragStartHandler}
            onDragOver={dragOverHandler}
            onDrop={dropHandler}
        >
            <div className="content">
                <div className="cardContent">
                    <div className="cardPath">
                        {card.visiblePath}
                    </div>
                    <div className="cardTitle">
                        {card.commonCardData.title}
                    </div>
                </div>
                <div className="controls">
                    <Controls card={card} storyMapper={storyMapper}/>
                </div>
            </div>
        </td>
    );
};