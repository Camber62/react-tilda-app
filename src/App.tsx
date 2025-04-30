import { useState, useEffect } from 'react';
import './App.css';
import ChatWidget from './components/cahat';
import HomePage from './components/HomePage/HomePage';

function App() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        document.addEventListener('TriggerModalEvent', (event) => {
            setIsOpen(true);
        });
    }, []);



    return (
        <>
            {isOpen && <ChatWidget setIsOpen={setIsOpen} />}
            <HomePage />
        </>
    )
}

export default App;