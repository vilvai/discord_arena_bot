import React from "react";
import { GameData, PlayerData } from "../shared/types";
import styled from "styled-components";
import PlayerDataEditor from "./PlayerDataEditor";
import { createNewPlayer } from "../shared/mocks";
import { StyledButton } from "./UIComponents";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	background-color: #fff;
	margin-top: 16px;
`;

const AddPlayerButton = styled(StyledButton)`
	margin: 8px;
`;

interface Props {
	gameData: GameData;
	onChangeGameData: (gameData: GameData) => void;
}

export default class GameDataEditor extends React.Component<Props> {
	handleChangePlayerData = (
		newPlayerData: Partial<PlayerData>,
		index: number
	) => {
		const { gameData, onChangeGameData } = this.props;
		const newGameData = {
			...gameData,
			players: gameData.players.map((oldPlayerData, i) =>
				i === index ? { ...oldPlayerData, ...newPlayerData } : oldPlayerData
			),
		};
		onChangeGameData(newGameData);
	};

	handleAddPlayer = () => {
		const { gameData, onChangeGameData } = this.props;
		const newGameData = {
			...gameData,
			players: [...gameData.players, createNewPlayer()],
		};
		onChangeGameData(newGameData);
	};

	handleDeletePlayer = (index: number) => {
		const { gameData, onChangeGameData } = this.props;
		const newGameData = {
			...gameData,
			players: gameData.players.filter((_, i) => i !== index),
		};
		onChangeGameData(newGameData);
	};

	render() {
		return (
			<Container>
				{this.props.gameData.players.map((playerData, i) => (
					<PlayerDataEditor
						key={i}
						playerIndex={i}
						onChangePlayerData={this.handleChangePlayerData}
						onDeletePlayer={this.handleDeletePlayer}
						{...playerData}
					/>
				))}
				<AddPlayerButton onClick={this.handleAddPlayer}>
					Add Player
				</AddPlayerButton>
			</Container>
		);
	}
}
