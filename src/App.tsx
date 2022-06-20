import React, {useRef} from 'react';
import './App.css';
import {BoardUI} from "./BoardUI";
import {StoryMapper} from "./model/StoryMapper";

function App() {
    const storyMapper = useRef(new StoryMapper());
    return (
        <div className="App">
            <BoardUI storyMapper={storyMapper.current}></BoardUI>
        </div>
    );
}

export default App;
