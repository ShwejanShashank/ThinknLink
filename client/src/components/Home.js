// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { v4 as uuidv4 } from "uuid";
// import "./Home.css"; // ✅ Include the CSS
// import logo from "./logo.png";

// const Home = ({ socket }) => {
//     const [username, setUsername] = useState("");
//     const [roomId, setRoomId] = useState("");
//     const navigate = useNavigate();

//     const createRoom = () => {
//         if (!username) return alert("Enter your name!");
//         localStorage.setItem("username", username);
//         const newRoomId = uuidv4().slice(0, 6);
//         socket.emit("create-room", { roomId: newRoomId, username });
//         navigate(`/game/${newRoomId}?username=${username}`);
//     };

//     const joinRoom = () => {
//         if (!username || !roomId) {
//             alert("Enter name and room ID!");
//             return;
//         }
//         localStorage.setItem("username", username);
//         socket.emit("join-room", { roomId, username }, (response) => {
//             if (response && !response.success) {
//                 alert(response.message);
//                 return;
//             }
//             navigate(`/game/${roomId}?username=${username}`);
//         });
//     };

//     return (



//         <div>
            
//         <div className="home-container">

//         <img src={logo} alt="ThinkNLink Logo" className="home-logo" />

//         <div className="username-block">
//             <input
//                 id="username"
//                 type="text"
//                 placeholder="Enter your name"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="username-input"
//             />
//             </div>
            
//             <div className="home-card">
//                 <button onClick={createRoom} className="create-room">
//                     Create Room
//                 </button>
//                 <p>
//                     OR
//                 </p>

//                 <input
//                     type="text"
//                     placeholder="Enter Room ID"
//                     value={roomId}
//                     onChange={(e) => setRoomId(e.target.value)}
//                     className="home-input"
//                 />
//                 <button onClick={joinRoom} className="join-room">
//                     Join Room
//                 </button>
//             </div>
//         </div>
//         </div>
//     );
// };

// export default Home;



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./Home.css";
import logo from "./logo.png";
import { FaTwitter, FaInstagram, FaGithub, FaQuestionCircle, FaCommentDots } from "react-icons/fa";

const Home = ({ socket }) => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
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
    <div className="home-container">
      {/* <img src={logo} alt="ThinkNLink Logo" className="home-logo" /> */}
      <h1>ThinkNLink</h1>
      <div className="username-block glass-card">
        <input
          id="username"
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="username-input"
        />
      </div>

      <div className="home-card glass-card">
        <button onClick={createRoom} className="create-room primary-button">Create Room</button>
        <p className="or-text">OR</p>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="home-input"
        />
        <button onClick={joinRoom} className="join-room secondary-button">Join Room</button>
      </div>

      <div className="home-footer">
        <div className="footer-icons">
          <FaTwitter />
          <FaInstagram />
          <FaGithub />
        </div>
        <div className="footer-buttons">
          <button onClick={() => setShowHowToPlay(true)} className="footer-button">
            <FaQuestionCircle /> How to Play
          </button>
          <button onClick={() => setShowFeedback(true)} className="footer-button">
            <FaCommentDots /> Feedback
          </button>
        </div>
      </div>

      {showHowToPlay && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowHowToPlay(false)}>&times;</span>
            <h2>How to Play</h2>
            <p>[Your content here]</p>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowFeedback(false)}>&times;</span>
            <h2>Feedback</h2>
            <p>[Your content here]</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;