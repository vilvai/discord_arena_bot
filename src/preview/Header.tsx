import React from "react";
import styled from "styled-components";

import logoSrc from "../assets/logo.png";

const HeaderContainer = styled.div`
	display: flex;
	width: 100%;
	padding: 8px;
	padding-right: 96px;
	box-sizing: border-box;
	box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.35);
	background-color: #686868;
`;

const Logo = styled.img`
	height: 64px;
	width: 64px;
	border-radius: 32px;
`;

const AreenaBotText = styled.div`
	font-size: 42px;
	font-family: Roboto;
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #f7f7f7;
	font-weight: 400;
`;

const Header = () => (
	<HeaderContainer>
		<Logo src={logoSrc} />
		<AreenaBotText>Areena Bot</AreenaBotText>
	</HeaderContainer>
);

export default Header;
