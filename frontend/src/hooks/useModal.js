import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing modal state
 * @param {boolean} initialState - Initial open state
 * @returns {object} Modal state and control functions
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

/**
 * Custom hook for detecting clicks outside an element
 * @param {Function} callback - Function to call when clicked outside
 * @returns {React.RefObject} Ref to attach to the element
 */
export const useClickOutside = (callback) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [callback]);

  return ref;
};
