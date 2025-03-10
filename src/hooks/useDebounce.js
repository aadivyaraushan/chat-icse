import { useEffect, useCallback } from 'react';

/**
 * Custom hook that creates a debounced version of a callback function
 * @param {Function} callback - The original function to be debounced
 * @param {number} delay - The time in milliseconds to wait before executing the callback
 * @returns {Function} - The debounced version of the callback
 */
const useDebounce = (callback, delay) => {
  // Create a memoized debounced version of the provided callback
  const debounceCallback = useCallback(
    (...args) => {
      // Define the function to be executed after the delay
      const later = () => {
        // Clear any existing timeout to prevent multiple executions
        clearTimeout(debounceCallback.timeout);
        // Execute the original callback with all arguments
        callback(...args);
      };

      // Cancel any pending execution of the callback
      clearTimeout(debounceCallback.timeout);

      // Set a new timeout to execute the callback after the specified delay
      debounceCallback.timeout = setTimeout(later, delay);
    },
    [callback, delay] // Re-create the debounced function when callback or delay changes
  );

  // Cleanup effect to prevent memory leaks by clearing the timeout
  // when the component using this hook unmounts or dependencies change
  useEffect(() => {
    return () => {
      clearTimeout(debounceCallback.timeout);
    };
  }, [debounceCallback]);

  // Return the debounced function for use in components
  return debounceCallback;
};

export default useDebounce;
