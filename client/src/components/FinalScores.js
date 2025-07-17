// // FinalScores.js
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { v4 as uuidv4 } from "uuid";

// const FinalScores = ({ socket }) => {
//   const { roomId } = useParams();
//   const [scores, setScores] = useState({});
//   const [sortedPlayers, setSortedPlayers] = useState([]);
//   const navigate = useNavigate();

//   const [roomCreated, setRoomCreated] = useState(false);

//   var username = localStorage.getItem("username");

//   useEffect(() => {
//     socket.emit("get-final-scores", { roomId });

//     // socket.disconnect();
    

//     socket.on("final-scores", (finalScoreMap) => {
//       console.log("Final Scores: ", finalScoreMap);
//       setScores(finalScoreMap);
//       const sorted = Object.keys(finalScoreMap).sort(
//         (a, b) => finalScoreMap[b] - finalScoreMap[a]
//       );
//       setSortedPlayers(sorted);
//     });

//     return () => {
//       socket.off("final-scores");
//     };
//   }, [socket, roomId]);

//   const goHome = () => {
//     socket.disconnect();
//     navigate("/");
//     window.location.reload(true);
//   };

//   const goToGame = () => {
//     // navigate(`/game/${roomId}?username=${username}`);
//     navigate(`/game/${roomId}?is-next-round=${false}`);
//     // if(!roomCreated){
//     //   setRoomCreated(true);

//     //   const newRoomId = uuidv4().slice(0, 6);
//     //   localStorage.setItem("newRoomId", newRoomId);
//     //   socket.emit("create-room", { newRoomId, username });
//     //   navigate(`/game/${newRoomId}?username=${username}`);
//     // }
//     // else{
//     //   const newRoomId = localStorage.getItem("newRoomId");
//     //   socket.emit("join-room", { newRoomId, username }, (response) => {
//     //     if (response && !response.success) {
//     //         alert(response.message);
//     //         return;
//     //     }


//     //     navigate(`/game/${roomId}?username=${username}`);
//     // });
//     // }


    
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "40px" }}>
//       <h1>🏆 Final Scores</h1>
//       <ul style={{ listStyle: "none", padding: 0, fontSize: "20px" }}>
//         {sortedPlayers.map((player, index) => (
//           <li
//             key={index}
//             style={{
//               marginBottom: "10px",
//               fontWeight: index === 0 ? "bold" : "normal",
//               color: index === 0 ? "goldenrod" : "black",
//             }}
//           >
//             {index + 1}. {player} - {scores[player]} points
//           </li>
//         ))}
//       </ul>

//       <button onClick={goHome} style={{ marginTop: "30px", padding: "10px 20px" }}>
//         Home
//       </button>
//     </div>
//   );
// };

// export default FinalScores;



import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FinalScores.css";

import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const FinalScores = ({ socket }) => {
  const { roomId } = useParams();
  const [scores, setScores] = useState({});
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const navigate = useNavigate();

  const currentUsername = localStorage.getItem("username") || "";

  const cheerAudioRef = useRef(null);
  const sadAudioRef = useRef(null);

  // const [width, height] = useWindowSize();

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    if (cheerAudioRef.current) {
      cheerAudioRef.current.play().catch((err) => {
        console.warn("Audio play blocked or failed:", err);
      });
    }
  })

  useEffect(() => {
    if (sadAudioRef.current) {
      sadAudioRef.current.play().catch((err) => {
        console.warn("Audio play blocked or failed:", err);
      });
    }
  })


  useEffect(() => {
    const updateSize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    socket.emit("get-final-scores", { roomId });

    socket.on("final-scores", (finalScoreMap) => {
      setScores(finalScoreMap);
      const sorted = Object.keys(finalScoreMap).sort(
        (a, b) => finalScoreMap[b] - finalScoreMap[a]
      );
      setSortedPlayers(sorted);
    });



    return () => {
      socket.off("final-scores");
    };
  }, [socket, roomId]);

  const goHome = () => {
    socket.disconnect();
    navigate("/");
    window.location.reload(true);
  };

  return (
    <div className="final-scores-container">
      
        {sortedPlayers.length > 0 && sortedPlayers[0] === currentUsername && (
          <>
          <Confetti
            width={width}
            height={height}
            numberOfPieces={300}
            recycle={false}
            gravity={0.3}
          />
          <audio ref={cheerAudioRef} src='/cheer_trimmed.mp3' preload="auto" />
          </>
        )}

        {sortedPlayers.length > 0 && sortedPlayers[sortedPlayers.length - 1] === currentUsername && (
          <audio ref={sadAudioRef} src='/last.mp3' preload="auto" />
        )}

            <h1>🏆 Final Scores</h1>

      {sortedPlayers.length > 0 && (
        <div className="winner-box">
          <h2>🎉 Congratulations {sortedPlayers[0]}!</h2>
          <p>You topped the chart with <strong>{scores[sortedPlayers[0]]}</strong> points!</p>
        </div>
      )}

      <ul className="leaderboard">
        {sortedPlayers.map((player, index) => (
          <li key={index} className="leaderboard-item">
            <span className={`rank rank-${index + 1}`}>
            {index === 0
              ? "🥇"
              : index === 1
              ? "🥈"
              : index === 2
              ? "🥉"
              : index === sortedPlayers.length - 1
              ? "🐌"
              : `${index + 1}.`}

            </span>
            <span className="player-name">{player}</span>
            <span className="player-score">{scores[player] || 0} pts</span>
          </li>
        ))}
      </ul>

      <button className="home-btn" onClick={goHome}>Back to Home</button>
    </div>
  );
};

export default FinalScores;