import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";

const Message = ({children, isBot}) => {
    return (
        // <div className={`w-full pl-11 pr-11 border-4 border-black ${isBot ? 'bg-zinc-900' : 'bg-zinc-800'}`}>
        //     <p className=' text-center text-xl'>{children}</p>
        // </div>
        <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`relative w-fit`}>
                <p className={`${isBot ? 'bg-slate-400' : 'bg-sky-400'} rounded-xl p-3 m-3`}>{children}</p>
            </div>
        </div>
    );
};

export default Message;