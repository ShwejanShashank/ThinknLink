
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
  const [duration, setDuration] = useState(30); // default 10s
  const [gameStarted, setGameStarted] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [copied, setCopied] = useState(false);
  const chatBoxRef = useRef(null);
  const [showCannotStartGame, setShowCannotStartGame] = useState(false);
  const MAX_LINKING_WORDS = 15;
  const [lastAddedIndex, setLastAddedIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const tickAudio = new Audio("/tick.mp3");
  tickAudio.volume = 1;
  const submitRef = useRef();
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);


  const tickAudioRef = useRef(null);
  const submittedAudioRef = useRef(null);


  const [joinToasts, setJoinToasts] = useState([]);

  const [messageType, setMessageType] = useState("user"); 

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


  useEffect(() => {
    if (gameStarted && timeLeft === duration) {
      // Play tick sound only once when timer starts
      if (tickAudioRef.current) {
        tickAudioRef.current.play().catch((err) => {
          console.warn("Audio play blocked or failed:", err);
        });
      }
    }
  }, [gameStarted, timeLeft, duration]);

  useEffect(() => {
    socket.on("player-joined", (newPlayer) => {
      const toastId = Date.now();
  
      setJoinToasts((prev) => [
        ...prev,
        { id: toastId, name: newPlayer.username },
      ]);
  
      setTimeout(() => {
        setJoinToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 3000);
    });
  
    return () => {
      socket.off("player-joined");
    };
  }, [socket]);

  // For Getting Window SIze for Mobile layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);





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
      // setTimeLeft(duration);

    });
    socket.on("chat-history", setChatMessages);
    socket.on("receive-chat-message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      
      });
  

    socket.on("start-timer", (time) => {
      setTimeLeft(time);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          tickAudioRef.current.play().catch((err) => {
            console.warn("Audio play blocked or failed:", err);
          });
          if (prev >1) {
            return prev - 1;
          } else if(prev<=1) {
            clearInterval(interval);
            submitRef.current?.click();
            return 0;
          }
        });
      }, 1000);
    
      setTimer(interval); // Keep reference for later clear
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

  // const startGame = () => {
  //   socket.emit("start-game", { roomId });
  // };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") addWord();
  };

  const submitChain = () => {
    setIsSubmitButtonDisabled(!isSubmitButtonDisabled);
    setSubmitted(true);
    socket.emit("submit-chain", { roomId, username, chain: chain });
    socket.emit("send-chat-message", {
      roomId,
      username,
      message: `${username} has submitted`,
      timestamp: new Date().toLocaleTimeString(),
      type: "system"
    });
    if (submittedAudioRef.current) {
      submittedAudioRef.current.play().catch((err) => {
        console.warn("Audio play blocked or failed:", err);
      });
    }
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      socket.emit("send-chat-message", {
        roomId,
        username,
        message: chatInput,
        timestamp: new Date().toLocaleTimeString(),
        type: "user"
      });
      setChatInput("");
      setMessageType("user");
    }
  };



const deleteWordAtIndex = (index) => {
  setDeletingIndex(index); // trigger animation

  setTimeout(() => {
    const updated = chain.filter((_, i) => i !== index);
    setChain(updated);
    setDeletingIndex(null); // reset
  }, 300); // matches animation duration
};

