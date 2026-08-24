# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Capitol Hill: The Markup is a browser-based interactive narrative game about policy advocacy in the US Congress. The player works for the American AI Policy Center (AAPC) navigating relationships and coalition dynamics to influence a committee vote on the Frontier AI Safety Act. Pure vanilla JS/HTML/CSS with no build process or dependencies.

## Running and Testing

- **Play the game:** Open `index.html` in a browser
- **Run tests:** Open `tests.html` in a browser (auto-runs on load, click "Run Tests" to re-run)
- **No build step, no npm, no package manager** — everything runs directly in the browser

## Architecture

Four JS modules loaded via `<script>` tags (order matters):

1. **`js/story.js`** (~4000 lines) — All game data: scene definitions (91 scenes), the `LOCATIONS` registry, `SPEAKER_STYLES`/`SPEAKER_GROUPS` mappings, `ROUTING_RULES`, and vote counting logic. This is the content layer.

2. **`js/dialogue.js`** — `DialogueEngine` class. Renders dialogue with typewriter effect (30ms/char), manages portraits, renders choice buttons with staggered fade-in. Speaker name determines CSS class via the style mappings in story.js.

3. **`js/scene.js`** — `SceneManager` class. Loads scenes by ID from `STORY`, processes conditional dialogue, handles scene transitions with fades, manages day progression (Mon-Wed, 3 days), filters choices by `conditionalOnly`, and routes through the `routeScene()` system. Auto-saves after each scene load.

4. **`js/main.js`** — `Game` class. Entry point. Manages menu/game screen toggling, save/load via localStorage (key: `"capitol_save"`), wires up click/spacebar to advance.

**Data flow:** `Game` → `SceneManager` → `DialogueEngine`, with `STORY` object as the shared data source.

## Story Flow

**Monday — Setup & Alliances**
- `intro` → Office briefing with Sarah on the Frontier AI Safety Act markup (sets `hadCoffee`)
- `champion_intro` → Rep. Okafor, the bill's lead sponsor on the committee, phones you. Sets `championOnboard`; the whip-count choice also sets `championWhipping` and `clueBoydHawk`
- `the_filibuster` → Drinks with Elena (MindScale lobbyist). Key choice: trust her or stay suspicious
- `stakeholder_meeting` → Public hearing. Choice to speak up or stay silent; staffer approaches afterward with an offer
- `coalition_call_intro` → Phone call to recruit coalition partners (Amara/civil rights, Kai/disability, Diane/watchdog). Negotiate each one individually. Amara and Diane both want "the lead" (page one) — you can promise both but must pick one in `coalition_final_choice`. Breaking a promise loses that partner. Routes through `coalition_outcome` (strong/moderate/weak)

**Monday Night — Inbox & Time Pressure**
- `inbox_triage` → Email triage (journalist, intern request, listserv drama)
- `time_pressure_choice` → Key fork: prep testimony OR visit Priya at her think tank. This is the main branching point — each path gets unique content but both converge at `news_break`
- `news_break` → Breaking news about Amendment 7. Choice to seize the moment (fast) or play it safe (slow)

**Tuesday — Second Act**
- `act2_morning` → Morning after news. Strategy choice: call committee members OR rally coalition. Then MindScale drops a counter-move — choice to confront or ignore
- `act2_final_prep` → Last prep before the hearing
- `elena_check` router → If player trusted both Elena and the staffer, Elena gets burned (betrayal consequence)

**Wednesday — The Markup Hearing**
- `markup_hearing_open` → Committee hearing begins. Interactive sequence:
  - Comment choice: focus on Amendment 7 or spread across amendments
  - Recess choice: lobby in hallway or pass intel to allies
- `markup_hearing_vote` → Amendment 7 vote called. Result computed by `getAmendment7Result(flags)`
- `miracle_check` router → If amendment fails outright (5 swings, margin -1), routes to miracle climax

**Post-Vote — Climax & Endings**
- `climax` → Post-vote fallout
- `climax_choice_check` router → Five paths based on which allies you have and whether you have leverage:
  - Both allies + leverage → negotiate or walk away
  - Both allies, no leverage → deal falls through
  - Coalition only (`climax_coalition_only`) / Priya only / Neither → limited options
- `ending_check` router → Eight endings (see below)

## Key Systems

### Flag-Driven Branching
All story branches are controlled by boolean flags (40 in `initialFlags`). Flags are set via scene `setFlags` or choice `setFlags`. Key flags: `trustedElena`, `sharedWithPriya`, `seizedMoment`, `focusedAmendment7`, `coalitionAligned`, `alignedCivilRights`/`alignedDisability`/`alignedWatchdog`, `promisedAmaraLead`/`promisedDianeLead`/`choseAmaraLead`/`choseDianeLead`, `preparedTestimony`, `calledCommitteeMembers`, `confrontedMindScale`, `miracleVictory`, `championOnboard`/`championWhipping`, `hadCoffee`.

