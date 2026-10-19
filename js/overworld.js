// Overworld - top-down WASD exploration layer. Each time the location (or staged room) changes,
// the player walks the room and presses E on the scene's target to start its dialogue. Scenes in
// OVERWORLD_CHOICES are decided by walking to a spot instead of picking a button.

const OVERWORLD_W = 20;
const OVERWORLD_H = 12;

// Rooms are laid out in tile units on a 20x12 grid. Furniture is solid unless `solid: false`;
// `id` makes it a walk target, `text` makes it inspectable. `spots` place named characters,
// `freeSpots` take anyone else; `liveCast` rooms add each scene's speakers as they appear.
const OVERWORLD_ROOMS = {
    office: {
        floor: ['#4a4a3c', '#46463a'], wall: '#5c5a48', wallTrim: '#2e2d24',
        liveCast: false,
        defaultCast: ['Sarah'],
        spawn: [10, 10.6],
        furniture: [
            { id: 'desk', label: 'your desk', kind: 'desk', x: 2, y: 2.4, w: 3.6, h: 1.4, color: '#6b5a40',
              text: 'Draft amendments in three colors of ink. The Frontier AI Safety Act is on top.' },
            { kind: 'desk', x: 13.5, y: 2.4, w: 3.6, h: 1.4, color: '#6b5a40',
              text: "Sarah's desk. One sticky note per committee member, color-coded by how they'll vote." },
            { kind: 'board', x: 8, y: 0.25, w: 4, h: 0.7, z: 0,
              text: 'The whip count, in Sarah\'s handwriting: 17 yes, 8 no. "Need 5" is underlined twice.' },
            { id: 'speakerphone', label: 'the speakerphone', kind: 'table', x: 8, y: 5, w: 4, h: 2, color: '#504e42' },
            { id: 'coffee', label: 'the coffee maker', kind: 'coffee', x: 17.8, y: 5.4, w: 1.4, h: 1.6, color: '#3a3a34',
              text: 'The coffee maker. It has outlived two executive directors.' },
            { kind: 'cabinet', x: 0.6, y: 5, w: 1, h: 3, color: '#6c6e66',
              text: 'Filing cabinets. Two failed bills, filed alphabetically.' },
            { kind: 'couch', x: 1, y: 9.6, w: 3, h: 1, color: '#5a4038',
              text: 'The office couch. Load-bearing during markup weeks.' },
            { kind: 'plant', x: 18.3, y: 9.6, w: 0.9, h: 0.9,
              text: 'A ficus nobody admits to watering.' },
            { id: 'door', label: 'the door', kind: 'door', x: 9, y: 11.5, w: 2, h: 0.5, z: 0 }
        ],
        spots: { Sarah: [15.3, 4.6], Elena: [6, 8.2], Priya: [13, 8.6], Okafor: [4, 8.4] },
        freeSpots: [[16, 8.4], [7, 4.4]],
        extras: []
    },
    bar: {
        floor: ['#3a2a1e', '#36271c'], wall: '#4a3020', wallTrim: '#1e140c',
        liveCast: true,
        defaultCast: [],
        spawn: [3, 10.4],
        furniture: [
            { kind: 'counter', x: 2, y: 1.6, w: 12, h: 1.2, color: '#5a3a22',
              text: 'The bartender knows every chief of staff\'s order and none of their names.' },
            { kind: 'tv', x: 15.5, y: 0.25, w: 2.6, h: 0.7, z: 0,
              text: 'C-SPAN on mute. A subcommittee is holding a hearing to an empty room.' },
            { kind: 'table', x: 16, y: 3.6, w: 2.6, h: 1.3, color: '#4a2e1a' },
            { id: 'booth', label: 'the back booth', kind: 'table', x: 16, y: 7.4, w: 2.6, h: 1.3, color: '#4a2e1a' },
            { kind: 'table', x: 6, y: 6, w: 1.3, h: 1.3, color: '#4a2e1a' },
            { kind: 'table', x: 10, y: 8, w: 1.3, h: 1.3, color: '#4a2e1a' },
            { kind: 'jukebox', x: 0.7, y: 7.4, w: 1, h: 1.6, color: '#7a3a3a',
              text: 'Mostly Springsteen. Somebody keeps paying for "The River."' },
            { kind: 'chair', x: 3, y: 3.2, w: 0.6, h: 0.6, solid: false },
            { kind: 'chair', x: 5.5, y: 3.2, w: 0.6, h: 0.6, solid: false },
            { kind: 'chair', x: 8, y: 3.2, w: 0.6, h: 0.6, solid: false },
            { kind: 'chair', x: 10.5, y: 3.2, w: 0.6, h: 0.6, solid: false }
        ],
        spots: { Elena: [15.4, 8], Marcus: [12, 5.4] },
        freeSpots: [[14.5, 4.6], [12, 9.6]],
        extras: [[8, 1.15, '#d8d0c0'], [3.3, 3.9, '#556070'], [10.8, 3.9, '#605048'], [6.6, 5.4, '#4a5a4a']]
    },
    conference: {
        floor: ['#33363e', '#30333a'], wall: '#454955', wallTrim: '#1c1e24',
        liveCast: true,
        defaultCast: ['Facilitator', 'Industry Rep', 'Academic', 'Nonprofit Advocate'],
        spawn: [10, 10.6],
        furniture: [
            { kind: 'table', x: 4, y: 4.2, w: 12, h: 2.8, color: '#3b3f48',
              text: 'Name placards: three industry groups, one academic, one nonprofit, and AAPC at the far end.' },
            { id: 'seat', label: "AAPC's seat", kind: 'chair', x: 5.2, y: 7.25, w: 0.9, h: 0.7, color: '#8a3040' },
            { kind: 'chair', x: 8, y: 7.25, w: 0.9, h: 0.7, color: '#50545e' },
            { kind: 'chair', x: 11, y: 7.25, w: 0.9, h: 0.7, color: '#50545e' },
            { kind: 'chair', x: 14, y: 7.25, w: 0.9, h: 0.7, color: '#50545e' },
            { kind: 'counter', x: 15.5, y: 9.3, w: 3.5, h: 0.9, color: '#4c4f58',
              text: 'Room-temperature water and a plate of pastries nobody has touched.' },
            { kind: 'board', x: 2, y: 0.25, w: 3.5, h: 0.7, z: 0,
              text: 'Agenda: "Stakeholder Perspectives on Frontier AI." Ninety minutes. Industry speaks first.' }
        ],
        spots: { Facilitator: [16.9, 5.6], 'Industry Rep': [8.4, 3.6], Academic: [11.4, 3.6],
                 'Nonprofit Advocate': [14.4, 3.6], Staffer: [2.4, 9.4], Marcus: [13.5, 10.2] },
        freeSpots: [[3, 5.6], [17, 8]],
        extras: [[5.4, 3.6, '#4a4e58'], [6.9, 3.6, '#4a4e58']]
    },
    thinktank: {
        floor: ['#5a564a', '#56524a'], wall: '#6a6656', wallTrim: '#2e2c24',
        liveCast: true,
        defaultCast: [],
        spawn: [3, 10.4],
        furniture: [
            { kind: 'shelf', x: 1, y: 0.9, w: 8, h: 0.9, color: '#5a4630',
              text: 'Bound reports, floor to ceiling. Half of them cite each other.' },
            { kind: 'board', x: 13, y: 0.25, w: 4, h: 0.7, z: 0,
              text: 'A diagram of a model evaluation pipeline, half erased. One box just says "???"' },
            { id: 'priyadesk', label: "Priya's desk", kind: 'desk', x: 11, y: 3.4, w: 4.5, h: 1.4, color: '#6a5a44',
              text: 'Printouts of evaluation results, annotated in red. Some pages have more red than print.' },
            { kind: 'paper', x: 3, y: 5.6, w: 1, h: 1, color: '#e8e4d8',
              text: 'A stack of reports on the floor, held down by a mug.' },
            { kind: 'paper', x: 6, y: 8.4, w: 1.2, h: 0.8, color: '#e8e4d8', solid: true },
            { kind: 'couch', x: 16.4, y: 8, w: 2.2, h: 1.4, color: '#4a5a58',
              text: 'An armchair buried under conference tote bags.' }
        ],
        spots: { Priya: [10.2, 4.6] },
        freeSpots: [[8, 6.5]],
        extras: []
    },
    capitol: {
        floor: ['#22324a', '#203046'], wall: '#5a3524', wallTrim: '#2a180e',
        liveCast: true,
        defaultCast: ['Chairman', 'Peters', 'Reese', 'Okafor', 'Boyd', 'Sarah'],
        spawn: [10, 10.6],
        furniture: [
            { kind: 'dais', x: 2, y: 2, w: 16, h: 1.4, color: '#5a3524',
              text: 'Twenty-five nameplates. Twenty-five votes. You need five of them to move.' },
            { kind: 'clock', x: 1.2, y: 0.25, w: 1, h: 0.6, z: 0,
              text: 'The hearing clock. Every member gets five minutes, and every member goes over.' },
            { kind: 'table', x: 7, y: 4.6, w: 6, h: 0.9, color: '#4a2c1e',
              text: 'The witness table. Four microphones, all off until the chair says otherwise.' },
            { kind: 'table', x: 15.5, y: 4.8, w: 3, h: 0.8, color: '#3a2c22',
              text: 'The press table. Three reporters, one of them asleep.' },
            { id: 'gallery', label: 'the gallery', kind: 'bench', x: 2, y: 7, w: 6.5, h: 0.6, color: '#4a2c1e',
              text: 'Gallery seating. Industry paid line-standers to hold half these seats since 5 AM.' },
            { kind: 'bench', x: 11.5, y: 7, w: 6.5, h: 0.6, color: '#4a2c1e' },
            { kind: 'bench', x: 2, y: 9.2, w: 6.5, h: 0.6, color: '#4a2c1e' },
            { kind: 'bench', x: 11.5, y: 9.2, w: 6.5, h: 0.6, color: '#4a2c1e' },
            { id: 'door', label: 'the hallway', kind: 'door', x: 9, y: 11.5, w: 2, h: 0.5, z: 0 }
        ],
        spots: { Chairman: [10, 1.5], Peters: [7.5, 1.5], Reese: [5, 1.5], Okafor: [12.5, 1.5],
                 Boyd: [15, 1.5], Sarah: [5, 8.4], Amara: [13.2, 8.4], Kai: [15.2, 8.4],
                 Priya: [16.8, 10.5], Diane: [3, 10.5] },
        freeSpots: [[18.5, 6.2], [1.2, 6.2]],
        extras: [[3, 1.5], [4, 1.5], [6.2, 1.5], [8.8, 1.5], [11.2, 1.5], [13.8, 1.5], [16.2, 1.5], [17.2, 1.5],
                 [3.2, 6.6, '#505058'], [12.4, 6.6, '#505058'], [16.8, 6.6, '#505058']]
    },
    hallway: {
        floor: ['#6e6a62', '#6a665e'], wall: '#8a8478', wallTrim: '#3e3a34', door: 'top',
        liveCast: true,
        defaultCast: ['Torres', 'Boyd'],
        spawn: [10, 1.7],
        furniture: [
            { id: 'door', label: 'the committee room', kind: 'door', x: 9, y: 0.4, w: 2, h: 0.6, z: 0 },
            { kind: 'column', x: 4, y: 3.6, w: 0.9, h: 0.9, color: '#b8b0a0' },
            { kind: 'column', x: 8, y: 3.6, w: 0.9, h: 0.9, color: '#b8b0a0',
              text: 'Marble, cold to the touch. Good cover for a conversation nobody should overhear.' },
            { kind: 'column', x: 12, y: 3.6, w: 0.9, h: 0.9, color: '#b8b0a0' },
            { kind: 'column', x: 16, y: 3.6, w: 0.9, h: 0.9, color: '#b8b0a0' },
            { kind: 'column', x: 4, y: 7.6, w: 0.9, h: 0.9, color: '#b8b0a0' },
            { kind: 'column', x: 8, y: 7.6, w: 0.9, h: 0.9, color: '#b8b0a0' },
            { kind: 'column', x: 12, y: 7.6, w: 0.9, h: 0.9, color: '#b8b0a0' },
            { kind: 'column', x: 16, y: 7.6, w: 0.9, h: 0.9, color: '#b8b0a0' },
            { kind: 'window', x: 19.45, y: 4, w: 0.5, h: 4, z: 0,
              text: 'Independence Avenue. A tour group is photographing the wrong building.' },
            { kind: 'counter', x: 0.6, y: 5, w: 1.1, h: 2, color: '#5a4a3a',
              text: 'Hearing-room coffee in a steel urn. Someone has written "decaf?" on the lid in pen.' },
            { kind: 'bench', x: 5.5, y: 10.7, w: 3, h: 0.5, color: '#4a3a2c' },
            { kind: 'bench', x: 11.5, y: 10.7, w: 3, h: 0.5, color: '#4a3a2c' }
        ],
        spots: { Torres: [2.4, 6], Boyd: [18.5, 6], Sarah: [8.45, 5.0], Priya: [6, 6] },
        freeSpots: [[14.5, 5.8]],
        // Movers walk back and forth on a path; reporters chase the player while a timer runs.
        movers: [
            { path: [[2.5, 2.5], [17.5, 2.5]], speed: 1.3, color: '#4a5060' },
            { path: [[17, 9.6], [3, 9.6]], speed: 1.1, color: '#5a4a5a' }
        ],
        reporters: [[14.5, 6.8], [6, 9], [11, 2.1]],
        extras: []
    },
    mall: {
        floor: ['#18241e', '#16221c'], wall: null, wallTrim: null,
        // Everyone who speaks at the Mall does it by phone.
        liveCast: false,
        defaultCast: [],
        spawn: [1.6, 8.2],
        path: { y: 7.4, h: 1.4, color: '#3a3a36' },
        furniture: [
            { kind: 'water', x: 4, y: 4.4, w: 11, h: 2.2, color: '#1c2d4a',
              text: 'The Reflecting Pool holds the Capitol dome upside down.' },
            { kind: 'obelisk', x: 17, y: 4.6, w: 1.2, h: 1.6, color: '#c8c4b8',
              text: 'The Washington Monument, lit from below. Somebody up there is working late too.' },
            { id: 'bench', label: 'the bench', kind: 'bench', x: 6, y: 9.4, w: 2, h: 0.5, color: '#3a3028' },
            { kind: 'bench', x: 11.5, y: 9.4, w: 2, h: 0.5, color: '#3a3028' },
            { kind: 'tree', x: 1.6, y: 1.6, w: 1, h: 1 }, { kind: 'tree', x: 4.8, y: 1.4, w: 1, h: 1 },
            { kind: 'tree', x: 8, y: 1.6, w: 1, h: 1 }, { kind: 'tree', x: 11.2, y: 1.4, w: 1, h: 1 },
            { kind: 'tree', x: 14.4, y: 1.6, w: 1, h: 1 }, { kind: 'tree', x: 17.6, y: 1.4, w: 1, h: 1 },
            { kind: 'tree', x: 3, y: 10.6, w: 1, h: 1 }, { kind: 'tree', x: 16.5, y: 10.4, w: 1, h: 1 }
        ],
        spots: {},
        freeSpots: [],
        extras: []
    }
};

