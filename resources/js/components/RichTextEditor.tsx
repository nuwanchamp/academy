import {useEffect, useRef, type ChangeEvent, type ReactNode} from "react";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    LinkIcon,
    Undo2,
    Redo2,
    ImageIcon,
    Video,
    Code as CodeIcon,
} from "lucide-react";
import {cn} from "@/lib/utils.ts";

type RichTextEditorProps = {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: number;
};

export default function RichTextEditor({
    id,
    value,
    onChange,
    placeholder = "Start writing your content...",
    className,
    minHeight = 240,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
                bulletList: {
                    keepMarks: true,
                },
                orderedList: {
                    keepMarks: true,
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline decoration-dotted underline-offset-4",
                },
            }),
            Image.configure({
                inline: false,
                HTMLAttributes: {
                    class: "rounded-lg border border-border my-4",
                },
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
                allowFullscreen: true,
                HTMLAttributes: {
                    class: "rounded-xl overflow-hidden my-4 w-full aspect-video",
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: [
                    "focus:outline-none text-sm leading-relaxed text-foreground space-y-4",
                    "[&_p]:mb-3 [&_p:last-child]:mb-0",
                    "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
                    "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4",
                    "[&_blockquote]:italic [&_blockquote]:text-muted-foreground",
                    "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
                ].join(" "),
            },
        },
        onUpdate: ({editor: current}) => {
            onChange(current.getHTML());
        },
    });

    const imageInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!editor) {
            return;
        }

        if (value === editor.getHTML()) {
            return;
        }

        editor.commands.setContent(value || "", { emitUpdate: false });
    }, [editor, value]);

    if (!editor) {
        return (
            <div className={cn("rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground", className)}>
                Loading editor...
            </div>
        );
    }

    const toggleLink = () => {
        const previousUrl = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Enter URL", previousUrl ?? "https://");

        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({href: url}).run();
    };

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !editor) {
            return;
        }

        const toDataUrl = (input: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(input);
        });

        try {
            const dataUrl = await toDataUrl(file);
            editor.chain().focus().setImage({src: dataUrl, alt: file.name}).run();
        } catch (error) {
            console.error("Failed to load image", error);
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt("Paste YouTube URL");
        if (!url || !editor) {
            return;
        }

        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/i);
        if (!match) {
            window.alert("Please provide a valid YouTube URL.");
            return;
        }

        const videoId = match[1];
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
        editor
            .chain()
            .focus()
            .setYoutubeVideo({
                src: embedUrl,
                width: 854,
                height: 480,
            })
            .run();
    };

    const toolbarButton = (args: {label: string; icon: ReactNode; onClick: () => void; active?: boolean}) => {
        const {label, icon, onClick, active} = args;
        return (
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    "inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                    active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent bg-transparent text-muted-foreground hover:bg-muted",
                )}
                aria-label={label}
            >
                {icon}
            </button>
        );
    };

    return (
        <div id={id} className={cn("rounded-lg border border-input bg-background", className)}>
            <div className="flex flex-wrap gap-1 border-b border-border px-2 py-2">
                {toolbarButton({
                    label: "Bold",
                    icon: <Bold className="size-3.5" />,
                    onClick: () => editor.chain().focus().toggleBold().run(),
                    active: editor.isActive("bold"),
                })}
                {toolbarButton({
                    label: "Italic",
                    icon: <Italic className="size-3.5" />,
                    onClick: () => editor.chain().focus().toggleItalic().run(),
                    active: editor.isActive("italic"),
                })}
                {toolbarButton({
                    label: "Bullet list",
                    icon: <List className="size-3.5" />,
                    onClick: () => editor.chain().focus().toggleBulletList().run(),
                    active: editor.isActive("bulletList"),
                })}
                {toolbarButton({
                    label: "Numbered list",
                    icon: <ListOrdered className="size-3.5" />,
                    onClick: () => editor.chain().focus().toggleOrderedList().run(),
                    active: editor.isActive("orderedList"),
                })}
                {toolbarButton({
                    label: "Quote",
                    icon: <Quote className="size-3.5" />,
                    onClick: () => editor.chain().focus().toggleBlockquote().run(),
                    active: editor.isActive("blockquote"),
                })}
                {toolbarButton({
                    label: "Inline code",
                    icon: <CodeIcon className="size-3.5" />,
                    onClick: () => editor.chain().focus().toggleCode().run(),
                    active: editor.isActive("code"),
                })}
                {toolbarButton({
                    label: "Link",
                    icon: <LinkIcon className="size-3.5" />,
                    onClick: toggleLink,
                    active: editor.isActive("link"),
                })}
                {toolbarButton({
                    label: "Insert image",
                    icon: <ImageIcon className="size-3.5" />,
                    onClick: () => imageInputRef.current?.click(),
                })}
                {toolbarButton({
                    label: "Embed video",
                    icon: <Video className="size-3.5" />,
                    onClick: addYoutubeVideo,
                })}
                <div className="ml-auto flex gap-1">
                    {toolbarButton({
                        label: "Undo",
                        icon: <Undo2 className="size-3.5" />,
                        onClick: () => editor.chain().focus().undo().run(),
                    })}
                    {toolbarButton({
                        label: "Redo",
                        icon: <Redo2 className="size-3.5" />,
                        onClick: () => editor.chain().focus().redo().run(),
                    })}
                </div>
            </div>
            <div className="px-3 py-2" style={{minHeight}}>
                <EditorContent editor={editor} />
            </div>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={handleImageChange}
            />
        </div>
    );
}
