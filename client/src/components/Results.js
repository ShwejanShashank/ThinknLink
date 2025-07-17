

import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./Results.css";

const Results = ({ socket }) => {
  const { roomId } = useParams();
  const location = useLocation();
  const [submissions, setSubmissions] = useState([]);
  const [shuffledSubmissions, setShuffledSubmissions] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null);
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [username, setUsername] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({});
  const [playersVoted, setPlayersVoted] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const hasShuffled = useRef(false);
  const navigate = useNavigate();

  const playersList = new URLSearchParams(location.search).get("playersList");
  const currentUsername = localStorage.getItem("username") || "";
  const [countdown, setCountdown] = useState(10);

  const submittedAudioRef = useRef(null);


  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatBoxRef = useRef(null);

  const [sortAnimated, setSortAnimated] = useState(false);


  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendMessage = () => {
    if (chatInput.trim()) {
      socket.emit("send-chat-message", {
        roomId,
        username: currentUsername,
        message: chatInput,
        timestamp: new Date().toLocaleTimeString(),
        type: "user",
      });
      setChatInput("");
    }
  };

  


  useEffect(() => {
    socket.emit("get-results", { roomId });

    socket.on("results", (data) => {
      setSubmissions(data);
      if (!hasShuffled.current) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setShuffledSubmissions(shuffled);
        hasShuffled.current = true;
      }
    });

    socket.on("chat-history", setChatMessages);

    socket.on("receive-chat-message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });



    


    socket.on("vote-update", setVotes);
    // socket.on("vote-count", (playersVotedCount) => {
    //   setPlayersVoted(playersVotedCount.size);
    // });
    socket.on("vote-count", (playersVotedSet) => {
      setPlayersVoted(playersVotedSet);
      console.log("PLAYERS VOTED: ", playersVoted);
      // store actual player names
    });

    // socket.on("reveal-votes", (revealedVotes, userScores) => {
    //   setUserVotes(revealedVotes);
    //   setRevealed(true);
    //   setShuffledSubmissions((prev) =>
    //     [...prev].sort((a, b) => (votes[b.username] || 0) - (votes[a.username] || 0))
    //   );
    //   setScores(userScores);
    // });

    socket.on("reveal-votes", (revealedVotes, userScores) => {
      setUserVotes(revealedVotes);
      setRevealed(true);
      setScores(userScores);
    
      // Don't sort immediately
      setTimeout(() => {
        setShuffledSubmissions((prev) =>
          [...prev].sort((a, b) => (votes[b.username] || 0) - (votes[a.username] || 0))
        );
        setSortAnimated(true);
      }, 500); // small delay to emphasize transition
    });

    socket.on("game-over", () => {
      setGameOver(true);
      setTimeout(() => {
        navigate(`/final-scores/${roomId}`);
      }, 10000);
    });


    return () => {
      socket.off("results");
      socket.off("vote-update");
      socket.off("reveal-votes");
      socket.off("vote-count");
      socket.off("chat-history");
      socket.off("receive-chat-message");
    };
  }, [socket, roomId, votes, navigate]);

  const handleVote = () => {
    if (!selectedChain) return alert("Please select a chain to vote!");
    // socket.emit("vote", { roomId, votedChain: selectedChain, username: currentUsername });
    socket.emit("vote", {
      roomId,
      votedChain: selectedChain.chain,
      votedFor: selectedChain.username,
      username: currentUsername
    });
    setVoted(true);
    socket.emit("send-chat-message", {
      roomId,
      username,
      message: `${currentUsername} has voted`,
      timestamp: new Date().toLocaleTimeString(),
      type: "system"
    });
    if (submittedAudioRef.current) {
      submittedAudioRef.current.play().catch((err) => {
        console.warn("Audio play blocked or failed:", err);
      });
    }
  };

  // useEffect(() => {
  //   if (revealed) {
  //     const timeout = setTimeout(() => {
  //       if (!gameOver) {
  //         setRevealed(false);
  //         setSelectedChain(null);
  //         setVoted(false);
  //         setUserVotes({});
  //         setVotes({});
  //         setIsClicked(true);
  //         navigate(`/game/${roomId}?is-next-round=true&&old-players-list=${playersList}`);
  //       }
  //     }, 10000);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [revealed, gameOver, navigate, playersList, roomId]);

  useEffect(() => {
    if (revealed) {
      let seconds = 10;
      setCountdown(seconds);
      const interval = setInterval(() => {
        seconds -= 1;
        setCountdown(seconds);
        if (seconds === 0) {
          clearInterval(interval);
          if (!gameOver) {
            setRevealed(false);
            setSelectedChain(null);
            setVoted(false);
            setUserVotes({});
            setVotes({});
            setIsClicked(true);
            navigate(`/game/${roomId}?is-next-round=true&&old-players-list=${playersList}`);
          }
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [revealed, gameOver, navigate, playersList, roomId]);

  const handleRevealVotes = () => {
    socket.emit("reveal-votes", { roomId });
  };

  return (
    
    <div className="results-container">

      <div className="results-layout">







      
      <div className="results-center-column">
      <h1>Voting</h1>
      {!revealed ? (
        <>
          <h3>Vote for the Best Chain (except yours)</h3>
          <audio ref={submittedAudioRef} src='/submitted.mp3' preload="auto" />
          <ul className="vote-list">
            {shuffledSubmissions.map((sub, index) => {
              const isOwn = sub.username === currentUsername;
              const isSelected = selectedChain === sub;
              return (
                <li
                  key={index}
                  className={`vote-item ${isOwn ? "disabled" : isSelected ? "selected" : ""}`}
                  onClick={() => {
                    // if (!voted && !isOwn) setSelectedChain(sub.chain);
                    if (!voted && !isOwn) setSelectedChain(sub);
                  }}
                >
                  <div className="vote-content">
                    {sub.chain.map((word, idx) => (
                      <React.Fragment key={idx}>
                        <span className="chain-word-results">{word}</span>
                        {idx < sub.chain.length - 1 && <span className="arrow">→</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  {!isOwn && (
                    <div className="vote-circle">
                      <div className={`circle ${isSelected ? "active" : ""}`} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* <div className="voter-status-bar">
            <h3>Players who voted this round:</h3>
            <ul className="voter-list">
              {submissions.map((player, i) => (
                <li key={i} className="voter-name">
                  
                  {playersVoted && playersVoted.includes(player.username) && (
                    <p></p>
                  )}

                </li>
              ))}
            </ul>
          </div> */}

          <div className="results-buttons">
            {!voted ? (
              <button onClick={handleVote} disabled={!selectedChain}>
                Submit Vote
              </button>
            ) : (
              <p>You have voted!</p>
            )}

            {playersVoted === submissions.length ? (
              <button onClick={handleRevealVotes}>Reveal Votes</button>
            ) : (
              <p>Waiting for all players to vote...</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h2>Final Results</h2>
          <ul className="vote-list">
          
            {shuffledSubmissions.map((sub, index) => (

                <li
                key={index}
                className={`result-box ${sortAnimated ? "revealed" : ""}`}
                >
                <div className="result-left">
                  <div className="username">{sub.username}</div>
                  <div className="chain">
                    
                    
                    {/* {sub.chain.join(" → ")} */}

                    {sub.chain.map((word, idx) => {
                    const isEndpoint = idx === 0 || idx === sub.chain.length - 1;
                    return (
                      <React.Fragment key={idx}>
                        <span
                          className={'chain-word-results'}
                        >
                          {word}
                          
                        </span>
                        {idx < sub.chain.length - 1 && <span className="arrow">→</span>}
                      </React.Fragment>
                        );
                      })}
                  
                  
                  
                  </div>
                  <div className="line">

                  </div>
                  {userVotes[sub.username] && (
                    <div className="voted-by">
                      Voted by: {userVotes[sub.username].join(", ")} 
                    </div>

                    
            
                    
                  )}
                </div>

                {sortAnimated && (
                  <>
                    {/* <div className="username">{sub.username}</div> */}
                    <div className="number-of-votes">
                      <div className="count">{votes[sub.username] || 0}</div>
                      <div className="label">{votes[sub.username] === 1 ? "vote" : "votes"}</div>
                    </div>
                  </>
                )}
              </li>

              
            ))}
          </ul>
          {/* <div className="next-round-banner">⏱ Next round starting in 10 seconds...</div>
       */}
       {!gameOver && (
       <div className="next-round-banner">
        ⏱ Next round starting in {countdown} second{countdown !== 1 ? "s" : ""}...
       </div>
       )}

        </>
      )}

      </div>

      <div className="chat" align="left">
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
    </div>
  );
};

export default Results;

