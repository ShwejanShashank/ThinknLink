

import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

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

    const playersList = new URLSearchParams(location.search).get("playersList");


    const [isClicked, setIsClicked] = useState(false);

    const hasShuffled = useRef(false);

    const navigate = useNavigate();

    const [scores, setScores] = useState({});
    const [playersVoted, setPlayersVoted] = useState(0);

    var currentUsername = "";


    useEffect(() => {
        socket.emit("get-results", { roomId });

        // socket.on("results", (data) => {
        //     setSubmissions(data);


        //     // Shuffle chains for anonymity
        //     const shuffled = [...data].sort(() => Math.random() - 0.5);
        //     setShuffledSubmissions(shuffled);
        // });

        socket.on("results", (data) => {
            setSubmissions(data);
            console.log("SUbmissions: ", data);
            if (!hasShuffled.current) {
                const shuffled = [...data].sort(() => Math.random() - 0.5);
                setShuffledSubmissions(shuffled);
                hasShuffled.current = true;
            }
        });

        socket.on("vote-update", (voteData) => {
            setVotes(voteData);
        });

        socket.on("vote-count", (count) => {
            setPlayersVoted(count);
        });

        socket.on("reveal-votes", (revealedVotes, userScores) => {
            setUserVotes(revealedVotes);
            setRevealed(true);

            // Sort chains based on vote count in descending order
            setShuffledSubmissions((prev) =>
                [...prev].sort((a, b) => (votes[b.chain] || 0) - (votes[a.chain] || 0))
            );

            console.log(userScores);
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
    }, [socket, roomId, votes]);

    const handleVote = () => {
        if (!selectedChain) return alert("Please select a chain to vote!");


        
        
            currentUsername = localStorage.getItem("username").toString();

            socket.emit("vote", { roomId, votedChain: selectedChain, username: currentUsername });
            setVoted(true);
        
        
    };




       const handleNextRound = () => {

        
        setTimeout(() => {
            if(!gameOver){
            setRevealed(false);
            setSelectedChain(null);
            setVoted(false);
            setUserVotes({});
            setVotes({});
            setIsClicked(true);
            console.log("Button Clicked")
            
            navigate(`/game/${roomId}?is-next-round=${true}&&old-players-list=${playersList}`);
    }

        }, 3000);

        };


    if(revealed){
        handleNextRound(); // Automatically run on mount
    }


    const handleRevealVotes = () => {
        socket.emit("reveal-votes", { roomId });
    };


    // // Next Round
    // useEffect(() => {
    //     socket.on("next-round", (newWords) => {
    //         setRevealed(false);
    //         setSelectedChain(null);
    //         setVoted(false);
    //         setUserVotes({});
    //         setVotes({});
    //         navigate(`/game/${roomId}`); // Redirect back to game
    //     });
    
    //     socket.on("final-scores", (finalScoreMap) => {
    //         console.log("Final Scores:", finalScoreMap);
    //         // You can optionally display them in Results page
    //     });
    
    //     return () => {
    //         socket.off("next-round");
    //         socket.off("final-scores");
    //     };
    // }, []);






    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Results</h1>

            {!revealed ? (
                <>
                    <h3>Vote for the Best Chain (except yours)</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {shuffledSubmissions.map((sub, index) => (
                            <li key={index}
                                style={{
                                    padding: "10px",
                                    marginBottom: "10px",
                                    border: "1px solid black",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    cursor: !voted && sub.username !== localStorage.getItem("username") ? "pointer" : "not-allowed",
                                    background: selectedChain === sub.chain ? "#d3f4ff" : (sub.username === localStorage.getItem("username") ? "#f0f0f0" : "white"),
                                    opacity: sub.username === localStorage.getItem("username") ? 0.5 : 1 // Grays out own chain
                                }}
                                // onClick={() => !voted && sub.username !== localStorage.getItem("username") && setSelectedChain(sub.chain)}
                                onClick={() => {
                                    if (!voted && sub.username !== localStorage.getItem("username")) {
                                        setSelectedChain(sub.chain);
                                    }
                                }}
                            >
                                <span>{sub.chain.join(" → ")}</span>
                            </li>
                        ))}
                    </ul>

                    {!voted ? (
                        <button onClick={handleVote} disabled={!selectedChain}>
                            Submit Vote
                        </button>
                    ) : (
                        <p>You have voted! Waiting for others...</p>
                    )}

                    {playersVoted === submissions.length ? (
                        <button onClick={handleRevealVotes}>Reveal Votes</button>
                    ) : (
                        <p>Waiting for all players to vote ({playersVoted}/{submissions.length})...</p>
                    )}
                </>
            ) : (
                <>
               
                    <h2>Final Results</h2>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {shuffledSubmissions.map((sub, index) => (
                            <li key={index} style={{
                                padding: "10px",
                                marginBottom: "10px",
                                border: "1px solid black",
                                background: "#e3e3e3"
                            }}>
                                <strong>{sub.username}</strong>: {sub.chain.join(" → ")}
                                <p>Votes: {votes[sub.chain] || 0}</p>
                                
                                {userVotes[sub.chain] && (
                                    <p style={{ fontSize: "14px", color: "gray" }}>
                                        Voted by: {userVotes[sub.chain].join(", ")}
                                        Score: {scores[sub.username]}
                                    </p>
                                    
                                )}

                                

                                
                            </li>
                        ))}
                            { <p>Next round starting in 10 seconds...</p>}
                            

                    </ul>
                    <button  onClick={handleNextRound}>Reveal Votes</button>
                    
                </>
            )}
        </div>
    );
};

export default Results;