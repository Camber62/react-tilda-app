import { useState, useEffect } from 'react';
import './App.css';
import ChatWidget from './components/cahat';
import HomePage from './components/HomePage/HomePage';

function App() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        console.log('TriggerModalEvent 123 ');
        document.addEventListener('TriggerModalEvent', (event) => {
            console.log('TriggerModalEvent', event);
        });
    }, []);

    useEffect(() => {
        const button = document.querySelector('a.t-btn.t142__submit[data-tilda-event-name="/tilda/click/rec995174706/button1"]');

        if (button) {
            const handleClick = (event: Event) => {
                event.stopPropagation();
                setIsOpen(prev => !prev);
                console.log('Клик по кнопке: /tilda/click/rec995174706/button1');
            };

            button.addEventListener('click', handleClick);

            return () => {
                button.removeEventListener('click', handleClick);
            };
        }
    }, []);

    return (
        <>
            {isOpen && <ChatWidget setIsOpen={setIsOpen} />}
            <HomePage />
        </>
    )
}

export default App;