/* =========================================
   MEMORY RUSH — ARCADE EDITION
   Game Logic
========================================= */


/* =========================================
   GAME DATA
========================================= */

const themes = {

    emoji: [
        "🚀",
        "👾",
        "🔥",
        "💎",
        "🎯",
        "⚡",
        "🧠",
        "🎮",
        "🌈",
        "🍕",
        "🦄",
        "👑",
        "🎧",
        "💫",
        "🛸",
        "🍀",
        "🌙",
        "☀️"
    ],

    dev: [
        "HTML",
        "CSS",
        "JS",
        "Java",
        "C++",
        "C",
        "Git",
        "GitHub",
        "SQL",
        "React",
        "Node",
        "Python",
        "PHP",
        "API",
        "Linux",
        "VS Code",
        "npm",
        "Docker"
    ],

    animal: [
        "🐶",
        "🐱",
        "🦊",
        "🐼",
        "🐯",
        "🦁",
        "🐸",
        "🐵",
        "🐨",
        "🐰",
        "🦄",
        "🐙",
        "🦋",
        "🐢",
        "🦉",
        "🐬",
        "🦈",
        "🐝"
    ]

};


/* =========================================
   DIFFICULTY SETTINGS
========================================= */

const difficulties = {

    easy: {
        rows: 3,
        cols: 4,
        pairs: 6,
        baseScore: 100
    },

    medium: {
        rows: 4,
        cols: 4,
        pairs: 8,
        baseScore: 150
    },

    hard: {
        rows: 6,
        cols: 6,
        pairs: 18,
        baseScore: 250
    }

};


/* =========================================
   DOM ELEMENTS
========================================= */

const startScreen =
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

const winScreen =
    document.getElementById("winScreen");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const homeBtn =
    document.getElementById("homeBtn");

const playAgainBtn =
    document.getElementById("playAgainBtn");

const changeSettingsBtn =
    document.getElementById("changeSettingsBtn");

const gameBoard =
    document.getElementById("gameBoard");

const timerElement =
    document.getElementById("timer");

const movesElement =
    document.getElementById("moves");

const accuracyElement =
    document.getElementById("accuracy");

const scoreElement =
    document.getElementById("score");

const comboContainer =
    document.getElementById("comboContainer");

const comboText =
    document.getElementById("comboText");

const peekBtn =
    document.getElementById("peekBtn");

const freezeBtn =
    document.getElementById("freezeBtn");

const customUpload =
    document.getElementById("customUpload");

const imageInput =
    document.getElementById("imageInput");

const uploadStatus =
    document.getElementById("uploadStatus");

const finalScore =
    document.getElementById("finalScore");

const finalTime =
    document.getElementById("finalTime");

const finalMoves =
    document.getElementById("finalMoves");

const finalAccuracy =
    document.getElementById("finalAccuracy");

const finalCombo =
    document.getElementById("finalCombo");

const achievementsContainer =
    document.getElementById("achievements");

const recordMessage =
    document.getElementById("recordMessage");

const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastText =
    document.getElementById("toastText");

const confettiContainer =
    document.getElementById("confettiContainer");


/* =========================================
   GAME STATE
========================================= */

let selectedDifficulty = "easy";
let selectedTheme = "emoji";

let cards = [];

let firstCard = null;
let secondCard = null;

let lockBoard = false;

let moves = 0;
let matches = 0;

let combo = 0;
let bestCombo = 0;

let score = 0;

let seconds = 0;
let timerInterval = null;

let gameStarted = false;
let gameFinished = false;

let peekUsed = false;
let freezeUsed = false;
let timeFrozen = false;

let customImages = [];

let currentFlipSound = null;


/* =========================================
   EVENT LISTENERS
========================================= */


/* Difficulty */

document
    .querySelectorAll("#difficultyChoices .choice")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll("#difficultyChoices .choice")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            selectedDifficulty =
                button.dataset.difficulty;

        });

    });


/* Theme */

document
    .querySelectorAll("#themeChoices .choice")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll("#themeChoices .choice")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            selectedTheme =
                button.dataset.theme;

            if (selectedTheme === "custom") {

                customUpload.classList.remove("hidden");

            } else {

                customUpload.classList.add("hidden");

            }

        });

    });


/* Image upload */

imageInput.addEventListener("change", handleImageUpload);


/* Buttons */

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", restartGame);

homeBtn.addEventListener("click", goHome);

playAgainBtn.addEventListener("click", () => {

    startGame();

});

changeSettingsBtn.addEventListener("click", goHome);

