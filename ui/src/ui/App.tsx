import React, {useEffect, useState} from 'react';
import './App.css';
import {BoardUI} from "./BoardUI";
import {StoryMapper} from "../model/StoryMapper";
import {Serializer} from "../model/serialize/Serializer";

function App() {
    const [storyMapper, setStoryMapper] = useState<StoryMapper>(new StoryMapper());
    const [json, setJson] = useState<string>(new Serializer(storyMapper).getJson());

    const serialize = () => {
        setJson(new Serializer(storyMapper).getJson());
    };

    const loadIntoBoard = () => {
        setStoryMapper(StoryMapper.deserialize(json));
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJson(e.target.value);
    };

    // useEffect(()=>{
    //     setStoryMapper(storyMapper);
    // }, [storyMapper]);

    return (
        <div className="App">
            <BoardUI storyMapper={storyMapper}></BoardUI>
            <br/>
            <textarea value={json} onChange={handleChange}></textarea>
            <button onClick={serialize}>serialize</button>
            <button onClick={loadIntoBoard}>load into board</button>
        </div>
    );
}

export default App;
