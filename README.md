# AU Material Storage (AUMS)
A desktop **Guild Wars 2** tool for browsing your account-wide storage and character inventories with a lightweight, terminal-ish UI.

## What it does
- **Character Select** → pick a character
- **Advanced Character View**
  - **Character Inventory** (grid view)
  - **Hover tooltips** (name/rarity/type + more details as available)
- **Account-wide Material Storage**
  - Category filters (e.g. Leather / Ingots & Ore / Gems / T1–T6 / Misc)
  - **Search** (fast filtering)
  - Scrollable grid (built to survive “I hoard everything” accounts)
- Caches `/v2/items` lookups so we don’t hammer the API like animals

## Roadmap (WIP)
- Account-wide **Bank Tabs** screen (same pattern as Materials/Inventory)
- More faithful “in-game style” category buckets and sorting
- Better material grouping (wood/cloth/etc) + per-tier grouping refinement
- Optional tooltip/embed system (may bring its own styling; will be sandboxed if added)

## Requirements
- **Node.js + npm**
- A **Guild Wars 2 API Key** with the appropriate scopes:
  - `account` (mandatory for all keys)
  - `inventories` (materials/bank/character inventories)
  - `characters` (character list/details)
  
Create a key here:
- https://account.guildwars2.com/account/api-keys

## Install
```bash
git clone <your-repo-url>
cd AU-Material-Storage
npm install
```
Notes on API keys
The app may prompt to reuse a saved API key (Y/N).
Your key is stored locally for convenience. Treat it like a password.
If you ever want to reset it, delete the saved key file/config (location depends on your setup/build).
