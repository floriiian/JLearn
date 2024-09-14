const availableHiragana=
    [{char:"あ",romaji:"a"},{char:"い",romaji:"i"},{char:"う",romaji:"u"},{char:"え",romaji:"e"},{char:"お",romaji:"o"},{char:"か",romaji:"ka"},{char:"き",romaji:"ki"},{char:"く",romaji:"ku"},{char:"け",romaji:"ke"},{char:"こ",romaji:"ko"},{char:"さ",romaji:"sa"},{char:"し",romaji:"shi"},{char:"す",romaji:"su"},{char:"せ",romaji:"se"},{char:"そ",romaji:"so"},{char:"た",romaji:"ta"},{char:"ち",romaji:"chi"},{char:"つ",romaji:"tsu"},{char:"て",romaji:"te"},{char:"と",romaji:"to"},{char:"な",romaji:"na"},{char:"に",romaji:"ni"},{char:"ぬ",romaji:"nu"},{char:"ね",romaji:"ne"},{char:"の",romaji:"no"},{char:"は",romaji:"ha"},{char:"ひ",romaji:"hi"},{char:"ふ",romaji:"fu"},{char:"へ",romaji:"he"},{char:"ほ",romaji:"ho"},{char:"ま",romaji:"ma"},{char:"み",romaji:"mi"},{char:"む",romaji:"mu"},{char:"め",romaji:"me"},{char:"も",romaji:"mo"},{char:"や",romaji:"ya"},{char:"ゆ",romaji:"yu"},{char:"よ",romaji:"yo"},{char:"ら",romaji:"ra"},{char:"り",romaji:"ri"},{char:"る",romaji:"ru"},{char:"れ",romaji:"re"},{char:"ろ",romaji:"ro"},{char:"わ",romaji:"wa"},{char:"を",romaji:"wo"},{char:"ん",romaji:"n"},{char:"が",romaji:"ga"},{char:"ぎ",romaji:"gi"},{char:"ぐ",romaji:"gu"},{char:"げ",romaji:"ge"},{char:"ご",romaji:"go"},{char:"ざ",romaji:"za"},{char:"じ",romaji:"ji"},{char:"ず",romaji:"zu"},{char:"ぜ",romaji:"ze"},{char:"ぞ",romaji:"zo"},{char:"だ",romaji:"da"},{char:"ぢ",romaji:"zi"},{char:"づ",romaji:"zu"},{char:"で",romaji:"de"},{char:"ど",romaji:"do"},{char:"ば",romaji:"ba"},{char:"び",romaji:"bi"},{char:"ぶ",romaji:"bu"},{char:"べ",romaji:"be"},{char:"ぼ",romaji:"bo"},{char:"ぱ",romaji:"pa"},{char:"ぴ",romaji:"pi"},{char:"ぷ",romaji:"pu"},{char:"ぺ",romaji:"pe"},{char:"ぽ",romaji:"po"},{char:"きゃ",romaji:"kya"},{char:"きゅ",romaji:"kyu"},{char:"きょ",romaji:"kyo"},{char:"しゃ",romaji:"sya"},{char:"しゅ",romaji:"syu"},{char:"しょ",romaji:"syo"},{char:"ちゃ",romaji:"cha"},{char:"ちゅ",romaji:"chu"},{char:"ちょ",romaji:"cho"},{char:"にゃ",romaji:"nya"},{char:"にゅ",romaji:"nyu"},{char:"にょ",romaji:"nyo"},{char:"ひゃ",romaji:"hya"},{char:"ひゅ",romaji:"hyu"},{char:"ひょ",romaji:"hyo"},{char:"みゃ",romaji:"mya"},{char:"みゅ",romaji:"myu"},{char:"みょ",romaji:"myo"},{char:"りゃ",romaji:"rya"},{char:"りゅ",romaji:"ryu"},{char:"りょ",romaji:"ryo"},{char:"ぎゃ",romaji:"gya"},{char:"ぎゅ",romaji:"gyu"},{char:"ぎょ",romaji:"gyo"},{char:"じゃ",romaji:"jya"},{char:"じゅ",romaji:"jyu"},{char:"じょ",romaji:"jyo"},{char:"びゃ",romaji:"bya"},{char:"びゅ",romaji:"byu"},{char:"びょ",romaji:"byo"},{char:"ぴゃ",romaji:"pya"},{char:"ぴゅ",romaji:"pyu"},{char:"ぴょ",romaji:"pyo"}];
const doubleRomaji = [
    { hiragana: "しゃ", hepburn: "sha", kunrei: "sya" },
    { hiragana: "しゅ", hepburn: "shu", kunrei: "syu" },
    { hiragana: "しょ", hepburn: "sho", kunrei: "syo" },

    { hiragana: "ちゃ", hepburn: "cha", kunrei: "cya" },
    { hiragana: "ちゅ", hepburn: "chu", kunrei: "cyu" },
    { hiragana: "ちょ", hepburn: "cho", kunrei: "cyo" },

    { hiragana: "じゃ", hepburn: "ja", kunrei: "zya" },
    { hiragana: "じゅ", hepburn: "ju", kunrei: "zyu" },
    { hiragana: "じょ", hepburn: "jo", kunrei: "zyo" },

    { hiragana: "つゃ", hepburn: "tsa", kunrei: "tya" },
    { hiragana: "つゅ", hepburn: "tsyu", kunrei: "tyu" },
    { hiragana: "つょ", hepburn: "tso", kunrei: "tyo" },

    { hiragana: "ふゃ", hepburn: "fya", kunrei: "hya" },
    { hiragana: "ふゅ", hepburn: "fyu", kunrei: "hyu" },
    { hiragana: "ふょ", hepburn: "fyo", kunrei: "hyo" }
];



let remainingHiragana = [...availableHiragana];

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

inputField.addEventListener("keypress", function(event) {

    const userAnswer = inputField.value.toLowerCase().trim();

     if(event.key === "Enter" && userAnswer.length > 0) {

         const correctAnswer = remainingHiragana[currentCardIndex]?.romaji;
         const currentHiragana = remainingHiragana[currentCardIndex].char;

        let isAnswerCorrect = userAnswer === correctAnswer;

         for (let i = 0; i < doubleRomaji.length; i++) {
             if (doubleRomaji[i].hiragana === currentHiragana) {
                 console.log("Is here");
                  if(userAnswer === doubleRomaji[i].hepburn || userAnswer === doubleRomaji[i].kunrei){
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
});

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
loadNextCard();