peekBtn.addEventListener("click", usePeek);

freezeBtn.addEventListener("click", useFreeze);


/* =========================================
   IMAGE UPLOAD
========================================= */

function handleImageUpload(event) {

    const files =
        Array.from(event.target.files);

    const maxImages =
        difficulties[selectedDifficulty].pairs;

    if (files.length < maxImages) {

        uploadStatus.textContent =
            `Please select at least ${maxImages} images for ${selectedDifficulty}.`;

        uploadStatus.style.color =
            "var(--red)";

        customImages = [];

        return;
    }

    const selectedFiles =
        files.slice(0, maxImages);

    customImages = [];

    let loaded = 0;

    selectedFiles.forEach(file => {

        const reader =
            new FileReader();

        reader.onload = e => {

            customImages.push(e.target.result);

            loaded++;

            if (loaded === selectedFiles.length) {

                uploadStatus.textContent =
                    `${loaded} images ready! Let's play.`;

                uploadStatus.style.color =
                    "var(--green)";

            }

        };

        reader.readAsDataURL(file);

    });

}


/* =========================================
   START GAME
========================================= */

function startGame() {

    if (
        selectedTheme === "custom" &&
        customImages.length <
            difficulties[selectedDifficulty].pairs
    ) {

        showToast(
            "⚠️",
            `Upload ${difficulties[selectedDifficulty].pairs} images first.`
        );

        return;
    }

    showScreen(gameScreen);

    resetGameState();

    createBoard();

    startTimer();

    gameStarted = true;

    /* Memory Scan automatically reveals cards
       for 2 seconds at the beginning */

    setTimeout(() => {

        revealInitialPeek();

    }, 350);

}


/* =========================================
   RESET GAME STATE
========================================= */

function resetGameState() {

    clearInterval(timerInterval);

    firstCard = null;
    secondCard = null;

    lockBoard = false;

    moves = 0;
    matches = 0;

    combo = 0;
    bestCombo = 0;

    score = 0;

    seconds = 0;

    gameStarted = false;
    gameFinished = false;

    peekUsed = false;
    freezeUsed = false;
    timeFrozen = false;

    timerElement.textContent =
        "00:00";

    movesElement.textContent =
        "0";

    accuracyElement.textContent =
        "100%";

    scoreElement.textContent =
        "0";

    comboContainer.classList.remove("show");

    peekBtn.disabled = false;

    freezeBtn.disabled = false;

    peekBtn.querySelector(".powerup-count").textContent =
        "1";

    freezeBtn.querySelector(".powerup-count").textContent =
        "1";

}


/* =========================================
   CREATE BOARD
========================================= */

function createBoard() {

    gameBoard.innerHTML = "";

    const settings =
        difficulties[selectedDifficulty];

    gameBoard.className =
        `game-board ${selectedDifficulty}`;

    let symbols;

    if (selectedTheme === "custom") {

        symbols = customImages.slice(
            0,
            settings.pairs
        );

    } else {

        symbols =
            themes[selectedTheme].slice(
                0,
                settings.pairs
            );

    }

    cards =
        [...symbols, ...symbols];

    shuffle(cards);

    cards.forEach((symbol, index) => {

        const card =
            createCard(symbol, index);

        gameBoard.appendChild(card);

    });

}


/* =========================================
   CREATE CARD
========================================= */

function createCard(symbol, index) {

    const card =
        document.createElement("div");

    card.className = "card";

    card.dataset.symbol =
        symbol;

    card.dataset.index =
        index;


    const back =
        document.createElement("div");

    back.className =
        "card-face card-back";


    const front =
        document.createElement("div");

    front.className =
        "card-face card-front";


    if (selectedTheme === "custom") {

        const image =
            document.createElement("img");

        image.src =
            symbol;

        image.alt =
            "Custom memory card";

        front.appendChild(image);

    } else {

        const symbolElement =
            document.createElement("span");

        symbolElement.className =
            "symbol";

        symbolElement.textContent =
            symbol;

        front.appendChild(symbolElement);

    }


    card.appendChild(back);

    card.appendChild(front);

    card.addEventListener(
        "click",
        () => flipCard(card)
    );

    return card;

}


/* =========================================
   FLIP CARD
========================================= */

function flipCard(card) {

    if (
        lockBoard ||
        card === firstCard ||
        card.classList.contains("matched") ||
        card.classList.contains("flipped") ||
        gameFinished
    ) {

        return;

    }

    playSound("flip");

    card.classList.add("flipped");


    if (!firstCard) {

        firstCard = card;

        return;

    }


    secondCard = card;

    moves++;

    updateStats();

    checkForMatch();

}


