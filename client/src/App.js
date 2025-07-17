



import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Game from "./components/Game";
import Results from "./components/Results";

import { io } from "socket.io-client";
import FinalScores from "./components/FinalScores";
//for render.com
const socket = io({
    autoConnect: false,
});
// const socket = io("http://localhost:5001", {
//     autoConnect: false, // important
//     });



const AppWrapper = () => {





  const navigate = useNavigate();

  useEffect(() => {
    if (performance.navigation.type === 1) {
      // Reload detected
      window.location.href = "http://localhost:3000/";
    } else {
      if (!socket.connected) {
        socket.connect();
      }
    }
  }, []);


  useEffect(() => {
    const handleBackButton = (event) => {
        window.location.href = "/"; 
    };

    window.history.pushState(null, "", window.location.href);
  
    window.addEventListener("popstate", handleBackButton);
  
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);



  return (
    <Routes>
      <Route path="/" element={<Home socket={socket} />} />
      <Route path="/game/:roomId" element={<Game socket={socket} />} />
      <Route path="/results/:roomId" element={<Results socket={socket} />} />
      <Route path="/final-scores/:roomId" element={<FinalScores socket={socket} />} />
    </Routes>
  );
};

const App = () => (

    <AppWrapper />

);

export default App;
