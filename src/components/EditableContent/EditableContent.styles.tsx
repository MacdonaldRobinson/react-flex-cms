import styled from "styled-components";

export const EditableWrapperToolbar = styled.div`
    display: none;
    padding: 10px;

    &.show {
        display: block;
    }

    & a {
        padding: 2px;
        border: 1px solid black;
        background-color: gray;
        color: white;
        cursor: pointer;

        &:hover {
            font-weight: bold;
        }
    }
`;

export const EditableWrapper = styled.div`
    &:hover {
        border: 1px solid black;

        ${EditableWrapperToolbar} {
            display: block;
        }
    }
`;
