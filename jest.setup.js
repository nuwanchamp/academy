import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserver;

if (typeof window !== 'undefined') {
    window.matchMedia = window.matchMedia || function () {
        return {
            matches: false,
            addListener() {},
            removeListener() {},
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent() { return false; },
        };
    };
}

if (typeof HTMLFormElement !== 'undefined' && !HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function (submitter) {
        if (submitter) {
            submitter.click();
            return;
        }
        this.dispatchEvent(new Event('submit', {cancelable: true}));
    };
}
