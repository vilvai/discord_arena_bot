const RealBasePlayer = jest.requireActual("../BasePlayer").default;

class BasePlayer extends RealBasePlayer {
	async loadAvatar(_avatarURL: string) {}
}

export default BasePlayer;
