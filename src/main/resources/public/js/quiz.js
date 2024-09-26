'use strict';

const endSessionPoint = "http://localhost:9999/api/end-session";
const createSessionPoint =  "http://localhost:9999/api/create-session/";

let mode;
const availableModes = ["Hiragana", "Katakana", "Kanji"];
let opt1 = false
let opt2 = false
let opt3 = false

let currentChar = null;
let currentStreak = 0;
let totalMistakes = 0;

let availableCharacters = [];
let remainingCharacters = [];
let currentCharacterIndex;

let startTime;
let sessionInitialized = false;
let errorShown = false;

const characterField = document.querySelector(".character");
const inputField = document.getElementById("inputField");
const completionScreen = document.getElementById("completionScreen")
const errorScreen = document.getElementById("errorScreen");

const errorDescription = document.querySelector(".errorDescription");

const quitScreen = document.querySelector(".quit_form")

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

/* Screens */

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
            type: mode,
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

function toggleQuitScreen() {

    console.log(quitScreen.classList.contains('active'));

        if(!quitScreen.classList.contains('active')){
            setTimeout(function () {
                new Audio('sounds/play_sound.mp3').play();
                quitScreen.classList.add('active');
            },150)
        }
        else{
            quitScreen.classList.remove('active');
        }
}

/* Quiz functions */

function restartQuiz() {

    cardsContainer.style.display = "flex";
    completionScreen.classList.remove('active');
    errorScreen.classList.remove('active');
    currentStreak = 0;
    streakAmount.textContent = currentStreak;
    startTime = undefined;
    sessionInitialized = false;

    requestCharacters().then(r =>console.log("Restarted."));
}

function loadNewCharacter() {

    errorShown = false;

    const total = availableCharacters.length;
    const current = availableCharacters.length - remainingCharacters.length;

    setProgressBarWidth(100 * current / total)
    fadeElement(cardsContainer)
    switchCheckButton(false);
    changeFooterStyle(false);

    if (remainingCharacters.length > 0) {

        currentCharacterIndex = Math.floor(Math.random() * remainingCharacters.length);

        setProgressBarWidth(100 * current / total)
        fadeElement(cardsContainer);
        switchCheckButton(false);
        changeFooterStyle(false);

        let newChar = remainingCharacters[currentCharacterIndex][0];
        currentChar = newChar;

        characterField.textContent = newChar;
        inputField.value = "";
        inputField.classList.remove("wrong");
        inputField.focus();

    } else if(sessionInitialized) {
       showCompletionScreen();
    }
}

async function requestCharacters() {

    if (!sessionInitialized) {

        let urlParams = new URLSearchParams(document.location.search);

        mode = urlParams.get("mode");

        if(mode === null || !availableModes.includes(mode)){
            showErrorScreen("Invalid URL Parameters")
            return;
        }

        opt1 = urlParams.get("opt1");
        opt2 = urlParams.get("opt2")
        opt3 = urlParams.get("opt3");

        try {
            const endResponse = await fetch(endSessionPoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: mode }),
            });

            const data = await endResponse.json();

            if (data.message !== 501) {
                const createResponse = await fetch(createSessionPoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: mode,
                        modes: [opt1, opt2, opt3]
                    }),
                });

                const createData = await createResponse.json();

                if (createData.message !== 501) {
                    availableCharacters = [...createData.data];
                    remainingCharacters.push(...availableCharacters);
                    sessionInitialized = true;
                    setTimeout(() => loadNewCharacter(), 100);
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

    console.log(totalMistakes)

    const userAnswer = inputField.value.toLowerCase().trim()
    const correctAnswer = remainingCharacters[currentCharacterIndex]?.[1]
    const currentCharacter = remainingCharacters[currentCharacterIndex];

    const firstCorrectAnswer = currentCharacter[1]
    const secondCorrectAnswer = currentCharacter[2]

    let isAnswerCorrect = userAnswer === correctAnswer;

    if(secondCorrectAnswer){

        if(userAnswer ===  firstCorrectAnswer || userAnswer === secondCorrectAnswer){
            isAnswerCorrect = true;
        }
    }

    if (isAnswerCorrect) {
        const correctSound = new Audio('sounds/correct' + Math.floor(Math.random() * 4) + ".mp3");
        correctSound.play().then(r => console.log("Correctly answered."));

        remainingCharacters.splice(currentCharacterIndex, 1);
        currentStreak++;

        loadNewCharacter();
    }
    else {

        changeFooterStyle(true);
        shakeElement(cardsContainer);

        setTimeout(() => {
            checkButton.style.backgroundColor = "#ec5454";
            checkButton.style.color = "#131f24";
            checkButton.style.boxShadow = "#d64747 0 1px";
        }, 50);

        if(sessionInitialized){
            footerInformation.innerText = '';
            footerInformation.innerText =
                secondCorrectAnswer ? firstCorrectAnswer + " / " + secondCorrectAnswer : correctAnswer

        }

        totalMistakes = totalMistakes + 1;
        currentStreak = 0;

    }

    if(streakAmount > 0) {
        shakeElement(streakAmount);
    }
    streakAmount.textContent = currentStreak;
}

/* Helper functions */

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

}

function setProgressBarWidth(percentage) {
    percentage = Math.max(0, Math.min(100, percentage));
    progressBar.style.width = percentage + '%';
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
        arc.style.transform = "rotate(" + angle + "deg)";
        value.textContent = percent < 100 ? percent + "%" : "Ready for Kana.";
        val += 0.005; // Speed

        requestAnimationFrame(() => drawScore(val, percent));
    }
}

checkButton.addEventListener("click", click => {
    inputField.readOnly ? loadNewCharacter() : handleAnswer();
})

inputField.addEventListener("keyup", function(event) {

        if(inputField.value.length > 0) {
            if(event.key === "Enter") {
                checkButton.click();
                startTime = startTime || new Date();
            }
            switchCheckButton();
        }
        else{
            switchCheckButton(false);
    }
})

requestCharacters().then(r => "Characters requested");
new Audio('sounds/start.mp3').play();


