import React, { useState } from 'react';
import './Modal.css';

const Modal: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {!open && (
                <button className="modal-fab" onClick={() => setOpen(true)}>
                    Открыть окно
                </button>
            )}
            {open && (
                <div className="modal-overlay">
                    <div className="modal-window">
                        <button className="modal-close" onClick={() => setOpen(false)}>&times;</button>
                        <div className="modal-content">
                            <p>Тут ваш контент модального окна.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal; 