const BACKGROUND_TO_ROOM = {
    'bg-office': 'office', 'bg-coalition': 'office', 'bg-bar': 'bar', 'bg-conference': 'conference',
    'bg-thinktank': 'thinktank', 'bg-capitol': 'capitol', 'bg-mall': 'mall'
};

// Walk targets for scenes that open a new location. Unlisted scenes fall back to their first
// on-screen speaker, then to the room's first targetable object.
const OVERWORLD_WALKS = {
    intro: { target: 'obj:desk', objective: 'Get to your desk.' },
    the_filibuster: { target: 'Elena', objective: 'Elena is waiting in a booth at the back.' },
    stakeholder_meeting: { target: 'obj:seat', objective: "Take AAPC's one seat at the table." },
    coalition_call_intro: { target: 'obj:speakerphone', objective: 'The coalition call starts at three. Get on the speakerphone.' },
    inbox_triage: { target: 'obj:desk', objective: 'Your inbox is filling up. Get to your desk.' },
    time_pressure_choice: { target: 'obj:desk', objective: 'Get to your desk.' },
    testimony_prep: { target: 'obj:desk', objective: 'The testimony won\'t write itself. Back to your desk.' },
    think_tank: { target: 'Priya', objective: 'Find Priya.' },
    aftermath_priya: { target: 'obj:desk', objective: 'Back at the office. Get to your desk.' },
    news_break: { target: 'obj:desk', objective: 'Your phone is lighting up. Get to your desk.' },
    news_fast: { target: 'obj:desk', objective: 'Write it. Your desk.' },
    news_slow: { target: 'obj:desk', objective: 'Morning. Get to your desk.' },
    act2_morning: { target: 'obj:desk', objective: 'Get to your desk.' },
    act2_mindscale: { target: 'Sarah', objective: 'Sarah is waving you over.' },
    elena_burned: { target: 'obj:desk', objective: 'Late. One more thing at your desk.' },
    markup_hearing_open: { target: 'Sarah', objective: 'Sarah saved you a seat in the gallery.' },
    recess_lobby: { target: 'Torres', objective: 'Torres is by the coffee. Two minutes.' },
    whip_boyd_intro: { target: 'Sarah', objective: 'Sarah is waving you over behind a column.' },
    markup_hearing_recess_choice: { target: 'obj:gallery', objective: 'Back to your seat in the gallery.' },
    whip_boyd_choice: { target: 'Sarah', objective: 'Sarah is waiting behind a column.' },
    boyd_skipped: { target: 'Sarah', objective: 'Find Sarah.' },
    markup_hearing_vote: { target: 'obj:gallery', objective: "They're calling the vote. Back to your seat." },
    climax: { target: 'obj:bench', objective: 'Find a bench.' }
};

