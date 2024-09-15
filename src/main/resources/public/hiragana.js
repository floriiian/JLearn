let loadMainKana = true;
let loadDakutenKana = false;
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

const footerContainer = document.querySelector('.footer-container');
const footerHeadline = document.querySelector('.footer-headline');
const footerInformation = document.querySelector('.footer-information');
const redCircleElement = document.querySelector('.circle-container');

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

    console.log(total);
    console.log(current);

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

function handleAnswer(){

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
        const timeTaken = Math.round(new Date() - startTime) / 1000;

        correctSound.play();

        totalTime += timeTaken;
        remainingHiragana.splice(currentCardIndex, 1);
        currentStreak++;
        loadNextCard();

    } else {

        footerContainer.style.backgroundColor = "#202f36"
        footerHeadline.style.visibility = "visible"
        footerInformation.style.visibility = "visible"
        redCircleElement.style.visibility = "visible"

        checkButton.style.backgroundColor = "#ec5454";
        checkButton.style.color = "#131f24";
        checkButton.style.boxShadow = "#d64747 0 1px 0";

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
    if(enable){
        checkButton.style.backgroundColor = "#7a79ed";
        checkButton.style.color = "#1b1a38";
        checkButton.style.boxShadow = '0 5px 0 #37444d';
        checkButton.style.pointerEvents = "auto";
    }
    else{
        checkButton.style.backgroundColor = "#37444d";
        checkButton.style.boxShadow = "0 0px 0 #37444d";
        checkButton.style.color = "#455560";
        checkButton.style.pointerEvents = "none";
    }
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

inputField.addEventListener("keyup", function(event) {

    if(inputField.value.length > 0){
        if(event.key === "Enter") {
            handleAnswer();
        }
        switchCheckButton();
    }
    else{
        switchCheckButton(false);
    }
})

