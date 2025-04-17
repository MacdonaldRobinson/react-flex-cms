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
    &:hover {
        &:not(.IsShowingEditor) {
            cursor: pointer;
            border: 1px solid black;
        }
    }

    &.IsShowingEditor {
        cursor: auto;
        margin-top: 10px;
        background-color: lightgray;
        border: 1px solid black;

        &:hover {
        }
    }
`;
