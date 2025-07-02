
// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import "./Results.css";

// const Results = ({ socket }) => {
//   const { roomId } = useParams();
//   const location = useLocation();
//   const [submissions, setSubmissions] = useState([]);
//   const [shuffledSubmissions, setShuffledSubmissions] = useState([]);
//   const [selectedChain, setSelectedChain] = useState(null);
//   const [voted, setVoted] = useState(false);
//   const [votes, setVotes] = useState({});
//   const [revealed, setRevealed] = useState(false);
//   const [userVotes, setUserVotes] = useState({});
//   const [username, setUsername] = useState("");
//   const [gameOver, setGameOver] = useState(false);
//   const [scores, setScores] = useState({});
//   const [playersVoted, setPlayersVoted] = useState(0);
//   const [isClicked, setIsClicked] = useState(false);
//   const hasShuffled = useRef(false);
//   const navigate = useNavigate();

//   const playersList = new URLSearchParams(location.search).get("playersList");
//   const currentUsername = localStorage.getItem("username") || "";

//   useEffect(() => {
//     socket.emit("get-results", { roomId });

//     socket.on("results", (data) => {
//       setSubmissions(data);
//       if (!hasShuffled.current) {
//         const shuffled = [...data].sort(() => Math.random() - 0.5);
//         setShuffledSubmissions(shuffled);
//         hasShuffled.current = true;
//       }
//     });

//     socket.on("vote-update", setVotes);
//     socket.on("vote-count", (playersVotedCount) => {
//         setPlayersVoted(playersVotedCount.size);
//         console.log("Voted: " ,playersVotedCount);
//     });


//     socket.on("reveal-votes", (revealedVotes, userScores) => {
//       setUserVotes(revealedVotes);
//       setRevealed(true);
//       setShuffledSubmissions((prev) =>
//         [...prev].sort((a, b) => (votes[b.chain] || 0) - (votes[a.chain] || 0))
//       );
//       setScores(userScores);
//     });


//     socket.on("game-over", () => {
//       setGameOver(true);
//       setTimeout(() => {
//         navigate(`/final-scores/${roomId}`);
//       }, 3000);
//     });

//     return () => {
//       socket.off("results");
//       socket.off("vote-update");
//       socket.off("reveal-votes");
//       socket.off("vote-count");
//     };
//   }, [socket, roomId, votes, navigate]);

//   const handleVote = () => {
//     if (!selectedChain) return alert("Please select a chain to vote!");
//     socket.emit("vote", { roomId, votedChain: selectedChain, username: currentUsername });
//     setVoted(true);
//   };

//   const handleNextRound = () => {
//     setTimeout(() => {
//       if (!gameOver) {
//         setRevealed(false);
//         setSelectedChain(null);
//         setVoted(false);
//         setUserVotes({});
//         setVotes({});
//         setIsClicked(true);
//         navigate(`/game/${roomId}?is-next-round=true&&old-players-list=${playersList}`);
//       }
//     }, 30000);
//   };

//   if (revealed) {
//     handleNextRound();
//   }

//   const handleRevealVotes = () => {
//     socket.emit("reveal-votes", { roomId });
//   };

//   return (
//     <div className="results-container">
//       <h1>Voting</h1>

//       {!revealed ? (
//         <>
//           <h3>Vote for the Best Chain (except yours)</h3>
//           <ul className="vote-list">
//             {shuffledSubmissions.map((sub, index) => {
//               const isOwn = sub.username === currentUsername;
//               const isSelected = selectedChain === sub.chain;
//               return (
//                 <li
//                   key={index}
//                   className={`vote-item ${isOwn ? "disabled" : isSelected ? "selected" : ""}`}
//                   onClick={() => {
//                     if (!voted && !isOwn) setSelectedChain(sub.chain);
//                   }}
//                 >
//                   <span>{sub.chain.join(" → ")}</span>
//                 </li>
//               );
//             })}
//           </ul>

