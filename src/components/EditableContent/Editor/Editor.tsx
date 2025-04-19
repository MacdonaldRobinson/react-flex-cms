import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";
import EditorTinyMCE from "./EditorTinyMCE/EditorTinyMCE";

export type TEditorRef = {
    setEditorContent: (newContent: string) => void;
    getEditorContent: () => string;
};

export type TEditor = {
    onChangeContent: (editorValue: string) => void;
    onEditorInit: () => void;
    initialContent: string;
    disabled: boolean;
};

const Editor = forwardRef<TEditorRef, TEditor>(
    (
        { initialContent, onChangeContent, disabled, onEditorInit }: TEditor,
        ref
    ) => {
        const editorRef = useRef<TEditorRef | null>(null);

        const setEditorContent = (newContent: string) => {
            console.log("Editor > setEditorContent");
            editorRef.current?.setEditorContent(newContent);
        };

        const getEditorContent = () => {
            console.log("Editor > getEditorContent");
            return editorRef.current?.getEditorContent() ?? "";
        };

        const handleOnEditorInit = useCallback(() => {
            console.log("Editor > handleOnEditorInit", editorRef.current);
            if (editorRef.current && onEditorInit) {
                onEditorInit();
                setEditorContent(initialContent);
            }
        }, [editorRef]);

        useImperativeHandle(ref, () => {
            return {
                setEditorContent,
                getEditorContent,
            };
        });

        return (
            <EditorTinyMCE
                ref={editorRef}
                onEditorInit={handleOnEditorInit}
                onChangeContent={() => {}}
                initialContent={""}
                disabled={false}
            />
        );
    }
);

export default Editor;
