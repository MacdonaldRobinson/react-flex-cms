import React, { useCallback, useState, useRef, useEffect } from "react";
import RcTiptapEditor from "reactjs-tiptap-editor";
import { debounce } from "lodash";
import {
    BaseKit,
    Blockquote,
    Bold,
    BulletList,
    Clear,
    Code,
    CodeBlock,
    Color,
    ColumnActionButton,
    Emoji,
    ExportPdf,
    ExportWord,
    FontFamily,
    FontSize,
    FormatPainter,
    Heading,
    Highlight,
    History,
    HorizontalRule,
    Iframe,
    Image,
    ImportWord,
    Indent,
    Italic,
    Katex,
    LineHeight,
    Link,
    MoreMark,
    OrderedList,
    SearchAndReplace,
    SlashCommand,
    Strike,
    Table,
    TaskList,
    TextAlign,
    Underline,
    TableOfContents,
    Excalidraw,
    TextDirection,
    Mention,
    Attachment,
    Mermaid,
    Twitter,
    Drawer,
} from "reactjs-tiptap-editor/extension-bundle";

import "katex/dist/katex.min.css";
import "easydrawer/styles.css";
import "reactjs-tiptap-editor/style.css";
import "react-image-crop/dist/ReactCrop.css";
import useCMS from "../../firebase/firestore/collections/CMS/useCMS";
import {
    EditableWrapper,
    EditableWrapperToolbar,
} from "./EditableContent.styles";
import { renderToStaticMarkup } from "react-dom/server";

function convertBase64ToBlob(base64: string): Blob {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let n = bstr.length; n--; ) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

const extensions = [
    BaseKit.configure({
        multiColumn: true,
        placeholder: { showOnlyCurrent: true },
    }),
    History,
    SearchAndReplace,
    TextDirection,
    TableOfContents,
    FormatPainter.configure({ spacer: true }),
    Clear,
    FontFamily,
    Heading.configure({ spacer: true }),
    FontSize,
    Bold,
    Italic,
    Underline,
    Strike,
    MoreMark,
    Katex,
    Emoji,
    Color.configure({ spacer: true }),
    Highlight,
    BulletList,
    OrderedList,
    TextAlign.configure({ types: ["heading", "paragraph"], spacer: true }),
    Indent,
    LineHeight,
    TaskList.configure({ spacer: true, taskItem: { nested: true } }),
    Link,
    Image.configure({
        upload: (file: File) => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(URL.createObjectURL(file)), 500);
            });
        },
    }),
    Blockquote,
    SlashCommand,
    HorizontalRule,
    Code,
    CodeBlock,
    ColumnActionButton,
    Table,
    Iframe,
    ExportPdf,
    ImportWord,
    ExportWord,
    Excalidraw,
    Mention,
    Attachment.configure({
        upload: (file: File) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            return new Promise((resolve) => {
                reader.onloadend = () => {
                    if (reader.result) {
                        const blob = convertBase64ToBlob(
                            reader.result as string
                        );
                        resolve(URL.createObjectURL(blob));
                    }
                };
            });
        },
    }),
    Mermaid,
    Twitter,
    Drawer.configure({
        upload: (file: File) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            return new Promise((resolve) => {
                reader.onloadend = () => {
                    if (reader.result) {
                        const blob = convertBase64ToBlob(
                            reader.result as string
                        );
                        resolve(URL.createObjectURL(blob));
                    }
                };
            });
        },
    }),
];

type TEditor = {
    contentId: string;
    children: React.ReactNode;
    onContentChange?: (value: string) => void;
};

const EditableContent = ({ contentId, children }: TEditor) => {
    const { updateContent, getContent } = useCMS();
    const [content, setContent] = useState<string | null>(null);
    const isInProgress = useRef(false);
    const [showEditor, setShowEditor] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const refEditor = useRef<React.ComponentRef<typeof RcTiptapEditor> | null>(
        null
    );

    const [theme] = useState<"light" | "dark">("light");
    const [disable] = useState<boolean>(false);

    useEffect(() => {
        async function fetchContent() {
            if (isInProgress.current) return;

            const initialHtml = renderToStaticMarkup(children);

            isInProgress.current = false;
            const foundContent = await getContent(contentId);

            console.log(foundContent);
            isInProgress.current = true;

            if (foundContent) {
                console.log("Setting found content");

                setContent(foundContent.contentValue);
            }

            if (!foundContent) {
                console.log("Setting initial content");

                await updateContent(contentId, {
                    contentValue: initialHtml,
                });

                setContent(initialHtml);
            }

            isInProgress.current = false;
            setIsLoading(false);
        }
        setIsLoading(true);
        fetchContent();
    }, [children, contentId, getContent, showEditor, updateContent]);

    const debounceSetContent = debounce(async () => {
        if (isInProgress.current) return;

        isInProgress.current = true;

        const html = refEditor.current?.editor?.getHTML();

        if (html && content != html) {
            await updateContent(contentId, {
                contentValue: html,
            });

            setContent(html);
        }

        isInProgress.current = false;
        setIsLoading(false);
    }, 1000);

    const onValueChange = useCallback(async () => {
        debounceSetContent();
    }, [debounceSetContent]);

    const handleToggleEditorClick = useCallback(() => {
        setIsLoading(true);
        setShowEditor(!showEditor);
    }, [showEditor]);

    return (
        <EditableWrapper>
            <EditableWrapperToolbar className={showEditor ? "show" : ""}>
                <a onClick={handleToggleEditorClick}>Toggle Editor</a>
            </EditableWrapperToolbar>
            {isLoading && <>Loading {contentId} ...</>}
            {content && !showEditor && !isLoading && (
                <div
                    className="tiptap ProseMirror"
                    dangerouslySetInnerHTML={{ __html: content ?? "" }}
                ></div>
            )}
            <div>
                {content && showEditor && !isLoading && (
                    <RcTiptapEditor
                        ref={refEditor}
                        output="html"
                        content={content}
                        onChangeContent={onValueChange}
                        extensions={extensions}
                        dark={theme === "dark"}
                        disabled={disable}
                    />
                )}
            </div>
        </EditableWrapper>
    );
};

export default EditableContent;
