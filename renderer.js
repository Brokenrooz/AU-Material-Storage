// Minimal state machine. The UwU code, as it were
// We are NOT calling it that -R

let apiKey = null;
let characterListLoaded = false;

const BUILD_MODE = "dev"; // "dev" | "release"

const STATES = {
    INTRO: "INTRO",
    KEY_CONFIRM: "KEY_CONFIRM",
    BOOTING: "BOOTING",
    CHARACTER_SELECT: "CHARACTER_SELECT",
    INVENTORY_VIEW: "INVENTORY_VIEW",
    LOCKED: "LOCKED"
};

let currentState = STATES.INTRO;

function setState(newState) {
    if (currentState === newState) return;

    console.log("STATE CHANGE:", currentState, "→", newState);
    currentState = newState;

    if (newState === STATES.BOOTING) {
        characterListLoaded = false;
    }

    if (typeof hideItemTooltip === "function") hideItemTooltip();



    render();
}

function render() {
    if (currentState === STATES.INTRO) renderIntro();
    if (currentState === STATES.KEY_CONFIRM) renderKeyConfirm();
    if (currentState === STATES.BOOTING) renderBooting();
    if (currentState === STATES.CHARACTER_SELECT) renderCharacterSelect();
    if (currentState === STATES.LOCKED) renderLocked();
    if (currentState === STATES.INVENTORY_VIEW) renderInventoryView();
}

// The render-y shit

function renderIntro() {
    document.getElementById("intro-screen").style.display = "flex";
    document.getElementById("key-confirm-screen").style.display = "none";
    document.getElementById("character-select").style.display = "none";
    document.getElementById("inventory-view").style.display = "none";
    document.getElementById("boot-log").style.display = "none";
}

function renderKeyConfirm() {
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("character-select").style.display = "none";
    document.getElementById("inventory-view").style.display = "none";
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
    console.log("renderBooting called");
    document.getElementById("key-confirm-screen").style.display = "none";
    document.getElementById("character-select").style.display = "none";
    document.getElementById("inventory-view").style.display = "none";
    document.getElementById("boot-log").style.display = "block";
}

function renderCharacterSelect() {
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("key-confirm-screen").style.display = "none";
    document.getElementById("boot-log").style.display = "none";

    const characterSelect = document.getElementById("character-select");
    document.getElementById("inventory-view").style.display = "none";
    characterSelect.style.display = "grid";

    if (!characterListLoaded) {
        characterListLoaded = true;
        populateCharacterList();
    }
}
// Remember the above "dev" / "release"? -X
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
    "Do not give out your API to people you don't fucking know."
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
    console.log("Boot started");
    const bootLog = document.getElementById("boot-log");
    bootLog.textContent = "";
    let index = 0;

    const interval = setInterval(() => {
        const line = document.createElement("div");
        line.textContent = bootMessages[index];
        bootLog.appendChild(line);

        index++;
        if (index >= bootMessages.length) {
            clearInterval(interval);

            setTimeout(() => {
                onComplete();
            }, 2500);
        }
    }, 600);
}

