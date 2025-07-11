


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { v4 as uuidv4 } from "uuid";
// import "./Home3.css";
// import logo from "./logo.png";
// import { FaTwitter, FaInstagram, FaGithub, FaQuestionCircle, FaCommentDots } from "react-icons/fa";

// const Home = ({ socket }) => {
//   const [username, setUsername] = useState("");
//   const [roomId, setRoomId] = useState("");
//   const [showHowToPlay, setShowHowToPlay] = useState(false);
//   const [showFeedback, setShowFeedback] = useState(false);
//   const navigate = useNavigate();

//   const createRoom = () => {
//     if (!username) return alert("Enter your name!");
//     localStorage.setItem("username", username);
//     const newRoomId = uuidv4().slice(0, 6);
//     socket.emit("create-room", { roomId: newRoomId, username });
//     navigate(`/game/${newRoomId}?username=${username}`);
//   };

//   const joinRoom = () => {
//     if (!username || !roomId) {
//       alert("Enter name and room ID!");
//       return;
//     }
//     localStorage.setItem("username", username);
//     socket.emit("join-room", { roomId, username }, (response) => {
//       if (response && !response.success) {
//         alert(response.message);
//         return;
//       }
//       navigate(`/game/${roomId}?username=${username}`);
//     });
//   };

//   return (
//     <div className="home-container">
//       {/* <img src={logo} alt="ThinkNLink Logo" className="home-logo" /> */}
//       <h1>ThinkNLink</h1>
//       <div className="username-block glass-card">
//         <input
//           id="username"
//           type="text"
//           placeholder="Enter your name"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="username-input"
//         />
//       </div>

//       <div className="home-card glass-card">
//         <button onClick={createRoom} className="create-room primary-button">Create Room</button>
//         <p className="or-text">OR</p>
//         <input
//           type="text"
//           placeholder="Enter Room ID"
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value)}
//           className="home-input"
//         />
//         <button onClick={joinRoom} className="join-room secondary-button">Join Room</button>
//       </div>

//       <div className="home-footer">
//         <div className="footer-icons">
//           <FaTwitter />
//           <FaInstagram />
//           <FaGithub />
//         </div>
//         <div className="footer-buttons">
//           <button onClick={() => setShowHowToPlay(true)} className="footer-button">
//             <FaQuestionCircle /> How to Play
//           </button>
//           <button onClick={() => setShowFeedback(true)} className="footer-button">
//             <FaCommentDots /> Feedback
//           </button>
//         </div>
//       </div>

//       {showHowToPlay && (
//         <div className="modal">
//           <div className="modal-content">
//             <span className="close" onClick={() => setShowHowToPlay(false)}>&times;</span>
//             <h2>How to Play</h2>
//             <p>[Your content here]</p>
//           </div>
//         </div>
//       )}

//       {showFeedback && (
//         <div className="modal">
//           <div className="modal-content">
//             <span className="close" onClick={() => setShowFeedback(false)}>&times;</span>
//             <h2>Feedback</h2>
//             <p>[Your content here]</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
//import { FaQuestionCircle, FaCommentDots, FaPlus, FaLink, FaPlay } from "react-icons/fa";

import logo2 from "./logo.png";

import { FaTwitter, FaInstagram, FaGithub, FaPlay} from "react-icons/fa";
import "./Home2.css";

import { useMemo } from "react";




