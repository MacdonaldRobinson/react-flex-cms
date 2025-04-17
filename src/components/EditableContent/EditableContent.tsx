import React, {
    useCallback,
    useState,
    useRef,
    useEffect,
    useMemo,
} from "react";
import RcTiptapEditor, { useEditorState } from "reactjs-tiptap-editor";
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
import useCMS, {
    TContentHistory,
} from "../../firebase/firestore/collections/CMS/useCMS";
import {
    EditableWrapper,
    EditableWrapperHeader,
    EditableWrapperInfoMessage,
    EditableWrapperToolbar,
    EditorHistory,
    EditorHistoryLabel,
    EditorHistoryWrapper,
    EditorWrapper,
} from "./EditableContent.styles";
import { renderToStaticMarkup } from "react-dom/server";
import useFirebaseAuth from "../../firebase/auth/useFirebaseAuth";
import clsx from "clsx";
import { format } from "date-fns";

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
    Image,
    Blockquote,
    SlashCommand,
    HorizontalRule,
    Code,
    CodeBlock,
    ColumnActionButton,
    Table.extend({
        renderHTML({ HTMLAttributes }) {
            return [
                "div",
                { class: "tableWrapper" },
                ["table", HTMLAttributes, 0],
            ];
        },
    }),
    Iframe,
    ExportPdf,
    ImportWord,
    ExportWord,
    Excalidraw,
    Mention,
    Attachment,
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
    onContentChange?: (contentValue: string) => void;
};

const EditableContent = React.memo(
    ({ contentId, children, onContentChange }: TEditor) => {
        const { addContent, getContentHistory } = useCMS();
        const { authUser } = useFirebaseAuth();

        const [showEditor, setShowEditor] = useState(false);
        const [canEdit, setCanEdit] = useState(false);

        const [isLoading, setIsLoading] = useState(true);
        const [info, setInfo] = useState("");

        const [contentHistory, setContentHistory] =
            useState<TContentHistory | null>();

        const { editorRef } = useEditorState();

        const initialHtml = useMemo(
            () => renderToStaticMarkup(children),
            [children]
        );

        const [_content, _setContent] = useState<string>("");

        const [theme] = useState<"light" | "dark">("light");
        const [disable] = useState<boolean>(false);

        const debounceAddContent = debounce(async () => {
            const html = editorRef.current?.editor?.getHTML();
            console.log(
                "debounceAddContent",
                editorRef.current?.editor?.getHTML()
            );

            if (html) {
                try {
                    const contentHistory = await addContent(contentId, {
                        contentValue: html,
                    });

                    setContent(html);
                    setInfo("");
                    setContentHistory(contentHistory);
                } catch (error) {
                    setInfo(error!.toString());
                }
            } else {
                setInfo("No changes made");
            }
            setIsLoading(false);
        }, 100);

        const onValueChange = useCallback(async () => {}, []);

        const setEditorContent = useCallback((newContent: string) => {
            console.log("setEditorContent");
            editorRef.current?.editor?.commands.setContent(newContent);
        }, []);

        const handleToggleEditorClick = useCallback(() => {
            setShowEditor(!showEditor);
            if (!showEditor) {
                setEditorContent(_content);
            }
        }, [showEditor]);

        const handleEditableContentClick = useCallback(() => {
            if (canEdit && !showEditor) {
                handleToggleEditorClick();
            }
        }, [canEdit, showEditor]);

        const handleSaveClick = useCallback(() => {
            setInfo("Saving ...");
            debounceAddContent();
        }, []);

        const setContent = (newValue: string) => {
            console.log("setContent", newValue);
            const parser = new DOMParser();
            const parsedValue = parser.parseFromString(newValue, "text/html");

            const body = parsedValue.querySelector("body");

            let newContent = newValue;

            if (body) {
                let foundAnyContent = false;

                body.childNodes.forEach((value) => {
                    if (value.childNodes.length > 0) {
                        foundAnyContent = true;
                    }
                });

                if (!foundAnyContent) {
                    const textContent = body.firstChild?.textContent?.trim();

                    if (textContent == "") {
                        newContent = "";
                    }
                }
            }

            _setContent(newContent);
            if (onContentChange) {
                onContentChange(newContent);
            }
        };

        useEffect(() => {
            const fetchContent = async () => {
                const contentHistory = await getContentHistory(contentId);

                if (contentHistory) {
                    const value = contentHistory.items[0].contentValue;

                    if (value) {
                        if (canEdit) {
                            setContent(value);
                            setContentHistory(contentHistory);
                        } else {
                            setContent(value);
                        }
                        setIsLoading(false);
                    } else {
                        setContent(`Empty content for contentId ${contentId}`);
                    }
                } else {
                    setContent(initialHtml);
                    setIsLoading(false);
                }
            };
            setIsLoading(true);
            fetchContent();
            if (authUser) {
                setCanEdit(true);
            } else {
                setCanEdit(false);
            }
        }, [authUser, contentId, getContentHistory, initialHtml, canEdit]);

        const handleHistoryClick = useCallback(
            (historyIndex: number) => {
                const historyItem = contentHistory?.items[historyIndex];

                if (historyItem) {
                    setEditorContent(historyItem.contentValue);
                }
            },
            [contentHistory]
        );

        return (
            <EditableWrapper
                className={clsx({
                    IsShowingEditor: showEditor,
                    canEdit: canEdit,
                })}
                onClick={handleEditableContentClick}
            >
                {authUser && canEdit && (
                    <EditableWrapperHeader className={showEditor ? "show" : ""}>
                        <EditableWrapperToolbar
                            className={showEditor ? "show" : ""}
                        >
                            <button onClick={handleToggleEditorClick}>
                                Toggle Editor
                            </button>
                            <button onClick={handleSaveClick}>Save</button>
                        </EditableWrapperToolbar>
                        {info && (
                            <EditableWrapperInfoMessage>
                                {info}
                            </EditableWrapperInfoMessage>
                        )}
                    </EditableWrapperHeader>
                )}
                {isLoading && <>Loading {contentId} ...</>}
                {!showEditor && !isLoading && (
                    <>
                        {_content && (
                            <div className="reactjs-tiptap-editor">
                                <div
                                    className="tiptap ProseMirror"
                                    dangerouslySetInnerHTML={{
                                        __html: _content ?? "",
                                    }}
                                ></div>
                            </div>
                        )}
                        {!_content && canEdit && (
                            <div>No content for contentId: {contentId}</div>
                        )}
                    </>
                )}
                {canEdit && showEditor && !isLoading && (
                    <EditorWrapper>
                        <RcTiptapEditor
                            ref={editorRef}
                            output="html"
                            content={_content}
                            onChangeContent={onValueChange}
                            extensions={extensions}
                            dark={theme === "dark"}
                            disabled={disable}
                        />
                        <EditorHistoryWrapper>
                            <EditorHistoryLabel>
                                History for: <span>{contentId}</span>
                            </EditorHistoryLabel>
                            <EditorHistory multiple>
                                {contentHistory &&
                                    contentHistory.items.map(
                                        (historyItem, index) => {
                                            return (
                                                <option
                                                    key={historyItem.documentId}
                                                    onClick={(e) =>
                                                        handleHistoryClick(
                                                            index
                                                        )
                                                    }
                                                >
                                                    {format(
                                                        historyItem.createdOn,
                                                        "yyyy-MM-dd hh:mm:ss"
                                                    )}
                                                </option>
                                            );
                                        }
                                    )}
                            </EditorHistory>
                        </EditorHistoryWrapper>
                    </EditorWrapper>
                )}
            </EditableWrapper>
        );
    }
);

export default EditableContent;
