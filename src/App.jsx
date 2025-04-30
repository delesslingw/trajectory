import { ReactP5Wrapper } from "@p5-wrapper/react";
import sketch from "./sketch";
function Sketch() {
    return <ReactP5Wrapper sketch={sketch} />;
}
function App() {
    return (
        <div
            style={{
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                margin: 0,
                padding: 0,
            }}
        >
            <Sketch />
        </div>
    );
}

export default App;
