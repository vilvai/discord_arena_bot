import React from "react";
import { render } from "react-dom";

const App = () => <div>Hello!</div>;

const rootElement = document.getElementById("root");
render(<App />, rootElement);
