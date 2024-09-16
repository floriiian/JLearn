'use strict';

let loadMainKana = false;
let loadDakutenKana = true;
let loadCombinationKana = false;

async function loadJSON() {
    try {
        const response = await fetch('hiragana/hiragana.json');
        if (!response.ok) {
            console.error('No network response');
            return;
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON: ', error, "\nIf this persists, please contact the website administrator.");
        throw error;
    }
}

let jsonContentLoaded = false;
let availableHiragana= [];

loadJSON().then(jsonContent => {
    if(jsonContent){
        if (loadMainKana) {
            availableHiragana.push(...jsonContent["single_hiragana"]);
        }
        if(loadDakutenKana){
            availableHiragana.push(...jsonContent["dakuten_hiragana"]);
            availableHiragana.push(...jsonContent["handakuten_hiragana"]);
        }
        if(loadCombinationKana){
            availableHiragana.push(...jsonContent["combo_hiragana"]);
        }
        jsonContentLoaded = true;
        remainingHiragana = Array.from(availableHiragana);
        loadNextCard();
    }
}).catch(error => {console.error("Error parsing JSON into Array:", error);});

let remainingHiragana = availableHiragana;

let currentStreak = 0;
let totalMistakes = 0;
let startTime;
let currentCardIndex;

const hiraganaText = document.getElementById("hiraganaText");
const inputField = document.getElementById("inputField");
const completionScreen = document.getElementById("completionScreen");

const modal = document.getElementById("innerCScreen");
const cardsContainer = document.getElementById("cardsContainer");
const streakAmount = document.getElementById("streakAmount");
const progressBar = document.getElementById("progressBar");

const checkButton = document.getElementById("checkButton");

const skipButton = document.querySelector('.skip-button');
const learnElement = document.querySelector('.learn-text');
const footerContainer = document.querySelector('.footer-container');
const footerHeadline = document.querySelector('.footer-headline');
const footerInformation = document.querySelector('.footer-information');
const redCircleElement = document.querySelector('.circle-container');

const arc = document.querySelector('.arc');
const value = document.querySelector('.value');


function setProgressBarWidth(percentage) {
    percentage = Math.max(0, Math.min(100, percentage));
    progressBar.style.width = percentage + '%';
}

function showCompletionScreen() {

    new Audio('sounds/success.mp3').play().then(r => "");

    const timeTaken = Math.round(new Date() - startTime) / 1000; // Seconds

    console.log(timeTaken); // 10
    console.log(totalMistakes); // 2

    cardsContainer.style.display = "none";
    completionScreen.style.display = "block";

    let mainKanaTime = 60;
    let dakutenTime = 30;
    let comboTime = 35;

    const perfectTime =
        (loadDakutenKana ? dakutenTime : 0) +
        (loadCombinationKana ? comboTime : 0) +
        (loadMainKana ? mainKanaTime : 0);

    const timeDifference = Math.abs(timeTaken - perfectTime);

    let maxScore = 100;
    let timePenalty = Math.min(timeDifference, 10) * 0.5;
    let mistakePenalty = totalMistakes * 2;

    let score = maxScore - timePenalty - mistakePenalty;

    drawScore(0, Math.max(score, 0));
}

function showRememberScreen() {
    console.log("Remembering..");
}

function restartHiragana() {

    remainingHiragana = [...availableHiragana];
    cardsContainer.style.display = "flex";
    completionScreen.style.display = "none";
    currentStreak = 0;
    streakAmount.textContent = currentStreak;
    startTime = undefined;

    loadNextCard();
}

function loadNextCard() {

    const total = availableHiragana.length;
    const current = availableHiragana.length - remainingHiragana.length;

    console.log(total);
    console.log(current);

    setProgressBarWidth(100 * current / total)
    fadeElement(cardsContainer)
    switchCheckButton(false);
    changeFooterStyle(false);

    console.log(remainingHiragana.length)
    if (remainingHiragana.length > 0) {
        currentCardIndex = Math.floor(Math.random() * remainingHiragana.length);
        hiraganaText.textContent = remainingHiragana[currentCardIndex].char;
        inputField.value = "";
        inputField.classList.remove("wrong");
        inputField.focus();

    } else if(jsonContentLoaded) {
        showCompletionScreen();
    }
}

function handleAnswer(){

    if(inputField.readOnly){
        loadNextCard();
        return;
    }

    const userAnswer = inputField.value.toLowerCase().trim()
    const correctAnswer = remainingHiragana[currentCardIndex]?.["romaji"];
    const currentHiragana = remainingHiragana[currentCardIndex];

    let isAnswerCorrect = userAnswer === correctAnswer;

    const hiraganaHepburn = currentHiragana["romaji"]["hepburn"];
    const hiraganaKunrei = currentHiragana["romaji"]["kunrei"];

    if(hiraganaHepburn){
        if(userAnswer ===  hiraganaHepburn || userAnswer === hiraganaKunrei){
            isAnswerCorrect = true;
        }
    }

    if (isAnswerCorrect) {

        const correctSound = new Audio('sounds/correct' + Math.floor(Math.random() * 4) + ".mp3");
        correctSound.play().then(r => "");

        remainingHiragana.splice(currentCardIndex, 1);
        currentStreak++;
        loadNextCard();

    } else {
        totalMistakes += 1;
        changeFooterStyle(true);

        let footerText = "";
        if(jsonContentLoaded){
            footerText = hiraganaHepburn ? hiraganaHepburn + " / " + hiraganaKunrei : correctAnswer
        }
        footerInformation.innerText = footerText;

        setTimeout(() => {
            checkButton.style.backgroundColor = "#ec5454";
            checkButton.style.color = "#131f24";
            checkButton.style.boxShadow = "#d64747 0 1px";
        }, 50);

        shakeElement(cardsContainer);
        currentStreak = 0;
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

function switchCheckButton(enable = true) {
    checkButton.style.backgroundColor = enable ? "#7a79ed" : "#37444d";
    checkButton.style.color = enable ? "#1b1a38" : "#455560";
    checkButton.style.boxShadow = enable ? '0 5px 0 #6565bb' :  "0 0px 0 #37444d";
    checkButton.style.pointerEvents = enable ? "auto" : "none";
}

function changeFooterStyle(isWrong = true){
    footerContainer.style.backgroundColor = isWrong ? "#202f36" : "transparent";
    footerHeadline.style.visibility = isWrong ? "visible" : "hidden";
    footerInformation.style.visibility = isWrong ? "visible" : "hidden";
    redCircleElement.style.visibility = isWrong ? "visible" : "hidden"
    learnElement.style.visibility = isWrong ? "visible" : "hidden";

    inputField.readOnly = isWrong;

    skipButton.style.visibility = isWrong ? "hidden" : "visible";
    checkButton.innerText = isWrong ? "Continue" : "Check";
}

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

function drawScore(val = 0, percent) {
    if (val <= percent / 100) {
        let angle = val * 180 - 45;
        let num = Math.min(Number(val * 100).toFixed(), percent);
        arc.style.transform = "rotate(" + angle + "deg)";

        let scoreText = "Ready for Kana.";
        if (percent < 100) {
            scoreText = percent + "%";
        }

        value.textContent = scoreText;


        val += 0.005; // Speed

        requestAnimationFrame(() => drawScore(val, percent));
    }
}

inputField.addEventListener("keyup", function(event) {

    if(!inputField.readOnly){

        if(startTime === undefined){
            startTime = new Date();
        }

        if(inputField.value.length > 0){
            if(event.key === "Enter") {
                handleAnswer();
            }
            switchCheckButton();
        }
        else{
            switchCheckButton(false);
        }
    }
})

