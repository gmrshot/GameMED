import React from "react";
import ReactDOM from "react-dom/client";
import GameMED from "./pages/Game.jsx"; // <-- render your new file

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GameMED />
  </React.StrictMode>
);
