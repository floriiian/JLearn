'use strict';

/* Selectable options*/

let selectedLanguage;
let selectedMode;
let formCooldown;

let opt1 = false;
let opt2 = false;
let opt3 = false;

/* Elements */

const hiraganaButton = document.getElementById("hiraganaButton")
const katakanaButton = document.getElementById("katakanaButton")
const kanjiButton = document.getElementById("kanjiButton")

const jpButton = document.getElementById("jpButton")
const cnButton = document.getElementById("cnButton")
const flagIcon = document.querySelector(".language-button");

kanjiButton.classList.add("disabled");

const selectForm = document.getElementById("selectForm");

const startButton = document.querySelector(".selection_btn");
const selectButton1 = document.getElementById("select_button_1");
const selectButton2 = document.getElementById("select_button_2");
const selectButton3 = document.getElementById("select_button_3");

let selection_char_1 = document.getElementById("selection_char_1");
let selection_text_1 = document.getElementById("selection_text_1");
let selection_char_2 = document.getElementById("selection_char_2");
let selection_text_2 = document.getElementById("selection_text_2");
let selection_char_3 = document.getElementById("selection_char_3");
let selection_text_3 = document.getElementById("selection_text_3");


/* Event Listeners */

jpButton.addEventListener("click", (event) => {
    event.preventDefault();
    changeLanguage("JP")
});

cnButton.addEventListener("click", (event) => {
    event.preventDefault();
    changeLanguage("CN")
});

hiraganaButton.addEventListener("click", (event) => {
    event.preventDefault();
    selectedMode = "Hiragana";
    toggleSelectForm(true);
});

katakanaButton.addEventListener("click", (event) => {
    event.preventDefault();
    selectedMode = "Katakana"
    toggleSelectForm(true);

})


const onClickOutside = (element, callback) => {
    document.addEventListener('click', e => {
        if (document.body.contains(element) && !element.contains(e.target)) {
            callback();
        }
    });
};

selectButton1.addEventListener("click", (event) => {
    opt1 = toggleKana(selectButton1, opt1);
    checkSelection();
});

selectButton2.addEventListener("click", (event) => {
    opt2 = toggleKana(selectButton2, opt2);
    checkSelection();
});

selectButton3.addEventListener("click", (event) => {
    opt3 = toggleKana(selectButton3, opt3);
    checkSelection();
});

startButton.addEventListener("click", (event) => {
    startMode();
})

onClickOutside(selectForm, () =>
    toggleSelectForm(false))

function toggleKana(button, loadKana) {

    const newState = !loadKana;
    if (newState) {
        button.classList.add("selected");
    } else {
        button.classList.remove("selected");
    }
    return newState;
}

function checkSelection(){
    if(!opt1 && !opt3 && !opt2) {
        switchStartButton(true);
    }
    else{
        switchStartButton(false)
    }
}


function toggleSelectText() {
    const selections = {
        Hiragana: ["あ", "が", "ぴょ"],
        Katakana: ["ア", "ビ", "キャ"]
    };

    const labels = ["Single", "Dakuten", "Combination"];

    let [selectionChar1, selectionChar2, selectionChar3] = selections[selectedMode];

    selection_char_1.innerText = selectionChar1;
    selection_text_1.innerText = labels[0];
    selection_char_2.innerText = selectionChar2;
    selection_text_2.innerText = labels[1];
    selection_char_3.innerText = selectionChar3;
    selection_text_3.innerText = labels[2];
}


function switchStartButton(deactivate){

    new Audio('sounds/select.mp3').play();

    if(!deactivate){
        startButton.disabled = false;
        startButton.style.backgroundColor = "#7978eb"
        startButton.style.boxShadow = "0 5px 0 #6464ba";
        startButton.style.color = "#1b1a38";
        startButton.style.pointerEvents = "auto";
    }else{
        startButton.disabled = true;
        startButton.style.pointerEvents = "none";
        startButton.style.backgroundColor = "#37444d"
        startButton.style.color = "#455560"
        startButton.style.boxShadow = "none";
    }
}

function changeLanguage(language){


    if(selectedLanguage === language){
        return;
    }

    let newDate = new Date();
    newDate.setMonth(newDate.getMonth() + 1);
    document.cookie = "language=" + language + "; expires=" + newDate.toUTCString() + ";";

    let url = new URL("http://localhost:63342/JLearn/src/main/resources/public/startpage.html");
    let params = new URLSearchParams(url.search);
    params.set("language", language);

    url.search = params.toString();
    window.location.href = url.toString();
}

function switchLanguageButtons(){

    let params = new URLSearchParams(document.location.search);
    let cookies = document.cookie.toString();

    selectedLanguage = params.get("language");

    if(selectedLanguage !== "JP" && selectedLanguage !== "CN"){
        if(cookies.includes("language=JP")){
            selectedLanguage = "JP";
        }
        else if(cookies.includes("language=CN")){
            selectedLanguage = "CN";
        }
        else{
            selectedLanguage = "JP";
        }
    }

    switch(selectedLanguage) {
        case "JP":
            jpButton.style.backgroundColor = "#37444d";
            flagIcon.src = "images/jp_flag.png"
            break;
        case "CN":
            cnButton.style.backgroundColor = "#37444d";
            flagIcon.src = "images/cn_flag.png"
    }
}

function selectMode(mode){
    selectedMode = mode;
}

function toggleSelectForm(show){

    toggleSelectText()

    let sound = 'sounds/play_sound.mp3'

    if(!formCooldown || new Date().getSeconds() >= formCooldown) {

        if (show) {
            cardsContainer.style.display = "none";
            selectForm.classList.add('active');
            formCooldown = new Date().getSeconds() + 1;
            new Audio(sound).play();
        }
        else if (selectForm.classList.contains('active')){
            sound = 'sounds/leave.mp3';
            cardsContainer.style.display = "flex";
            selectForm.classList.remove('active');
            new Audio(sound).play();
        }
    }
}

function startMode() {

    let url = new URL("http://localhost:63342/JLearn/src/main/resources/public/quiz.html");
    let params = new URLSearchParams(url.search);

    params.set("mode", selectedMode);
    params.set("opt1", opt1);
    params.set("opt2", opt2);
    params.set("opt3", opt3);

    url.search = params.toString();
    window.location.href = url.toString();
}
switchLanguageButtons()