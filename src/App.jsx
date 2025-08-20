import React from "react";
import GameMED from "./pages/Game.jsx";

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, err:null }; }
  static getDerivedStateFromError(err){ return { hasError:true, err }; }
  componentDidCatch(err, info){ console.error("UI ErrorBoundary:", err, info); }
  render(){
    if (this.state.hasError){
      return (
        <div style={{padding:16, fontFamily:"system-ui, sans-serif"}}>
          <h2>⚠️ Runtime error in UI</h2>
          <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.err)}</pre>
          <p>Open the browser console for stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App(){
  return (
    <ErrorBoundary>
      <GameMED />
    </ErrorBoundary>
  );
}