**The climax and endings are decoupled from `trustedElena`.** `climax_choice_check` and `ending_check` key on `coalitionAligned`, `sharedWithPriya` and `seizedMoment` only — regression tests assert Elena's flags appear in neither. `trustedElena` still gates `elena_check` (the burn), `clueMarcusTie`, and conditional dialogue, but it no longer decides where the story lands.

### Conditional Dialogue (3 types)
- `conditionalOnly: 'flagName'` — include line only if flag is true; prefix with `!` to negate
- `conditionalText: { flagName: 'alt text' }` — replace text if flag is true
- `textFn: (flags) => string` — computed text from flags

### Router Scenes
Scenes with `isRouter: true` and a `routerId` use `ROUTING_RULES` to branch based on flag state. Key routers include `coalition_status`, `elena_check`, `boyd_security`, `miracle_check`, `climax_choice_check`, and `ending_check` (plus the two rebuttal checks). Each has ordered conditions — first match wins.

### Vote Counting
`getAmendment7Result(flags)` in story.js computes a 25-member committee vote. Industry starts with 17 YES votes, 8 NO; each swing flips one yes to no. Some swings require flag combinations (e.g., `calledRecess && seizedMoment`). Max practical swings = 6. At 5 swings: 12-13, amendment fails outright by one (miracle path). At 6 swings (requires flipping Boyd via `boydFlipped`): 11-14, a decisive bipartisan defeat (realignment path). At 4 or fewer: amendment passes. `sharedWithPriya` and `preparedTestimony` are mutually exclusive (time pressure fork), so both paths can reach 5 swings through different combos. When changing vote math, update BOTH the story.js vote function AND the vote-count tests in tests.js.

### Eight Endings
Determined by `ending_check` router (checked in priority order, first match wins). Eight endings:
- **Common Ground** (`ending_realignment`) — Bipartisan defeat of Amendment 7 (6 swings; flipped Rep. Boyd by making the safety case on national-security terms he already holds). The hardest/best ending, gated behind the Boyd whip-count deduction puzzle. Set via `bipartisanWin`. Outranks the miracle. (Scene id and flag keep the `realignment`/`bipartisanWin` names; user-facing label is "Common Ground" — Boyd voting his own priorities is treated as ordinary coalition work, not a sea-change.)
- **The Breakthrough** (`ending_miracle`) — Amendment 7 defeated outright (5 swings). Requires miracle path.
- **Incremental** (`ending_incremental`) — Both allies, negotiated a compromise.
- **Walked Away** (`ending_walked_away`) — Both allies, walked away from the deal.
- **No Leverage** (`ending_no_leverage`) — Both allies but no leverage, deal falls through.
- **Cassandra** (`ending_cassandra`) — Coalition only: a movement that was right but couldn't reach the votes.
- **Pyrrhic** (`ending_pyrrhic`) — Priya only, amendment passes, fight continues.
- **Status Quo** (`ending_status_quo`) — No allies or burned Elena, nothing changes.

### Conservative Cast + Boyd Whip-Count Deduction Puzzle (the hardest puzzle)
Three conservative figures add ideological texture: **Rep. Reese** (R, innovation-first, hard YES on Amendment 7 — unflippable, China-race absolutist), **Rep. Boyd** (R, populist, the gettable swing vote), and **Marcus Halloran** (a MindScale-tied operative who "plays both sides"). They are written to be coherent and persuasive, not strawmen — the pro-safety case is reframed through national-security/sovereignty/anti-Big-Tech-populism.

The puzzle is a **hidden-information deduction**: three sources each give a contradictory read on how to flip Boyd. Exactly one is right.
- **Elena** (insider, but self-interested): anti-monopoly frame → *backfires* (Boyd's donor is Prometheus; he hears a rival's play).
- **Marcus** (paid by MindScale): "skip Boyd, lost cause" → *misdirection* (keeps a swing vote off the table for his client).
- **Priya / committee homework**: national-security frame → *correct*.

