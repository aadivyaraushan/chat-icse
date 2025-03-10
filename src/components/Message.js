'use client';

/**
 * Message Component
 * Renders a chat message bubble with different styling based on whether
 * the message is from the current user or another participant
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isFromUser - Whether the message is from the current user
 * @param {React.ReactNode} props.children - The content of the message
 * @returns {JSX.Element} A styled message bubble
 */
const Message = ({ isFromUser, children }) => {
  return (
    // Container div that positions the message bubble left or right
    <div
      className={`w-full flex flex-row justify-${
        isFromUser ? 'end' : 'start'
      } mb-2`}
    >
      {/* Message bubble with conditional styling */}
      <div
        className={` ${
          isFromUser ? 'float-right' : 'float-left'
        }  w-72 bg-zinc-800 p-3 rounded-3xl m-2 text-${
          isFromUser ? 'right' : 'left'
        } max-w-xs`}
      >
        {/* Message content */}
        <p>{children}</p>
      </div>
    </div>
  );
};

export default Message;
