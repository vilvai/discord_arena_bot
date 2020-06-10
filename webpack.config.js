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
		extensions: [".ts", ".tsx", ".js", ".css"],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: "babel-loader",
				exclude: /node_modules/,
			},
			{ test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: "file-loader",
					},
				],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				use: {
					loader: "url-loader",
				},
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	devServer: {
		contentBase: "./dist",
	},
};

module.exports = config;
