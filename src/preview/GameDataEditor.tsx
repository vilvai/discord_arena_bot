import React from "react";
import { GameData, PlayerData } from "../shared/types";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	height: 300px;
	width: 600px;
	flex-direction: column;
	background-color: #fff;
	margin-top: 16px;
`;

interface Props {
	gameData: GameData;
	onChangeGameData: (gameData: GameData) => void;
}

export default class GameDataEditor extends React.Component<Props> {
	handleChangePlayerData = (newPlayerData: PlayerData, index: number) => {
		const { gameData, onChangeGameData } = this.props;
		const newGameData = {
			...gameData,
			players: gameData.players.map((oldPlayerData, i) =>
				i === index ? newPlayerData : oldPlayerData
			),
		};
		onChangeGameData(newGameData);
	};

	render() {
		return (
			<Container>
				{this.props.gameData.players.map((playerData) => (
					<Player
						onChangePlayerData={this.handleChangePlayerData}
						{...playerData}
					/>
				))}
			</Container>
		);
	}
}

const PlayerContainer = styled.div`
	display: flex;
	width: 100%;
	height: 50px;
	border-bottom: 1px solid black;
	padding: 4px;
	box-sizing: border-box;
`;

type PlayerProps = {
	onChangePlayerData: (newPlayerData: PlayerData, index: number) => void;
} & PlayerData;

const Player = ({
	onChangePlayerData,
	name,
	avatarURL,
	playerClass,
}: PlayerProps) => (
	<PlayerContainer>
		<input value={name} />
	</PlayerContainer>
);
