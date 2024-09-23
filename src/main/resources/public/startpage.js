'use strict';

/* Selectable options*/

let selectedMode;
let formCooldown;

let opt1 = false;
let opt2 = false;
let opt3 = false;

/* Elements */

const hiraganaButton = document.getElementById("hiraganaButton")
const katakanaButton = document.getElementById("katakanaButton")
const kanjiButton = document.getElementById("kanjiButton")

kanjiButton.classList.add("disabled");
katakanaButton.classList.add("disabled");

const selectForm = document.getElementById("selectForm");

const startButton = document.querySelector(".selection_btn");
const selectButton1 = document.getElementById("select_button_1");
const selectButton2 = document.getElementById("select_button_2");
const selectButton3 = document.getElementById("select_button_3");

/* Event Listeners */

hiraganaButton.addEventListener("click", (event) => {
    event.preventDefault();
    toggleSelectForm(true);
});

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

function selectMode(mode){
    selectedMode = mode;
}

function toggleSelectForm(show){

    let sound = 'sounds/play_sound.mp3'

    if(!formCooldown || new Date().getSeconds() >= formCooldown) {

        if (show) {
            switch (selectedMode) {
                case "Hiragana":
                //selectButton1.textContent = "Single"
            }
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
