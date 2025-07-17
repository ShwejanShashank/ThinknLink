

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");//for render.com
var isNextRound = false;

const app = express();
app.use(cors());

// for render.com
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
});


const server = http.createServer(app);

const io = new Server(server);//for render.com
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });

const wordList = [
    "Dog", "Car", "Tree", "Book", "Phone", "Table", "Water", "Light",
    "Chair", "House", "Clock", "Road", "Paper", "Shoe", "Laptop", "Bag",
    "School", "Rain", "Sun", "Door", "Glass", "Ball", "Flower", "Bed",
    "Window", "Bridge", "Bottle", "Camera", "Watch", "Pencil", "Fire",
    "Train", "River", "Mountain", "Keyboard", "Mouse", "Speaker", "Hat",
    "Jacket", "Mirror", "Fence", "Cloud", "Sky", "Ocean", "Toothbrush"
];

const wordCategories = {
    animals: ["cat", "dog", "lion", "tiger", "elephant", "giraffe", "zebra",
        "monkey", "panda", "bear", "rabbit", "horse", "kangaroo", "cow", "sheep",
        "goat", "deer", "camel", "wolf", "fox", "leopard", "cheetah", "hippopotamus",
        "rhinoceros", "crocodile", "alligator", "dolphin", "whale", "shark", "penguin",
        "ostrich", "eagle", "parrot", "owl", "bat", "chicken", "duck", "mouse", 
        "rat", "pig", "donkey", "turkey", "bee", "ant", "spider"],
    food: [
        "pizza", "burger", "fries", "biryani", "pasta",
        "sandwich", "noodles", "tacos", "sushi", "dumplings",
        "hotdog", "falafel", "ramen", "pancakes", "waffles",
        "curry", "steak", "salad", "bacon", "meatballs",
        "chicken wings", "fried rice", "mashed potatoes", "spring rolls", "kebab",
        "butter chicken",
        "grilled cheese", "omelette", "mac and cheese"
      ],
    fruits: [
        "mango", "apple", "pineapple", "banana", "grape",
        "orange", "strawberry", "watermelon", "papaya", "kiwi",
        "pomegranate", "cherry", "blueberry", "pear", "guava",
        "peach", "plum", "lychee", "lemon",
        "coconut", "blackberry",
        "custard apple", "grapefruit"
      ],
    celebrities: ["Taylor Swift", "Cristiano Ronaldo", "Snoop Dogg",
        "Tom Cruise", "John Cena", "Donald trump", "Elon Musk", "Jackie Chan",
        "Selena Gomez", "Michael Jackson", "Bruce Lee",
        "Will Smith", "Jennifer Lopez",
        "Justin Bieber", "Virat Kohli", "Kim Kardashian",
        "Rihanna", "Messi", "Lady Gaga",
        "Newton", "Einstein", "Stephen Hawking", "Nikola Tesla",
        "Galileo"
    ],
    countries: [
        "United States", "India", "China", "France",
        "Germany", "Russia", "Japan", "Australia",
        "Brazil", "Italy", "Mexico",
        "Saudi Arabia", "South Africa", "Egypt",
        "Switzerland", "Thailand",
        "Pakistan", "Nigeria"
      ],
    colors: [
        "Red", "Blue", "Green", "Yellow",
        "Purple", "Pink", "Black", "White", "Gray",
        "Brown", "Cyan", "Magenta",
        "Maroon",
        "Violet"
      ],
    sports: [
        "Soccer", "Basketball", "Cricket", "Tennis", "Baseball",
        "Hockey", "Table Tennis", "Volleyball", "Golf",
        "Boxing", "Wrestling", "Skating", "Swimming",
        "Cycling", "Karate", "Chess", "Skiing", "Formula 1",
      ],
    vehicles: [
        "Car", "Bus", "Bicycle", "Motorcycle", "Truck",
        "Scooter", "Train", "Airplane", "Helicopter", "Boat",
        "Ship", "Van", "Tractor", "Ambulance",
        "Taxi", "Skateboard", "Yacht", "Rocket"
      ],
    occupations: [
        "Doctor", "Teacher", "Engineer", "Lawyer", "Chef",
        "Police Officer", "Firefighter", "Nurse", "Pilot", "Farmer",
        "Artist", "Musician", "Actor", "Scientist", "Photographer",
        "Dentist", "Architect", "Mechanic", "Electrician", "Plumber",
        "Writer", "Journalist", "Software Developer", "Cashier"
      ],
    householdItems: [
        "Chair", "Table", "Sofa", "Bed", "Pillow",
        "Blanket", "Lamp", "Mirror",
        "Clock","Curtain", "Carpet", "Broom",
        "Bucket", "Mop", "Towel", "Comb"
      ],
    electronics: [
        "Television", "Refrigerator", "Washing Machine", "Microwave", "Oven",
        "Toaster", "Air Conditioner", "Fan", "Vacuum Cleaner",
        "Hair Dryer", "Electric Kettle", "Blender",
        "Laptop", "Smartphone", "Smartwatch",
        "Printer", "Camera", "Speaker", "Projector",
        "Earphones","Dishwasher", "Coffee Maker","Rice Cooker",
        "Security Camera", "Alarm Clock",
        "Electric Toothbrush", "calendar", "calculator", "torch"
      ],
    alcoholAndRelated: [
        "Wine", "Whiskey", "Vodka", "Tequila",
        "Champagne", "Beer",
        "Cocktail", "Mojito",
        "Cigarette", "Cigar", "Hookah", "Tobacco"
      ],
    instruments: [
        "Piano", "Guitar", "Violin", "Drums", "Flute",
        "Trumpet", "Saxophone"
      ],
    bodyParts: [
        "Head", "Hair", "Face", "Eyes",
        "Ears", "Nose", "Lips", "Teeth", "Tongue",
        "Neck", "Hands",
        "Fingers", "Chest", "Stomach", "Back", "Waist",
        "Hips", "Legs", "Feet",
        "Heart", "Lungs", "Brain", "Skin"
    ],
    mythicalCharacters: [
        "Hercules", "Thor",
        "Jesus", "Buddha"
    ],
    comicCharacters: [
        "Superman", "Batman", "Spider-Man", "Iron Man",
        "Captain America", "Hulk", "Joker", "Aquaman", "Venom", "Mickey Mouse"
    ],
    socialMediaPlatforms: [
        "Facebook", "Instagram", "Twitter", "TikTok", "Snapchat",
        "YouTube", "WhatsApp", "Reddit", "LinkedIn",
        "Discord", "Telegram", "Messenger"
    ]

  };

  const getRandomWordPair = (categories) => {
    const categoryKeys = Object.keys(categories);
  
    // Pick two different random category indices
    let idx1 = Math.floor(Math.random() * categoryKeys.length);
    let idx2;
    do {
      idx2 = Math.floor(Math.random() * categoryKeys.length);
    } while (idx2 === idx1); // ensure different categories
  
    const cat1 = categoryKeys[idx1];
    const cat2 = categoryKeys[idx2];
  
    // Pick random word from each category
    const word1 = categories[cat1][Math.floor(Math.random() * categories[cat1].length)];
    const word2 = categories[cat2][Math.floor(Math.random() * categories[cat2].length)];
  
    return [word1, word2];
  }

  const [startWord, endWord] = getRandomWordPair(wordCategories);
  console.log("Start:", startWord);
  console.log("End:", endWord);