/* =========================================
   CHECK MATCH
========================================= */

function checkForMatch() {

    lockBoard = true;

    const isMatch =
        firstCard.dataset.symbol ===
        secondCard.dataset.symbol;


    if (isMatch) {

        handleMatch();

    } else {

        handleWrong();

    }

}


/* =========================================
   MATCH
========================================= */

function handleMatch() {

    matches++;

    combo++;

    bestCombo =
        Math.max(bestCombo, combo);


    firstCard.classList.add("matched");

    secondCard.classList.add("matched");


    /* Score */

    const settings =
        difficulties[selectedDifficulty];

    const comboBonus =
        combo * 25;

    const speedBonus =
        Math.max(
            0,
            100 - seconds
        );

    score +=
        settings.baseScore +
        comboBonus +
        speedBonus;


    playSound("match");

    showCombo();

    updateStats();


    setTimeout(() => {

        resetTurn();

        if (
            matches ===
            difficulties[selectedDifficulty].pairs
        ) {

            finishGame();

        }

    }, 350);

}


/* =========================================
   WRONG MATCH
========================================= */

function handleWrong() {

    combo = 0;

    firstCard.classList.add("wrong");

    secondCard.classList.add("wrong");

    playSound("wrong");

    showToast(
        "💥",
        "Wrong match! Combo reset."
    );


    setTimeout(() => {

        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");

        firstCard.classList.remove("wrong");
        secondCard.classList.remove("wrong");

        resetTurn();

    }, 750);

}


/* =========================================
   RESET TURN
========================================= */

function resetTurn() {

    firstCard = null;

    secondCard = null;

    lockBoard = false;

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    movesElement.textContent =
        moves;

    scoreElement.textContent =
        score.toLocaleString();


    let accuracy = 100;

    if (moves > 0) {

        accuracy =
            Math.round(
                (matches / moves) * 100
            );

    }

    accuracy =
        Math.min(100, accuracy);

    accuracyElement.textContent =
        `${accuracy}%`;

}


/* =========================================
   COMBO DISPLAY
========================================= */

function showCombo() {

    if (combo < 2) {

        comboContainer.classList.remove(
            "show"
        );

        return;

    }

    comboText.textContent =
        `🔥 COMBO ×${combo}`;

    comboContainer.classList.add(
        "show"
    );

    setTimeout(() => {

        comboContainer.classList.remove(
            "show"
        );

    }, 900);

}


/* =========================================
   TIMER
========================================= */

function startTimer() {

    clearInterval(timerInterval);

    timerInterval =
        setInterval(() => {

            if (
                !gameStarted ||
                gameFinished ||
                timeFrozen
            ) {

                return;

            }

            seconds++;

            updateTimer();

        }, 1000);

}


function updateTimer() {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

}


/* =========================================
   INITIAL MEMORY SCAN
========================================= */

function revealInitialPeek() {

    const allCards =
        document.querySelectorAll(".card");

    allCards.forEach(card =>
        card.classList.add("flipped")
    );

    showToast(
        "👀",
        "MEMORY SCAN ACTIVATED!"
    );


    setTimeout(() => {

        allCards.forEach(card => {

            if (
                !card.classList.contains("matched")
            ) {

                card.classList.remove(
                    "flipped"
                );

            }

        });

        gameStarted = true;

    }, 2000);

}


/* =========================================
   PEEK POWER-UP
========================================= */

function usePeek() {

    if (
        peekUsed ||
        lockBoard ||
        gameFinished
    ) {

        return;

    }

    peekUsed = true;

    peekBtn.disabled = true;

    peekBtn.querySelector(
        ".powerup-count"
    ).textContent = "0";


    const allCards =
        document.querySelectorAll(".card");


    allCards.forEach(card => {

        if (
            !card.classList.contains("matched")
        ) {

            card.classList.add(
                "flipped"
            );

        }

    });


    playSound("powerup");

    showToast(
        "👀",
        "MEMORY SCAN — 2 SECONDS!"
    );


    setTimeout(() => {

        allCards.forEach(card => {

            if (
                !card.classList.contains("matched")
            ) {

                card.classList.remove(
                    "flipped"
                );

            }

        });

    }, 2000);

}


/* =========================================
   FREEZE TIME
========================================= */

