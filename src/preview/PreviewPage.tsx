import React, { Component } from "react";
import styled from "styled-components";

import Game from "../shared/game/Game";
import { GameData } from "../shared/types";
import { SCREEN_WIDTH, SCREEN_HEIGHT, GAME_FPS } from "../shared/constants";
import GameDataEditor from "./GameDataEditor";
import { mockGameData } from "../shared/mocks";

const Container = styled.div`
	display: flex;
	height: 100vh;
	padding-top: 40px;
	flex-direction: column;
	align-items: center;
	background-color: #eeeeee;
	box-sizing: border-box;
`;

const ButtonContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 8px;
`;

const Canvas = styled.canvas`
	box-shadow: 4px 3px 6px 0px rgba(0, 0, 0, 0.35);
	background-color: white;
`;

const Button = styled.button`
	width: 100px;
	&:last-child {
		margin-left: 8px;
	}
`;

interface Props {}

interface State {
	gameData: GameData;
	gameLoopTimer?: number;
}

export default class PreviewPage extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.canvasRef = React.createRef();
		this.state = {
			gameData: mockGameData,
		};
	}

	canvasRef: React.RefObject<HTMLCanvasElement>;
	game?: Game;

	componentDidMount() {
		if (!this.canvasRef.current) return;
		const ctx = this.canvasRef.current.getContext("2d");
		if (!ctx) return;
		this.game = new Game(ctx);
		this.handleStartSimulation();
	}

	gameLoop() {
		if (!this.game) return;
		this.game.update();
		this.game.draw();
	}

	handleStartSimulation = async () => {
		if (!this.game) return;
		clearInterval(this.state.gameLoopTimer);
		await this.game.initializeGame(this.state.gameData);
		this.game.draw();
		this.setState({
			gameLoopTimer: setInterval(() => this.gameLoop(), 1000 / GAME_FPS),
		});
	};

	handlePauseSimulation = () => {
		clearInterval(this.state.gameLoopTimer);
		this.setState({
			gameLoopTimer: undefined,
		});
	};

	handleResumeSimulation = () => {
		this.setState({
			gameLoopTimer: setInterval(() => this.gameLoop(), 1000 / GAME_FPS),
		});
	};

	handleGameDataChange = (gameData: GameData) => {
		this.setState({ gameData });
	};

	render() {
		return (
			<Container>
				<ButtonContainer>
					<Button onClick={this.handleStartSimulation}>
						Restart simulation
					</Button>
					{this.state.gameLoopTimer === undefined ? (
						<Button onClick={this.handleResumeSimulation}>
							Resume simulation
						</Button>
					) : (
						<Button onClick={this.handlePauseSimulation}>
							Pause simulation
						</Button>
					)}
				</ButtonContainer>
				<Canvas
					width={SCREEN_WIDTH}
					height={SCREEN_HEIGHT}
					ref={this.canvasRef}
				/>
				<GameDataEditor
					gameData={this.state.gameData}
					onChangeGameData={this.handleGameDataChange}
				/>
			</Container>
		);
	}
}
