import '@testing-library/jest-dom';

// Mock window.scrollIntoView which jsdom does not implement
Element.prototype.scrollIntoView = () => {};

// Mock HTMLMediaElement play/pause
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};