Clues gathered across the game let the player tell them apart, and they come from **deliberately split sources** so no single conversation hands over the answer: `clueMarcusTie` (eliminates Marcus; from `elena_trusted`), `clueBoydDonor` (poisons the monopoly frame; from `priya_ally` **only**), `clueBoydHawk` (his hawk record; from `act2_phones` committee calls **or** `champion_intro_whip`). At the Wednesday commit (`whip_boyd_choice`, inserted between the recess scenes and the vote), choosing the **security** frame routes through `boyd_security_router`, which sets `boydFlipped` only when the player holds **both** `clueBoydHawk` and `clueBoydDonor` — one source is a hunch, not receipts, and Boyd stays noncommittal. Because the donor clue comes only from Priya, flipping Boyd requires the Priya path; the testimony fork cannot reach Common Ground. `boydFlipped` adds a 6th vote swing. Wrong deduction (monopoly/skip) or no homework → Boyd stays a no, and a close vote can flip from fail to pass.

### Internal Champion + Coffee

**Rep. Gloria Okafor (D)** is the bill's lead sponsor on the committee and the player's inside voice — speaker key `'Okafor'`, CSS class `.speaker-okafor`. Distinct from Peters (who *offers* Amendment 7) and Chen (Priya's no vote). `champion_intro` sits on the main path (`intro` → `champion_intro` → `the_filibuster`); she establishes the 17-yes / need-5 count and frames herself as the person who reads your case into the record. Both her choices set `championOnboard`; "run the whip count" additionally sets `championWhipping` and `clueBoydHawk`, making her the third hawk-clue source. She is a **soft gate** — narratively load-bearing and a clue source, but she adds **no vote swing**, so no ending is locked behind her. She recurs in `markup_hearing_open`/`markup_hearing_vote` and pays off in the realignment, miracle and status-quo endings.

The **coffee motif** (`hadCoffee`, set in `intro`) is pure texture — Sarah's cup, the midnight coffee-maker beat in `act2_final_prep`, "I'll make more coffee" in `ending_status_quo`. It never hard-gates anything.

## Tone

Standing guidance, easy to regress:

- **Don't draw attention to Boyd's party in either direction.** Being aghast that a Republican backs AI safety is the error; so is admiring how honorable it was. Both are the text protesting too much about party while claiming party doesn't matter. Characterize Boyd by his **priorities** (China hawk, anti-Big-Tech populist) and foreground the **whip-count craft** — you found what he already cared about and put it in front of him. Operational party talk in whip counting ("the gettable Republicans") is realistic and fine; meta-commentary defending the win is not.
- **Present clues, don't connect dots.** The deduction puzzle gives the player facts. Cut hand-holding — no "cross him off", no "that frame is poisoned".
- **Avoid LLMisms**, especially the "It's not X, it's Y" antithesis cadence.

## Testing

Tests live in `js/tests.js` using a custom `TestRunner` class with `assert()`, `assertEqual()`, and `assertDeepEqual()`. Tests validate: location registry, speaker style mappings, routing rules, conditional dialogue processing, scene structure integrity, character payoffs, ending reachability, vote counting, and flag coverage. Tests operate on the `STORY` data directly — they don't require DOM interaction.

**Running them under Node** (no browser): write a temporary harness in the repo root — not `/tmp` — that `vm`-evals `story.js` then `tests.js` with `const`/`let` rewritten to `var`. `TestRunner` is a **singleton object** (`const TestRunner = {...}`), not a class: call its `test*` methods directly off the object, then read `TestRunner.passed`/`failed`/`results`. Filter the expected `SceneManager is not defined` throw from `testConditionalDialogue`, which is DOM-only. Delete the harness afterwards.

## Adding Content

- **New scenes:** Add to the `STORY` object in `story.js`. Each scene needs: `id`, `day`, `location` (from `LOCATIONS`), `background`, `dialogue` array, and either `nextScene`, `choices`, or `isRouter`+`routerId`.
- **New speakers:** Add to `SPEAKER_STYLES` (direct mapping) or `SPEAKER_GROUPS` (group mapping) in story.js, and add corresponding CSS class in `css/style.css`.
- **New locations:** Add to the `LOCATIONS` object in story.js.
- **New routing rules:** Add conditions array to `ROUTING_RULES` in story.js.
- **New flags:** Just use them in `setFlags` and reference in conditionals/routing. Update tests to cover new paths.

## Common Pitfalls

- `setFlags` on a scene is applied **after** its dialogue completes (in `onDialogueComplete`), not on scene load.
- `setFlags` is a static object and cannot be conditional — use a router scene for conditional flag setting.
- `conditionalOnly` filtering on *choices* happens in `SceneManager.onDialogueComplete()`, not in `DialogueEngine`.
- Router scenes need **both** `isRouter: true` and a `routerId`.
- Scene transitions carry a 500ms fade plus 300ms delays — auto-advance scripts must account for them.

## Save System

localStorage key `"capitol_save"` stores JSON: `{ currentScene, flags, currentDay, timestamp }`. Saves automatically after every scene load. Cleared on new game or reaching an ending.
