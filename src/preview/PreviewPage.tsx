import React, { Component } from "react";
import styled from "styled-components";

import Game from "../shared/game/Game";
import { GameData } from "../shared/types";
import { SCREEN_WIDTH, SCREEN_HEIGHT, GAME_FPS } from "../shared/constants";

const Container = styled.div`
	display: flex;
	height: 100vh;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: #eeeeee;
`;

const Canvas = styled.canvas`
	box-shadow: 4px 3px 6px 0px rgba(0, 0, 0, 0.35);
	background-color: white;
`;

const TextArea = styled.textarea`
	width: 300px;
	height: 200px;
	resize: none;
`;

interface Props {}

interface State {
	inputText: string;
}

export default class PreviewPage extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.canvasRef = React.createRef();
		this.state = {
			inputText: `{
"players": [{
"avatarURL": "https://cdn.discordapp.com/avatars/328204246749020161/7a08d2b1f2f5d168ac50778ecc2fcf93.png?size=128",
"class": "spuge"
},{
"avatarURL": "https://cdn.discordapp.com/avatars/160995903182864384/fa07b1a1db14e12a994d67ce32a887c3.png?size=128",
"class": "teekkari"
},{
"avatarURL": "https://cdn.discordapp.com/avatars/162898422892855297/a0a097c92ee1066133a18afaa9515e29.png?size=128",
"class": "fighter"
},{
"avatarURL": "https://cdn.discordapp.com/avatars/160785897149693952/69591f533a458a1a820d709ad491bd3e.png?size=128",
"class": "chungus"
},{
"avatarURL": "https://cdn.discordapp.com/avatars/160115262538907658/0de78ec90612f30c34f3140257f9fef9.png?size=128",
"class": "assassin"
}]
}`,
		};
	}

	canvasRef: React.RefObject<HTMLCanvasElement>;
	game: Game;
	gameSetTimeout: number;

	componentDidMount() {
		const ctx = this.canvasRef.current.getContext("2d");
		this.game = new Game(ctx);
	}

	async initializeGame(gameData: GameData) {
		clearTimeout(this.gameSetTimeout);
		await this.game.initializeGame(gameData);
		this.game.draw();
		this.gameLoop();
	}

	gameLoop() {
		const time = window.performance.now();
		this.game.update();
		this.game.draw();
		const loopTime = window.performance.now() - time;
		this.gameSetTimeout = setTimeout(
			() => this.gameLoop(),
			1000 / GAME_FPS - loopTime
		);
	}

	handleStartSimulation = () => {
		const { inputText } = this.state;
		try {
			const inputObject = JSON.parse(inputText);
			this.initializeGame(inputObject);
		} catch {
			alert("input is not correctly formatted");
		}
	};

	handleStopSimulation = () => clearTimeout(this.gameSetTimeout);

	handleInputChange = (event: any) => {
		this.setState({ inputText: event.target.value });
	};

	render() {
		return (
			<Container>
				<TextArea
					value={this.state.inputText}
					onChange={this.handleInputChange}
				/>
				<button onClick={this.handleStartSimulation}>Start simulation</button>
				<button onClick={this.handleStopSimulation}>Stop simulation</button>
				<Canvas
					width={SCREEN_WIDTH}
					height={SCREEN_HEIGHT}
					ref={this.canvasRef}
				/>
			</Container>
		);
	}
}
