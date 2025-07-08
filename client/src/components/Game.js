



// Updated Game.js with copy room ID button and tooltip
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./Game.css";
import logo from "./logo.png";

const Game = ({ socket }) => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const isNextRound = new URLSearchParams(location.search).get("is-next-round");

  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [words, setWords] = useState([]);
  const [chain, setChain] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [rounds, setRounds] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [copied, setCopied] = useState(false);
  const chatBoxRef = useRef(null);
  const [showCannotStartGame, setShowCannotStartGame] = useState(false);
  const MAX_LINKING_WORDS = 15;
  const [lastAddedIndex, setLastAddedIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);

  useEffect(() => {
    if (lastAddedIndex !== null) {
      const timeout = setTimeout(() => setLastAddedIndex(null), 500);
      return () => clearTimeout(timeout);
    }
  }, [lastAddedIndex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (isNextRound) socket.emit("next-round-game", { roomId });
  }, [isNextRound]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    socket.emit("join-room", { roomId, username });
    socket.on("update-players", setPlayers);
    socket.on("update-scores", setScores);
    socket.on("update-rounds", ({ rounds }) => setRounds(rounds));
    socket.on("creator", ({ creator }) => setIsCreator(socket.id === creator));
    socket.on("game-started", (wordPair, currentRound) => {
      setWords(wordPair);
      setChain(wordPair);
      setGameStarted(true);
      setCurrentRound(currentRound);
    });
    socket.on("chat-history", setChatMessages);
    socket.on("receive-chat-message", (msg) => setChatMessages((prev) => [...prev, msg]));
    socket.on("start-timer", (time) => {
      setTimeLeft(time);
      setTimer(
        setInterval(() => {
          setTimeLeft((prev) => {
            if (prev > 0) return prev - 1;
            clearInterval(timer);
            return 0;
          });
        }, 1000)
      );
    });
    socket.on("next-round", (wordPair) => {
      clearInterval(timer);
    //   setWords(wordPair);
    //   setChain(wordPair);
      setSubmitted(false);
    //   setCurrentRound((prev) => prev + 1);
      navigate(`/results/${roomId}?playersList=${players}`);
    });
    socket.on("game-over", () => {
      clearInterval(timer);
      if (!submitted) submitChain();
      navigate(`/results/${roomId}`);
    });

    // socket.on("cannot-start-game", () => {
    //   setShowCannotStartGame(true);
    // });

    return () => {
      socket.off("update-players");
      socket.off("update-scores");
      socket.off("chat-history");
      socket.off("receive-chat-message");
      socket.off("start-timer");
      socket.off("game-over");
      socket.off("update-rounds");
      socket.off("game-started");
    };
  }, [socket, roomId, username, navigate, timer]);

  const handleSetRounds = (e) => {
    const value = parseInt(e.target.value);
    setRounds(value);
    socket.emit("set-rounds", { roomId, rounds: value });
  };

  const startGame = () => {
    socket.emit("start-game", { roomId });
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") addWord();
  };

  const submitChain = () => {
    socket.emit("submit-chain", { roomId, username, chain });
    setSubmitted(true);
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      socket.emit("send-chat-message", {
        roomId,
        username,
        message: chatInput,
        timestamp: new Date().toLocaleTimeString(),
      });
      setChatInput("");
    }
  };



// const addWord = () => {
//   if (!newWord.trim() || submitted) return;

//   const updatedChain = [...chain.slice(0, -1), newWord, chain[chain.length - 1]];
//   setChain(updatedChain);
//   setLastAddedIndex(chain.length - 1); // Index of the added middle word
//   setNewWord("");
// };

// const deleteWordAtIndex = (index) => {
//   const updated = chain.filter((_, i) => i !== index);
//   setChain(updated);
// };

const deleteWordAtIndex = (index) => {
  setDeletingIndex(index); // trigger animation

  setTimeout(() => {
    const updated = chain.filter((_, i) => i !== index);
    setChain(updated);
    setDeletingIndex(null); // reset
  }, 300); // matches animation duration
};

