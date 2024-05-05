'use client';
const Message = ({ isFromUser, children }) => {
  return (
    <div
      className={`w-full  flex flex-row justify-${
        isFromUser ? 'end' : 'start'
      } mb-2`}
    >
      <div
        className={` ${
          isFromUser ? 'float-right' : 'float-left'
        }  w-72 bg-zinc-800 p-3 rounded-3xl m-2 text-${
          isFromUser ? 'right' : 'left'
        } max-w-xs`}
      >
        <p>{children}</p>
      </div>
    </div>
  );
};

export default Message;