let rooms = {};


const getRandomWords = () => {
    let firstIndex = Math.floor(Math.random() * wordList.length);
    let secondIndex;
    do {
        secondIndex = Math.floor(Math.random() * wordList.length);
    } while (secondIndex === firstIndex);
    return [wordList[firstIndex], wordList[secondIndex]];
};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    console.log("----------------------------------------------------------------");

    socket.on("create-room", ({ roomId, username }) => {
        rooms[roomId] = { 
            players: {}, 
            submissions: [], 
            creator: socket.id, 
            rounds: 1, 
            currentRound: 0,
            gameStarted: false,
            timerStarted: false,
            words: [],
            chat: [],
            timer: null,
            userScores: {},
            votes: {},
            userVotes: {},
            playersVoted: new Set(),
            newRoomId: "",
            timeLeft: 10
        };

        rooms[roomId].players[socket.id] = username;
        socket.join(roomId);

        io.to(roomId).emit("update-players", Object.values(rooms[roomId].players), rooms[roomId].userScores);
        io.to(roomId).emit("update-rounds", { rounds: rooms[roomId].rounds, creator: rooms[roomId].creator });
        io.to(socket.id).emit("chat-history", rooms[roomId].chat);
    });

    socket.on("join-room-validation", ({ roomId, username }, callback) => {
        if (!rooms[roomId]) {
            if (typeof callback === "function") {
                callback({ success: false, message: "Invalid Room ID! Room does not exist." });
            }
            return;
        }

        if (rooms[roomId].gameStarted) {
            if (typeof callback === "function") {
                callback({ success: false, message: "Game has already started. You can't join this room now." });
            }
            return;
        }
        socket.broadcast.to(roomId).emit("player-joined", { username });

        if (typeof callback === "function") {
            callback({ success: true });
        }
    });
    

    socket.on("join-room", ({ roomId, username }, callback) => {
        // if (!rooms[roomId]) {
        //     if (typeof callback === "function") {
        //         callback({ success: false, message: "Invalid Room ID! Room does not exist." });
        //     }
        //     return;
        // }

        // if (rooms[roomId].gameStarted) {
        //     if (typeof callback === "function") {
        //         callback({ success: false, message: "Game has already started. You can't join this room now." });
        //     }
        //     return;
        // }

        

        rooms[roomId].players[socket.id] = username;
        socket.join(roomId);

        io.to(roomId).emit("update-players", Object.values(rooms[roomId].players));


        io.to(roomId).emit("update-rounds", { rounds: rooms[roomId].rounds});
        
        io.to(socket.id).emit("chat-history", rooms[roomId].chat);

        


        if(rooms[roomId].currentRound===0)
        {
            Object.values(rooms[roomId].players).forEach((player) => {
                if(rooms[roomId].userScores[player]==null)
                rooms[roomId].userScores[player] = 0;
            });
            io.to(roomId).emit("creator", { creator: rooms[roomId].creator });
        }


        io.to(socket.id).emit("update-scores", rooms[roomId].userScores);



        if (typeof callback === "function") {
            callback({ success: true });
        }

        // // If game is ongoing, send full game state to the joining player
        // if (rooms[roomId].gameStarted) {
        //     const gameState = {
        //         words: rooms[roomId].words,
        //         chat: rooms[roomId].chat,
        //         scores: rooms[roomId].userScores,
        //         timeLeft: rooms[roomId].timeLeft || 0,
        //         submittedPlayers: Array.from(rooms[roomId].playersVoted), // as usernames
        //         submissions: rooms[roomId].submissions
        //     };

        //     io.to(socket.id).emit("game-state", gameState);
        // }
    });

    // socket.on("send-chat-message", ({ roomId, username, message }) => {
    //     if (!rooms[roomId]) return;

    //     const chatMessage = { username, message, timestamp: new Date().toLocaleTimeString() };
    //     rooms[roomId].chat.push(chatMessage);  // Store message in chat history

    //     io.to(roomId).emit("receive-chat-message", chatMessage);
    // });

    socket.on("send-chat-message", ({ roomId, username, message, timestamp, type }) => {
        if (!rooms[roomId]) return;
    
        const chatMessage = { username, message, timestamp, type };
        rooms[roomId].chat.push(chatMessage);
    
        io.to(roomId).emit("receive-chat-message", chatMessage);
    });

    socket.on("set-rounds", ({ roomId, rounds }) => {
        if (rooms[roomId] && socket.id === rooms[roomId].creator) {
            rooms[roomId].rounds = rounds;
            io.to(roomId).emit("update-rounds", { rounds: rooms[roomId].rounds, creator: rooms[roomId].creator });
        }
    });

    socket.on("start-game", ({ roomId,duration }) => {
        // if(Object.keys(rooms[roomId].players).length <= 2){
    
        //     io.to(roomId).emit("cannot-start-game");
        //     return;
        // }
    
        if (rooms[roomId] && socket.id === rooms[roomId].creator) {
            rooms[roomId].currentRound = 0;
            rooms[roomId].duration = duration || 10; // use passed or fallback
            rooms[roomId].gameStarted = true;
            rooms[roomId].words = getRandomWordPair(wordCategories);
            rooms[roomId].submissions = [];
            rooms[roomId].timerStarted = false;
            io.to(roomId).emit("game-started", rooms[roomId].words, rooms[roomId].currentRound+1,rooms[roomId].duration);
        }
    });
    // socket.on("start-game", ({ roomId, duration }) => {
    //     if (rooms[roomId] && socket.id === rooms[roomId].creator) {
    //         const room = rooms[roomId];

    //         room.gameStarted = true;
    //         room.currentRound = 1;
    //         room.duration = duration;
    //         room.words = getRandomWordPair(wordCategories);
    //         room.submissions = [];
    //         room.timerStarted = true;

    //         // Notify clients to start game + timer
    //         io.to(roomId).emit("game-started", room.words, room.currentRound);
    //         io.to(roomId).emit("start-timer", room.duration);

    //         let countdown = room.duration;

    //         room.timer = setInterval(() => {
    //             countdown--;

    //             if (
    //                 countdown === 0 ||
    //                 room.submissions.length === Object.keys(room.players).length
    //             ) {
    //                 clearInterval(room.timer);

    //                 console.log("INSIDE IF COUNTDOWN = 0");

    //                 // Auto-submit for players who missed
    //                 Object.keys(room.players).forEach((playerId) => {
    //                     const uname = room.players[playerId];
    //                     if (!room.submissions.find((s) => s.username === uname)) {
    //                         room.submissions.push({ username: uname, chain: ["No Submission"] });
    //                     }
    //                 });

    //                 console.log("SUBMISSIONS: ", room.submissions);

    //                 // Emit results or next round
    //                 if (room.currentRound < room.rounds) {
    //                     room.currentRound++;
    //                     room.words = getRandomWordPair(wordCategories);
    //                     // room.submissions = [];
    //                     room.timerStarted = false;
    //                     room.votes = {};
    //                     room.userVotes = {};
    //                     room.playersVoted = new Set();

    //                     io.to(roomId).emit("next-round", room.words);
    //                 } else {
    //                     io.to(roomId).emit("final-scores", room.userScores);
    //                     io.to(roomId).emit("game-over");
    //                 }
    //             }
    //         }, 1000);
    //     }
    // });



    socket.on("next-round-game", ({ roomId }) => {
            
            room = rooms[roomId];
            rooms[roomId].gameStarted = true;
            // rooms[roomId].words = getRandomWords();
            rooms[roomId].submissions = [];
            rooms[roomId].timerStarted = false;
            rooms[roomId].playersVoted = new Set();
            rooms[roomId].votes = {};
            rooms[roomId].userVotes = {};
            io.to(roomId).emit("game-started", rooms[roomId].words, rooms[roomId].currentRound+1);

            console.log(rooms[roomId].players);
            console.log("------------------------------------------");

            io.to(roomId).emit("update-players", Object.values(rooms[roomId].players));
            io.to(socket.id).emit("update-scores", rooms[roomId].userScores);


            io.to(roomId).emit("update-rounds", { rounds: rooms[roomId].rounds});
            
            io.to(socket.id).emit("chat-history", rooms[roomId].chat);


            
            if (typeof callback === "function") {
                callback({ success: true });
            }

        
    });

    socket.on("submit-chain", ({ roomId, username, chain }) => {
        if (!rooms[roomId]) return;
    
    
    
        // Add the submission if it does not already exist
        const existingSubmission = rooms[roomId].submissions.find(sub => sub.username === username);
        if (!existingSubmission) {
            rooms[roomId].submissions.push({ username, chain });
        }
    
        // Start the timer only once per round
        if (!rooms[roomId].timerStarted) {
            rooms[roomId].timerStarted = true;
            let countdown = rooms[roomId].duration;
            // Set to 30 in production
    
            io.to(roomId).emit("start-timer", countdown);
    
            const timer = setInterval(() => {
                countdown--;
                // io.to(roomId).emit("start-timer", countdown);
    
                if (countdown === 0 || rooms[roomId].submissions.length === Object.keys(rooms[roomId].players).length) {
                    clearInterval(timer);
    
                    // Auto-generate missing submissions
                    Object.keys(rooms[roomId].players).forEach((playerId) => {
                        const username = rooms[roomId].players[playerId];
    
                        if (!rooms[roomId].submissions.some(sub => sub.username === username)) {
                            rooms[roomId].submissions.push({
                                username,
                                chain: ["No Submission"]
                            });
                        }
                    });
    
                    // Send results to all players
                    // Changed (Commented)
                    // io.to(roomId).emit("results", rooms[roomId].submissions);
                    // io.to(roomId).emit("results-players", Object.values(rooms[roomId].players));
    
                    // End game after showing results
                    // setTimeout(() => {
                    //     io.to(roomId).emit("game-over");
                    // }, 5000);
    
    
                    // After voting is complete and votes are revealed
                        const room = rooms[roomId];
    
    
                        if (room.currentRound < room.rounds) {
                            room.currentRound++;
                            room.words = getRandomWordPair(wordCategories);

    
                            // room.submissions = [];
                            // room.timerStarted = false;
                            // room.votes = {};
                            // room.userVotes = {};
                            // room.playersVoted = new Set();
                            isNextRound = true;
                            io.to(roomId).emit("next-round", room.words);
                        }
    
                        // } else {
                        //     console.log("Game Over");
                        //     io.to(roomId).emit("final-scores", room.userScores);
                        //     io.to(roomId).emit("game-over");
                        // }
                }
            }, 1000);
        }
    });
    // socket.on("submit-chain", ({ roomId, username, chain }) => {
    //     if (!rooms[roomId]) return;

    //     const existing = rooms[roomId].submissions.find((sub) => sub.username === username);
    //     if (!existing) {
    //         rooms[roomId].submissions.push({ username, chain });
    //     }
    // });


    socket.on("get-results", ({ roomId }) => {
        console.log("Room ID: ", rooms[roomId]);
        if (rooms[roomId]) {
            io.to(socket.id).emit("results", rooms[roomId].submissions);
            io.to(socket.id).emit("chat-history", rooms[roomId].chat);
        }
    });



    // socket.on("vote", ({ roomId, votedChain, username }) => {
    //     if (!rooms[roomId]) return;
    
    //     // if (!rooms[roomId].votes) rooms[roomId].votes = {};
    //     // if (!rooms[roomId].userVotes) rooms[roomId].userVotes = {};
    //     // if (!rooms[roomId].playersVoted) rooms[roomId].playersVoted = new Set();
    //     // if (!rooms[roomId].userScores) rooms[roomId].userScores = {};
    //     // rooms[roomId].userScores = {};

    
    //     // Store vote count
    //     if (!rooms[roomId].votes[votedChain]) {
    //         rooms[roomId].votes[votedChain] = 0;
    //     }
    //     rooms[roomId].votes[votedChain]++;

    //     //User Scores
    //     // if (!rooms[roomId].userScores[username]) {
    //     //     rooms[roomId].userScores[username] = 0;
    //     //     console.log("User scores are set to 0");
    //     // }
    
       


    
    //     // Track who voted whom
    //     if (!rooms[roomId].userVotes[votedChain]) {
    //         rooms[roomId].userVotes[votedChain] = [];
    //     }
    //     rooms[roomId].userVotes[votedChain].push(username);
    
    //     // Mark the player as voted
    //     rooms[roomId].playersVoted.add(username);
    
    //     io.to(roomId).emit("vote-update", rooms[roomId].votes);
    //     io.to(roomId).emit("vote-count", rooms[roomId].playersVoted);


    //     console.log("votes: ", rooms[roomId].votes);
    //     console.log("uservotes: ", rooms[roomId].userVotes);
    //     console.log("playersvoted: ", rooms[roomId].playersVoted);

    
    //     // **Only reveal votes once every player has voted**
    //     if (rooms[roomId].playersVoted.size === Object.keys(rooms[roomId].players).length) {

            

    //         // const scoreMap = {};
    //         // rooms[roomId].submissions.forEach(item => {
    //         // scoreMap[item.username] = rooms[roomId].votes[item.chain]*10 || 0;
    //         // });

    //         // rooms[roomId].userScores = scoreMap;

            
    //         rooms[roomId].submissions.forEach(item => {

    //             console.log("User Scores:", rooms[roomId].userScores[item.username]);

    //         if(rooms[roomId].currentRound===1)
    //         rooms[roomId].userScores[item.username] = rooms[roomId].votes[item.chain]*10 || 0;
    //         else
    //         rooms[roomId].userScores[item.username] = rooms[roomId].userScores[item.username] + rooms[roomId].votes[item.chain]*10;
    //         });

            
           
            
    //         setTimeout(() => {
    //             console.log(rooms[roomId].userScores);
    //             console.log("Votes: ", rooms[roomId].userVotes)
    //         }, 1000);
            


    //         io.to(roomId).emit("reveal-votes", rooms[roomId].userVotes, rooms[roomId].userScores);

    //         if(rooms[roomId].currentRound>=rooms[roomId].rounds){
    //             console.log("Game Over");
    //             io.to(roomId).emit("game-over");
                
    //         }
    //     }
    // });

    socket.on("vote", ({ roomId, votedChain, votedFor, username }) => {
        if (!rooms[roomId]) return;
      
        const room = rooms[roomId];
        const votedUser = votedFor; // now passed directly from client
      
        if (!votedUser) {
          console.error("No voted user received");
          return;
        }
      
        // Initialize vote map
        if (!room.votes[votedUser]) room.votes[votedUser] = 0;
        room.votes[votedUser]++;
        console.log("VOTEEEEEEE ", room.votes[votedUser])
      
        if (!room.userVotes[votedUser]) room.userVotes[votedUser] = [];
        room.userVotes[votedUser].push(username);
        console.log("USER VOTESSSSŚ", room.userVotes);
      
        room.playersVoted.add(username);
        io.to(roomId).emit("vote-update", room.votes);
        io.to(roomId).emit("vote-count", room.playersVoted);
      
        if (room.playersVoted.size === Object.keys(room.players).length) {
          room.submissions.forEach((sub) => {
            const user = sub.username;
            const votePoints = (room.votes[user] || 0) * 10;
            if (room.currentRound === 1) room.userScores[user] = votePoints;
            else room.userScores[user] += votePoints;
          });
      
          io.to(roomId).emit("reveal-votes", room.userVotes, room.userScores);
          if (room.currentRound >= room.rounds) {
            io.to(roomId).emit("game-over");
          }
        }
      });

    socket.on("get-final-scores", ({ roomId }) => {
        if (rooms[roomId] && rooms[roomId].userScores) {
            io.to(socket.id).emit("final-scores", rooms[roomId].userScores);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (const roomId in rooms) {
            if (rooms[roomId].players[socket.id]) {
                delete rooms[roomId].players[socket.id];
                if (Object.keys(rooms[roomId].players).length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit("update-players", Object.values(rooms[roomId].players));
                }
            }
        }
    });


server.listen(5001, () => {
    console.log("Server running on port 5001");
});
