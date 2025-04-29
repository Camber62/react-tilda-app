import './App.css';
import HomePage from './components/HomePage/HomePage';
import LoremIpsum from './components/LoremIpsum/LoremIpsum';
import Modal from './components/Modal/Modal';

function App() {
    return (
        <>
            <Modal />
            <LoremIpsum />
            <HomePage />
        </>
    )
}

export default App;