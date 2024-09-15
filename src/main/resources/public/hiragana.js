
let loadMainKana = true;
let loadDakutenKana = true;
let loadCombinationKana = true;

let availableHiragana= [];
let doubleRomaji = [];


async function loadJSON() {
    try {
        const response = await fetch('hiragana/hiragana.json');
        if (!response.ok) {
            console.log('Network response was not ok');
            return;
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON: ', error, "\nIf this persists, please contact the website administrator.");
        throw error;
    }
}

let jsonContent;
let jsonContentLoaded = false;

loadJSON().then(jsonContent => {
    if(jsonContent){
        if (loadMainKana) {
            availableHiragana.push(...jsonContent["single_hiragana"]);
            availableHiragana.push(...jsonContent["dakuten_hiragana"]);
        }
        if(loadDakutenKana){
            availableHiragana.push(...jsonContent["dakuten_hiragana"]);
        }
        if(loadCombinationKana){
            availableHiragana.push(...jsonContent["combo_hiragana"]);
        }
        jsonContentLoaded = true;
        remainingHiragana = availableHiragana;
        loadNextCard();
    }
}).catch(error => {
    console.error("Error parsing JSON into Array:", error);
});


let remainingHiragana = availableHiragana;

let currentStreak = 0;
let startTime;
let currentCardIndex;
let totalTime = 0;

const hiraganaText = document.getElementById("hiraganaText");
const inputField = document.getElementById("inputField");
const completionScreen = document.getElementById("completionScreen");

const modal = document.getElementById("innerCScreen");
const cardsContainer = document.getElementById("cardsContainer");
const streakAmount = document.getElementById("streakAmount");
const progressBar = document.getElementById("progressBar");

const checkButton = document.getElementById("checkButton");

function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

function fadeElement(element) {
    element.classList.add('fade');

    setTimeout(() => {
        element.classList.remove('fade');
    }, 500);
}

function setProgressBarWidth(percentage) {
    percentage = Math.max(0, Math.min(100, percentage));
    progressBar.style.width = percentage + '%';
}

function showCompletionScreen() {

    new Audio('sounds/success.mp3').play();
    const pTagSelector = document.getElementById("averageTime");
    const timeText =  "Average completion-time: " + (totalTime / availableHiragana.length);

    if(pTagSelector === null){
        const pTag = document.createElement('p');
        modal.appendChild(pTag);
        pTag.id = "averageTime"
        pTag.innerText = timeText;
    }
    else{
        pTagSelector.innerText = timeText;
    }
    cardsContainer.style.display = "none";
    completionScreen.style.display = "block";
}

function restartHiragana() {

    remainingHiragana = [...availableHiragana];
    cardsContainer.style.display = "flex";
    completionScreen.style.display = "none";
    currentStreak = 0;
    streakAmount.textContent = currentStreak;

    loadNextCard();
}

function loadNextCard() {

    const total = availableHiragana.length;
    const current = availableHiragana.length - remainingHiragana.length;

    setProgressBarWidth(100 * current / total)
    fadeElement(cardsContainer)
    switchCheckButton(false);

    console.log(remainingHiragana.length)
    if (remainingHiragana.length > 0) {
        currentCardIndex = Math.floor(Math.random() * remainingHiragana.length);
        hiraganaText.textContent = remainingHiragana[currentCardIndex].char;
        inputField.value = "";
        inputField.classList.remove("wrong");
        inputField.focus();

        startTime = new Date();

    } else if(jsonContentLoaded) {
        showCompletionScreen();
    }
}

function switchCheckButton(enable = true) {
    if(enable){
        checkButton.style.backgroundColor = "#7a79ed";
        checkButton.style.color = "#1b1a38";
        checkButton.style.pointerEvents = "auto";
    }
    else{
        checkButton.style.backgroundColor = "#37444d";
        checkButton.style.boxShadow = "0 0px 0 #37444d";
        checkButton.style.color = "#455560";
        checkButton.style.pointerEvents = "none";
    }
}

inputField.addEventListener("keyup", function(event) {

    if(inputField.value.length > 0){
        switchCheckButton(false);
        if(event.key === "Enter") {
            handleAnswer();
        }
        switchCheckButton();
    }
    else{
        checkButton.style.backgroundColor = "#37444d";
        checkButton.style.boxShadow = "0 0px 0 #37444d";
        checkButton.style.color = "#455560";
        checkButton.style.pointerEvents = "none";
    }
})

function handleAnswer(){

    const userAnswer = inputField.value.toLowerCase().trim()
    const correctAnswer = remainingHiragana[currentCardIndex]?.["romaji"];

    console.log(remainingHiragana[1]);
    console.log(currentCardIndex);

    const currentHiragana = remainingHiragana[currentCardIndex].char;

    let isAnswerCorrect = userAnswer === correctAnswer || currentHiragana === "じ" && (userAnswer === "ji" || userAnswer === "zi");

    for (let i = 0; i < doubleRomaji.length; i++) {
        if (doubleRomaji[i]["hiragana"] === currentHiragana) {
            console.log("Is here");
            if(userAnswer === doubleRomaji[i]["hepburn"] || userAnswer === doubleRomaji[i]["kunrei"]){
                console.log("Is true");
                isAnswerCorrect = true;
                break;
            }
        }
    }

    if (isAnswerCorrect) {

        const correctSound = new Audio('sounds/correct' + Math.floor(Math.random() * 4) + ".mp3");
        correctSound.play();

        const endTime = new Date();
        const timeTaken = Math.round((endTime - startTime) / 1000); // T

        totalTime += timeTaken;
        remainingHiragana.splice(currentCardIndex, 1);
        currentStreak++;
        loadNextCard();

    } else {
        shakeElement(cardsContainer);
        currentStreak = 0;
        inputField.classList.add("wrong");
    }
    if(streakAmount > 0){
        shakeElement(streakAmount);
    }
    streakAmount.textContent = currentStreak;
}

function playPronunciation() {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => playPronunciation();
        return;
    }
    const currentHiragana = remainingHiragana[currentCardIndex]?.char;
    const utterance = new SpeechSynthesisUtterance(currentHiragana);
    utterance.voice = voices.find(voice => voice.lang === 'ja-JP');
    utterance.language = "ja-JP";

    speechSynthesis.speak(utterance);
}