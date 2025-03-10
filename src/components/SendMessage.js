'use client';

// Import FontAwesome components for icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Import specific solid icons (note: these are imported but not used in the component)
import {
  faArrowAltCircleRight,
  faArrowCircleRight,
} from '@fortawesome/free-solid-svg-icons';
// Import paper plane icon from regular icon set
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';

/**
 * SendMessage Component
 * Renders a message input field with a send button
 * Used in chat interfaces to allow users to compose and send messages
 *
 * @returns {JSX.Element} A styled input field with send button
 */
const SendMessage = () => {
  return (
    // Container with rounded borders and background
    <div className='bg-black rounded-full w-full flex flex-row border-white border-2'>
      {/* Message input field */}
      <input
        className='flex-3 bg-black p-4 rounded-full w-full placeholder:text-zinc-400'
        placeholder='Send a message'
      />

      {/* Send button with paper plane icon */}
      <button>
        <FontAwesomeIcon
          icon={faPaperPlane}
          className='w-7 h-14 mr-5 text-white'
        />
      </button>
    </div>
  );
};

export default SendMessage;
