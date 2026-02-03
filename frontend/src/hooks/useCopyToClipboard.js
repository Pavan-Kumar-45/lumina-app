import { useState, useCallback } from 'react';
import { copyToClipboard } from '../utils/exportUtils';

/**
 * Custom hook for managing copy to clipboard functionality
 * @param {number} resetDelay - Time in ms before resetting copied state (default 2000)
 * @returns {object} Copied state and copy function
 */
export const useCopyToClipboard = (resetDelay = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    }
    return success;
  }, [resetDelay]);

  return { copied, copy };
};
