



// Updated Game.js with copy room ID button and tooltip
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./Game.css";

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

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (isNextRound) socket.emit("next-round-game", { roomId });
  }, [isNextRound]);

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

  const startGame = () => socket.emit("start-game", { roomId });

  const addWord = () => {
    if (!newWord.trim() || submitted) return;
    setChain([...chain.slice(0, -1), newWord, chain[chain.length - 1]]);
    setNewWord("");
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

  return (
    <div className="game-container">
      {copied && <div className="copy-toast">Room ID copied!</div>}
      <div className="sidebar">
        <h2>Players</h2>
        <ul>
          {[...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0)).map((player, i) => (
            <li key={i}>
              <span className="avatar">{player.charAt(0)}</span>
              <div className="player-name">{player}</div>
              <div className="score">{scores[player] || 0} pts</div>
            </li>
          ))}
        </ul>
        {!gameStarted && isCreator && (
          <div className="round-selector">
            <label>Rounds</label>
            <select value={rounds} onChange={handleSetRounds}>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{r} Rounds</option>
              ))}
            </select>
            <button className="start-button" onClick={startGame}>Start Game</button>
          </div>
        )}
      </div>

      <div className="main">
        <div className="top-bar">
          <span className="room-id" onClick={handleCopy} title="Click to copy">
            Room: {roomId} 📋
          </span>
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

        <h3 className="chain-title">Word Chain</h3>
        <div className="chain-box">
          {chain.map((word, idx) => (
            <React.Fragment key={idx}>
              <span className={`chain-word ${idx === 0 || idx === chain.length - 1 ? 'endpoint' : 'middle'}`}>{word}</span>
              {idx < chain.length - 1 && <span className="arrow">→</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="actions">
          <input
            className="word-input"
            type="text"
            placeholder="Add linking word..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!gameStarted || submitted}
          />
          <button className="add-btn" onClick={addWord} disabled={!gameStarted || submitted}>+ Add Word</button>
          <button className="submit-btn" onClick={submitChain} disabled={!gameStarted || submitted}>Submit Chain</button>
        </div>

        {!gameStarted && !isNextRound && <div className="waiting">Waiting for players...</div>}
      </div>

      <div className="chat">
        <h3>Chat</h3>
        <div className="chat-box" ref={chatBoxRef}>
          {chatMessages.map((msg, i) => (
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
