import React, {useEffect, useState} from "react";
import {CommonCardData} from "../../model/CommonCardData";

interface PropsCardMainBody {
    commonCardData: CommonCardData;
    editMode: boolean;
}

export const CardMainBody = ({commonCardData, editMode}: PropsCardMainBody) => {
    const [title, setTitle] = useState<string>(commonCardData.title);

    useEffect(() => {
        // if the commonCardData changes (a different instance) we need
        // to reload the title. Otherwise the Card will "keep" its data on
        // UI even if you move the Notes around
        setTitle(commonCardData.title);
    }, [commonCardData]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newTitle = e.target.value;
        commonCardData.title = newTitle;
        setTitle(newTitle);
    };

    return (editMode) ?
        // edit
        (<div className="">
                <textarea rows={5} cols={30}
                          value={title}
                          onChange={handleChange}></textarea>
        </div>) :
        // read
        (<div className="cardTitle">
            {title}
        </div>);
};