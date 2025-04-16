import React, {
    useCallback,
    useState,
    useRef,
    useEffect,
    useMemo,
} from "react";
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
import useFirebaseAuth from "../../firebase/auth/useFirebaseAuth";

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

const EditableContent = React.memo(({ contentId, children }: TEditor) => {
    const { updateContent, getContent } = useCMS();
    const { authUser } = useFirebaseAuth();

    const [showEditor, setShowEditor] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const initialHtml = useMemo(
        () => renderToStaticMarkup(children),
        [children]
    );

    const [content, setContent] = useState<string | null>(null);

    const refEditor = useRef<React.ComponentRef<typeof RcTiptapEditor> | null>(
        null
    );

    const [theme] = useState<"light" | "dark">("light");
    const [disable] = useState<boolean>(false);

    const debounceSetContent = debounce(async () => {
        const html = refEditor.current?.editor?.getHTML();

        if (html && content != html) {
            await updateContent(contentId, {
                contentValue: html,
            });

            setContent(html);
        }
        setIsLoading(false);
    }, 1000);

    const onValueChange = useCallback(async () => {
        console.log("onValueChange");
        debounceSetContent();
    }, [debounceSetContent]);

    const handleToggleEditorClick = useCallback(() => {
        setShowEditor(!showEditor);
    }, [showEditor]);

    useEffect(() => {
        const fetchContent = async () => {
            const data = await getContent(contentId);
            console.log("fetchContent", data);

            if (data) {
                setContent(data.contentValue);
                setIsLoading(false);
            } else {
                setContent(initialHtml);
                setIsLoading(false);
            }
        };
        setIsLoading(true);
        fetchContent();
    }, [authUser, contentId, getContent, initialHtml]);

    return (
        <EditableWrapper className={authUser ? "enable" : ""}>
            {authUser && (
                <EditableWrapperToolbar className={showEditor ? "show" : ""}>
                    <a onClick={handleToggleEditorClick}>Toggle Editor</a>
                </EditableWrapperToolbar>
            )}
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
});

export default EditableContent;