const addWord = () => {
  if (!newWord.trim() || submitted) return;

  const middleWords = chain.slice(1, -1); // get words between first and last

  if (middleWords.length >= MAX_LINKING_WORDS) {
    alert("You can only add up to 20 linking words!");
    return;
  }

  const updatedChain = [...chain.slice(0, -1), newWord, chain[chain.length - 1]];
  setChain(updatedChain);
  setLastAddedIndex(chain.length - 1);
  setNewWord("");
};

  return (
    <div className="game-container">
      {copied && <div className="copy-toast">Room ID copied!</div>}
      <div className="sidebar">
      {/* <img src={logo} alt="ThinkNLink Logo" className="home-logo" /> */}
      <h1>ThinkNLink</h1>
        <h2>Players</h2>
        <ul className="players-list">
          {[...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0)).map((player, i) => (
            <li className="list-item" key={i}>
              <span className="avatar">{player.charAt(0)}</span>
              <div className="player-name">{player}</div>
              <div className="score">{scores[player] || 0} pts</div>
            </li>
          ))}
        </ul>
        
      </div>

      <div className="main">
        <div className="top-bar">

          <span className="room-id" >
            <p>Room ID: {roomId} </p>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAYklEQVR4nGNgGE7Am4GB4QkDA8N/MjFB8JgCw/8TNp4EheQCulvgTWacgILakxgLKImTR8RYQG6Q/celb9QCGBgNIoJgNIgIApqXrv8HjQWPqV3YoQNPMi0BGe5Bhs8HKQAA5qOmsSMWnn4AAAAASUVORK5CYII=" alt="copy"
          className="click-to-copy" onClick={handleCopy} title="Click to copy"
          ></img>
            
          </span>
          {/* <div ></div> */}

          {showCannotStartGame && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setShowCannotStartGame(false)}>&times;</span>
                <h2>Game cannot be started!</h2>
                <p>You need atleast 3 players to start the game</p>
              </div>
            </div>
          )}

          
          {gameStarted && (
            <span className="round-progress">
              Round {currentRound} of {rounds}
              <div className="round-bar">
                <div className="round-bar-fill" style={{ width: `${(currentRound / rounds) * 100}%` }}></div>
              </div>
            </span>
          )}
          {timeLeft !== null && <span className="timer">⏱ {timeLeft}s</span>}
        </div>

        {/* <h3 className="chain-title">Word Chain</h3> */}

        <div className="chain-box-outline">
        <div className="chain-box">
          {/* {chain.map((word, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`chain-word ${
                  idx === 0 || idx === chain.length - 1 ? "endpoint" : "middle"
                } ${idx === lastAddedIndex ? "pop-animate" : ""}`}
              >
                {word}
              </span>
              {idx < chain.length - 1 && <span className="arrow">→</span>}
            </React.Fragment>
          ))} */}

          {chain.map((word, idx) => {
            const isEndpoint = idx === 0 || idx === chain.length - 1;
            return (
              <React.Fragment key={idx}>
                <span
                  className={`chain-word ${isEndpoint ? 'endpoint' : 'middle'} ${idx === lastAddedIndex ? 'pop-animate' : ''} ${idx === deletingIndex ? 'fade-out' : ''}`}
                >
                  {word}
                  {!isEndpoint && (
                    <button
                      className="delete-word"
                      onClick={() => deleteWordAtIndex(idx)}
                      title="Delete"
                    >
                      X
                    </button>
                  )}
                </span>
                {idx < chain.length - 1 && <span className="arrow">→</span>}
              </React.Fragment>
            );
          })}

            
        </div>
        {gameStarted && (
          <span className="word-limit" style={{ fontSize: '14px', color: 'gray' }}>
            Linking words: {chain.length > 2 ? chain.length - 2 : 0} / {MAX_LINKING_WORDS}
          </span>
        )}
        
        </div>

        <div className="actions">
          <input
            className="word-input"
            type="text"
            placeholder="Add linking word..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value.slice(0, 30))}
            onKeyDown={handleKeyPress}
            disabled={!gameStarted || submitted}
          />
          <button className="add-btn" onClick={addWord} disabled={!gameStarted || submitted}>+ Add Word</button>
          <button className="submit-btn" onClick={submitChain} disabled={!gameStarted || submitted}>Submit Chain </button>
        </div>
        {!gameStarted && isCreator && (
          <div className="round-selector">
            <label align="center"> Set Number of Rounds</label>
            <select value={rounds} onChange={handleSetRounds}>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{r} Rounds</option>
              ))}
            </select>
            <button className="start-button" onClick={startGame}>Start Game</button>
          </div>
        )}

        {!gameStarted && !isNextRound && <div className="waiting">Waiting for players...</div>}
      </div>

      

      <div className="chat">
        <h3>Chat</h3>
        <div className="chat-box" ref={chatBoxRef}>
          {/* {chatMessages.map((msg, i) => (
            <div key={i} className="chat-msg">
              <strong>{msg.username}:</strong> {msg.message}
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          ))} */}

          {chatMessages.slice().reverse().map((msg, i) => (
            <div key={i} className="chat-msg">
              <strong>{msg.username}:</strong> {msg.message}
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Game;