// Choices made by walking: each option is a spot ('obj:id' or 'npc:Name') that commits one
// choice (matched by its next scene id), or several via `choices`, which opens a button submenu.
// If any available choice is unmapped, the scene falls back to plain buttons. A `timer` adds
// pressure only: on expiry every option opens as buttons, so the clock never changes an outcome.
const OVERWORLD_CHOICES = {
    time_pressure_choice: {
        objective: 'Testimony is due at noon. Priya leaves at noon. Pick one.',
        options: [
            { at: 'obj:door', choice: 'think_tank', verb: 'Go see Priya' },
            { at: 'obj:desk', choice: 'testimony_prep', verb: 'Write the testimony' }
        ]
    },
    news_break: {
        objective: 'Statement tonight, or wait for the coalition?',
        options: [
            { at: 'obj:desk', choice: 'news_fast', verb: 'Write it now' },
            { at: 'obj:speakerphone', choice: 'news_slow', verb: 'Loop in the coalition' }
        ]
    },
    act2_strategy_choice: {
        objective: 'One afternoon. Work the phones or send in the coalition?',
        options: [
            { at: 'obj:desk', choice: 'act2_phones', verb: "Call Torres's office" },
            { at: 'obj:speakerphone', choice: 'act2_rally_coalition', verb: 'Unleash the coalition' }
        ]
    },
    act2_mindscale: {
        objective: 'MindScale just dropped thirty pages. Answer it or let it sit?',
        options: [
            { at: 'obj:desk', choice: 'act2_confront', verb: 'Write a rebuttal' },
            { at: 'obj:coffee', choice: 'act2_ignore', verb: 'Ignore it' }
        ]
    },
    markup_hearing_recess_choice: {
        objective: 'Fifteen-minute recess. Work the hallway or stay in the gallery?',
        options: [
            { at: 'obj:door', choice: 'recess_lobby', verb: 'Find Torres in the hallway' },
            { at: 'obj:gallery', choice: 'recess_notes', verb: 'Pass notes to your allies' }
        ]
    },
    whip_boyd_choice: {
        objective: 'Boyd is by the window. Get to him before he goes back in.',
        timer: { seconds: 90, realSeconds: 11, expireText: 'Boyd is heading back in. You catch him at the door.' },
        options: [
            { at: 'npc:Boyd', choices: ['boyd_security_router', 'boyd_backfire'], verb: 'Approach Boyd' },
            { at: 'npc:Torres', choice: 'boyd_skipped', verb: 'Work Torres instead' }
        ]
    }
};

const choiceTargetId = (choice) => choice.nextDialogue || choice.nextScene;

// Pure: map a scene's available choices onto walk targets, or null to fall back to buttons.
function getChoiceTargets(sceneId, availableChoices) {
    const cfg = OVERWORLD_CHOICES[sceneId];
    if (!cfg) return null;
    const covered = new Set();
    const targets = [];
    for (const opt of cfg.options) {
        const ids = opt.choices || [opt.choice];
        const picks = availableChoices.filter(c => ids.includes(choiceTargetId(c)));
        if (!picks.length) continue;
        picks.forEach(c => covered.add(c));
        const [type, id] = opt.at.split(':');
        targets.push({ type, id, verb: opt.verb, picks });
    }
    if (covered.size !== availableChoices.length) return null;
    return targets;
}

