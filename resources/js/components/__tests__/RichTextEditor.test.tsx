import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {EditorView} from "prosemirror-view";
import RichTextEditor from "@/components/RichTextEditor.tsx";

const createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: document.body,
    cloneRange: () => createRange(),
    selectNodeContents: () => {},
    deleteContents: () => {},
    extractContents: () => document.createDocumentFragment(),
    getBoundingClientRect: () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        toJSON: () => "",
    }),
    getClientRects: () => ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: function* () {},
    }),
});

beforeAll(() => {
    // TipTap relies on DOM Range + selection APIs that JSDOM does not fully implement.
    // These lightweight mocks unlock contenteditable interactions in tests.
    if (!document.createRange) {
        document.createRange = createRange as unknown as typeof document.createRange;
    }

    if (!window.getSelection) {
        window.getSelection = () => ({
            removeAllRanges: () => {},
            addRange: () => {},
            getRangeAt: () => createRange(),
            rangeCount: 1,
        }) as unknown as Selection;
    }

    if (!document.elementFromPoint) {
        document.elementFromPoint = () => document.body;
    }

    const rectList = () => ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: function* () {},
    });

    const rect = () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        toJSON: () => "",
    });

    if (!Element.prototype.getClientRects) {
        Object.defineProperty(Element.prototype, "getClientRects", {
            configurable: true,
            value: rectList,
        });
    }

    if (!Element.prototype.getBoundingClientRect) {
        Object.defineProperty(Element.prototype, "getBoundingClientRect", {
            configurable: true,
            value: rect,
        });
    }

    const nodeProto = (Node as unknown as {prototype: Record<string, unknown>}).prototype;

    if (!nodeProto.getClientRects) {
        Object.defineProperty(nodeProto, "getClientRects", {
            configurable: true,
            value: rectList,
        });
    }

    if (!nodeProto.getBoundingClientRect) {
        Object.defineProperty(nodeProto, "getBoundingClientRect", {
            configurable: true,
            value: rect,
        });
    }
});

const getLastPayload = (spy: jest.Mock) => (spy.mock.calls as any).at(-1)?.[0] as string | undefined;

const renderEditor = async () => {
    const onChange = jest.fn();
    const utils = render(<RichTextEditor value="" onChange={onChange} />);
    await waitFor(() => {
        const editor = utils.container.querySelector('[contenteditable="true"]');
        expect(editor).toBeTruthy();
    });

    const editorEl = utils.container.querySelector('[contenteditable="true"]') as HTMLElement;
    const user = userEvent.setup();

    return {
        ...utils,
        user,
        onChange,
        editorEl,
    };
};

describe("RichTextEditor", () => {
    it("formats bold text when toggled", async () => {
        const {user, editorEl, onChange} = await renderEditor();

        await user.click(screen.getByRole("button", {name: /bold/i}));
        await user.type(editorEl, "Bold text");

        await waitFor(() => {
            expect(getLastPayload(onChange)).toContain("<strong>Bold text</strong>");
        });
    });

    it("supports bullet lists", async () => {
        const {user, editorEl, onChange} = await renderEditor();

        await user.click(screen.getByRole("button", {name: /bullet list/i}));
        await user.type(editorEl, "Item one{enter}Item two");

        await waitFor(() => {
            expect(getLastPayload(onChange)).toMatch(/<ul>.*<li><p>Item one<\/p><\/li>.*<li><p>Item two<\/p><\/li>/s);
        });
    });

    it("supports block quotes", async () => {
        const {user, editorEl, onChange} = await renderEditor();

        await user.click(screen.getByRole("button", {name: /quote/i}));
        await user.type(editorEl, "Remember this insight");

        await waitFor(() => {
            expect(getLastPayload(onChange)).toMatch(/<blockquote>.*Remember this insight.*<\/blockquote>/s);
        });
    });

    it("handles inline code toggles", async () => {
        const {user, editorEl, onChange} = await renderEditor();

        await user.click(screen.getByRole("button", {name: /inline code/i}));
        await user.type(editorEl, "const value = 42;");

        await waitFor(() => {
            expect(getLastPayload(onChange)).toContain("<code>const value = 42;</code>");
        });
    });

    it("inserts uploaded images", async () => {
        const {user, container, onChange} = await renderEditor();
        const originalFileReader = global.FileReader;

        class MockFileReader {
            public result: string | ArrayBuffer | null = null;
            public onload: null | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) = null;

            readAsDataURL(): void {
                this.result = "data:image/png;base64,mock-data";
                if (this.onload) {
                    this.onload.call(this as unknown as FileReader, {target: {result: this.result}} as ProgressEvent<FileReader>);
                }
            }
        }

        Object.defineProperty(global, "FileReader", {
            writable: true,
            value: MockFileReader,
        });

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(["dummy"], "photo.png", {type: "image/png"});

        await user.click(screen.getByRole("button", {name: /insert image/i}));
        fireEvent.change(fileInput, {target: {files: [file]}});

        await waitFor(() => {
            expect(getLastPayload(onChange)).toContain("data:image/png;base64,mock-data");
            expect(getLastPayload(onChange)).toContain("photo.png");
        });

        Object.defineProperty(global, "FileReader", {
            writable: true,
            value: originalFileReader,
        });
    });

    it("embeds YouTube videos via toolbar", async () => {
        const {user, onChange} = await renderEditor();
        const promptSpy = jest.spyOn(window, "prompt").mockReturnValue("https://youtu.be/dQw4w9WgXcQ");

        await user.click(screen.getByRole("button", {name: /embed video/i}));

        await waitFor(() => {
            expect(getLastPayload(onChange)).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
        });

        promptSpy.mockRestore();
    });
});

(EditorView.prototype as any).scrollToSelection = () => {};