// Wiring
// Messages that will display if you fail to insert a proper apikey. Seriously, is critical thinking hard for you? -K
// You of all people do not get to say that -R
const shameMessages = [
    "Are you stupid? Paste an API key.",
    "That is not an API key.",
    "Nice try. Still not an API key.",
    "You had one job.",
    "Your mother should have swallowed you.",
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

async function populateCharacterList() {
    console.log("[DATA] populateCharacterList called");

    const listContainer = document.getElementById("character-list");
    if (!listContainer) {
        console.error("character-list container is missing");
        return;
    }

    listContainer.innerHTML = "<div>Loading characters...</div>";

    try {
        const response = await fetch(
            `https://api.guildwars2.com/v2/characters?access_token=${apiKey}`
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const characters = await response.json();

        listContainer.innerHTML = "";

        characters.forEach(name => {
            const row = document.createElement("div");
            row.className = "character-row";

            const nameSpan = document.createElement("span");
            nameSpan.textContent = name;

            const profSpan = document.createElement("span");
            profSpan.className = "char-prof";
            profSpan.textContent = "";

            row.appendChild(nameSpan);
            row.appendChild(profSpan);

            row.addEventListener("click", () => {
                document.querySelectorAll(".character-row")
                    .forEach(el => el.classList.remove("active"));

                row.classList.add("active");

                loadCharacterDetails(name, profSpan);
            });

            listContainer.appendChild(row);
        });

        console.log("[DATA] Characters loaded:", characters.length);
    } catch (err) {
        console.error("[DATA] Character fetch failed:", err);
        listContainer.innerHTML = "<div>Failed to load character.</div>";
    }
}

async function loadCharacterDetails(name, profElement) {
    console.log("[DATA] Loading details for:", name);

    const detailPanel = document.getElementById("character-details");
    detailPanel.innerHTML = "<div>Loading character...</div>";

    try {
        console.log("Using API key:", apiKey);
        const response = await fetch(
            `https://api.guildwars2.com/v2/characters/${encodeURIComponent(name)}?access_token=${apiKey}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch character details");
        }

        const data = await response.json();
        console.log("FULL CHARACTER DATA:", data);

        if (profElement) {
            profElement.textContent = data.profession;
        }

        let eliteSpecName = "None";
        const eliteId = data.specializations?.pve?.[2]?.id;

        if (eliteId) {
            const specRes = await fetch(
                `https://api.guildwars2.com/v2/specializations/${eliteId}`
            );

            if (specRes.ok) {
                const specData = await specRes.json();
                eliteSpecName = specData.name;
            }
        }

        let mapName = "Unknown";

        if (data.map_id) {
            const mapRes = await fetch(
                `https://api.guildwars2.com/v2/maps/${data.map_id}` //This one requires you to be online, on the character. Its kind of useless :/
            );

            if (mapRes.ok) {
                const mapData = await mapRes.json();
                mapName = mapData.name;
            }
        }

        detailPanel.innerHTML = `
            <h2>${data.name}</h2>
            <p><strong>Profession:</strong> ${data.profession}</p>
            <p><strong>Level:</strong> ${data.level}</p>
            <p><strong>Location:</strong> ${mapName}</p>
            <p><strong>Elite Spec:</strong> ${eliteSpecName}</p>
        `;


        // Inventory button: because clicking things is apparently how we do UX -X
        // Is that a double X? -K
        const inventoryBtn = document.createElement("button");
        inventoryBtn.className = "account-btn";
        inventoryBtn.textContent = "View Inventory";

        inventoryBtn.addEventListener("click", () => {
            currentInventoryCharacter = name;
            setState(STATES.INVENTORY_VIEW);
        });

        detailPanel.appendChild(document.createElement("br"));
        detailPanel.appendChild(inventoryBtn);
    } catch (err) {
        console.error(err);
        detailPanel.innerHTML = "<div>Failed to load character.</div>";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    characterListLoaded = false;

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
        confirmStep = 0;
        modalOk.textContent = "Confirm";
    });

    modalOk.addEventListener("click", () => {
        const dialogIndex = confirmStep;

        if (dialogIndex >= confirmDialogs.length) {
            console.log("Triggering BOOT state");

            modal.style.display = "none";
            warningText.style.display = "block";

            setState(STATES.BOOTING);

            setTimeout(() => {
                console.log("Calling runBootSequence");
                runBootSequence(() => {
                    console.log("Boot complete → switching to CHARACTER_SELECT");
                    setState(STATES.CHARACTER_SELECT);
                });
            }, 50);

            return;
        }

        modalText.textContent = confirmDialogs[dialogIndex];

        if (dialogIndex === confirmDialogs.length - 1) {
            modalOk.textContent = "I understand";
            modalText.style.color = "#ff5555";
        } else {
            modalOk.textContent = "Confirm";
            modalText.style.color = "#d0d0d0";
        }

        confirmStep++;
    });

    keyInput?.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;

        const value = keyInput.value.toLowerCase();

        if (value === "y") {
            setState(STATES.BOOTING);

            setTimeout(() => {
                runBootSequence(() => setState(STATES.CHARACTER_SELECT));
            }, 50);
        }

        if (value === "n") {
            window.close();
        }

        keyInput.value = "";
    });
});

