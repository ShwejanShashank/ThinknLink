import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./Home.css"; // ✅ Include the CSS
import logo from "./logo.png";

const Home = ({ socket }) => {
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const createRoom = () => {
        if (!username) return alert("Enter your name!");
        localStorage.setItem("username", username);
        const newRoomId = uuidv4().slice(0, 6);
        socket.emit("create-room", { roomId: newRoomId, username });
        navigate(`/game/${newRoomId}?username=${username}`);
    };

    const joinRoom = () => {
        if (!username || !roomId) {
            alert("Enter name and room ID!");
            return;
        }
        localStorage.setItem("username", username);
        socket.emit("join-room", { roomId, username }, (response) => {
            if (response && !response.success) {
                alert(response.message);
                return;
            }
            navigate(`/game/${roomId}?username=${username}`);
        });
    };

    return (



        <div>
            
        <div className="home-container">

        <img src={logo} alt="ThinkNLink Logo" className="home-logo" />

        <div className="username-block">
            <input
                id="username"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="username-input"
            />
            </div>
            
            <div className="home-card">
                <button onClick={createRoom} className="home-button">
                    Create Room
                </button>
                <p>
                    OR
                </p>
                <div className="divider" />
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="home-input"
                />
                <button onClick={joinRoom} className="home-button secondary">
                    Join Room
                </button>
            </div>
        </div>
        </div>
    );
};

export default Home;