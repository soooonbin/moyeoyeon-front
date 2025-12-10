import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from '../pages/Main';
import SelectRoom from "../pages/SelectRoom";
import CreateRoom from "../pages/CreateRoom";
import ChatRoom from "../pages/ChatRoom";
import InviteRoom from "../pages/InviteRoom";

const Router: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/select-room" element={<SelectRoom />} />
                <Route path="/create-room" element={<CreateRoom />} />
                <Route path="/chat-room/:roomId" element={<ChatRoom />} />
                <Route path="/invite/:inviteId" element={<InviteRoom />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
