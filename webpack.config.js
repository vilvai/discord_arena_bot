const webpack = require("webpack");
const path = require("path");

const config = {
	mode: "development",
	devtool: "inline-source-map",
	entry: "./src/preview/index.tsx",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: "babel-loader",
				exclude: /node_modules/,
			},
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
		],
	},
	devServer: {
		contentBase: "./dist",
	},
};

module.exports = config;