//           <div className="results-buttons">
//             {!voted ? (
//               <button onClick={handleVote} disabled={!selectedChain}>
//                 Submit Vote
//               </button>
//             ) : (
//               <p>You have voted!</p>
//             )}

//             {playersVoted === submissions.length ? (
//               <button onClick={handleRevealVotes}>Reveal Votes</button>
//             ) : (
//               <p>Waiting for all players to vote...</p>
//             )}
//           </div>
//         </>
//       ) : (
//         <>
//           <h2>Final Results</h2>
//           <ul className="vote-list">
//             {shuffledSubmissions.map((sub, index) => (
//               <li key={index} className="result-box">
//                 <strong>{sub.username}</strong>: {sub.chain.join(" → ")}
//                 <p>Votes: {votes[sub.chain] || 0}</p>
//                 {userVotes[sub.chain] && (
//                   <p>
//                     Voted by: {userVotes[sub.chain].join(", ")} — Score: {scores[sub.username] || 0}
//                   </p>
//                 )}
//               </li>
//             ))}
//           </ul>
//           <p className="next-round-hint">Next round starting in 10 seconds...</p>
//         </>
//       )}
//     </div>
//   );
// };

// export default Results;



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

    socket.on("vote-update", setVotes);
    socket.on("vote-count", (playersVotedCount) => {
      setPlayersVoted(playersVotedCount.size);
      console.log("Voted: ", playersVotedCount);
    });

    socket.on("reveal-votes", (revealedVotes, userScores) => {
      setUserVotes(revealedVotes);
      setRevealed(true);
      setShuffledSubmissions((prev) =>
        [...prev].sort((a, b) => (votes[b.chain] || 0) - (votes[a.chain] || 0))
      );
      setScores(userScores);
    });

    socket.on("game-over", () => {
      setGameOver(true);
      setTimeout(() => {
        navigate(`/final-scores/${roomId}`);
      }, 3000);
    });

    return () => {
      socket.off("results");
      socket.off("vote-update");
      socket.off("reveal-votes");
      socket.off("vote-count");
    };
  }, [socket, roomId, votes, navigate]);

  const handleVote = () => {
    if (!selectedChain) return alert("Please select a chain to vote!");
    socket.emit("vote", { roomId, votedChain: selectedChain, username: currentUsername });
    setVoted(true);
  };

  useEffect(() => {
    if (revealed) {
      const timeout = setTimeout(() => {
        if (!gameOver) {
          setRevealed(false);
          setSelectedChain(null);
          setVoted(false);
          setUserVotes({});
          setVotes({});
          setIsClicked(true);
          navigate(`/game/${roomId}?is-next-round=true&&old-players-list=${playersList}`);
        }
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [revealed, gameOver, navigate, playersList, roomId]);

  const handleRevealVotes = () => {
    socket.emit("reveal-votes", { roomId });
  };

  return (
    <div className="results-container">
      <h1>Voting</h1>

      {!revealed ? (
        <>
          <h3>Vote for the Best Chain (except yours)</h3>
          <ul className="vote-list">
            {shuffledSubmissions.map((sub, index) => {
              const isOwn = sub.username === currentUsername;
              const isSelected = selectedChain === sub.chain;
              return (
                <li
                  key={index}
                  className={`vote-item ${isOwn ? "disabled" : isSelected ? "selected" : ""}`}
                  onClick={() => {
                    if (!voted && !isOwn) setSelectedChain(sub.chain);
                  }}
                >
                  <span>{sub.chain.join(" → ")}</span>
                </li>
              );
            })}
          </ul>

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
              <li key={index} className="result-box">
                <strong>{sub.username}</strong>: {sub.chain.join(" → ")}
                <p>Votes: {votes[sub.chain] || 0}</p>
                {userVotes[sub.chain] && (
                  <p>
                    Voted by: {userVotes[sub.chain].join(", ")} — Score: {scores[sub.username] || 0}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="next-round-hint">Next round starting in 10 seconds...</p>
        </>
      )}
    </div>
  );
};

export default Results;