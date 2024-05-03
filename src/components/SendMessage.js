'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowAltCircleRight,
  faArrowCircleRight,
} from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';

const SendMessage = () => {
  return (
    <div className='  bg-black rounded-full w-full flex flex-row border-white border-2'>
      <input
        className=' flex-3 bg-black p-4 rounded-full w-full  placeholder:text-zinc-400'
        placeholder='Send a message'
      />
      <button>
        <FontAwesomeIcon
          icon={faPaperPlane}
          className=' w-7 h-14 mr-5 text-white'
        />
      </button>
    </div>
  );
};

export default SendMessage;
