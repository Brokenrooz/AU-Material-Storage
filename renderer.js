// Minimal state machine. The UwU code, as it were

let apiKey = null;
let characterListLoaded = false;

const BUILD_MODE = "dev"; // "dev" | "release"

const STATES = {
    INTRO: "INTRO",
    KEY_CONFIRM: "KEY_CONFIRM",
    BOOTING: "BOOTING",
    CHARACTER_SELECT: "CHARACTER_SELECT",
    LOCKED: "LOCKED"
};

let currentState = STATES.INTRO;

function setState(newState) {
    currentState = newState;
    render();
}

function render() {
    if (currentState === STATES.INTRO) renderIntro();
    if (currentState === STATES.KEY_CONFIRM) renderKeyConfirm();
    if (currentState === STATES.BOOTING) renderBooting();
    if (currentState === STATES.CHARACTER_SELECT) renderCharacterSelect();
    if (currentState === STATES.LOCKED) renderLocked();
}

// The render-y shit

function renderIntro() {
    document.getElementById("intro-screen").style.display = "flex";
    document.getElementById("key-confirm-screen").style.display = "none";
    document.getElementById("character-select").style.display = "none";
    document.getElementById("boot-log").style.display = "none";
}

function renderKeyConfirm() {
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("character-select").style.display = "none";
    document.getElementById("boot-log").style.display = "none";

    const screen = document.getElementById("key-confirm-screen");
    const text = document.getElementById("key-confirm-text");
    const input = document.getElementById("key-confirm-input");

    screen.style.display = "flex";
    text.textContent =
        `API key detected for ${localStorage.getItem("gw2AccountName") ?? "this account"}\n` +
        `Would you like to continue? (Y/N)`;

    input.value = "";
    input.focus();
}

function renderBooting() {
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("key-confirm-screen").style.display = "none";
    document.getElementById("boot-log").style.display = "block";
}

function renderCharacterSelect() {
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("key-confirm-screen").style.display = "none";
    document.getElementById("boot-log").style.display = "none";

    const characterSelect = document.getElementById("character-select");
    characterSelect.style.display = "grid";

    if (!characterListLoaded) {
        populateCharacterList();
        characterListLoaded = true;
    }
}

function renderLocked() {
    document.body.innerHTML = `
        <div style="
            background:#000;
            color:#ff5555;
            font-family:monospace;
            height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:2rem;">
            <div>
                <p>[ INTEGRITY VIOLATION DETECTED ]</p>
                <p>Core behavioral safeguard has been altered.</p>
                <p>Application Failure.</p>
                <br/>
                <p style="opacity:0.6">
                    If you understand why this happened,  
                    you also understand how to fix it.
                </p>
                <p style="opacity:0.4">
                    Otherwise: reinstall.
                </p>
            </div>
        </div>
    `;
}

let confirmStep = 0;

const confirmDialogs = [
    "You are about to give this app access to your account API data.",
    "This key can read your character and storage data.",
    "Confirm that you have correctly understood what this app is going to do.",
    "Do not give out your fucking API key to anyone. Ever."
];

const bootMessages = [
    "Initializing API subsystems...",
    "Validating API key format...",
    "Establishing secure local session...",
    "Requesting account permissions...",
    "Uploading account data to chinese servers...",
    "Preparing character index...",
    "Boot sequence nominal.",
    "UwU Account Data loaded."
];

function runBootSequence(onComplete) {
    const bootLog = document.getElementById("boot-log");
    bootLog.textContent = "";
    let index = 0;

    const interval = setInterval(() => {
        bootLog.textContent += bootMessages[index] + "\n";
        index++;
        if (index >= bootMessages.length) {
            clearInterval(interval);
            setTimeout(onComplete, 1800);
        }
    }, 1000);
}

// Wiring

const shameMessages = [
    "Are you stupid? Paste an API key.",
    "That is not an API key.",
    "Nice try. Still not an API key.",
    "You had one job.",
    "This is not how computers work.",
    "Incorrect. Try again.",
    "Traces of Melvis detected. Intelligence not found.",
    "API keys have hyphens. This does not.",
    "If a higher form of life exists, you are definitely not it."
];

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString();
}

document.addEventListener("DOMContentLoaded", async () => {

    // ---- Integrity Guard (SAFE POSITION) ----
    const SHAME_HASH_KEY = "shameIntegrityHash";
    const currentShameHash = hashString(shameMessages.join("|"));
    const storedShameHash = localStorage.getItem(SHAME_HASH_KEY);

    if (!storedShameHash) {
        localStorage.setItem(SHAME_HASH_KEY, currentShameHash);
    } else if (storedShameHash !== currentShameHash) {
        localStorage.setItem("appLocked", "true");
    }

    if (BUILD_MODE === "release" && localStorage.getItem("appLocked") === "true") {
        setState(STATES.LOCKED);
        return;
    }

    // ---- Normal Startup ----
    const savedKey = localStorage.getItem("gw2ApiKey");

    if (savedKey) {
        apiKey = savedKey;
        setState(STATES.KEY_CONFIRM);
    } else {
        setState(STATES.INTRO);
    }

    const apiInput = document.getElementById("api-key-input");
    const startButton = document.getElementById("start-button");
    const modal = document.getElementById("confirm-modal");
    const modalText = document.getElementById("confirm-text");
    const modalOk = document.getElementById("confirm-ok");
    const warningText = document.getElementById("warning-text");
    const keyInput = document.getElementById("key-confirm-input");

    startButton.addEventListener("click", () => {
        const key = apiInput.value.trim();
        const looksLikeApiKey =
            key.length >= 60 &&
            key.includes("-") &&
            /^[a-zA-Z0-9-]+$/.test(key);

        if (!looksLikeApiKey) {
            apiInput.value =
                shameMessages[Math.floor(Math.random() * shameMessages.length)];
            apiInput.select();
            return;
        }

        apiKey = key;
        localStorage.setItem("gw2ApiKey", apiKey);

        startButton.textContent = "Confirm";
        modalText.textContent = confirmDialogs[0];
        modal.style.display = "flex";
        confirmStep = 2;
    });

    modalOk.addEventListener("click", () => {
        const dialogIndex = confirmstep - 2;

        if (dialogIndex === confirmDialogs.length - 1) {
            modalText.style.color = "#ff5555";
            modalOk.textContent = "I understand";
        } else {
            modalOk.textContent = "Confirm";
            modalText.style.color = "#d0d0d0";
        }

        if (dialogIndex < confirmDialogs.length) {
            modalText.textContent = confirmDialogs[dialongIndex];
            confirmStep++
            return;
        }

        modal.style.display = "none";
        warningText.style.display = "block";

        setState(STATES.BOOTING);
        runBootSequence(() => setState(STATES.CHARACTER_SELECT));
    });


    keyInput?.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;
        if (keyInput.value.toLowerCase() === "y") {
            setState(STATES.BOOTING);
            runBootSequence(() => setState(STATES.CHARACTER_SELECT));
        }
        if (keyInput.value.toLowerCase() === "n") {
            window.close();
        }
        keyInput.value = "";
    });

});
