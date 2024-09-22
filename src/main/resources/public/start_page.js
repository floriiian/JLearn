'use strict';

const createSessionPoint =  "http://localhost:9999/api/create-session/";

let loadMainKana = false;
let loadDakutenKana = false;
let loadCombinationKana = false;

let selectedMode;

const hiraganaButton = document.getElementById("hiraganaButton")
const katakanaButton = document.getElementById("katakanaButton")
const kanjiButton = document.getElementById("kanjiButton")

const selectForm = document.getElementById("selectForm");

const startButton = document.querySelector(".selection_btn");
const selectButton1 = document.getElementById("select_button_1");
const selectButton2 = document.getElementById("select_button_2");
const selectButton3 = document.getElementById("select_button_3");

// Disable Buttons because it's not available yet.
kanjiButton.classList.add("disabled");
katakanaButton.classList.add("disabled");

hiraganaButton.addEventListener("click", (event) => {
    event.preventDefault();
    showSelectForm();
});

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
    if(!loadMainKana && !loadCombinationKana && !loadDakutenKana) {
        switchStartButton(true);
    }
    else{
        switchStartButton(false)
    }
}
function switchStartButton(deactivate){

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

selectButton1.addEventListener("click", (event) => {
    loadMainKana = toggleKana(selectButton1, loadMainKana);
    checkSelection();
});

selectButton2.addEventListener("click", (event) => {
    loadDakutenKana = toggleKana(selectButton2, loadDakutenKana);
    checkSelection();
});

selectButton3.addEventListener("click", (event) => {
    loadCombinationKana = toggleKana(selectButton3, loadCombinationKana);
    checkSelection();
});

startButton.addEventListener("click", (event) => {
    startMode();
})

function selectMode(mode){
    selectedMode = mode;
}

function showSelectForm(){

    new Audio('sounds/play_sound.mp3').play();
    switch(selectedMode){
        case "Hiragana":
            //selectButton1.textContent = "Single"

    }
    // selectButton1.innerText = "Sex"

    cardsContainer.style.display = "none";
    selectForm.classList.add('active');
}

function startMode() {

    console.log("REDIRECTING!")

    let url = new URL("https://example.com");
    let params = new URLSearchParams(url.search);

    params.set("mode", selectedMode);

    switch (selectedMode) {
        case "Hiragana":
            params.set("main", loadMainKana);
            params.set("daku", loadDakutenKana);
            params.set("comb", loadCombinationKana);
            break;
    }
    url.search = params.toString();
    window.location.href = url.toString();
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
