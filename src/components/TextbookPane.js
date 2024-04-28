import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

const TextbookPane = () => {
  const [width, setWidth] = useState(240);
  const [minWidth, maxWidth] = [30, 850];
  // const hidden = useRef(false);
  const [hidden, setHidden] = useState(false);
  const isResizing = useRef(false);
  // max width is 480 px
  // min is 0
  const sidebarRef = useRef(null);

  useEffect(() => {
    window.addEventListener('mousemove', (e) => {
      console.log('mouse moving');
      console.log('movement of x: ', e.movementX);
      console.log('hidden: ', hidden.current);
      if (!isResizing.current) {
        return;
      }
      setWidth((previousWidth) => {
        const newWidth = previousWidth - e.movementX / 2;
        const isWidthInRange = newWidth >= minWidth && newWidth <= maxWidth;
        return isWidthInRange ? newWidth : previousWidth;
      });
    });

    window.addEventListener('mouseup', () => {
      console.log('mouse up');
      isResizing.current = false;
    });
  }, []);

  useEffect(() => {
    console.log('WIDTH: ', width);

    if (width === minWidth) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [width]);

  return (
    <div
      ref={sidebarRef}
      className={`  text-white resize-x h-screen flex flex-row items-center justify-center`}
      style={{ width: `${width / 16}rem` }}
    >
      <button
        className=' bg-zinc-100 m-1 w-2 h-10 rounded-xl'
        onMouseDown={() => {
          console.log('mouse down');
          isResizing.current = true;
        }}
      ></button>
      <div
        className={`flex flex-col items-center w-full h-full ${
          hidden ? 'hidden' : ''
        }`}
      >
        <iframe src='/Psyched.pdf' className='w-full h-full' />
      </div>
    </div>
  );
};

export default TextbookPane;
