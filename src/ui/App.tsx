import React, {useRef, useState} from 'react';
import './App.css';
import {BoardUI} from "./BoardUI";
import {StoryMapper} from "../model/StoryMapper";
import {Serializer} from "../model/serialize/Serializer";

function App() {
    const storyMapper = useRef(new StoryMapper());
    const [json, setJson] = useState<string>(new Serializer(storyMapper.current).getJson());

    const serialize = () => {
        setJson(new Serializer(storyMapper.current).getJson());
    }

    return (
        <div className="App">
            <BoardUI storyMapper={storyMapper.current}></BoardUI>
            <br/>
            <textarea value={json}></textarea>
            <button onClick={serialize}>serialize</button>
        </div>
    );
}

export default App;