let inventoryRenderToken = 0;
STATES.INVENTORY_VIEW = "INVENTORY_VIEW";

const inventoryCategories = [
    "ALL ITEMS",
    "WEAPONS",
    "ARMOR",
    "TRINKETS",
    "CONSUMABLES",
    "MATERIALS",
    "MISC"
];

let currentInventoryCharacter = null;

// Character inventory, tooltips on hover
// Real tooltips is the goal, cus who the fuck doesnt like looking at a picture and playing, "which fucking mini is that?" -R

let _tooltipToken = 0;
let _tooltipEl = null;
let _tooltipRAF = 0;
let _tooltipMouseX = 0;
let _tooltipMouseY = 0;

function getTooltipEl() {
    if (_tooltipEl) return _tooltipEl;
    _tooltipEl = document.getElementById("item-tooltip");

    // If the HTML didn't include it, fabricate one. (Yes, I'm enabling bad habits) -X
    if (!_tooltipEl) {
        _tooltipEl = document.createElement("div");
        _tooltipEl.id = "item-tooltip";
        document.body.appendChild(_tooltipEl);
    }
    return _tooltipEl;
}

function hideItemTooltip() {
    const el = getTooltipEl();
    el.style.display = "none";
    el.innerHTML = "";
    _tooltipToken++;
}

function sanitizeGw2Text(text) {
    if (!text) return "";
    // Strip HTML tags and GW2's weird <c=@...> color tags -X
    return String(text)
        .replace(/<\/?c[^>]*>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\r?\n/g, "\n")
        .trim();
}

function scheduleTooltipReposition() {
    if (_tooltipRAF) return;
    _tooltipRAF = requestAnimationFrame(() => {
        _tooltipRAF = 0;
        positionTooltip(_tooltipMouseX, _tooltipMouseY);
    });
}

function positionTooltip(x, y) {
    const el = getTooltipEl();
    if (el.style.display === "none") return;

    const pad = 12;
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - pad;
    const maxY = window.innerHeight - rect.height - pad;

    let left = x + pad;
    let top = y + pad;

    if (left > maxX) left = Math.max(pad, x - rect.width - pad);
    if (top > maxY) top = Math.max(pad, y - rect.height - pad);

    el.style.left = left + "px";
    el.style.top = top + "px";
}

