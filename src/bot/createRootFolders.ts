import rimraf from "rimraf";
import fs from "fs";

import { INPUT_FILE_DIRECTORY, RENDER_DIRECTORY } from "../shared/constants";

export const createRootFolders = () => {
	rimraf.sync(INPUT_FILE_DIRECTORY);
	rimraf.sync(RENDER_DIRECTORY);

	fs.mkdirSync(INPUT_FILE_DIRECTORY);
	fs.mkdirSync(RENDER_DIRECTORY);
};
