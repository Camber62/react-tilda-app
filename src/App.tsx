import BotAnimation from "./components/BotAnimation";
import ChatWindow from "./components/ChatWindow";
import ParticleSphere from "./components/ParticleSphere";

const App = () => {
    return (
        <div className="app">
            <h1>Чат</h1>
            <ChatWindow />
            {/* <BotAnimation /> */}
            {/* <ParticleSphere /> */}
        </div>
    );
};

export default App;