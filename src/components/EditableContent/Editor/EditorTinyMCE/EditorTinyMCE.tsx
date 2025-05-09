import {
    forwardRef,
    useRef,
    useImperativeHandle,
    useEffect,
    useCallback,
    useState,
} from "react";
import { Editor } from "@tinymce/tinymce-react";
import { TEditorRef, TEditor } from "../Editor";

const EditorTinyMCE = forwardRef<TEditorRef, TEditor>(
    (
        { initialContent, onChangeContent, disabled, onEditorInit }: TEditor,
        ref
    ) => {
        const editorRef = useRef<Editor>(null);
        const [workingTinyMceUrl, setWorkingBaseUrl] = useState<string>("");

        const setEditorContent = useCallback(
            (newContent: string) => {
                console.log("EditorTinyMCE > setEditorContent");
                setTimeout(() => {
                    editorRef.current?.editor?.setContent(newContent);
                }, 100);
            },
            [editorRef]
        );

        const getEditorContent = useCallback(() => {
            console.log("EditorTinyMCE > getEditorContent", editorRef);
            return editorRef.current?.editor?.getContent() ?? "";
        }, [editorRef]);

        useImperativeHandle(ref, () => {
            return {
                setEditorContent,
                getEditorContent,
            };
        });

        const baseUrl = window.location.origin;

        const segments = window.location.pathname
            .split("/")
            .filter((segment) => segment != "");

        const testUrls = [
            `${baseUrl}/tinymce/tinymce.min.js`,
            `${baseUrl}/${segments[0]}/tinymce/tinymce.min.js`,
        ];

        useEffect(() => {
            const correctUrl = () => {
                testUrls.forEach(async (url) => {
                    const test = await fetch(url);
                    if (test.status == 200) {
                        setWorkingBaseUrl(url);
                    }
                });
            };
            correctUrl();
        }, []);

        useEffect(() => {
            console.log(workingTinyMceUrl);
        }, [workingTinyMceUrl]);

        return (
            <>
                {workingTinyMceUrl == "" && <>Loading...</>}
                {workingTinyMceUrl != "" && (
                    <Editor
                        licenseKey="gpl"
                        ref={editorRef}
                        tinymceScriptSrc={`${workingTinyMceUrl}`}
                        onInit={(_evt, editor) => {
                            console.log("Editor Initialized!");
                            onEditorInit?.();
                        }}
                        initialValue={initialContent}
                        init={{
                            inline: true,
                            menubar: false,
                            branding: false,
                            promotion: false,
                            toolbar: false, // Disable main toolbar, only show quickbars
                            plugins: [
                                "quickbars", // Enable the Quickbars plugin for custom toolbars
                                "image", // Enable the Image plugin for inserting and editing images
                                "media", // Enable the Media plugin for embedding media
                                "link", // Enable the Link plugin for links
                                "lists", // Enable the List plugin
                                "table", // Enable the Table plugin
                                "fullscreen", // Enable Fullscreen plugin
                                "code", // Enable the Code plugin
                                "help", // Enable Help plugin
                                "wordcount", // Enable Wordcount plugin
                            ],
                            quickbars_insert_toolbar: "image media table", // Insert toolbar buttons (image, media, table)
                            quickbars_selection_toolbar:
                                "bold italic | alignleft aligncenter alignright | link unlink | image media", // Selection toolbar buttons (bold, italic, etc.)
                            quickbars_image_toolbar:
                                "alignleft aligncenter alignright | rotateleft rotateright | imageoptions", // Image-specific toolbar buttons
                            contextmenu: "image link media", // Right-click context menu for image and link
                            image_advtab: true, // Enable the "Advanced" tab in the image dialog for URL editing
                        }}
                    />
                )}
            </>
        );
    }
);

export default EditorTinyMCE;
