import styled from "styled-components";

export const EditableWrapperToolbar = styled.div`
    display: none;

    &.show {
        display: flex;
        flex-direction: row;
        gap: 5px;
    }

    & button {
        cursor: pointer;
    }
`;

export const EditableWrapperInfoMessage = styled.div`
    padding: 5px;
    background-color: lightblue;
    color: black;
`;

export const EditableWrapperHeader = styled.div`
    display: none;

    &.show {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
    }
`;

export const EditableWrapper = styled.div`
    & .ProseMirror {
        padding: 0 !important;
        margin: 0 !important;
        min-height: auto !important;

        & h1,
        h2,
        h3 {
            margin-top: 1rem;
        }

        & ul {
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
    }

    &.canEdit {
        &:hover {
            &:not(.IsShowingEditor) {
                cursor: pointer;
                outline: 1px solid;
            }
        }

        &.IsShowingEditor {
            & .ProseMirror {
                padding: 10px !important;
                margin: 10px !important;
                margin-left: 70px !important;
                min-height: inherit !important;
            }

            cursor: auto;
            margin-top: 10px;
            background-color: lightgray;
            border: 1px solid black;

            &:hover {
            }
        }
    }
`;

export const EditorWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 5px;
    justify-content: stretch;
    & > div {
        outline: 1px solid;
    }
    & > div:first-child {
        background-color: white;
        width: 100%;
        padding: 10px;
    }
`;

export const EditorHistoryWrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 200px;
    background-color: darkgray;
    padding: 5px;
`;

export const EditorHistory = styled.select`
    height: 100%;
    padding: 5px;
    & option {
        padding: 5px;
        cursor: pointer;

        &:hover {
            background-color: lightgray;
        }
    }
`;

export const EditorHistoryLabel = styled.div`
    & span {
        font-weight: bold;
    }
`;
