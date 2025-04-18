import React, {
    useCallback,
    useState,
    useEffect,
    useMemo,
    useRef,
} from "react";
import { debounce } from "lodash";

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
import Editor, { TEditorRef } from "./Editor/Editor";

type TEditableContent = {
    contentId: string;
    children: React.ReactNode;
    onContentChange?: (contentValue: string) => void;
};

const EditableContent = React.memo(
    ({ contentId, children, onContentChange }: TEditableContent) => {
        const { addContent, getContentHistory } = useCMS();
        const { authUser } = useFirebaseAuth();

        const [showEditor, setShowEditor] = useState(false);
        const [canEdit, setCanEdit] = useState(false);

        const [isLoading, setIsLoading] = useState(true);
        const [info, setInfo] = useState("");

        const [contentHistory, setContentHistory] =
            useState<TContentHistory | null>();

        const editorRef = useRef<TEditorRef>(null);

        const initialHtml = useMemo(
            () => renderToStaticMarkup(children),
            [children]
        );

        const [_content, _setContent] = useState<string>("");

        const [theme] = useState<"light" | "dark">("light");
        const [disable] = useState<boolean>(false);

        const debounceAddContent = debounce(async () => {
            const html = editorRef.current?.getEditorContent();

            console.log("debounceAddContent");

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

        const setEditorContent = useCallback(
            (newContent: string) => {
                console.log(
                    "EditableContent > setEditorContent",
                    editorRef.current
                );
                editorRef.current?.setEditorContent(newContent);
            },
            [editorRef]
        );

        const handleToggleEditorClick = useCallback(() => {
            console.log("EditableContent > handleToggleEditorClick");
            setShowEditor(!showEditor);
            if (!showEditor) {
                setEditorContent(_content);
            }
        }, [showEditor, editorRef]);

        const handleEditableContentClick = useCallback(() => {
            if (canEdit && !showEditor) {
                handleToggleEditorClick();
            }
        }, [canEdit, showEditor, editorRef]);

        const handleSaveClick = useCallback(() => {
            setInfo("Saving ...");
            debounceAddContent();
        }, []);

        const setContent = (newValue: string) => {
            console.log("EditableContent > setContent");
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
            console.log("EditableContent > useEffect", editorRef.current);
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
        }, [
            authUser,
            contentId,
            getContentHistory,
            initialHtml,
            canEdit,
            editorRef.current,
        ]);

        const onEditorInit = () => {};

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
                        <Editor
                            onEditorInit={onEditorInit}
                            ref={editorRef}
                            onChangeContent={onValueChange}
                            initialContent={_content}
                            disabled={false}
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
