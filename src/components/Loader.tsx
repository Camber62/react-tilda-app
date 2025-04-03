import React from 'react';
import { Spin } from 'antd';

export const ChatMessageLoading: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
        </div>
    );
}; 