function useFreeze() {

    if (
        freezeUsed ||
        gameFinished
    ) {

        return;

    }

    freezeUsed = true;

    freezeBtn.disabled = true;

    freezeBtn.querySelector(
        ".powerup-count"
    ).textContent = "0";


    timeFrozen = true;

    playSound("powerup");

    showToast(
        "❄️",
        "TIME FROZEN — 5 SECONDS!"
    );


    setTimeout(() => {

        timeFrozen = false;

        showToast(
            "▶️",
            "TIME RESUMED!"
        );

    }, 5000);

}


/* =========================================
   FINISH GAME
========================================= */

function finishGame() {

    gameFinished = true;

    gameStarted = false;

    clearInterval(timerInterval);

    playSound("win");

    createConfetti();

    const accuracy =
        moves > 0
            ? Math.min(
                100,
                Math.round(
                    (matches / moves) * 100
                )
            )
            : 100;


    /* Final bonus */

    const difficultyBonus = {

        easy: 100,

        medium: 250,

        hard: 500

    };

    score +=
        difficultyBonus[selectedDifficulty];


    /* Perfect bonus */

    if (accuracy === 100) {

        score += 500;

    }


    finalScore.textContent =
        score.toLocaleString();

    finalTime.textContent =
        formatTime(seconds);

    finalMoves.textContent =
        moves;

    finalAccuracy.textContent =
        `${accuracy}%`;

    finalCombo.textContent =
        `×${bestCombo}`;


    saveBestScore(
        selectedDifficulty,
        seconds,
        moves
    );


    checkAchievements(
        accuracy
    );


    setTimeout(() => {

        showScreen(winScreen);

    }, 500);

}


/* =========================================
   ACHIEVEMENTS
========================================= */

function checkAchievements(accuracy) {

    achievementsContainer.innerHTML = "";


    const achievements = [

        {
            name: "Speed Demon",
            icon: "⚡",
            unlocked:
                seconds <=
                (
                    selectedDifficulty === "easy"
                        ? 25
                        : selectedDifficulty === "medium"
                            ? 45
                            : 90
                )
        },

        {
            name: "Sharp Memory",
            icon: "🧠",
            unlocked:
                accuracy >= 90
        },

        {
            name: "Combo King",
            icon: "🔥",
            unlocked:
                bestCombo >= 3
        },

        {
            name: "Perfect Recall",
            icon: "💎",
            unlocked:
                accuracy === 100
        }

    ];


    achievements.forEach(
        (achievement, index) => {

            const element =
                document.createElement("div");

            element.className =
                "achievement";

            if (achievement.unlocked) {

                element.classList.add(
                    "unlocked"
                );

            }

            element.style.animationDelay =
                `${index * 80}ms`;

            element.innerHTML = `
                <span class="achievement-icon">
                    ${achievement.icon}
                </span>

                <span>
                    ${achievement.name}
                </span>
            `;

            achievementsContainer.appendChild(
                element
            );

        }
    );

}


/* =========================================
   BEST SCORE / LOCAL STORAGE
========================================= */

function getBestScores() {

    const saved =
        localStorage.getItem(
            "memoryRushBestScores"
        );

    return saved
        ? JSON.parse(saved)
        : {};
}


function saveBestScore(
    difficulty,
    time,
    moves
) {

    const bestScores =
        getBestScores();

    const old =
        bestScores[difficulty];


    let isNewRecord = false;


    if (!old) {

        isNewRecord = true;

    } else if (
        time < old.time ||
        (
            time === old.time &&
            moves < old.moves
        )
    ) {

        isNewRecord = true;

    }


    if (isNewRecord) {

        bestScores[difficulty] = {
            time,
            moves
        };

        localStorage.setItem(
            "memoryRushBestScores",
            JSON.stringify(bestScores)
        );

        recordMessage.classList.remove(
            "hidden"
        );

    } else {

        recordMessage.classList.add(
            "hidden"
        );

    }

}


/* =========================================
   RESTART
========================================= */

function restartGame() {

    startGame();

}


/* =========================================
   HOME
========================================= */

function goHome() {

    clearInterval(timerInterval);

    gameFinished = true;

    showScreen(startScreen);

}


/* =========================================
   SCREEN SWITCHER
========================================= */

function showScreen(screen) {

    [
        startScreen,
        gameScreen,
        winScreen
    ].forEach(element => {

        element.classList.remove(
            "active"
        );

    });

    screen.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   SHUFFLE
========================================= */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];

    }

    return array;

}


/* =========================================
   TIME FORMAT
========================================= */

