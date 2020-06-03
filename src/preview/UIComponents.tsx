import styled, { css } from "styled-components";

const sharedStyle = css`
	height: 28px;
	box-sizing: border-box;
	border: 1px solid #ccc;
	border-radius: 4px;
	outline: none;

	&:focus {
		border-color: #19c5db;
	}
`;

export const StyledButton = styled.button`
	${sharedStyle}
	background-color: #eee;
	cursor: pointer;

	&:hover {
		background-color: #ddd;
	}
`;

export const StyledInput = styled.input`
	${sharedStyle}
`;

export const StyledSelect = styled.select`
	${sharedStyle}
`;
