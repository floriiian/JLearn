let availableHiragana = [
    { char: "あ", romaji: "a" },
    { char: "い", romaji: "i" },
    { char: "う", romaji: "u" },
    { char: "え", romaji: "e" },
    { char: "お", romaji: "o" }
];

let currentStreak = 0;
let startTime;
let currentCardIndex;
const hiraganaText = document.getElementById("hiraganaText");
const inputField = document.getElementById("inputField");
const completionScreen = document.getElementById("completionScreen");

function showCompletionScreen() {
    new Audio('sounds/success.mp3').play();
    completionScreen.style.display = "block";
}

function restartHiragana() {
    completionScreen.style.display = "none";
}

function loadNextCard() {
    if (availableHiragana.length > 0) {
        currentCardIndex = Math.floor(Math.random() * availableHiragana.length);
        hiraganaText.textContent = availableHiragana[currentCardIndex].char;
        inputField.value = "";
        inputField.classList.remove("wrong");
        inputField.focus();

        startTime = new Date(); // Capture start time

        console.log("Loaded Card:", availableHiragana[currentCardIndex]); // Debug
    } else {
        showCompletionScreen();
    }
}

inputField.addEventListener('keydown', (event) => {

    if (/^[a-zA-Z]$/.test(event.key)) {
        new Audio('sounds/typing' + Math.floor(Math.random() * 4)  + '.mp3').play();
    } else {
        console.log(event.key);
    }
    });

inputField.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        const userAnswer = inputField.value.toLowerCase().trim();
        const correctAnswer = availableHiragana[currentCardIndex]?.romaji; // Checks for null via ? synt

        if (userAnswer === correctAnswer) {

            const correctSound = new Audio('sounds/correct' + Math.floor(Math.random() * 4) + ".mp3");
            correctSound.play();

            const endTime = new Date();
            const timeTaken = Math.round((endTime - startTime) / 1000); // T in sec

            availableHiragana.splice(currentCardIndex, 1);
            console.log("Time: " + timeTaken + " Steak: " + currentStreak);

            currentStreak++;
            loadNextCard();

        } else {
            currentStreak = 0;
            inputField.classList.add("wrong");
        }
    }
});

loadNextCard();