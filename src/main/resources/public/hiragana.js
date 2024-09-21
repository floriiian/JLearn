'use strict';

let loadMainKana = true;
let loadDakutenKana = true;
let loadCombinationKana = true;

const endSessionPoint = "http://localhost:9999/api/end-session";
const createSessionPoint =  "http://localhost:9999/api/create-session/";

let currentChar = null;
let currentStreak = 0;
let totalMistakes = 0;


let availableHiragana = [];
let remainingHiragana = [];
let currentCardIndex;

let startTime;
let sessionInitialized = false;
let charactersLoaded = false;
let errorShown = false;

const hiraganaText = document.getElementById("hiraganaText");
const inputField = document.getElementById("inputField");
const completionScreen = document.getElementById("completionScreen")
const errorScreen = document.getElementById("errorScreen");

const errorDescription = document.querySelector(".errorDescription");

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

function showRememberScreen() {
    console.log("Remembering..");
}


function showCompletionScreen() {

    if(!sessionInitialized){
        return
    }

    fetch(endSessionPoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'Hiragana',
            total_mistakes: totalMistakes,
            current_streak: currentStreak

        }),
    }).then(response => response.json()) // Parse the response JSON
        .then(data => {

            sessionInitialized = false;

            new Audio('sounds/success.mp3').play();
            cardsContainer.style.display = "none";
            completionScreen.classList.add('active');

            let score = data.data[0];

            drawScore(0, Math.max(score, 0));

        })
        .catch(error => {
            showErrorScreen("The API is currently offline.")
            console.log(error);
        });
}

function showErrorScreen(description) {

    if(errorShown) {
        return;
    }

    sessionInitialized = false;
    new Audio('sounds/error.mp3').play();

    cardsContainer.style.display = "none";
    errorScreen.classList.add('active');
    errorDescription.innerText = description + "\nYou can try reconnecting or exiting.";

    errorShown = true;
}

function restartHiragana() {

    cardsContainer.style.display = "flex";
    completionScreen.classList.remove('active');
    errorScreen.classList.remove('active');
    currentStreak = 0;
    streakAmount.textContent = currentStreak;
    startTime = undefined;

    sessionInitialized = false;
    requestCharacters().then(r =>console.log("Restarted."));
}

function loadChar() {

    console.log("Executed");

    errorShown = false;

    const total = availableHiragana.length;
    const current = availableHiragana.length - remainingHiragana.length;

    setProgressBarWidth(100 * current / total)
    fadeElement(cardsContainer)
    switchCheckButton(false);
    changeFooterStyle(false);

    if (remainingHiragana.length > 0) {

        currentCardIndex = Math.floor(Math.random() * remainingHiragana.length);

        setProgressBarWidth(100 * current / total)
        fadeElement(cardsContainer);
        switchCheckButton(false);
        changeFooterStyle(false);

        let newChar = remainingHiragana[currentCardIndex][0];
        currentChar = newChar;

        hiraganaText.textContent = newChar;
        inputField.value = "";
        inputField.classList.remove("wrong");
        inputField.focus();

    } else if(sessionInitialized) {
       showCompletionScreen();
    }

}

async function requestCharacters() {
    if (!sessionInitialized) {
        try {
            const endResponse = await fetch(endSessionPoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'Hiragana' }),
            });

            const data = await endResponse.json();

            if (data.message !== 501) {
                const createResponse = await fetch(createSessionPoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'Hiragana',
                        modes: [loadMainKana, loadDakutenKana, loadCombinationKana]
                    }),
                });

                const createData = await createResponse.json();

                if (createData.message !== 501) {
                    availableHiragana = [...createData.data];
                    remainingHiragana.push(...availableHiragana);
                    sessionInitialized = true;
                    setTimeout(() => loadChar(), 100);
                }
            } else {
                console.log("Session could not be reset.");
            }
        } catch (error) {
            showErrorScreen("The API is currently offline.");
            console.error('API ERROR: ', error);
        }
    }
}

function handleAnswer(){

    const userAnswer = inputField.value.toLowerCase().trim()
    const correctAnswer = remainingHiragana[currentCardIndex]?.[1]
    const currentHiragana = remainingHiragana[currentCardIndex];

    const hiraganaHepburn = currentHiragana[1]
    const hiraganaKunrei = currentHiragana[2]

    let isAnswerCorrect = userAnswer === correctAnswer;

    if(hiraganaKunrei){

        if(userAnswer ===  hiraganaHepburn || userAnswer === hiraganaKunrei){
            isAnswerCorrect = true;
        }
    }
    if (isAnswerCorrect) {
        const correctSound = new Audio('sounds/correct' + Math.floor(Math.random() * 4) + ".mp3");
        correctSound.play().then(r => "");
        remainingHiragana.splice(currentCardIndex, 1);
        currentStreak++;
        loadChar();
    }
    else {
        totalMistakes += 1;
        changeFooterStyle(true);

        let footerText;
        if(sessionInitialized){
            footerText = hiraganaKunrei ? hiraganaHepburn + " / " + hiraganaKunrei : correctAnswer
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
    const utterance = new SpeechSynthesisUtterance(currentChar);
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

    checkButton.onclick = function() {
        if (isWrong) {
            loadChar();
        } else {
            handleAnswer();
        }
    };

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
        // let num = Math.min(parseInt(Number(val * 100).toFixed()), percent);
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
        if(inputField.value.length > 0){
            if(event.key === "Enter") {
                handleAnswer();

                if(startTime === undefined){
                    startTime = new Date();
                }
            }
            switchCheckButton();
        }
        else{
            switchCheckButton(false);
        }
    }
})
requestCharacters()