const OFFSTAGE_SPEAKERS = ['Narrator', 'You', 'Phone'];

const DISPLAY_NAMES = {
    Okafor: 'Rep. Okafor', Boyd: 'Rep. Boyd', Reese: 'Rep. Reese', Peters: 'Rep. Peters', Chen: 'Rep. Chen',
    Torres: 'Rep. Torres'
};

const NAME_COLORS = { Torres: '#7880a0' };

const CAST_COLORS = {
    'speaker-sarah': '#c49de0', 'speaker-elena': '#f0a830', 'speaker-priya': '#40c4b0',
    'speaker-amara': '#e07080', 'speaker-kai': '#60a8e0', 'speaker-diane': '#70c070',
    'speaker-marcus': '#d8a838', 'speaker-boyd': '#d05050', 'speaker-okafor': '#9a86f0',
    'speaker-official': '#7880a0', 'speaker-minor': '#70705f', 'speaker-character': '#e94560'
};

// Recess scenes keep the committee-room location string but play out in the hallway.
const OVERWORLD_SCENE_ROOMS = {
    recess_lobby: 'hallway', whip_boyd_intro: 'hallway', whip_boyd_choice: 'hallway',
    boyd_flipped: 'hallway', boyd_noncommittal: 'hallway', boyd_backfire: 'hallway',
    boyd_skipped: 'hallway'
};

function getRoomKey(scene) {
    return OVERWORLD_SCENE_ROOMS[scene.id] || BACKGROUND_TO_ROOM[scene.background] || 'office';
}

function sceneSpeakersOnStage(scene) {
    const names = [];
    for (const line of scene.dialogue || []) {
        const s = line.speaker;
        if (!s || OFFSTAGE_SPEAKERS.includes(s) || s.startsWith('Voice') || names.includes(s)) continue;
        names.push(s);
    }
    return names;
}

// Pure: what the player must do to start this scene. Returns { roomKey, target, objective, cast }.
function getWalkPlan(sceneId, scene) {
    const roomKey = getRoomKey(scene);
    const room = OVERWORLD_ROOMS[roomKey];
    const cast = [...room.defaultCast];
    const addCast = (name) => { if (!cast.includes(name)) cast.push(name); };

    if (room.liveCast) sceneSpeakersOnStage(scene).forEach(addCast);

    const walk = OVERWORLD_WALKS[sceneId];
    let target;
    if (walk) {
        target = walk.target.startsWith('obj:')
            ? { type: 'obj', id: walk.target.slice(4) }
            : { type: 'npc', id: walk.target };
    } else {
        const speaker = sceneSpeakersOnStage(scene).find(s => cast.includes(s) || room.spots[s]);
        if (speaker) {
            target = { type: 'npc', id: speaker };
        } else {
            target = { type: 'obj', id: room.furniture.find(f => f.id).id };
        }
    }
    if (target.type === 'npc') addCast(target.id);

    const label = target.type === 'npc'
        ? (DISPLAY_NAMES[target.id] || target.id)
        : room.furniture.find(f => f.id === target.id).label;
    const objective = (walk && walk.objective) || (target.type === 'npc' ? `Find ${label}.` : `Go to ${label}.`);
    return { roomKey, target, objective, cast };
}

function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}

const SKIN_TONES = ['#f1c9a5', '#e0ac85', '#c68863', '#9c6a48', '#704a32', '#f5d6bc'];
const HAIR_COLORS = ['#2a1e16', '#5a3a20', '#141414', '#8a6a3a', '#b0b0a8', '#6a2a1a'];

