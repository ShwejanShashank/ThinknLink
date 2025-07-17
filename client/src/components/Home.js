


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import logo2 from "./logo.png";

import "./Home2.css";

import { useMemo } from "react";

import { FaInstagram, FaTwitter, FaCommentDots, FaPlay } from "react-icons/fa";
import emailjs from "emailjs-com";

const getSeededValue = (index, max) => {
  const seed = Math.random() * 10000;
  return Math.abs(seed % 1) * max;
};




const Home = ({ socket }) => {
  const [mode, setMode] = useState("create");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [feedback, setFeedback] = useState("");

  const sendFeedback = (e) => {
    e.preventDefault();
    const templateParams = {
      message: feedback,
    };

    emailjs
      .send(
        "service_1cukvag", // Replace from EmailJS dashboard
        "template_rt6n7qa", // Replace from EmailJS dashboard
        templateParams,
        "J7H0jXDxRy9wdyw_X" // Replace from EmailJS dashboard (public key)
      )
      .then(
        (result) => {
          alert("Feedback sent successfully!");
          setFeedback("");
          setShowPopup(false);
        },
        (error) => {
          alert("Failed to send feedback.");
          console.error(error.text);
        }
      );
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    else if(socket.connected){
      socket.disconnect();
    }
  }, []);

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
      alert("Enter Name AND Room ID!");
      return;
    }
    localStorage.setItem("username", username);
    socket.emit("join-room-validation", { roomId, username }, (res) => {
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
  return Array.from({ length: 150 }).map((_, index) => ({
    id: index,
    word: words[index % words.length],
    style: {
      left: `${getSeededValue(index, 90) + 5}%`,  // stays between 5% and 95%
      top: `${getSeededValue(index + 200, 90) + 5}%`,
      fontSize: `${9 + getSeededValue(index + 400, 20)}px`,
      animationDuration: `${15 + getSeededValue(index + 600, 25)}s`,
      animationDelay: `-${15 + getSeededValue(index + 800, 30)}s`
    }
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
                
                
            >
              <FaPlay className="icon" /> {mode === "create" ? "Create Room" : "Join Room"}
            </button>

        </div>
        

        <div className="icon-bar">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="icon twitter" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="icon instagram" />
        </a>
        <button className="feedback-btn" onClick={() => setShowPopup(true)}>
          <FaCommentDots className="icon feedback" /> Feedback
        </button>
      </div>

      {showPopup && (
        <div className="feedback-popup">
          <form onSubmit={sendFeedback}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback..."
              required
            />
            <p className="feedback-cancel" onClick={() => setShowPopup(false)}>×</p>
            <div className="popup-buttons">
              <button type="submit" className="feedback-submit">Submit</button>
              
            </div>
          </form>
        </div>
      )}

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