const availableHiragana = [
    { char: "あ", romaji: "a" },
    { char: "い", romaji: "i" },
    { char: "う", romaji: "u" },
    { char: "え", romaji: "e" },
    { char: "お", romaji: "o" }
];

console.log(availableHiragana);

let remainingHiragana = [...availableHiragana];

let currentStreak = 0;
let startTime;
let currentCardIndex;
let totalTime = 0;

const hiraganaText = document.getElementById("hiraganaText");
const inputField = document.getElementById("inputField");
const completionScreen = document.getElementById("completionScreen");
const modal = document.getElementById("innerCScreen");

function showCompletionScreen() {
    new Audio('sounds/success.mp3').play();
    const pTag = document.createElement('p');
    modal.appendChild(pTag);

    console.log(availableHiragana.length);

    pTag.innerText = "It took you an average of " + (totalTime / availableHiragana.length) + " seconds to answer";

    completionScreen.style.display = "block";
}

function restartHiragana() {
    remainingHiragana = [...availableHiragana];
    completionScreen.style.display = "none";
    loadNextCard();
}

function loadNextCard() {
    console.log(availableHiragana);

    if (remainingHiragana.length > 0) {
        currentCardIndex = Math.floor(Math.random() * remainingHiragana.length);
        hiraganaText.textContent = remainingHiragana[currentCardIndex].char;
        inputField.value = "";
        inputField.classList.remove("wrong");
        inputField.focus();

        startTime = new Date();

    } else {
        showCompletionScreen();
    }
}

inputField.addEventListener('keydown', (event) => {

    if (/^[a-zA-Z]$/.test(event.key)) {
        new Audio('sounds/typing' + Math.floor(Math.random() * 4)  + '.mp3').play();
    }
});

inputField.addEventListener("keypress", function(event) {

    if (/^[a-zA-Z]$/.test(event.key)) {
        new Audio('sounds/typing' + Math.floor(Math.random() * 4)  + '.mp3').play();
    }
    else if(event.key === "Enter") {
        const userAnswer = inputField.value.toLowerCase().trim();
        const correctAnswer = remainingHiragana[currentCardIndex]?.romaji; // Checks for null via ? synt

        if (userAnswer === correctAnswer) {

            const correctSound = new Audio('sounds/correct' + Math.floor(Math.random() * 4) + ".mp3");
            correctSound.play();

            const endTime = new Date();
            const timeTaken = Math.round((endTime - startTime) / 1000); // T

            totalTime += timeTaken;
            remainingHiragana.splice(currentCardIndex, 1);
            currentStreak++;
            loadNextCard();

        } else {
            currentStreak = 0;
            inputField.classList.add("wrong");
        }
    }
});
loadNextCard();