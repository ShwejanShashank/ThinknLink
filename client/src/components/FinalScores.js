// FinalScores.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const FinalScores = ({ socket }) => {
  const { roomId } = useParams();
  const [scores, setScores] = useState({});
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const navigate = useNavigate();

  const [roomCreated, setRoomCreated] = useState(false);

  var username = localStorage.getItem("username");

  useEffect(() => {
    socket.emit("get-final-scores", { roomId });

    // socket.disconnect();
    

    socket.on("final-scores", (finalScoreMap) => {
      console.log("Final Scores: ", finalScoreMap);
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

  const goToGame = () => {
    // navigate(`/game/${roomId}?username=${username}`);
    navigate(`/game/${roomId}?is-next-round=${false}`);
    // if(!roomCreated){
    //   setRoomCreated(true);

    //   const newRoomId = uuidv4().slice(0, 6);
    //   localStorage.setItem("newRoomId", newRoomId);
    //   socket.emit("create-room", { newRoomId, username });
    //   navigate(`/game/${newRoomId}?username=${username}`);
    // }
    // else{
    //   const newRoomId = localStorage.getItem("newRoomId");
    //   socket.emit("join-room", { newRoomId, username }, (response) => {
    //     if (response && !response.success) {
    //         alert(response.message);
    //         return;
    //     }


    //     navigate(`/game/${roomId}?username=${username}`);
    // });
    // }


    
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>🏆 Final Scores</h1>
      <ul style={{ listStyle: "none", padding: 0, fontSize: "20px" }}>
        {sortedPlayers.map((player, index) => (
          <li
            key={index}
            style={{
              marginBottom: "10px",
              fontWeight: index === 0 ? "bold" : "normal",
              color: index === 0 ? "goldenrod" : "black",
            }}
          >
            {index + 1}. {player} - {scores[player]} points
          </li>
        ))}
      </ul>

      <button onClick={goToGame} style={{ marginTop: "30px", padding: "10px 20px" }}>
        🔁 Play Again
      </button>
      <button onClick={goHome} style={{ marginTop: "30px", padding: "10px 20px" }}>
        Home
      </button>
    </div>
  );
};

export default FinalScores;