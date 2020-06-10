import { registerFont } from "canvas";

export const loadFonts = () => {
	registerFont("src/fonts/Roboto-Regular.ttf", {
		family: "Roboto",
		weight: "400",
	});
	registerFont("src/fonts/Roboto-Italic.ttf", {
		family: "Roboto",
		weight: "400",
		style: "italic",
	});
	registerFont("src/fonts/Roboto-Medium.ttf", {
		family: "Roboto",
		weight: "500",
	});
	registerFont("src/fonts/Roboto-MediumItalic.ttf", {
		family: "Roboto",
		weight: "500",
		style: "italic",
	});
	registerFont("src/fonts/Roboto-Bold.ttf", {
		family: "Roboto",
		weight: "700",
	});
	registerFont("src/fonts/Roboto-BoldItalic.ttf", {
		family: "Roboto",
		weight: "700",
		style: "italic",
	});
};
