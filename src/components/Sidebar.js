import { useCallback, useEffect, useRef, useState } from 'react';

const Sidebar = () => {
  const [width, setWidth] = useState(240);
  const [hidden, setHidden] = useState(false);
  const [minWidth, maxWidth] = [30, 850];
  // max width is 480 px
  // min is 0
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);

  useEffect(() => {
    window.addEventListener('mousemove', (e) => {
      if (!isResizing.current) {
        return;
      }
      setWidth((previousWidth) => {
        const newWidth = previousWidth + e.movementX / 2;
        const isWidthInRange = newWidth >= minWidth && newWidth <= maxWidth;
        return isWidthInRange ? newWidth : previousWidth;
      });
    });

    window.addEventListener('mouseup', () => {
      isResizing.current = false;
    });
  }, []);

  useEffect(() => {
    if (width === minWidth) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [width]);

  return (
    <div
      ref={sidebarRef}
      className={` ${
        hidden ? 'bg-black' : 'bg-zinc-900'
      } text-white resize-x h-screen flex flex-row items-center justify-center`}
      style={{ width: `${width / 16}rem` }}
    >
      <div
        className={`flex flex-col items-center w-11/12 h-full  ${
          hidden ? 'hidden' : ''
        } `}
      >
        <button
          className={`hover:cursor-pointer p-2  rounded-xl m-3   ${
            hidden ? 'hidden' : ''
          }`}
        >
          + New Question
        </button>
        <button
          className={`   ${
            hidden ? 'hidden' : ''
          } text-ellipsis overflow-hidden whitespace-nowrap h-6`}
          style={{ width: `${width / 16 - 4}rem` }}
        >
          Ball Bouncing on Wall AAAAAAAAAAAAAAA
        </button>
        <button
          className={`  ${
            hidden ? 'hidden' : ''
          } text-ellipsis overflow-hidden whitespace-nowrap h-6`}
          style={{ width: `${width / 16 - 4}rem` }}
        >
          Object on Inclined Plane
        </button>
      </div>
      <button
        className=' bg-zinc-100  w-2 h-10 rounded-xl'
        onMouseDown={() => {
          isResizing.current = true;
        }}
      ></button>
    </div>
  );
};

export default Sidebar;
