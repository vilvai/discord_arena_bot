import React from "react";
import { PlayerData, PlayerClass } from "../shared/types";
import styled from "styled-components";
import { StyledInput, StyledSelect, StyledButton } from "./UIComponents";

const PlayerContainer = styled.div`
	display: flex;
	align-items: center;
	height: 50px;
	padding: 8px;
	box-sizing: border-box;
	border-bottom: 1px solid #ddd;
`;

const PlayerNameInput = styled(StyledInput)`
	padding-left: 4px;
`;

const PlayerClassSelect = styled(StyledSelect)`
	margin-left: 8px;
`;

const PlayerAvatarInput = styled(StyledInput)`
	margin-left: 8px;
	padding-left: 4px;
`;

const PlayerIcon = styled.img`
	margin-left: 8px;
	width: 36px;
	height: 36px;
	border-radius: 18px;
	box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.45);
`;

const DeleteButton = styled(StyledButton)`
	margin-left: 8px;
	width: 24px;
	height: 24px;
	background-color: #e73737;
	border-color: #d20000;
	font-size: 16px;
	color: #fff;
	&:hover {
		background-color: #bc0e0e;
	}
`;

type PlayerProps = {
	onChangePlayerData: (
		newPlayerData: Partial<PlayerData>,
		index: number
	) => void;
	onDeletePlayer: (index: number) => void;
	playerIndex: number;
} & PlayerData;

export default class PlayerDataEditor extends React.Component<PlayerProps> {
	handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { onChangePlayerData, playerIndex } = this.props;
		const name = event.target.value;
		onChangePlayerData({ name }, playerIndex);
	};

	handleChangeClass = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const { onChangePlayerData, playerIndex } = this.props;
		const playerClass: any = event.target.value;
		onChangePlayerData({ playerClass }, playerIndex);
	};

	handleChangeAvatarURL = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { onChangePlayerData, playerIndex } = this.props;
		const avatarURL = event.target.value;
		onChangePlayerData({ avatarURL }, playerIndex);
	};

	handleDelete = () => this.props.onDeletePlayer(this.props.playerIndex);

	render() {
		const { playerClass, avatarURL, name } = this.props;
		return (
			<PlayerContainer>
				<PlayerNameInput value={name} onChange={this.handleChangeName} />
				<PlayerClassSelect
					value={playerClass}
					onChange={this.handleChangeClass}
				>
					{Object.values(PlayerClass).map((playerClass) => (
						<option key={playerClass} value={playerClass}>
							{playerClass}
						</option>
					))}
				</PlayerClassSelect>
				<PlayerAvatarInput
					value={avatarURL}
					onChange={this.handleChangeAvatarURL}
				/>
				<PlayerIcon src={avatarURL} />
				<DeleteButton onClick={this.handleDelete}>X</DeleteButton>
			</PlayerContainer>
		);
	}
}