class Overworld {
    constructor() {
        this.canvas = document.getElementById('overworld-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.objectiveEl = document.getElementById('objective');
        this.hintEl = document.getElementById('controls-hint');
        this.toastEl = document.getElementById('toast');
        this.timerEl = document.getElementById('timer');

        this.mode = 'off';   // 'off' | 'walk' | 'cutscene'
        this.roomKey = null;
        this.targets = [];     // what E commits to: the walk target, or the options of a walk-to choice
        this.choice = null;    // { onPick, onSubmenu, startedAt } while a walk-to choice is open
        this.timer = null;     // { remaining, rate, expireText } while a countdown runs
        this.optionToast = false;
        this.keys = new Set();
        this.room = null;
        this.npcs = [];
        this.player = null;
        this.plan = null;
        this.onArrive = null;
        this.nearest = null;
        this.time = 0;
        this.lastFrame = 0;
        this.rafId = null;
        this.paused = false;   // the save/load panel freezes movement and the countdown
        this.toastTimer = null;

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('blur', () => this.keys.clear());
        this.resize();
    }

    get isWalking() {
        return this.mode === 'walk';
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth, h = window.innerHeight;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.viewW = w;
        this.viewH = h;
    }

    // Build the room for a scene. The player stands still until beginWalk().
    enterScene(sceneId, scene) {
        this.plan = getWalkPlan(sceneId, scene);
        this.roomKey = this.plan.roomKey;
        this.room = OVERWORLD_ROOMS[this.plan.roomKey];
        this.targets = [this.plan.target];
        this.choice = null;
        this.stopTimer();
        this.setTimeOfDay(scene.location || '');
        this.npcs = [];
        this.plan.cast.forEach(name => this.addNpc(name));
        this.room.extras.forEach(([x, y, color]) => {
            this.npcs.push(this.makePerson(`extra-${x}-${y}`, x, y, color || '#5a5c66', null));
        });
        (this.room.movers || []).forEach((m, i) => {
            const npc = this.makePerson(`mover-${i}`, m.path[0][0], m.path[0][1], m.color, null);
            Object.assign(npc, { path: m.path, leg: 1, speed: m.speed });
            this.npcs.push(npc);
        });
        (this.room.reporters || []).forEach(([x, y], i) => {
            const npc = this.makePerson(`reporter-${i}`, x, y, '#a08a50', null);
            Object.assign(npc, { reporter: true, home: [x, y], cooldown: 0 });
            this.npcs.push(npc);
        });

        const [sx, sy] = this.room.spawn;
        this.player = this.makePerson('You', sx, sy, '#6cb4e0', null);
        this.player.facing = 'up';
        this.player.skin = '#e8b890';
        this.player.hair = '#3a2818';

        this.onArrive = null;
        this.mode = 'cutscene';
        this.keys.clear();
        this.canvas.classList.add('visible');
        this.startLoop();
    }

    // Hand control to the player until they press E on the walk target.
    beginWalk(onArrive) {
        this.onArrive = onArrive;
        this.mode = 'walk';
        this.keys.clear();
        this.objectiveEl.textContent = this.plan.objective;
        this.objectiveEl.classList.add('visible');
        this.hintEl.classList.add('visible');
    }

    roomFor(scene) {
        return getRoomKey(scene);
    }

    // Open a walk-to choice in the current room. Returns false if the scene should use buttons.
    startChoice(sceneId, availableChoices, onPick, onSubmenu) {
        if (!this.room) return false;
        const targets = getChoiceTargets(sceneId, availableChoices);
        if (!targets || !targets.every(t => this.findTargetPoint(t))) return false;
        const cfg = OVERWORLD_CHOICES[sceneId];
        this.targets = targets;
        this.choice = { onPick, onSubmenu, startedAt: Date.now() };
        if (cfg.timer) {
            this.timer = { remaining: cfg.timer.seconds, rate: cfg.timer.seconds / cfg.timer.realSeconds, expireText: cfg.timer.expireText };
            this.timerEl.classList.add('visible');
        }
        this.mode = 'walk';
        this.keys.clear();
        this.objectiveEl.textContent = cfg.objective;
        this.objectiveEl.classList.add('visible');
        this.hintEl.classList.add('visible');
        return true;
    }

    stopTimer() {
        this.timer = null;
        if (this.timerEl) this.timerEl.classList.remove('visible');
    }

    // Same room, new scene: bring in any newly arrived speakers.
    syncCast(scene) {
        if (!this.room || !this.room.liveCast) return;
        sceneSpeakersOnStage(scene).forEach(name => this.addNpc(name));
    }

    addNpc(name) {
        if (this.npcs.some(n => n.name === name)) return;
        let pos = this.room.spots[name];
        if (!pos) {
            pos = this.room.freeSpots.find(([x, y]) => !this.npcs.some(n => n.x === x && n.y === y));
            if (!pos) return;
        }
        const color = NAME_COLORS[name] || CAST_COLORS[getSpeakerClass(name)] || '#e94560';
        const npc = this.makePerson(name, pos[0], pos[1], color, DISPLAY_NAMES[name] || name);
        npc.facing = pos[1] < 3 ? 'down' : 'left';
        this.npcs.push(npc);
    }

    makePerson(name, x, y, body, label) {
        const h = hashString(name);
        return {
            name, x, y, body, label,
            skin: SKIN_TONES[h % SKIN_TONES.length],
            hair: HAIR_COLORS[(h >> 3) % HAIR_COLORS.length],
            facing: 'down', phase: 0, moving: false
        };
    }

    setTimeOfDay(location) {
        if (/Night|11:47 PM|12:14 AM/.test(location)) this.timeOfDay = 'night';
        else if (/Evening/.test(location)) this.timeOfDay = 'dusk';
        else if (/Early Morning/.test(location)) this.timeOfDay = 'dawn';
        else this.timeOfDay = 'day';
    }

    hide() {
        this.mode = 'off';
        this.roomKey = null;
        this.choice = null;
        this.stopTimer();
        this.keys.clear();
        this.canvas.classList.remove('visible');
        this.objectiveEl.classList.remove('visible');
        this.hintEl.classList.remove('visible');
        this.hideToast();
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }

    fadeOut() {
        this.canvas.classList.remove('visible');
        this.objectiveEl.classList.remove('visible');
        this.hideToast();
    }

    // --- Input ---

    keyDown(code) {
        this.keys.add(code);
    }

    keyUp(code) {
        this.keys.delete(code);
    }

    interact() {
        if (this.mode !== 'walk') return;
        // Stops a key mashed through the last line of dialogue from committing a choice blind.
        if (this.choice && Date.now() - this.choice.startedAt < 600) return;
        const hit = this.nearest;
        if (hit && hit.target) {
            this.arrive(hit);
            return;
        }
        if (this.toastEl.classList.contains('visible')) {
            this.hideToast();
            return;
        }
        if (!hit) return;
        if (hit.kind === 'npc') {
            this.showToast(`${hit.ref.label} is busy. ${this.objectiveEl.textContent}`);
        } else if (hit.ref.text) {
            this.showToast(hit.ref.text);
        }
    }

    arrive(hit) {
        const choice = this.choice;
        this.choice = null;
        this.stopTimer();
        this.mode = 'cutscene';
        this.keys.clear();
        this.player.moving = false;
        const dx = hit.cx - this.player.x, dy = hit.cy - this.player.y;
        this.player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        if (hit.kind === 'npc') {
            hit.ref.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : (dy > 0 ? 'up' : 'down');
        }
        this.objectiveEl.classList.remove('visible');
        this.hintEl.classList.remove('visible');
        this.hideToast();
        if (choice) {
            const picks = hit.target.picks;
            setTimeout(() => (picks.length === 1 ? choice.onPick(picks[0]) : choice.onSubmenu(picks)), 200);
            return;
        }
        const cb = this.onArrive;
        this.onArrive = null;
        if (cb) setTimeout(cb, 200);
    }

    expireTimer() {
        const choice = this.choice;
        const expireText = this.timer.expireText;
        const allPicks = this.targets.flatMap(t => t.picks);
        this.choice = null;
        this.stopTimer();
        this.mode = 'cutscene';
        this.keys.clear();
        this.player.moving = false;
        this.objectiveEl.classList.remove('visible');
        this.hintEl.classList.remove('visible');
        this.showToast(expireText);
        if (choice) setTimeout(() => choice.onSubmenu(allPicks), 200);
    }

    showToast(text) {
        this.optionToast = false;
        this.toastEl.textContent = text;
        this.toastEl.classList.add('visible');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => this.hideToast(), 4000);
    }

    hideToast() {
        this.optionToast = false;
        clearTimeout(this.toastTimer);
        this.toastEl.classList.remove('visible');
    }

    // --- Simulation ---

