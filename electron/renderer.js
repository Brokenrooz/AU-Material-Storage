// Minimal state machine. The UwU code, as it were

const STATES = {
    INTRO: "INTRO",
    BOOTING: "BOOTING",
    CHARACTER_SELECT: "CHARACTER_SELECT"
};

let currentState = STATES.INTRO;

function setState(newState) {
    currentState = newState;
    render();
}

function render() {
    if (currentState === STATES.INTRO) {
        renderIntro();
    }

    if (currentState === STATES.BOOTING) {
        renderBooting();
    }

    if (currentState === STATES.CHARACTER_SELECT) {
        renderCharacterSelect();
    }
}

// The render-y shit

function renderIntro() {
    console.log("State", currentState);
}

function renderBooting() {
    const bootLog = document.getElementById("boot-log");
    bootLog.style.display = "block";
}

function renderCharacterSelect() {
    const intro = document.getElementById("intro-screen");
    const characterSelect = document.getElementById("character-select");

    intro.style.display = "none";
    characterSelect.style.display = "flex";
}

let confirmStep = 0;
const confirmDialogs = [
    "You are about to give this app access to your account API data.",
    "This key can read your character and storage data.",
    "Confirm that you have correctly understood what this app is going to do.",
    "Do not give out your fucking API key to anyone. Ever."
];

const bootMessages = [
    "Initializing API subsystem...",
    "Validating API key format...",
    "Establishing secure local session...",
    "Requesting account permissions...",
    "Preparing character index...",
    "Boot sequence nominal."
];

let bootIndex = 0;
let bootInterval = null;

// Wiring

document.addEventListener("DOMContentLoaded", () => {
    const apiInput = document.getElementById("api-key-input");
    const startButton = document.getElementById("start-button");
    const warningText = document.getElementById("warning-text");

    const modal = document.getElementById("confirm-modal");
    const modalText = document.getElementById("confirm-text");
    const modalOk = document.getElementById("confirm-ok");

    const bootLog = document.getElementById("boot-log");

    startButton.addEventListener("click", () => {
        const key = apiInput.value.trim();

        const looksLikeApiKey =
            key.length >= 60 &&
            key.includes("-") &&
            /^[a-zA-Z0-9-]+$/.test(key);
        
        //if not api key > shame user
        if (!looksLikeApiKey) {
            apiInput.value = "Are you stupid? Paste an API key.";
            apiInput.select();
            return;
        }

        //if valid integer match > change button text
        if (confirmStep === 0) {
            startButton.textContent = "Confirm";
            confirmStep = 1;
            return;
        }

        // open modal on first confirm click
        if (confirmStep === 1) {
            modalText.textContent = confirmDialogs[0];
            modalText.style.color = "#d0d0d0";
            modalOk.textContent = "OK";
            modal.style.display = "flex";
            confirmStep = 2;
            return;
        }
    });

    modalOk.addEventListener("click", () => {
        const dialogIndex = confirmStep - 2;

        // final modal warning styling
        if (dialogIndex === confirmDialogs.length - 1) {
            modalText.style.color = "#ff5555";
            modalOk.textContent = "I understand";
        }

        if (dialogIndex < confirmDialogs.length) {
            modalText.textContent = confirmDialogs[dialogIndex];
            confirmStep++;
            return;
        }

        // Final dialog > pop friendly warning
        modal.style.display = "none";
        warningText.style.display = "block";

        setState(STATES.BOOTING);
        startBootSequence();
    });

    render();
});

function startBootSequence() {
    const bootLog = document.getElementById("boot-log");

    bootLog.innerHTML = "";
    bootIndex = 0;

    bootInterval = setInterval(() => {
        if (bootIndex < bootMessages.length) {
            const line = document.createElement("div");
            line.textContent = bootMessages[bootIndex];
            bootLog.appendChild(line);
            bootIndex++;
        } else {
            clearInterval(bootInterval);

            console.log("BOOT COMPLETE → CHARACTER_SELECT");

            setTimeout(() => {
                setState(STATES.CHARACTER_SELECT);
            }, 500);
        }
    }, 600);
}
