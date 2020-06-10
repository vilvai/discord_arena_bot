import React from "react";
import { PlayerData } from "../shared/types";
import styled from "styled-components";
import PlayerDataEditor from "./PlayerDataEditor";
import { createNewBotPlayer } from "../shared/bots";
import { StyledButton } from "./UIComponents";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	background-color: #fff;
`;

const AddPlayerButton = styled(StyledButton)`
	margin: 8px;
`;

interface Props {
	players: PlayerData[];
	onChangePlayers: (players: PlayerData[]) => void;
}

export default class GameDataEditor extends React.Component<Props> {
	handleChangePlayerData = (
		newPlayerData: Partial<PlayerData>,
		index: number
	) => {
		const { players, onChangePlayers } = this.props;
		const newPlayers = players.map((oldPlayerData, i) =>
			i === index ? { ...oldPlayerData, ...newPlayerData } : oldPlayerData
		);
		onChangePlayers(newPlayers);
	};

	handleAddPlayer = () => {
		const { players, onChangePlayers } = this.props;
		const newPlayers = [...players, createNewBotPlayer()];
		onChangePlayers(newPlayers);
	};

	handleDeletePlayer = (index: number) => {
		const { players, onChangePlayers } = this.props;
		const newPlayers = players.filter((_, i) => i !== index);
		onChangePlayers(newPlayers);
	};

	render() {
		return (
			<Container>
				{this.props.players.map((playerData, i) => (
					<PlayerDataEditor
						key={playerData.id}
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
