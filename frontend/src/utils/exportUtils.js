/**
 * Export utilities for downloading content in various formats
 */

/**
 * Export content as a file
 * @param {string} content - Content to export
 * @param {string} filename - Base filename without extension
 * @param {string} format - File format ('md', 'txt', 'pdf')
 * @param {string} title - Optional title for the document
 */
export const exportFile = (content, filename, format, title = '') => {
  if (format === 'pdf') {
    window.print();
    return;
  }

  const mimeType = format === 'md' ? 'text/markdown' : 'text/plain';
  const extension = format === 'md' ? 'md' : 'txt';
  const fullContent = title ? `# ${title}\n\n${content}` : content;

  const element = document.createElement('a');
  const file = new Blob([fullContent], { type: mimeType });
  element.href = URL.createObjectURL(file);
  element.download = `${filename}.${extension}`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};
