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
                            <p className="modal-text-center">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo?</p>
                            <div className="modal-input-row">
                                <input className="modal-input" type="text" placeholder="Sed ut perspiciatis unde omnis" />
                                <button className="modal-send-btn">&#8593;</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal; 