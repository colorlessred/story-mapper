import React, {useEffect, useState} from 'react';
import '../App.css';
import {Card} from "../Card";
import {StoryMapper} from "../../model/StoryMapper";
import {Controls} from "./Controls";
import {CardMainBody} from "./CardMainBody";

interface PropsCardUI {
    card: Card;
    storyMapper: StoryMapper;
}

export const CardUI = ({card, storyMapper}: PropsCardUI) => {
    /**
     * if true, show edit form
     */
    const [editMode, setEditMode] = useState<boolean>(card.commonCardData.editMode);

    useEffect(() => {
        card.commonCardData.editMode = editMode;
    }, [editMode]);

    const dragStartHandler = (event: React.DragEvent) => {
        storyMapper.setDraggedCard(card);
        console.log(`started drag for ${card.id}`);
    };

    const dragOverHandler = (event: React.DragEvent) => {
        const draggedCard = storyMapper.getDraggedCard();
        if (draggedCard !== undefined) {
            if (draggedCard.canMoveInto(card)) {
                event.preventDefault();
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

    const clickHandler = () => {
        setEditMode(!editMode);
    };

    return (
        <td className={`card card${card.type}`}
            draggable={true}
            onDragStart={dragStartHandler}
            onDragOver={dragOverHandler}
            onDrop={dropHandler}
        >
            <div className="content">
                <div className="cardContent" onClick={clickHandler}>
                    <div className="cardPath">
                        {card.visiblePath}
                    </div>
                    <CardMainBody commonCardData={card.commonCardData} editMode={editMode}/>
                </div>
                <div className="controls">
                    <Controls card={card} storyMapper={storyMapper}/>
                </div>
            </div>
        </td>
    );
};