const addWord = () => {
  setIsSubmitButtonDisabled(false);

  if (!newWord.trim() || submitted) return;

  const middleWords = chain.slice(1, -1); // get words between first and last

  if (middleWords.length >= MAX_LINKING_WORDS) {
    alert("You can only add up to 15 linking words!");
    return;
  }

  const updatedChain = [...chain.slice(0, -1), newWord, chain[chain.length - 1]];
  setChain(updatedChain);
  setLastAddedIndex(chain.length - 1);
  setNewWord("");
  socket.emit("send-chat-message", {
    roomId,
    username,
    message: `${username} has entered a word`,
    timestamp: new Date().toLocaleTimeString(),
    type: "system"
  });

  setMessageType("system");
};

  return (



    

    <div className="game-container">

        {isMobile ? (
            // 📱 Mobile Layout
            <>
              <div className="game-container-mobile">
                {copied && <div className="copy-toast">Room ID copied!</div>}
                <h2>ThinkNLink</h2>
                <h3 className="players-list">Players</h3>
                <div className="mobile-players-scroll-wrapper">
                  <div className="mobile-players-scroll">
                    {[...players]
                      .sort((a, b) => (scores[b] || 0) - (scores[a] || 0))
                      .map((player, i) => (
                        <div key={i} className="player-pill">
                          <span className="pill-avatar">{player.charAt(0)}</span>
                          <span className="pill-name">{player}</span>
                          <span className="pill-score">{scores[player] || 0} pts</span>
                        </div>
                      ))}
                  </div>
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

        <div className="toast-container">
          {joinToasts.map((toast) => (
            <div key={toast.id} className="toast">
              👤 {toast.name} joined the room
            </div>
          ))}
        </div>

        

        {/* <h3 className="chain-title">Word Chain</h3> */}
        <audio ref={tickAudioRef} src='/clock_tick_trimmed.mp3' preload="auto" />
        <audio ref={submittedAudioRef} src='/submitted.mp3' preload="auto" />
        {/* <audio ref={tickAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2184/2184-preview.mp3" preload="auto" /> */}
        {gameStarted && (


        <div className="chain-box-outline">
        <div className="chain-box">

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
          <span className="word-limit" style={{ fontSize: '14px', color: 'gray' }}>
            Words Entered: {chain.length > 2 ? chain.length - 2 : 0} Max Limit: {MAX_LINKING_WORDS}
          </span>
        
        </div>
        )}

        {gameStarted && (



        <div className="actions">
          <div className="actions-top">

          
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
          </div>

          <button ref={submitRef} className="submit-btn" onClick={submitChain} disabled={isSubmitButtonDisabled}>Submit Chain </button>
        </div>
        )}
        {!gameStarted && isCreator && (
          <div className="round-selector">
            <label align="center"> Set Number of Rounds</label>
            <div className="round-controls">
              <select value={rounds} onChange={handleSetRounds}>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r} Rounds</option>
                ))}
              </select>
              <button className="start-button" onClick={() => socket.emit("start-game", { roomId, duration })}>
                Start Game
              </button>
            </div>

          </div>
        )}
        {!gameStarted && !isNextRound && 
        <div className="waiting-indicator">
        <div className="hourglass-icon">⏳</div>
        <p className="waiting-text">Waiting for players to join...</p>
      </div>
      }


        {!gameStarted && <div className="game-info-panel">
          <h4>🧠 How the Game Works</h4>
          <ul className="info-list">
            <li><strong>Link the Start and End words</strong> using creative connections.</li>
            <li><strong>First player to submit</strong> triggers the countdown for others.</li>
            <li>Everyone must finish their chain <strong>before time runs out</strong>.</li>
            <li>You can add up to <strong>15 linking words</strong>.</li>
          </ul>

          <h4>🔗 Example Chain:</h4>
          <div className="example-chain">
            <span className="chain-word">Ocean</span>
            <span className="arrow">→</span>
            <span className="chain-word">Boat</span>
            <span className="arrow">→</span>
            <span className="chain-word">Sail</span>
            <span className="arrow">→</span>
            <span className="chain-word">Wind</span>
            <span className="arrow">→</span>
            <span className="chain-word">Sky</span>
          </div>

          <p className="highlighted-note">
            ⚠️ Timer starts the moment <strong>anyone submits</strong>. Be quick and thoughtful!
          </p>
        </div>}

        {/* {!gameStarted && !isNextRound && <div className="waiting">Waiting for players...</div>} */}

      


                </div>
              
                <div className="chat">
                  <h3>Chat</h3>
                  <div className="chat-box" ref={chatBoxRef}>
                  
                    {chatMessages.slice().reverse().map((msg, i) => (
                      <div
                        key={i}
                        className={msg.type === "system" ? "chat-msg-system" : "chat-msg-user"}
                      >
                        {msg.type === "system" ? (
                          <>
                            {msg.message}
                            <span className="timestamp">{msg.timestamp}</span>
                          </>
                        ) : (
                          <>
                            <strong>{msg.username}:</strong> {msg.message}
                            <span className="timestamp">{msg.timestamp}</span>
                          </>
                        )}
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
            </>
          ) : (
            // 🖥️ Desktop Layout
            <>
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

        <div className="toast-container">
          {joinToasts.map((toast) => (
            <div key={toast.id} className="toast">
              👤 {toast.name} joined the room
            </div>
          ))}
        </div>

        

        {/* <h3 className="chain-title">Word Chain</h3> */}
        <audio ref={tickAudioRef} src='/clock_tick_trimmed.mp3' preload="auto" />
        <audio ref={submittedAudioRef} src='/submitted.mp3' preload="auto" />
        {/* <audio ref={tickAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2184/2184-preview.mp3" preload="auto" /> */}
        {gameStarted && (


        <div className="chain-box-outline">
        <div className="chain-box">

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
          <span className="word-limit" style={{ fontSize: '14px', color: 'gray' }}>
            Words Entered: {chain.length > 2 ? chain.length - 2 : 0} Max Limit: {MAX_LINKING_WORDS}
          </span>
        
        </div>
        )}

        {gameStarted && (



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
          <button ref={submitRef} className="submit-btn" onClick={submitChain} disabled={isSubmitButtonDisabled}>Submit Chain </button>
        </div>
        )}
        {!gameStarted && isCreator && (
          <div className="round-selector">
            <label align="center"> Set Number of Rounds</label>
            <select value={rounds} onChange={handleSetRounds}>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{r} Rounds</option>
              ))}
            </select>

            {/*<button className="start-button" onClick={startGame}>Start Game</button>*/}
            <button className="start-button" onClick={() => socket.emit("start-game", { roomId, duration })}>
              Start Game
            </button>

          </div>
        )}
        {!gameStarted && !isNextRound && 
        <div className="waiting-indicator">
        <div className="hourglass-icon">⏳</div>
        <p className="waiting-text">Waiting for players to join...</p>
      </div>
      }


        {!gameStarted && <div className="game-info-panel">
          <h4>🧠 How the Game Works</h4>
          <ul className="info-list">
            <li><strong>Link the Start and End words</strong> using creative connections.</li>
            <li><strong>First player to submit</strong> triggers the countdown for others.</li>
            <li>Everyone must finish their chain <strong>before time runs out</strong>.</li>
            <li>You can add up to <strong>15 linking words</strong>.</li>
          </ul>

          <h4>🔗 Example Chain:</h4>
          <div className="example-chain">
            <span className="chain-word">Ocean</span>
            <span className="arrow">→</span>
            <span className="chain-word">Boat</span>
            <span className="arrow">→</span>
            <span className="chain-word">Sail</span>
            <span className="arrow">→</span>
            <span className="chain-word">Wind</span>
            <span className="arrow">→</span>
            <span className="chain-word">Sky</span>
          </div>

          <p className="highlighted-note">
            ⚠️ Timer starts the moment <strong>anyone submits</strong>. Be quick and thoughtful!
          </p>
        </div>}

        {/* {!gameStarted && !isNextRound && <div className="waiting">Waiting for players...</div>} */}

      


      </div>

      

      <div className="chat">
        <h3>Chat</h3>
        <div className="chat-box" ref={chatBoxRef}>
        
          {chatMessages.slice().reverse().map((msg, i) => (
            <div
              key={i}
              className={msg.type === "system" ? "chat-msg-system" : "chat-msg-user"}
            >
              {msg.type === "system" ? (
                <>
                  {msg.message}
                  <span className="timestamp">{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <strong>{msg.username}:</strong> {msg.message}
                  <span className="timestamp">{msg.timestamp}</span>
                </>
              )}
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
            </>
          )}







    
    </div>
  );
};

export default Game;
