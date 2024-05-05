import { useEffect, useCallback } from 'react';

const useDebounce = (callback, delay) => {
  const debounceCallback = useCallback(
    (...args) => {
      const later = () => {
        clearTimeout(debounceCallback.timeout);
        callback(...args);
      };
      clearTimeout(debounceCallback.timeout);
      debounceCallback.timeout = setTimeout(later, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      clearTimeout(debounceCallback.timeout);
    };
  }, [debounceCallback]);

  return debounceCallback;
};

export default useDebounce;