async function fetchJsonSafe(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

async function getItemStatDef(statId) {
    if (!statId) return null;

    renderInventoryGrid._itemStatCache = renderInventoryGrid._itemStatCache || new Map();
    const cache = renderInventoryGrid._itemStatCache;

    if (cache.has(statId)) return cache.get(statId);

    const data = await fetchJsonSafe(`https://api.guildwars2.com/v2/itemstats/${statId}`);
    cache.set(statId, data);
    return data;
}

async function ensureItemDefs(ids) {
    if (!ids || !ids.length) return;

    const itemDefCache = renderInventoryGrid._itemDefCache || new Map();
    renderInventoryGrid._itemDefCache = itemDefCache;

    const missing = [];
    for (const id of ids) {
        if (id && !itemDefCache.has(id)) missing.push(id);
    }
    if (!missing.length) return;

    // /v2/items supports 200 ids per call, as opposed to not batching them and getting back "haha, fuck you" error -K
    for (let i = 0; i < missing.length; i += 200) {
        const chunk = missing.slice(i, i + 200);
        const idsStr = chunk.join(",");
        const defs = await fetchJsonSafe(`https://api.guildwars2.com/v2/items?ids=${idsStr}`);
        if (!defs) continue;

        for (const def of defs) {
            if (def && def.id) itemDefCache.set(def.id, def);
        }
    }
}

function formatAttributes(attrs) {
    if (!attrs) return "";
    const parts = [];
    for (const [k, v] of Object.entries(attrs)) {
        parts.push(`${k}: ${v}`);
    }
    return parts.join(" • ");
}

function buildTooltipHTML(invItem, itemDef, statDef, upgradeNames) {
    const name = (itemDef && itemDef.name) ? itemDef.name : `Item ${invItem ? invItem.id : "?"}`;
    const rarity = itemDef && itemDef.rarity ? itemDef.rarity : "";
    const type = itemDef && itemDef.type ? itemDef.type : "";
    const level = itemDef && typeof itemDef.level === "number" ? itemDef.level : "";
    const count = invItem && invItem.count ? invItem.count : 1;

    const desc = sanitizeGw2Text(itemDef && itemDef.description ? itemDef.description : "");

    const lines = [];

    if (rarity || type || level !== "") {
        const meta = [rarity, type, level !== "" ? `Lvl ${level}` : ""].filter(Boolean).join(" • ");
        if (meta) lines.push(`<div class="tt-meta">${meta}</div>`);
    }

    if (count > 1) lines.push(`<div class="tt-line">Count: ${count}</div>`);

    if (invItem) {
        if (invItem.binding) lines.push(`<div class="tt-line">Binding: ${invItem.binding}</div>`);
        if (invItem.bound_to) lines.push(`<div class="tt-line">Bound to: ${invItem.bound_to}</div>`);
    }

    // Equipment-ish details -R
    const details = itemDef && itemDef.details ? itemDef.details : null;
    if (details) {
        if (typeof details.defense === "number") lines.push(`<div class="tt-line">Defense: ${details.defense}</div>`);
        if (details.weight_class) lines.push(`<div class="tt-line">Weight: ${details.weight_class}</div>`);
        if (details.damage_type) lines.push(`<div class="tt-line">Damage: ${details.damage_type}</div>`);
        if (typeof details.min_power === "number" && typeof details.max_power === "number") {
            lines.push(`<div class="tt-line">Power: ${details.min_power}–${details.max_power}</div>`);
        }
    }

    // Chosen stats (if the item instance has them) -X
    if (invItem && invItem.stats) {
        const statName = statDef && statDef.name ? statDef.name : (invItem.stats.id ? `Stat ${invItem.stats.id}` : "Stats");
        const attrs = invItem.stats.attributes || (statDef ? statDef.attributes : null);
        const attrText = formatAttributes(attrs);
        lines.push(`<div class="tt-line">Stats: ${sanitizeGw2Text(statName)}${attrText ? ` — ${attrText}` : ""}</div>`);
    }

    // Upgrades (runes/sigils/infusions), best-effort -X
    if (upgradeNames && upgradeNames.length) {
        lines.push(`<div class="tt-line">Upgrades: ${upgradeNames.map(sanitizeGw2Text).join(", ")}</div>`);
    }

    if (desc) {
        lines.push(`<div class="tt-desc">${desc.replace(/\n/g, "<br/>")}</div>`);
    }

    return `
        <div class="tt-name">${sanitizeGw2Text(name)}</div>
        ${lines.join("")}
    `;
}

function attachItemTooltip(slotEl, invItem, itemDef) {
    slotEl.addEventListener("mouseenter", (e) => {
        _tooltipMouseX = e.clientX;
        _tooltipMouseY = e.clientY;

        const el = getTooltipEl();
        const myToken = ++_tooltipToken;

        el.style.display = "block";
        el.innerHTML = buildTooltipHTML(invItem, itemDef, null, null);
        positionTooltip(_tooltipMouseX, _tooltipMouseY);

        // Lazy-load the extra details (stats + upgrades) and update tooltip when ready -K
        (async () => {
            // If user already moved away, don't bother. (read, fuck em) -X
            if (myToken !== _tooltipToken) return;

            // Stats
            let statDef = null;
            if (invItem && invItem.stats && invItem.stats.id) {
                statDef = await getItemStatDef(invItem.stats.id);
            }

            // Upgrades (item ids)
            const upgradeIds = [];
            if (invItem && Array.isArray(invItem.upgrades)) upgradeIds.push(...invItem.upgrades);
            if (invItem && Array.isArray(invItem.infusions)) upgradeIds.push(...invItem.infusions);

            if (upgradeIds.length) {
                await ensureItemDefs(upgradeIds);
            }

            if (myToken !== _tooltipToken) return;

            const defCache = renderInventoryGrid._itemDefCache || new Map();
            const upgradeNames = upgradeIds
                .map(id => (defCache.get(id) && defCache.get(id).name) ? defCache.get(id).name : null)
                .filter(Boolean);

            el.innerHTML = buildTooltipHTML(invItem, itemDef, statDef, upgradeNames);
            positionTooltip(_tooltipMouseX, _tooltipMouseY);
        })();
    });

    slotEl.addEventListener("mousemove", (e) => {
        _tooltipMouseX = e.clientX;
        _tooltipMouseY = e.clientY;
        scheduleTooltipReposition();
    });

    slotEl.addEventListener("mouseleave", () => {
        hideItemTooltip();
    });
}

// End of hover tips system, thank you for reading -K



function renderInventoryView() {
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("key-confirm-screen").style.display = "none";
    document.getElementById("character-select").style.display = "none";
    document.getElementById("inventory-view").style.display = "grid";

    renderInventoryCategories();
    renderInventoryCommands();
    renderInventoryGrid();
}

function renderInventoryCategories() {
    const container = document.getElementById("inventory-categories");
    container.innerHTML = "";

    inventoryCategories.forEach((cat, index) => {
        const entry = document.createElement("div");
        entry.className = "terminal-entry";
        entry.textContent = cat;

        if (index === 0) entry.classList.add("active");

        entry.addEventListener("click", () => {
            document.querySelectorAll("#inventory-categories .terminal-entry")
                .forEach(el => el.classList.remove("active"));
            entry.classList.add("active");

            renderInventoryGrid(cat);
        });

        container.appendChild(entry);
    });
}

function renderInventoryCommands() {
    const container = document.getElementById("inventory-commands");
    container.innerHTML = "";

    const returnEntry = document.createElement("div");
    returnEntry.className = "terminal-entry active";
    returnEntry.textContent = "RETURN TO CHARACTER SELECT";

    returnEntry.addEventListener("click", () => {
        document.getElementById("inventory-view").style.display = "none";
        setState(STATES.CHARACTER_SELECT);
    });

    container.appendChild(returnEntry);
}

async function renderInventoryGrid(filter = "ALL ITEMS") {
    const grid = document.getElementById("inventory-grid");
    grid.innerHTML = "";

    if (!currentInventoryCharacter) return;

    const myToken = ++inventoryRenderToken;

    // Lazy caches, because hammering /v2/items one by one is for unhinged people -X
    // So like Kazu? -R
    // Keyed by character name -X
    if (!renderInventoryGrid._inventoryCache) renderInventoryGrid._inventoryCache = new Map();
    // Keyed by item id -X
    if (!renderInventoryGrid._itemDefCache) renderInventoryGrid._itemDefCache = new Map();
    // Keyed by fuck both of you -K
    const inventoryCache = renderInventoryGrid._inventoryCache;
    const itemDefCache = renderInventoryGrid._itemDefCache;

    function matchesFilter(filterName, itemType) {
        if (filterName === "ALL ITEMS") return true;

        return (
            (filterName === "WEAPONS" && itemType === "Weapon") ||
            (filterName === "ARMOR" && itemType === "Armor") ||
            (filterName === "TRINKETS" && itemType === "Trinket") ||
            (filterName === "CONSUMABLES" && itemType === "Consumable") ||
            (filterName === "MATERIALS" && itemType === "CraftingMaterial") ||
            (filterName === "MISC" &&
                itemType !== "Weapon" &&
                itemType !== "Armor" &&
                itemType !== "Trinket" &&
                itemType !== "Consumable" &&
                itemType !== "CraftingMaterial"
            )
        );
    }

    function chunk(arr, size) {
        const out = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
    }

    try {
        // Abort if a newer render started, Seriously, how many of these are there? -K
        if (myToken !== inventoryRenderToken) return;

        // Pull inventory once per character (unless you *want* to DDOS yourself) ...Dont you fucking say it -R
        // o3o Meanie -K
        let allItems = inventoryCache.get(currentInventoryCharacter);

        if (!allItems) {
            const response = await fetch(
                `https://api.guildwars2.com/v2/characters/${encodeURIComponent(currentInventoryCharacter)}/inventory?access_token=${apiKey}`
            );

            if (!response.ok) throw new Error("Inventory fetch failed");

            const data = await response.json();

            allItems = [];

            data.bags.forEach(bag => {
                if (!bag || !bag.inventory) return;
                bag.inventory.forEach(item => {
                    if (item && item.id) allItems.push(item);
                });
            });

            inventoryCache.set(currentInventoryCharacter, allItems);
        }

        // Abort if a newer render started
        if (myToken !== inventoryRenderToken) return;

        if (!allItems.length) {
            grid.innerHTML = "<div>No inventory items found.</div>";
            return;
        }

        // Batch-resolve item definitions (200 ids max per call)
        const uniqueIds = Array.from(new Set(allItems.map(i => i.id)));
        const missingIds = uniqueIds.filter(id => !itemDefCache.has(id));

        for (const batch of chunk(missingIds, 200)) {
            // Abort if a newer render started
            if (myToken !== inventoryRenderToken) return;

            if (!batch.length) continue;

            const ids = batch.join(",");
            const itemRes = await fetch(`https://api.guildwars2.com/v2/items?ids=${ids}`);

            if (!itemRes.ok) continue;

            const itemDefs = await itemRes.json();
            itemDefs.forEach(def => {
                if (def && def.id) itemDefCache.set(def.id, def);
            });
        }

        // Abort if a newer render started | God I love making these /s -X
        if (myToken !== inventoryRenderToken) return;

        // Render filtered grid. /) <- doesnt that look like a hoof? -K
        const frag = document.createDocumentFragment();
        let rendered = 0;

        for (const item of allItems) {
            // Abort if a newer render started
            if (myToken !== inventoryRenderToken) return;

            const itemData = itemDefCache.get(item.id);
            if (!itemData) continue;
            if (!matchesFilter(filter, itemData.type)) continue;
            const slot = document.createElement("div");
            slot.className = "item-slot";

            const img = document.createElement("img");
            img.src = itemData.icon || "";
            img.alt = itemData.name || `Item ${item.id}`;
            slot.appendChild(img);

            if (item.count && item.count > 1) {
                const count = document.createElement("div");
                count.className = "item-count";
                count.textContent = item.count;
                slot.appendChild(count);
            }

            // Tooltip hook (this function exists earlier in file) -X
            attachItemTooltip(slot, item, itemData);

            frag.appendChild(slot);
            rendered++;

        }

        grid.appendChild(frag);

        if (rendered === 0) {
            grid.innerHTML = `<div>No items match: ${filter}</div>`;
        }

    } catch (err) {
        console.error("Inventory load failed:", err);
        grid.innerHTML = "<div>Failed to load inventory.</div>";
    }
}





// The Graveyard of why the fuck does this even exist


if (false) {

    // render() extends to support inv view -X
    // NOTE: no longer needed (core render() now handles INVENTORY_VIEW) -R
    const originalRender = render;

    render = function () {
        originalRender();
        if (currentState === STATES.INVENTORY_VIEW) {
            renderInventoryView();
        }
    }
}
// Were disabling this? -K
// Legacy monkey-patch approach, its been reformatted further up -R
if (false) {
    const originalLoadCharacterDetails = loadCharacterDetails;

    loadCharacterDetails = async function (name, profElement) {
        await originalLoadCharacterDetails(name, profElement);

        const detailPanel = document.getElementById("character-details");

        const inventoryBtn = document.createElement("button");
        inventoryBtn.className = "account-btn";
        inventoryBtn.textContent = "View Inventory";

        inventoryBtn.addEventListener("click", () => {
            currentInventoryCharacter = name;
            setState(STATES.INVENTORY_VIEW);

        });

        detailPanel.appendChild(document.createElement("br"));
        detailPanel.appendChild(inventoryBtn);
    };
}
// dupy slot render snip -X
if (false) {
    const slot = document.createElement("div");
    slot.className = "item-slot";

    const img = document.createElement("img");
    img.src = itemData.icon;
    img.title = itemData.name;

    slot.appendChild(img);

    if (item.count && item.count > 1) {
        const count = document.createElement("div");
        count.className = "item-count";
        count.textContent = item.count;
        slot.appendChild(count);
    }

    grid.appendChild(slot);

}
