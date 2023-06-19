import React, {useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";

const MessageForm = ({onClickMessageForm}) => {
    const [text, setText] = useState('')

    return (
        <div className='absolute bottom-0 w-full'>
            <div className='flex justify-center'>
                <div className='bg-zinc-700 flex justify-evenly rounded-md w-11/12 m-5' >
                    <input type='text' placeholder='Ask a question' className='bg-zinc-700 rounded-md w-11/12 p-1'/>
                    <button onClick={() => onClickMessageForm(text)}>
                        <FontAwesomeIcon icon={faPaperPlane} className='text-zinc-600 p-1'/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageForm;