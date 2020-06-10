import React from "react";
import { render } from "react-dom";
import { createGlobalStyle } from "styled-components";

import PreviewPage from "./PreviewPage";

import RobotoRegular from "../fonts/Roboto-Regular.ttf";
import RobotoItalic from "../fonts/Roboto-Italic.ttf";
import RobotoMedium from "../fonts/Roboto-Medium.ttf";
import RobotoMediumItalic from "../fonts/Roboto-MediumItalic.ttf";
import RobotoBold from "../fonts/Roboto-Bold.ttf";
import RobotoBoldItalic from "../fonts/Roboto-BoldItalic.ttf";

const GlobalStyle = createGlobalStyle`
@font-face {
	font-family: Roboto;
	src: url(${RobotoRegular}) format("truetype");
	font-weight: 400;
}
@font-face {
	font-family: Roboto;
	src: url(${RobotoItalic}) format("truetype");
	font-weight: 400;
	font-style: italic;
}
@font-face {
	font-family: Roboto;
	src: url(${RobotoMedium}) format("truetype");
	font-weight: 500;
}
@font-face {
	font-family: Roboto;
	src: url(${RobotoMediumItalic}) format("truetype");
	font-weight: 500;
	font-style: italic;
}
@font-face {
	font-family: Roboto;
	src: url(${RobotoBold}) format("truetype");
	font-weight: 700;
}
@font-face {
	font-family: Roboto;
	src: url(${RobotoBoldItalic}) format("truetype");
	font-weight: 700;
	font-style: italic;
}
`;

const rootElement = document.getElementById("root");
render(
	<>
		<GlobalStyle />
		<PreviewPage />
	</>,
	rootElement
);