function formatTime(totalSeconds) {

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const secondsPart =
        totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secondsPart).padStart(2, "0")}`;

}


/* =========================================
   TOAST
========================================= */

let toastTimeout;

function showToast(icon, message) {

    clearTimeout(toastTimeout);

    toastIcon.textContent =
        icon;

    toastText.textContent =
        message;

    toast.classList.add("show");


    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2200);

}


/* =========================================
   WEB AUDIO API
========================================= */

let audioContext = null;


function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }

    return audioContext;

}


function playSound(type) {

    try {

        const ctx =
            getAudioContext();

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();


        oscillator.connect(gain);

        gain.connect(ctx.destination);


        const now =
            ctx.currentTime;


        if (type === "flip") {

            oscillator.type =
                "sine";

            oscillator.frequency.setValueAtTime(
                400,
                now
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                650,
                now + 0.08
            );

            gain.gain.setValueAtTime(
                0.0001,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                0.07,
                now + 0.01
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.1
            );

            oscillator.start(now);

            oscillator.stop(
                now + 0.11
            );

        }


        else if (type === "match") {

            oscillator.type =
                "triangle";

            oscillator.frequency.setValueAtTime(
                500,
                now
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                900,
                now + 0.12
            );

            gain.gain.setValueAtTime(
                0.0001,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                0.12,
                now + 0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.25
            );

            oscillator.start(now);

            oscillator.stop(
                now + 0.26
            );

        }


        else if (type === "wrong") {

            oscillator.type =
                "sawtooth";

            oscillator.frequency.setValueAtTime(
                220,
                now
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                100,
                now + 0.2
            );

            gain.gain.setValueAtTime(
                0.0001,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                0.08,
                now + 0.01
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.22
            );

            oscillator.start(now);

            oscillator.stop(
                now + 0.23
            );

        }


        else if (type === "powerup") {

            oscillator.type =
                "sine";

            oscillator.frequency.setValueAtTime(
                450,
                now
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                1000,
                now + 0.3
            );

            gain.gain.setValueAtTime(
                0.0001,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                0.1,
                now + 0.03
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.35
            );

            oscillator.start(now);

            oscillator.stop(
                now + 0.36
            );

        }


        else if (type === "win") {

            playWinMelody(ctx);

        }

    } catch (error) {

        console.log(
            "Audio unavailable:",
            error
        );

    }

}


/* =========================================
   WIN MELODY
========================================= */

function playWinMelody(ctx) {

    const notes = [
        523.25,
        659.25,
        783.99,
        1046.5
    ];

    notes.forEach(
        (frequency, index) => {

            const oscillator =
                ctx.createOscillator();

            const gain =
                ctx.createGain();

            oscillator.connect(gain);

            gain.connect(
                ctx.destination
            );

            const start =
                ctx.currentTime +
                index * 0.12;

            oscillator.type =
                "triangle";

            oscillator.frequency.value =
                frequency;

            gain.gain.setValueAtTime(
                0.0001,
                start
            );

            gain.gain.exponentialRampToValueAtTime(
                0.12,
                start + 0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                start + 0.25
            );

            oscillator.start(start);

            oscillator.stop(
                start + 0.26
            );

        }
    );

}


/* =========================================
   CONFETTI
========================================= */

function createConfetti() {

    confettiContainer.innerHTML = "";

    const pieces = 100;

    for (
        let i = 0;
        i < pieces;
        i++
    ) {

        const piece =
            document.createElement("div");

        piece.className =
            "confetti";


        const randomHue =
            Math.floor(
                Math.random() * 360
            );


        piece.style.left =
            `${Math.random() * 100}%`;

        piece.style.background =
            `hsl(${randomHue}, 90%, 65%)`;

        piece.style.animationDuration =
            `${2 + Math.random() * 3}s`;

        piece.style.animationDelay =
            `${Math.random() * 0.8}s`;

        piece.style.width =
            `${5 + Math.random() * 7}px`;

        piece.style.height =
            `${7 + Math.random() * 12}px`;

        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        confettiContainer.appendChild(
            piece
        );

    }


    setTimeout(() => {

        confettiContainer.innerHTML = "";

    }, 6000);

}


/* =========================================
   PREVENT PAGE FROM SELECTING CARDS
========================================= */

document.addEventListener(
    "dragstart",
    event => {

        if (
            event.target.closest(".card")
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================
   INITIAL STATE
========================================= */

showScreen(startScreen);

console.log(
    "%c🧠 MEMORY RUSH — ARCADE EDITION",
    "font-size:18px;font-weight:bold;"
);

console.log(
    "%cBuilt with HTML + CSS + JavaScript",
    "font-size:12px;"
);