const Home = ({ socket }) => {
  const [mode, setMode] = useState("create");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  const createRoom = () => {
    if (!username) return alert("Enter your name!");
    const newRoomId = uuidv4().slice(0, 6);
    localStorage.setItem("username", username);
    socket.emit("create-room", { roomId: newRoomId, username });
    navigate(`/game/${newRoomId}?username=${username}`);
  };

  const joinRoom = () => {
    if (!username || !roomId) {
      alert("Enter name and room ID!");
      return;
    }
    localStorage.setItem("username", username);
    socket.emit("join-room", { roomId, username }, (res) => {
      if (!res?.success) return alert(res.message);
      navigate(`/game/${roomId}?username=${username}`);
    });
  };


  const handleKeyPress = (e) => {

    if (e.key === "Enter" && mode === "create") createRoom();
    else if(e.key === "Enter" && mode === "join") joinRoom();
  };

// ...

const floatingWordsMemo = useMemo(() => {
  const words = (
    "Dog Car Tree Book Phone Table Water Light Chair House Clock Road Paper Shoe Laptop Bag " +
    "School Rain Sun Door Glass Ball Flower Bed Window Bridge Bottle Camera Watch Pencil Fire " +
    "Train River Mountain Keyboard Mouse Speaker Hat Jacket Mirror Fence Cloud Sky Ocean Toothbrush " +
    "Pen Cup Doorbell Blanket Rug Backpack Candle Plate Fork Spoon Knife Shirt Pants Socks Shoe Brush " +
    "Helmet Bicycle Fan Plant Garden Lamp Wallet Passport Soap Towel Pillow Bench Sand Beach Desert " +
    "Island Volcano Forest Lake Sink Stove Fridge Magazine Notebook Album Coin Paint Frame Shelf Cupboard " +
    "Remote Ladder Globe Kite Toy Basket Bat Drum Microphone Curtain Mat Tent Balloons Statue"
  ).split(" ");
  return Array.from({ length: 120 }).map((_, index) => ({
    id: index,
    word: words[index % words.length],
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: `${10 + Math.random() * 20}px`,
      animationDuration: `${15 + Math.random() * 25}s`,
      // animationDelay: `${index * 0}s`,
      animationDelay: `${Math.random() * 0.0}s`
    },
  }));
}, []);



  return (
      <div className="home-wrapper">


        <div className="floating-words" aria-hidden>
          {floatingWordsMemo.map((item) => (
            <span key={item.id} className="float-word" style={item.style}>
              {item.word}
            </span>
          ))}
        </div>

        <div className="home-container">
        <div className="logo-wrapper">
          <img src={logo2} alt="ThinkNLink Logo" className="home-logo" />
        </div>


          <div className="form-card">
            <div className="tabs">
              <button className={mode === "create" ? "tab active" : "tab"} onClick={() => setMode("create")}>
                Create Room
              </button>
              <button className={mode === "join" ? "tab active" : "tab"} onClick={() => setMode("join")}>
                Join Room
              </button>
            </div>

            <input
                type="text"
                className="input-username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyPress}
            />

            {mode === "join" && (
                <input
                className="input-room-id"
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
            )}

            <button
                className="submit-btn-home"
                onClick={mode === "create" ? createRoom : joinRoom}
                disabled={!username.trim() || (mode === "join" && !roomId.trim())}
            >
              <FaPlay className="icon" /> {mode === "create" ? "Create Room" : "Join Room"}
            </button>

        </div>
        </div>


        <div className="how-to-play-section">
        <div className="how-to-play-card">
          <div className="icon">🔗</div>
          <h3>Connect the Words</h3>
          <p>
            Start with a given word and build a meaningful word chain where each word connects logically to the next.
            Think fast and smart! The goal is to create a clever chain of words that makes sense and flows naturally.
          </p>
        </div>

        <div className="how-to-play-card">
          <div className="icon">🗳️</div>
          <h3>Vote for the Best Chain</h3>
          <p>
            Once everyone submits their chains, vote for the best one — except your own! 
            Pick the chain that’s smart, creative, or just really funny. Your vote helps decide the winner of the round.
          </p>
        </div>

        <div className="how-to-play-card">
          <div className="icon">🏆</div>
          <h3>Beat Your Friends</h3>
          <p>
            Each vote earns points. The player with the most votes wins the round and climbs the leaderboard.
            Outsmart your friends, gain the most points, and become the ultimate ThinkNLink champion!
          </p>
        </div>
      </div>

      </div>
  );
};

export default Home;