// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";             // ✅ bring back your styles
import GameMED from "./pages/Game.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GameMED />
  </React.StrictMode>
);