    startLoop() {
        if (this.rafId) return;
        this.lastFrame = performance.now();
        const tick = (now) => {
            const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
            this.lastFrame = now;
            this.time += dt;
            if (!this.paused) this.update(dt);
            this.render();
            this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
    }

    solids(includeNpcs = true) {
        const rects = this.room.furniture.filter(f => f.solid !== false)
            .map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h }));
        // Room bounds: the top wall is a full tile deep, the other sides half a tile.
        rects.push({ x: 0, y: 0, w: OVERWORLD_W, h: 1 });
        rects.push({ x: 0, y: 0, w: 0.5, h: OVERWORLD_H });
        rects.push({ x: OVERWORLD_W - 0.5, y: 0, w: 0.5, h: OVERWORLD_H });
        rects.push({ x: 0, y: OVERWORLD_H - 0.5, w: OVERWORLD_W, h: 0.5 });
        if (includeNpcs) for (const n of this.npcs) rects.push({ x: n.x - 0.3, y: n.y - 0.22, w: 0.6, h: 0.44 });
        return rects;
    }

    blockedBy(rects, x, y) {
        return rects.some(r => x + 0.28 > r.x && x - 0.28 < r.x + r.w && y + 0.2 > r.y && y - 0.2 < r.y + r.h);
    }

    // Movers patrol always; reporters chase only while a countdown runs, and a catch costs time.
    updateCrowd(dt) {
        const p = this.player;
        const walls = this.solids(false);
        const playerBox = [{ x: p.x - 0.3, y: p.y - 0.22, w: 0.6, h: 0.44 }];
        const step = (n, tx, ty, speed) => {
            const dx = tx - n.x, dy = ty - n.y, dist = Math.hypot(dx, dy);
            if (dist < 0.05) return true;
            const len = Math.min(speed * dt, dist);
            const nx = n.x + (dx / dist) * len, ny = n.y + (dy / dist) * len;
            n.moving = false;
            // Never step into the player, but always allow stepping away (no deadlock when touching).
            const away = Math.hypot(nx - p.x, ny - p.y) >= Math.hypot(n.x - p.x, n.y - p.y);
            if (!away && this.blockedBy(playerBox, nx, ny)) return false;
            if (!this.blockedBy(walls, nx, n.y)) { n.x = nx; n.moving = true; }
            if (!this.blockedBy(walls, n.x, ny)) { n.y = ny; n.moving = true; }
            if (n.moving) {
                n.phase += dt * 9;
                n.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            }
            return false;
        };
        for (const n of this.npcs) {
            if (n.path) {
                const [tx, ty] = n.path[n.leg];
                if (step(n, tx, ty, n.speed)) n.leg = (n.leg + 1) % n.path.length;
            } else if (n.reporter) {
                n.cooldown = Math.max(0, n.cooldown - dt);
                const chasing = this.timer && this.mode === 'walk' && n.cooldown === 0 && !p.stun &&
                    Math.hypot(p.x - n.x, p.y - n.y) < 4.5;
                if (chasing) {
                    step(n, p.x, p.y, 2.5);
                    if (Math.hypot(p.x - n.x, p.y - n.y) < 0.8) {
                        p.stun = 1.0;
                        // Every reporter backs off for a beat, so catches can't chain.
                        this.npcs.forEach(r => { if (r.reporter) r.cooldown = Math.max(r.cooldown, 1.5); });
                        n.cooldown = 5;
                        this.showToast('"Thirty seconds for a quote on Titan 4?" A reporter plants himself in your path.');
                    }
                } else {
                    step(n, n.home[0], n.home[1], 1.2);
                }
            }
        }
    }

    update(dt) {
        if (this.room && this.player) this.updateCrowd(dt);
        if (this.mode !== 'walk') return;
        if (this.timer) {
            this.timer.remaining -= dt * this.timer.rate;
            const secs = Math.max(0, Math.ceil(this.timer.remaining));
            this.timerEl.textContent = `0:${String(secs).padStart(2, '0')}`;
            this.timerEl.classList.toggle('urgent', secs <= 30);
            if (this.timer.remaining <= 0) {
                this.expireTimer();
                return;
            }
        }
        const k = this.keys;
        let dx = 0, dy = 0;
        if (k.has('KeyW') || k.has('ArrowUp')) dy -= 1;
        if (k.has('KeyS') || k.has('ArrowDown')) dy += 1;
        if (k.has('KeyA') || k.has('ArrowLeft')) dx -= 1;
        if (k.has('KeyD') || k.has('ArrowRight')) dx += 1;

        const p = this.player;
        if (p.stun) {
            p.stun = Math.max(0, p.stun - dt);
            dx = dy = 0;
        }
        p.moving = dx !== 0 || dy !== 0;
        if (p.moving) {
            const len = Math.hypot(dx, dy);
            const speed = 4.2 * dt;
            const solids = this.solids();
            const blocked = (x, y) => this.blockedBy(solids, x, y);
            const nx = p.x + (dx / len) * speed;
            if (!blocked(nx, p.y)) p.x = nx;
            const ny = p.y + (dy / len) * speed;
            if (!blocked(p.x, ny)) p.y = ny;
            p.phase += dt * 10;
            p.facing = Math.abs(dx) >= Math.abs(dy) && dx !== 0 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        }
        this.nearest = this.findNearest();

        // While standing at a choice option, show its full text.
        const t = this.nearest && this.nearest.target;
        if (this.choice && t) {
            const text = t.picks.length === 1 ? t.picks[0].text : t.picks.map(c => c.text).join('  /  ');
            if (!this.optionToast || this.toastEl.textContent !== text) {
                this.toastEl.textContent = text;
                this.toastEl.classList.add('visible');
                clearTimeout(this.toastTimer);
                this.optionToast = true;
            }
        } else if (this.optionToast) {
            this.hideToast();
        }
    }

    findNearest() {
        const p = this.player;
        let best = null;
        const consider = (hit, dist, reach) => {
            if (dist <= reach && (!best || dist < best.dist)) best = { ...hit, dist };
        };
        // Targets win ties within reach, so flavor objects never shadow a choice.
        const consider2 = (hit, dist, reach) => consider(hit, hit.target ? dist - 0.3 : dist, reach);
        for (const n of this.npcs) {
            if (!n.label) continue;
            const target = this.targets.find(t => t.type === 'npc' && t.id === n.name) || null;
            consider2({ kind: 'npc', ref: n, cx: n.x, cy: n.y, target }, Math.hypot(n.x - p.x, n.y - p.y), 1.6);
        }
        for (const f of this.room.furniture) {
            const target = this.targets.find(t => t.type === 'obj' && t.id === f.id) || null;
            if (!target && !f.text) continue;
            const cx = Math.max(f.x, Math.min(p.x, f.x + f.w));
            const cy = Math.max(f.y, Math.min(p.y, f.y + f.h));
            consider2({ kind: 'obj', ref: f, cx: f.x + f.w / 2, cy: f.y + f.h / 2, target },
                Math.hypot(cx - p.x, cy - p.y), 0.9);
        }
        return best;
    }

    // --- Rendering ---

    render() {
        const ctx = this.ctx;
        const T = Math.floor(Math.min(this.viewW / OVERWORLD_W, this.viewH / OVERWORLD_H));
        const ox = Math.floor((this.viewW - T * OVERWORLD_W) / 2);
        const oy = Math.floor((this.viewH - T * OVERWORLD_H) / 2);
        this.T = T;

        ctx.fillStyle = '#121410';
        ctx.fillRect(0, 0, this.viewW, this.viewH);
        ctx.save();
        ctx.translate(ox, oy);

        this.drawFloor(ctx, T);

        // Depth-sort furniture and people by their bottom edge.
        const drawables = [];
        for (const f of this.room.furniture) {
            const flat = f.z === 0 || f.kind === 'water' || f.kind === 'paper';
            drawables.push({ y: flat ? -1 : f.y + f.h, draw: () => this.drawFurniture(ctx, T, f) });
        }
        for (const n of this.npcs) drawables.push({ y: n.y, draw: () => this.drawPerson(ctx, T, n) });
        drawables.push({ y: this.player.y, draw: () => this.drawPerson(ctx, T, this.player) });
        drawables.sort((a, b) => a.y - b.y).forEach(d => d.draw());

        this.drawTint(ctx, T);
        if (this.mode === 'walk') {
            this.drawTargetMarker(ctx, T);
            this.drawPrompt(ctx, T);
        }
        ctx.restore();
    }

    drawFloor(ctx, T) {
        const r = this.room;
        for (let y = 0; y < OVERWORLD_H; y++) {
            for (let x = 0; x < OVERWORLD_W; x++) {
                ctx.fillStyle = r.floor[(x + y) % 2];
                ctx.fillRect(x * T, y * T, T, T);
            }
        }
        if (r.path) {
            ctx.fillStyle = r.path.color;
            ctx.fillRect(0, r.path.y * T, OVERWORLD_W * T, r.path.h * T);
        }
        if (r.wall) {
            ctx.fillStyle = r.wall;
            ctx.fillRect(0, 0, OVERWORLD_W * T, T);
            ctx.fillStyle = r.wallTrim;
            ctx.fillRect(0, T - T * 0.12, OVERWORLD_W * T, T * 0.12);
            ctx.fillRect(0, 0, T * 0.5, OVERWORLD_H * T);
            ctx.fillRect((OVERWORLD_W - 0.5) * T, 0, T * 0.5, OVERWORLD_H * T);
            ctx.fillRect(0, (OVERWORLD_H - 0.5) * T, OVERWORLD_W * T, T * 0.5);
            ctx.fillStyle = '#6a5038';
            if (r.door === 'top') ctx.fillRect((r.spawn[0] - 1) * T, T * 0.15, 2 * T, T * 0.85);
            else ctx.fillRect((r.spawn[0] - 1) * T, (OVERWORLD_H - 0.5) * T, 2 * T, T * 0.5);
        } else {
            // Outdoors: stars along the top edge
            ctx.fillStyle = 'rgba(255,255,240,0.5)';
            for (let i = 0; i < 40; i++) {
                const sx = (hashString('s' + i) % 1000) / 1000 * OVERWORLD_W;
                const sy = (hashString('t' + i) % 1000) / 1000 * 0.9;
                ctx.fillRect(sx * T, sy * T, 2, 2);
            }
        }
    }

    shade(hex, amt) {
        const n = parseInt(hex.slice(1), 16);
        const c = (v) => Math.max(0, Math.min(255, v + amt));
        return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
    }

    drawFurniture(ctx, T, f) {
        const x = f.x * T, y = f.y * T, w = f.w * T, h = f.h * T;
        const color = f.color || '#555555';
        switch (f.kind) {
            case 'board':
                ctx.fillStyle = '#d8d8d0'; ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
                ctx.fillStyle = '#c03040';
                for (let i = 0; i < 3; i++) ctx.fillRect(x + w * 0.1, y + h * (0.2 + i * 0.25), w * (0.5 - i * 0.1), 2);
                return;
            case 'door':
                return;  // drawn with the walls
            case 'window':
                ctx.fillStyle = '#9ab8d0'; ctx.fillRect(x, y, w, h);
                ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + 2, y + 4, w * 0.3, h - 8);
                return;
            case 'tv':
                ctx.fillStyle = '#111'; ctx.fillRect(x, y, w, h);
                ctx.fillStyle = '#2a4a6a'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
                return;
            case 'clock':
                ctx.fillStyle = '#e8e0c8'; ctx.beginPath();
                ctx.arc(x + w / 2, y + h / 2, h / 2, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath();
                ctx.moveTo(x + w / 2, y + h / 2); ctx.lineTo(x + w / 2, y + h * 0.15);
                ctx.moveTo(x + w / 2, y + h / 2); ctx.lineTo(x + w * 0.7, y + h / 2); ctx.stroke();
                return;
            case 'water': {
                ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = '#8a8a80'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
                ctx.fillStyle = 'rgba(200,220,255,0.18)';
                for (let i = 0; i < 6; i++) {
                    const sx = x + ((i * 0.17 + this.time * 0.03) % 1) * w;
                    ctx.fillRect(sx, y + h * (0.2 + (i % 3) * 0.25), T * 0.6, 2);
                }
                return;
            }
            case 'paper':
                ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 3, y + 3, w, h);
                ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
                ctx.fillStyle = '#b0aca0'; ctx.fillRect(x + 2, y + h * 0.3, w - 4, 1); ctx.fillRect(x + 2, y + h * 0.6, w - 4, 1);
                return;
            case 'plant':
            case 'tree': {
                const cx = x + w / 2, cy = y + h / 2;
                ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath();
                ctx.ellipse(cx, y + h, w * 0.5, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
                if (f.kind === 'plant') { ctx.fillStyle = '#7a4a2a'; ctx.fillRect(cx - w * 0.25, cy, w * 0.5, h * 0.5); }
                else { ctx.fillStyle = '#4a3420'; ctx.fillRect(cx - w * 0.1, cy, w * 0.2, h * 0.5); }
                ctx.fillStyle = f.kind === 'plant' ? '#3a6a3a' : '#1e3a24';
                ctx.beginPath(); ctx.arc(cx, cy - h * 0.2, w * (f.kind === 'tree' ? 0.75 : 0.5), 0, Math.PI * 2); ctx.fill();
                return;
            }
            case 'obelisk': {
                ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x - T * 0.2, y + h - 4, w + T * 0.4, 6);
                const top = y - T * 3.4;
                ctx.fillStyle = color; ctx.beginPath();
                ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.15, top + T * 0.5); ctx.lineTo(x + w / 2, top);
                ctx.lineTo(x + w * 0.85, top + T * 0.5); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
                ctx.fillStyle = 'rgba(255,240,200,0.15)'; ctx.fillRect(x + w * 0.2, top + T * 0.6, w * 0.25, y + h - top - T * 0.6);
                ctx.fillStyle = '#d03030'; ctx.fillRect(x + w * 0.4, top + T * 0.6, 3, 3);
                return;
            }
        }

        // Generic block: front face plus a raised, lighter top face.
        const z = (f.z !== undefined ? f.z : (f.kind === 'column' ? 1.6 : 0.35)) * T;
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 2, y + 4, w, h);
        ctx.fillStyle = this.shade(color, -25); ctx.fillRect(x, y + h - z, w, z);
        ctx.fillStyle = color; ctx.fillRect(x, y - z, w, h);
        ctx.fillStyle = this.shade(color, 25); ctx.fillRect(x, y - z, w, 2);

        if (f.kind === 'desk') {
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x + w * 0.55, y - z + h * 0.1, w * 0.3, h * 0.35);
            ctx.fillStyle = '#5a8ab0'; ctx.fillRect(x + w * 0.57, y - z + h * 0.13, w * 0.26, h * 0.27);
            ctx.fillStyle = '#ecebe2'; ctx.fillRect(x + w * 0.1, y - z + h * 0.25, w * 0.3, h * 0.4);
        } else if (f.kind === 'shelf') {
            const colors = ['#8a3a30', '#2a4a6a', '#6a6a30', '#3a5a3a', '#7a5a8a'];
            for (let i = 0; i < f.w * 5; i++) {
                ctx.fillStyle = colors[i % colors.length];
                ctx.fillRect(x + i * T / 5 + 1, y - z + 2, T / 5 - 2, h - 4);
            }
        } else if (f.kind === 'coffee') {
            ctx.fillStyle = '#c0c0b8'; ctx.fillRect(x + w * 0.25, y - z + h * 0.15, w * 0.5, h * 0.4);
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            const puff = (this.time * 0.6) % 1;
            ctx.fillRect(x + w * 0.45, y - z - puff * T * 0.5, 3, 3);
        } else if (f.id === 'speakerphone') {
            ctx.fillStyle = '#1e1e1e'; ctx.beginPath();
            ctx.ellipse(x + w / 2, y - z + h / 2, T * 0.4, T * 0.25, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#40d040'; ctx.fillRect(x + w / 2 - 2, y - z + h / 2 - 2, 4, 4);
        } else if (f.kind === 'dais') {
            ctx.fillStyle = '#e8e0c8';
            for (let i = 0; i < 13; i++) ctx.fillRect(x + (i + 0.3) * w / 13, y - z + h * 0.6, w / 26, h * 0.18);
        } else if (f.kind === 'jukebox') {
            const hue = Math.floor(this.time * 60) % 360;
            ctx.fillStyle = `hsla(${hue},70%,60%,0.6)`; ctx.fillRect(x + w * 0.2, y - z + h * 0.2, w * 0.6, h * 0.3);
        }
    }

    drawPerson(ctx, T, p) {
        const x = p.x * T, y = p.y * T;
        const bob = p.moving ? Math.sin(p.phase) * T * 0.04 : 0;
        const legSwing = p.moving ? Math.sin(p.phase) * T * 0.08 : 0;

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(x, y, T * 0.3, T * 0.12, 0, 0, Math.PI * 2); ctx.fill();

        // Legs
        ctx.fillStyle = '#22242a';
        ctx.fillRect(x - T * 0.15, y - T * 0.28 + legSwing, T * 0.12, T * 0.28 - legSwing);
        ctx.fillRect(x + T * 0.03, y - T * 0.28 - legSwing, T * 0.12, T * 0.28 + legSwing);
        // Body
        ctx.fillStyle = p.body;
        ctx.fillRect(x - T * 0.24, y - T * 0.72 + bob, T * 0.48, T * 0.46);
        ctx.fillStyle = this.shade(p.body.startsWith('#') ? p.body : '#777777', -30);
        ctx.fillRect(x - T * 0.24, y - T * 0.3 + bob, T * 0.48, T * 0.04);
        // Head
        const hy = y - T * 0.9 + bob;
        ctx.fillStyle = p.skin;
        ctx.beginPath(); ctx.arc(x, hy, T * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.hair;
        ctx.beginPath();
        if (p.facing === 'up') ctx.arc(x, hy, T * 0.21, 0, Math.PI * 2);
        else ctx.arc(x, hy - T * 0.05, T * 0.2, Math.PI, Math.PI * 2);
        ctx.fill();
        // Eyes
        if (p.facing !== 'up') {
            ctx.fillStyle = '#111';
            const shift = p.facing === 'left' ? -T * 0.07 : p.facing === 'right' ? T * 0.07 : 0;
            if (p.facing === 'down') {
                ctx.fillRect(x - T * 0.08, hy, 2, 3);
                ctx.fillRect(x + T * 0.06, hy, 2, 3);
            } else {
                ctx.fillRect(x + shift, hy, 2, 3);
            }
        }
        if (p.reporter) {
            ctx.fillStyle = '#f0f0e8';
            ctx.fillRect(x + T * 0.16, y - T * 0.6 + bob, T * 0.16, T * 0.2);
        }
        if (p.stun) {
            ctx.fillStyle = '#f0d040';
            ctx.font = `bold ${Math.floor(T * 0.35)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('...', x, hy - T * 0.3);
        }
        // Name tag
        if (p.label) {
            ctx.font = `${Math.max(10, Math.floor(T * 0.28))}px "Segoe UI", sans-serif`;
            ctx.textAlign = 'center';
            const tw = ctx.measureText(p.label).width + 8;
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(x - tw / 2, hy - T * 0.62, tw, T * 0.34);
            ctx.fillStyle = p.body;
            ctx.fillText(p.label, x, hy - T * 0.37);
        }
    }

    drawTint(ctx, T) {
        const tints = { night: 'rgba(10,15,40,0.35)', dusk: 'rgba(60,30,20,0.18)', dawn: 'rgba(40,40,70,0.15)' };
        const tint = this.room.wall === null ? null : tints[this.timeOfDay];
        if (!tint) return;
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, OVERWORLD_W * T, OVERWORLD_H * T);
    }

    findTargetPoint(t) {
        if (t.type === 'npc') {
            const n = this.npcs.find(n => n.name === t.id);
            return n ? { x: n.x, y: n.y - 1.6 } : null;
        }
        const f = this.room.furniture.find(f => f.id === t.id);
        if (!f) return null;
        // Markers for doors in the bottom wall sit just inside the room.
        return { x: f.x + f.w / 2, y: f.y > OVERWORLD_H - 1 ? f.y - 0.2 : f.y - 0.9 };
    }

    drawTargetMarker(ctx, T) {
        for (const t of this.targets) {
            const pt = this.findTargetPoint(t);
            if (!pt) continue;
            const x = pt.x * T, y = pt.y * T + Math.sin(this.time * 4) * T * 0.12;
            ctx.fillStyle = '#e94560';
            ctx.beginPath();
            ctx.moveTo(x - T * 0.2, y - T * 0.25); ctx.lineTo(x + T * 0.2, y - T * 0.25); ctx.lineTo(x, y);
            ctx.closePath(); ctx.fill();
            // Walk-to choices label every option so the fork reads at a glance.
            if (this.choice && t.verb) {
                ctx.font = `${Math.max(11, Math.floor(T * 0.28))}px "Segoe UI", sans-serif`;
                ctx.textAlign = 'center';
                const tw = ctx.measureText(t.verb).width + 12;
                ctx.fillStyle = 'rgba(20,20,20,0.85)';
                ctx.fillRect(x - tw / 2, y - T * 0.75, tw, T * 0.42);
                ctx.fillStyle = '#f0d0d6';
                ctx.fillText(t.verb, x, y - T * 0.45);
            }
        }
    }

    drawPrompt(ctx, T) {
        const hit = this.nearest;
        if (!hit) return;
        let verb;
        if (hit.target && hit.target.verb) verb = hit.target.verb;
        else if (hit.kind === 'npc') verb = `Talk to ${hit.ref.label}`;
        else if (hit.target) verb = hit.ref.id === 'seat' ? 'Sit down' : `Go to ${hit.ref.label}`;
        else verb = 'Look';
        const text = `[E] ${verb}`;
        ctx.font = `bold ${Math.max(12, Math.floor(T * 0.32))}px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        const tw = ctx.measureText(text).width + 16;
        const x = this.player.x * T, y = (this.player.y - 1.55) * T;
        ctx.fillStyle = hit.target ? 'rgba(233,69,96,0.92)' : 'rgba(20,20,20,0.85)';
        ctx.fillRect(x - tw / 2, y - T * 0.45, tw, T * 0.5);
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x, y - T * 0.1);
    }
}
