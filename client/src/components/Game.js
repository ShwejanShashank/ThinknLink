
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const Game = ({ socket }) => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    var username = localStorage.getItem("username");

    const isNextRound = new URLSearchParams(location.search).get("is-next-round");


    const [players, setPlayers] = useState([]);
    const [scores, setScores] = useState({}); // Track player scores
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [nextRound, setNextRound] = useState(false);
    const [words, setWords] = useState([]);
    const [chain, setChain] = useState([]);
    const [newWord, setNewWord] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [rounds, setRounds] = useState(1);
    const [gameStarted, setGameStarted] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const chatBoxRef = useRef(null);


    const newScores = {};



    useEffect(() => {
        console.log("-------->", {isNextRound});
        setTimeout(() => {
            if (isNextRound) {
                // Only run this once
                socket.emit("next-round-game", { roomId });
                // setScores(newScores);
            }
        }, 1000);
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNextRound]);

    useEffect(() => {
        window.history.replaceState(null, "", "/");
        username = localStorage.getItem("username");
        socket.emit("join-room", { roomId, username });

        socket.on("update-players", (playerList) => {
            setPlayers(playerList);

            // playerList.forEach((player) => {
            //     if(newScores[player]!=null)
            //     newScores[player] = scores[player]; // Initialize score if not set
            //     else
            //     newScores[player] = 0;
            // });

            

            


            // setScores(newScores);
        });


            


        socket.on("update-scores", (newScores) => {
            setScores(newScores);
        });

        socket.on("update-rounds", ({ rounds}) => {
            setRounds(rounds);
        });

        socket.on("creator", ({ creator }) => {
            setIsCreator(socket.id === creator);
        });

        socket.on("game-started", (wordPair) => {
            setWords(wordPair);
            setChain(wordPair);
            setGameStarted(true);
        });

        // socket.on("game-state", (state) => {
        //     setWords(state.words);
        //     setChain(state.words);
        //     setChatMessages(state.chat);
        //     setScores(state.scores);
        //     // setTimeLeft(state.timeLeft);
        //     setGameStarted(true);
        
        //     // if (state.submittedPlayers.includes(username)) {
        //     //     setSubmitted(true);
        //     // }
        // });

        socket.on("game-words", (wordPair) => {
            setWords(wordPair);
            setChain(wordPair);
        });

        socket.on("chat-history", (history) => {
            setChatMessages(history);
        });

        socket.on("receive-chat-message", (message) => {
            setChatMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on("start-timer", (time) => {
            setTimeLeft(time);
            setTimer(setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev > 0) return prev - 1;
                    clearInterval(timer);
                    return 0;
                });
            }, 1000));
        });

        // if(isNextRound){
        //     socket.emit("next-round-game", { roomId });
        //     setScores(newScores);
        // }



        socket.on("next-round", (wordPair) => {
            clearInterval(timer);
            setWords(wordPair);
            setChain(wordPair);
            setSubmitted(false);
            setNextRound(true);
            navigate(`/results/${roomId}?playersList=${players}`);
        });

        socket.on("results", (submissions) => {
            console.log("Results received:", submissions);
        });

        socket.on("game-over", () => {
            clearInterval(timer);
            if (!submitted) submitChain();
            navigate(`/results/${roomId}`);
        });

        const handleBackButton = () => {
            socket.emit("leave-room", { roomId, username });
            socket.disconnect();
            navigate("/");
        };

        window.addEventListener("popstate", handleBackButton);

        return () => {
            socket.off("update-players");
            socket.off("update-scores");
            socket.off("game-words");
            socket.off("chat-history");
            socket.off("receive-chat-message");
            socket.off("start-timer");
            socket.off("game-over");
            socket.off("update-rounds");
            socket.off("game-started");

            window.removeEventListener("popstate", handleBackButton);
            socket.emit("leave-room", { roomId, username });
        };
    }, [socket, roomId, username, navigate, timer]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSetRounds = (e) => {
        const value = parseInt(e.target.value);
        setRounds(value);
        socket.emit("set-rounds", { roomId, rounds: value });
    };

    const startGame = () => {
        socket.emit("start-game", { roomId });
    };

    const addWord = () => {
        if (!newWord.trim() || submitted) return;
        setChain([...chain.slice(0, -1), newWord, chain[chain.length - 1]]);
        setNewWord("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addWord();
        }
    };

    const submitChain = () => {
        socket.emit("submit-chain", { roomId, username, chain });
        setSubmitted(true);
    };

    // const sendMessage = () => {
    //     if (chatInput.trim() !== "") {
    //         socket.emit("send-chat-message", { roomId, username, message: chatInput });
    //         setChatInput("");
    //     }
    // };

    const sendMessage = () => {
        if (chatInput.trim() !== "") {
            socket.emit("send-chat-message", {
                roomId,
                username,
                message: chatInput,
                timestamp: new Date().toLocaleTimeString() // Add timestamp here
            });
            setChatInput("");
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", padding: "20px" }}>
            {/* Left Sidebar - Player List with Scores */}
            <div style={{ width: "200px", textAlign: "left", marginRight: "20px", padding: "10px", borderRight: "2px solid black" }}>
                <h3>Players & Scores</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                        {[...players]
                            .sort((a, b) => (scores[b] || 0) - (scores[a] || 0))
                            .map((player, index) => (
                              <li key={index} style={{ marginBottom: "10px", fontSize: "18px" }}>
                                {player} - <strong>{scores[player] || 0}</strong>
                              </li>
                        ))}
                        
                </ul>
            </div>

            {/* Main Game Section */}
            <div style={{ flex: 1, textAlign: "center" }}>
                <h2>Room ID: {roomId}</h2>

                {timeLeft !== null && <h4>Time Left: {timeLeft}s</h4>}

                {!gameStarted && !isNextRound ? (
                    <div>
                        <h3>Number of Rounds:</h3>
                        <input type="number" value={rounds} onChange={handleSetRounds} disabled={!isCreator} />
                        {isCreator && <button onClick={startGame}>Start Game</button>}
                    </div>
                ) : (
                    <div>
                        <h3>{chain.join(" → ")}</h3>
                        <input 
                            type="text" 
                            placeholder="Enter a linking word" 
                            value={newWord} 
                            onChange={(e) => setNewWord(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={submitted} 
                        />
                        <button onClick={addWord} disabled={submitted}>Add</button>
                        <button onClick={submitChain} disabled={submitted}>Submit</button>
                    </div>
                )}

                {/* Chat Box */}
                <div
                    ref={chatBoxRef}
                    style={{
                        border: "1px solid black",
                        width: "300px",
                        height: "200px",
                        overflowY: "auto",
                        margin: "20px auto",
                        padding: "10px",
                        textAlign: "left",
                        background: "#f9f9f9"
                    }}
                >
                    {chatMessages.map((msg, index) => (
                        <p key={index}>
                            <strong>{msg.username}:</strong> {msg.message} 
                            <span style={{ fontSize: "10px", color: "gray", marginLeft: "10px" }}>
                            {msg.timestamp}
                            </span>
                        </p>
                    ))}
                </div>

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
    );
};

export default Game;