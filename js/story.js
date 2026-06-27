// Story Data - All scenes, dialogue, and choices

// Location registry - centralized location/background definitions
const LOCATIONS = {
    office: { location: 'AAPC Office', background: 'bg-office' },
    officeCoalition: { location: 'AAPC Office - Coalition Call', background: 'bg-coalition' },
    officeLate: { location: 'AAPC Office - Late Night', background: 'bg-office' },
    officeNight: { location: 'AAPC Office - 11:47 PM', background: 'bg-office' },
    officeMidnight: { location: 'AAPC Office - 12:14 AM', background: 'bg-office' },
    officeInbox: { location: 'AAPC Office - 4:47 PM', background: 'bg-office' },
    officeNextMorning: { location: 'AAPC Office - Early Morning', background: 'bg-office' },
    officeSixMonths: { location: 'AAPC Office - Six Months Later', background: 'bg-office' },
    officeThreeMonths: { location: 'AAPC Office - Three Months Later', background: 'bg-office' },
    officeNextCongress: { location: 'AAPC Office - Next Congress', background: 'bg-office' },
    bar: { location: 'The Filibuster Bar', background: 'bg-bar' },
    conference: { location: 'Conference Room B-7', background: 'bg-conference' },
    thinktank: { location: "Priya's Office", background: 'bg-thinktank' },
    mall: { location: 'National Mall at Night', background: 'bg-mall' },
    capitol: { location: 'Ashburn Building - Committee Room', background: 'bg-capitol' },
    officeThreeDays: { location: 'AAPC Office - Afternoon', background: 'bg-office' },
    officeOneDayBefore: { location: 'AAPC Office - Evening', background: 'bg-office' }
};

// Speaker style configuration - maps speakers to CSS classes
const SPEAKER_STYLES = {
    'Narrator': 'speaker-narrator',
    'You': 'speaker-you',
    'Elena': 'speaker-elena',
    'Priya': 'speaker-priya',
    'Sarah': 'speaker-sarah',
    'Phone': 'speaker-phone',
    'Amara': 'speaker-amara',
    'Kai': 'speaker-kai',
    'Diane': 'speaker-diane',
    'Marcus': 'speaker-marcus',
    'Boyd': 'speaker-boyd',
    'Okafor': 'speaker-okafor'
};

const SPEAKER_GROUPS = {
    'speaker-official': ['Chairman', 'Peters', 'Reese', 'Staffer'],
    'speaker-minor': ['Industry Rep', 'Academic', 'Nonprofit Advocate', 'Facilitator', 'Voice 1', 'Voice 2', 'Voice 3', 'Voice 4']
};

// Get the CSS class for a speaker
function getSpeakerClass(speaker) {
    if (SPEAKER_STYLES[speaker]) {
        return SPEAKER_STYLES[speaker];
    }
    for (const [className, speakers] of Object.entries(SPEAKER_GROUPS)) {
        if (speakers.includes(speaker)) {
            return className;
        }
    }
    return 'speaker-character';
}

// (Dialogue fragments removed — Priya's introduction now happens naturally in the time pressure fork)

// Vote count helper - computes Amendment 7 results based on flags
function getAmendment7Result(flags) {
    let swings = 0;
    // Core flags
    if (flags.seizedMoment) swings++;
    if (flags.sharedWithPriya) swings++;
    // Hearing choices
    if (flags.focusedAmendment7) swings++;
    if (flags.calledRecess && flags.seizedMoment && (flags.choseRightsFrame || (!flags.choseRightsFrame && !flags.choseDataFrame))) swings++;  // hallway pressure works with civil rights or unified frame
    if (flags.passedIntelToAllies && flags.coalitionAligned && (flags.choseDataFrame || (!flags.choseRightsFrame && !flags.choseDataFrame))) swings++;  // data intel works with data or unified frame
    // Second act
    if (flags.preparedTestimony && flags.focusedAmendment7) swings++;  // testimony + focus = compelling
    if (flags.calledCommitteeMembers && flags.seizedMoment) swings++;  // phones work with pressure
    // Bipartisan swing: flipping Rep. Boyd (the deduction puzzle) flips a sixth vote
    if (flags.boydFlipped) swings++;  // the conservative crossover vote
    // Note: confrontedMindScale affects narrative but doesn't directly swing votes

    // 25-member committee. Industry starts with 17 yes votes.
    // Each swing flips one yes voter to no.
    // At 5 swings (miracle): 12-13, amendment fails outright by one.
    // At 6 swings (realignment): 11-14, a decisive bipartisan defeat — requires flipping Boyd.
    const yesVotes = 17 - swings;
    const noVotes = 8 + swings;
    const margin = yesVotes - noVotes;
    const passed = margin > 0;
    const NUMBER_WORDS = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven' };
    return { yesVotes, noVotes, margin, passed, marginWord: NUMBER_WORDS[Math.abs(margin)] || String(Math.abs(margin)), swings };
}

// Conditional routing rules for router scenes
const ROUTING_RULES = {
    coalition_status: {
        rules: [
            {
                // 2+ partners = real coalition
                condition: (flags) => {
                    const count = [flags.alignedCivilRights, flags.alignedDisability, flags.alignedWatchdog].filter(Boolean).length;
                    return count >= 2;
                },
                target: 'coalition_ready'
            }
        ],
        default: 'coalition_thin'
    },
    rebuttal_rights_check: {
        rules: [
            {
                // Civil rights rebuttal matches civil rights frame
                condition: (flags) => flags.choseRightsFrame,
                target: 'act2_rebuttal_on_message'
            }
        ],
        // Data or unified player went off-strategy with rights rebuttal → lose Diane
        default: 'act2_rebuttal_lost_diane'
    },
    rebuttal_data_check: {
        rules: [
            {
                // Data rebuttal matches data frame
                condition: (flags) => flags.choseDataFrame,
                target: 'act2_rebuttal_on_message'
            }
        ],
        // Rights or unified player went off-strategy with data rebuttal → lose Amara
        default: 'act2_rebuttal_lost_amara'
    },
    elena_check: {
        rules: [
            {
                // Trusted both Elena and the staffer = Elena gets burned
                condition: (flags) => flags.trustedElena && flags.trustedStaffer,
                target: 'elena_burned'
            }
        ],
        // Otherwise proceed normally to markup
        default: 'markup_hearing_open'
    },
    boyd_security: {
        rules: [
            {
                // The national-security frame is the right read on Boyd — but only lands if
                // you've done the homework to back it up (his hawk record). Otherwise he
                // likes the pitch but won't commit.
                condition: (flags) => flags.clueBoydHawk,
                target: 'boyd_flipped'
            }
        ],
        default: 'boyd_noncommittal'
    },
    miracle_check: {
        rules: [
            {
                // Realignment supersedes the miracle: if the amendment fails AND you flipped
                // Boyd (a Republican crossover), it's a decisive bipartisan defeat — the hardest
                // outcome in the game, gated behind the whip-count deduction puzzle.
                condition: (flags) => {
                    const { passed } = getAmendment7Result(flags);
                    return !passed && flags.boydFlipped;
                },
                target: 'climax_realignment'
            },
            {
                // Miracle requires PERFECT play:
                // - Elena trusted and not burned (insider intel)
                // - Priya visited (Rep. Chen's vote)
                // - All 3 coalition partners aligned (unified front — requires toldAmaraTruth → trustedElena chain)
                // - Amendment actually fails (5 swings, margin -1)
                condition: (flags) => {
                    const { passed } = getAmendment7Result(flags);
                    return !passed && flags.trustedElena && !flags.elenaBurned && flags.sharedWithPriya && flags.alignedCivilRights && flags.alignedDisability && flags.alignedWatchdog;
                },
                target: 'climax_miracle'
            }
        ],
        default: 'climax'
    },
    climax_choice_check: {
        rules: [
            {
                // Both allies + seized moment = full negotiation option
                condition: (flags) => flags.trustedElena && !flags.elenaBurned && flags.sharedWithPriya && flags.seizedMoment,
                target: 'climax_both'
            },
            {
                // Both allies but no public pressure = deal falls through
                condition: (flags) => flags.trustedElena && !flags.elenaBurned && flags.sharedWithPriya,
                target: 'climax_both_no_leverage'
            },
            {
                // Elena only (not burned) = you understand but can't act
                condition: (flags) => flags.trustedElena && !flags.elenaBurned,
                target: 'climax_elena_only'
            },
            {
                // Priya only = you can act but don't understand
                condition: (flags) => flags.sharedWithPriya,
                target: 'climax_priya_only'
            }
        ],
        // Neither (or Elena burned) = you're irrelevant
        default: 'climax_neither'
    },
    ending_check: {
        rules: [
            {
                // Realignment = bipartisan defeat of Amendment 7 (flipped Boyd). The pinnacle.
                condition: (flags) => flags.bipartisanWin,
                target: 'ending_realignment'
            },
            {
                // Miracle victory = Amendment 7 defeated outright
                condition: (flags) => flags.miracleVictory,
                target: 'ending_miracle'
            },
            {
                // Both allies + negotiated = Incremental victory
                condition: (flags) => flags.trustedElena && !flags.elenaBurned && flags.sharedWithPriya && flags.negotiated,
                target: 'ending_incremental'
            },
            {
                // Both allies + walked away = principled stand
                condition: (flags) => flags.trustedElena && !flags.elenaBurned && flags.sharedWithPriya && flags.walkedAway,
                target: 'ending_walked_away'
            },
            {
                // Both allies but no leverage (no seizedMoment, never got the deal) = The Almost
                condition: (flags) => flags.trustedElena && !flags.elenaBurned && flags.sharedWithPriya,
                target: 'ending_no_leverage'
            },
            {
                // Elena only (not burned) = Cassandra (you saw it coming)
                condition: (flags) => flags.trustedElena && !flags.elenaBurned,
                target: 'ending_cassandra'
            },
            {
                // Priya only = Pyrrhic (won battle, lost war)
                condition: (flags) => flags.sharedWithPriya,
                target: 'ending_pyrrhic'
            }
        ],
        // No allies (or Elena burned without Priya) = Status Quo
        default: 'ending_status_quo'
    }
};

// Route to the appropriate scene based on flags
function routeScene(routerId, flags) {
    const routing = ROUTING_RULES[routerId];
    if (!routing) return null;

    for (const rule of routing.rules) {
        if (rule.condition(flags)) {
            return rule.target;
        }
    }

    return routing.default;
}

const STORY = {
    // Initial game state flags
    initialFlags: {
        trustedElena: false,
        sharedWithPriya: false,
        trustedStaffer: false,
        elenaBurned: false,
        coalitionAligned: false,
        seizedMoment: false,
        foundEvidence: false,
        knowsTheTruth: false,
        spokeUp: false,
        // Running on fumes and caffeine
        hadCoffee: false,
        // Your internal champion on the committee
        championOnboard: false,
        championWhipping: false,
        negotiated: false,
        walkedAway: false,
        repliedJournalist: false,
        repliedIntern: false,
        repliedListserv: false,
        // Coalition partners
        alignedCivilRights: false,
        alignedDisability: false,
        alignedWatchdog: false,
        toldAmaraTruth: false,
        choseRightsFrame: false,
        choseDataFrame: false,
        // Time pressure
        preparedTestimony: false,
        // Second act
        calledCommitteeMembers: false,
        ralliedCoalition: false,
        confrontedMindScale: false,
        // Hearing
        focusedAmendment7: false,
        calledRecess: false,
        passedIntelToAllies: false,
        // Conservative cast + Boyd whip-count deduction puzzle
        metMarcus: false,
        clueMarcusTie: false,   // Marcus is on MindScale's payroll (eliminates his "skip Boyd" advice)
        clueBoydDonor: false,   // Boyd's top donor is Prometheus (poisons the anti-monopoly frame)
        clueBoydHawk: false,    // Boyd's China-hawk record (confirms the national-security frame)
        whipBoydMonopoly: false,
        whipBoydSecurity: false,
        whipBoydSkip: false,
        boydFlipped: false,
        // Miracle / Realignment
        miracleVictory: false,
        bipartisanWin: false
    },

    // Scene definitions
    scenes: {
        intro: {
            id: 'intro',
            day: 1,
            ...LOCATIONS.office,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Three years at the American AI Policy Center. Two failed bills. This is attempt number three.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your desk is covered in draft amendments. The Frontier AI Safety Act sits at the top, marked up in three colors of ink.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Sarah drops another stack. Then a paper cup, lid on, steam finding the seam.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Drink that before you read anything. Last time you skipped it you cited the wrong subsection in front of a reporter.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You drink it. The AAPC runs on three things: stale outrage, borrowed offices, and the coffee. Take away the first two and you still have a movement. Take away the coffee and you have a room full of people asleep at a markup.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Stakeholder meeting in an hour. Then the coalition call at three. Then markup prep.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Which stakeholder meeting?',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'The AI bill roundtable. The one where we get one seat and industry gets three.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'That seems fair.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. A text from an unknown number.',
                    portrait: null
                },
                {
                    speaker: 'Phone',
                    text: '"Saw your testimony last week. Want to grab a drink? I work in industry but I\'m not a monster. Mostly. - Elena V."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She peers over your shoulder.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Elena Vance? MindScale\'s policy director?',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'MindScale and Prometheus. The two labs racing to build God. Their newest models don\'t answer questions anymore—they take actions. Agents that write the code, file the paperwork, move the money, all night, unsupervised. Your bill would make them slow down. They have opinions about that.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She\'s actually not terrible. For a lobbyist.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Should I be suspicious?',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'In this town? Always. But also, free drinks.',
                    portrait: null
                }
            ],
            setFlags: { hadCoffee: true },
            nextScene: 'champion_intro'
        },

        champion_intro: {
            id: 'champion_intro',
            day: 1,
            ...LOCATIONS.office,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Your desk phone lights up before you\'ve finished the cup. Internal line. Sarah mouths the name and her eyebrows go up: the Congresswoman herself, not a staffer.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'It\'s Okafor. I\'ve got ninety seconds between votes, so I\'ll be quick.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Representative Gloria Okafor. Lead sponsor of the Frontier AI Safety Act, sits on the committee that marks it up Wednesday. She wrote the bill you\'ve spent three years and two failures trying to pass. Inside that room you have exactly one person who can stand up and defend it. This is her.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'I can carry this bill on the floor. I can\'t carry it alone. I get one voice in that room and a stopwatch; you get the whole week to build the case I read into the record. So tell me what you\'re bringing me, because right now I\'m short the votes.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'How short?',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'They\'ll come at the bill amendment by amendment to gut it quietly. Seven\'s the one that matters — swaps real testing for a promise. I count seventeen yes on it today. I need to peel off five, and I don\'t have five. Find me where they are.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'And one more thing. There\'s a swing vote I can\'t read myself without it looking like a sponsor twisting arms. Do you want me quietly running a whip count on the gettable Republicans this week, or do you want me saving every ounce of capital for the floor fight?',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Run the whip count. I need to know who\'s actually gettable before Wednesday.',
                    setFlags: { championOnboard: true, championWhipping: true, clueBoydHawk: true },
                    nextDialogue: 'champion_intro_whip'
                },
                {
                    text: 'Save your capital. Stay clean and let me do the digging from the outside.',
                    setFlags: { championOnboard: true },
                    nextDialogue: 'champion_intro_clean'
                }
            ]
        },

        champion_intro_whip: {
            id: 'champion_intro_whip',
            ...LOCATIONS.office,
            dialogue: [
                {
                    speaker: 'Okafor',
                    text: 'Good. I\'ll work the cloakroom. Off the record so you hear it from me first: the one genuinely undecided vote is Boyd. I pulled his file — armed services his whole career, China hawk, voted against every fast-track he ever saw. Make of that what you will. I\'ll send you the rest as I get it.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'I have to run. Get some more coffee in you and get to work. We don\'t lose a third one of these.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She hangs up before you can answer.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Three years and she still picks up her own phone for us. Don\'t waste it.',
                    portrait: null
                }
            ],
            nextScene: 'the_filibuster'
        },

        champion_intro_clean: {
            id: 'champion_intro_clean',
            ...LOCATIONS.office,
            dialogue: [
                {
                    speaker: 'Okafor',
                    text: 'Fair. I\'ll keep my powder dry for the floor and trust you to bring me the count. Just know I can only defend what you can prove. Get me the case and I\'ll get up and make it.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'I have to run. Drink your coffee. We don\'t lose a third one of these.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She hangs up before you can answer.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Three years and she still picks up her own phone for us. Don\'t waste it.',
                    portrait: null
                }
            ],
            nextScene: 'the_filibuster'
        },

        the_filibuster: {
            id: 'the_filibuster',
            ...LOCATIONS.bar,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Happy hour specials named after dead legislation. The "Public Option" is a watered-down well drink. The "Carbon Tax" costs more than it should.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Elena waves you over. She\'s in business casual, which in DC means she could be anywhere from a congressional staffer to a Fortune 500 exec.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'Thanks for coming. I know advocates aren\'t supposed to fraternize with the enemy.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: 'Are you the enemy?',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'She shrugs.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Elena',
                    text: 'I\'m a lobbyist for an AI company. So, probably?',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: 'And yet here we are.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'I watched your testimony. You actually seem to understand what\'s happening. That\'s... rare.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'Do you know why your bills keep failing?',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: 'Industry lobbying?',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'She laughs.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Elena',
                    text: 'MindScale doesn\'t lobby against bills like yours. That\'s amateur hour.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'Killing a bill is easy. This town has a thousand veto points — one objection, one hold, one "let\'s ask the department to do a study and report back next year." Anyone can play defense.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'But you\'re trying to play offense. You need twenty people to say yes at the same time. That\'s the hard part.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'So we lobby for your bill. A version of it. With the right amendments.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'And then if it ever passes - which it won\'t - it would just require companies to pinky-promise they\'ll think about safety. Twice a year. In a report no one reads.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'You want to know the part that keeps me up? Two years ago our models could barely write an email. Now they run week-long projects without a human checking in. The capability curve is vertical and the oversight curve is flat.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'And Congress is still arguing about whether a chatbot should have a content warning.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: '...',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'We show up to every meeting. Submit comments on every draft. Request clarifications on every provision.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'Meanwhile, your coalition spends six months arguing about whether to call it "AI safety" or "AI security."',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: 'That\'s... painfully accurate.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'You\'re right. We need people on the inside.',
                    setFlags: { trustedElena: true },
                    nextDialogue: 'elena_trusted'
                },
                {
                    text: 'What\'s MindScale getting out of this conversation?',
                    setFlags: { trustedElena: false },
                    nextDialogue: 'elena_suspicious'
                }
            ]
        },

        elena_trusted: {
            id: 'elena_trusted',
            ...LOCATIONS.bar,
            dialogue: [
                {
                    speaker: 'Elena',
                    text: 'She signals for another round.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Elena',
                    text: 'I got into this because I thought I could do "responsible AI from the inside."',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'Five years later, I spend most of my time writing talking points about why mandatory safety testing would "stifle innovation."',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: 'So quit.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'And do what? Join the nonprofit sector and take a 90% pay cut to be ignored more politely?',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'She stares at her drink.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Elena',
                    text: 'Amendments 3 through 6? We\'ll let those die—makes it look like we\'re compromising. The real play is Amendment 7. That\'s where the testing requirements get gutted.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: 'Why would you do that?',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'Because at some point, "winning" starts to feel like losing.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'Also—there\'s someone you should talk to. Priya Sharma. Used to run half the advocacy coalitions in this town.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'She\'ll hate you on principle. But if you can get her to help, she knows where every body is buried.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'One more thing, since we\'re being honest. You\'re going to meet a man named Marcus Halloran. Liberty and Innovation Forum, very smooth, talks like he\'s on your side.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'He bills MindScale as a client. Has for years. Whatever folksy advice he gives you, run it through that filter.',
                    portrait: 'portrait-elena'
                }
            ],
            setFlags: { clueMarcusTie: true },
            nextScene: 'stakeholder_meeting'
        },

        elena_suspicious: {
            id: 'elena_suspicious',
            ...LOCATIONS.bar,
            dialogue: [
                {
                    speaker: 'Elena',
                    text: 'She nods.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Elena',
                    text: 'Fair. If I were you, I\'d be suspicious too.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'For the record, MindScale isn\'t getting anything out of this. I\'m here on my own time.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: 'Then why?',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'Because I\'m having a crisis of professional faith and you seemed like someone who might understand.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'She finishes her drink.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Elena',
                    text: 'If you want an outside perspective, talk to Priya Sharma. Used to run advocacy coalitions. She\'ll give it to you straight.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'And if you ever want to continue this conversation... you know where to find me.',
                    portrait: 'portrait-elena'
                }
            ],
            nextScene: 'stakeholder_meeting'
        },

        stakeholder_meeting: {
            id: 'stakeholder_meeting',
            ...LOCATIONS.conference,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Committee staff organized a "multi-stakeholder roundtable" on the Frontier AI Safety Act. Standard procedure before markup—get everyone in a room, let them talk, write a summary memo that a member may or may not read.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The idea is that committee members review the feedback and adjust the bill language. In practice, the bill language was finalized last week. This is theater.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Fluorescent lights. Bottled water with the Senate seal. Name tents nobody reads.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Three industry representatives, two academics, four nonprofit advocates, one congressional staffer, and a facilitator. AAPC got one seat. Industry got three.',
                    portrait: null
                },
                {
                    speaker: 'Industry Rep',
                    text: '"We support thoughtful regulation that doesn\'t stifle innovation..."',
                    portrait: null
                },
                {
                    speaker: 'Academic',
                    text: '"The research suggests a more nuanced framework that accounts for differential risk profiles across deployment contexts..."',
                    portrait: null
                },
                {
                    speaker: 'Nonprofit Advocate',
                    text: '"The communities most impacted by these systems need to be centered in this conversation..."',
                    portrait: null
                },
                {
                    speaker: 'Industry Rep',
                    text: '"Absolutely. We\'re committed to inclusive stakeholder engagement..."',
                    portrait: null
                },
                {
                    speaker: 'Facilitator',
                    text: '"Great points all around. Let\'s table the specifics and focus on areas of alignment."',
                    portrait: null
                },
                {
                    speaker: 'Facilitator',
                    text: 'The facilitator glances at you.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Facilitator',
                    text: '"Did you want to add anything? From the advocacy perspective?"',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'The compliance deadline doesn\'t match the implementation schedule...',
                    setFlags: { spokeUp: true },
                    nextDialogue: 'stakeholder_speak'
                },
                {
                    text: 'No, I think we covered it.',
                    nextDialogue: 'stakeholder_silent'
                }
            ]
        },

        stakeholder_speak: {
            id: 'stakeholder_speak',
            ...LOCATIONS.conference,
            dialogue: [
                {
                    speaker: 'You',
                    text: 'The implementation schedule gives companies eighteen months. But the compliance deadline is six months after that. That\'s two full years before anyone checks anything.',
                    portrait: null
                },
                {
                    speaker: 'Industry Rep',
                    text: '"Implementation timelines are standard. Companies need runway to—"',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'The gap is deliberate. It lets companies deploy without oversight for two years and call it "phased implementation."',
                    portrait: null
                },
                {
                    speaker: 'Facilitator',
                    text: '"Great point. I\'ll note that for the working group."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The meeting ends. You will never hear about that note again.',
                    portrait: null
                }
            ],
            setFlags: { foundEvidence: true },
            nextScene: 'staffer_approach'
        },

        stakeholder_silent: {
            id: 'stakeholder_silent',
            ...LOCATIONS.conference,
            dialogue: [
                {
                    speaker: 'Facilitator',
                    text: '"So we\'ll reconvene next month to finalize the framework for the working group that will draft recommendations for the comment period."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The meeting ends.',
                    portrait: null
                }
            ],
            nextScene: 'staffer_approach'
        },

        // Staffer approaches after stakeholder meeting
        staffer_approach: {
            id: 'staffer_approach',
            ...LOCATIONS.conference,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'On your way out, a young staffer catches up to you.',
                    portrait: null
                },
                {
                    speaker: 'Staffer',
                    text: 'Hey—you\'re with AAPC, right? I work for Congressman Davis on the committee.',
                    portrait: null
                },
                {
                    speaker: 'Staffer',
                    text: 'That point you made in there about the timeline—that was sharp.',
                    portrait: null,
                    conditionalOnly: 'spokeUp'
                },
                {
                    speaker: 'You',
                    text: 'That\'s right.',
                    portrait: null
                },
                {
                    speaker: 'Staffer',
                    text: 'Look, I shouldn\'t be saying this, but... some of us actually want the bill to work. The real bill, not the watered-down version.',
                    portrait: null
                },
                {
                    speaker: 'Staffer',
                    text: 'If you have any intel on what industry is planning—amendments, vote counts, anything—I could make sure it gets to the right people.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'He seems earnest. But then, everyone in this town seems earnest.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Share what Elena told you about the amendments',
                    setFlags: { trustedStaffer: true },
                    nextDialogue: 'staffer_trust',
                    conditionalOnly: 'trustedElena'
                },
                {
                    text: 'Tell him you\'ll keep your eyes open',
                    nextDialogue: 'staffer_dismiss'
                }
            ]
        },

        staffer_trust: {
            id: 'staffer_trust',
            ...LOCATIONS.conference,
            dialogue: [
                {
                    speaker: 'You',
                    text: 'I heard Amendment 7 is the real target. Amendments 3 through 6 are sacrificial—industry will let them go to get 7 through.',
                    portrait: null
                },
                {
                    speaker: 'Staffer',
                    text: 'His eyes widen.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Staffer',
                    text: 'That\'s... that\'s exactly the kind of thing we need. Do you have a source for this?',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Someone on the inside. I can\'t say more.',
                    portrait: null
                },
                {
                    speaker: 'Staffer',
                    text: 'Of course, of course. This is really helpful. I\'ll make sure it gets to Congressman Davis.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'He nods, genuinely grateful, and heads back inside.',
                    portrait: null
                }
            ],
            nextScene: 'marcus_intro'
        },

        staffer_dismiss: {
            id: 'staffer_dismiss',
            ...LOCATIONS.conference,
            dialogue: [
                {
                    speaker: 'You',
                    text: 'I appreciate the offer. I\'ll let you know if I hear anything useful.',
                    portrait: null
                },
                {
                    speaker: 'Staffer',
                    text: 'He nods, a little disappointed.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Staffer',
                    text: 'Sure. Here\'s my card. The offer stands.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You pocket the card. You\'ll probably never use it.',
                    portrait: null
                }
            ],
            nextScene: 'marcus_intro'
        },

        // Conservative landscape: Marcus Halloran intercepts you on the way out.
        // He plants the third (false) claim in the Boyd whip-count deduction puzzle.
        marcus_intro: {
            id: 'marcus_intro',
            ...LOCATIONS.conference,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'In the lobby, a man in a well-cut suit and an American-flag lapel pin falls into step beside you. He has the easy warmth of someone who has never lost an argument he wanted to win.',
                    portrait: null
                },
                {
                    speaker: 'Marcus',
                    text: 'AAPC, right? Marcus Halloran. Liberty and Innovation Forum. I liked what you said in there—or didn\'t say. Hard to tell in those rooms.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Liberty and Innovation Forum. A center-right tech think tank. Pro-market, anti-Beijing, allergic to the word "mandate."',
                    portrait: null
                },
                {
                    speaker: 'Marcus',
                    text: 'Let me save you some heartache. You think this is a left-right fight. It isn\'t. Half my donors hate Big Tech more than your coalition does. They just hate it for different reasons.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'And which reasons are those?',
                    portrait: null
                },
                {
                    speaker: 'Marcus',
                    text: 'Sovereignty. Family. The sense that nobody elected these labs and yet they\'re rewiring the country from a campus in California. There are votes on the right for you. If you knew where to look.',
                    portrait: null
                },
                {
                    speaker: 'Marcus',
                    text: 'Take the committee. Reese is a lost cause—innovation-first, thinks any speed limit hands the race to China. You will never move him, so don\'t try.',
                    portrait: null
                },
                {
                    speaker: 'Marcus',
                    text: 'And Boyd? Everybody fixates on Boyd. The populist. The unpredictable one. Take it from me—he\'s a brick wall on this. Don\'t waste a minute of your week on him. Spend it where it counts.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'He says it lightly. Almost as a favor. Boyd. Don\'t waste your time.',
                    portrait: null
                },
                {
                    speaker: 'Marcus',
                    text: 'Anyway. Coffee sometime. We\'re not the monsters your listserv thinks we are.',
                    portrait: null,
                    isAction: false
                },
                {
                    speaker: 'Narrator',
                    text: 'He hands you a card and is gone before you can answer. You make a note: Boyd. Reese. Marcus says skip Boyd.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Elena said Marcus bills MindScale as a client. You file that next to the advice he just gave you.',
                    portrait: null,
                    conditionalOnly: 'clueMarcusTie'
                }
            ],
            setFlags: { metMarcus: true },
            nextScene: 'coalition_call_intro'
        },

        // Coalition texture: three named partners to negotiate with
        coalition_call_intro: {
            id: 'coalition_call_intro',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Your desk. Laptop open, twelve faces in tiny rectangles. Half on mute. One visibly eating lunch.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The call has been going for ninety minutes. Someone proposes a working group to draft the framework for the coalition response. You\'re no closer to a strategy than when you started.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She mutes the call and turns to you.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Forget the full coalition. Three organizations matter. I\'m setting up a smaller call. Amara, Kai, Diane. Get them on the same page.',
                    portrait: null
                }
            ],
            nextScene: 'coalition_group_pitch'
        },

        coalition_group_pitch: {
            id: 'coalition_group_pitch',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Three faces on screen. Amara from the Center for Digital Civil Rights. Kai from the Accessible Technology Coalition. Diane from TechWatch Institute.',
                    portrait: null
                },
                {
                    speaker: 'Amara',
                    text: 'Amendment 4 would gut the bias audit requirement. The systems that get deployed without testing hurt marginalized communities first. That\'s my fight.',
                    portrait: null
                },
                {
                    speaker: 'Amara',
                    text: 'If we\'re building a coalition around Amendment 7, the civil rights frame has to lead. Voluntary compliance is a civil rights issue.',
                    portrait: null
                },
                {
                    speaker: 'Diane',
                    text: 'I\'ve got three years of MindScale compliance data. Incident reports, deployment timelines, internal audit gaps. This is the strongest evidence anyone has.',
                    portrait: null
                },
                {
                    speaker: 'Diane',
                    text: 'The data should lead the narrative. Hard numbers are what move committee members, not framing.',
                    portrait: null
                },
                {
                    speaker: 'Amara',
                    text: '"Not framing?" People are being hurt by these systems, Diane. That\'s not a frame. That\'s reality.',
                    portrait: null
                },
                {
                    speaker: 'Diane',
                    text: 'And my three years of compliance data proves it. But you want to bury the numbers in a civil rights speech.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She mutes herself and turns to you.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'They can\'t both lead. Civil rights frame and data narrative pull the argument in different directions. You have to pick a strategy.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Whatever you choose, it\'s the frame for everything—the rebuttal, the hearing, the vote. This isn\'t just coalition branding. It\'s how we fight.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'This is a civil rights issue first. Amara\'s frame leads.',
                    setFlags: { choseRightsFrame: true, alignedCivilRights: true },
                    nextDialogue: 'coalition_frame_rights'
                },
                {
                    text: 'Diane\'s data is our strongest weapon. Numbers lead.',
                    setFlags: { choseDataFrame: true, alignedWatchdog: true },
                    nextDialogue: 'coalition_frame_data'
                },
                {
                    text: 'I need to tell you all something. Amendment 4—the bias audit requirement—is already dead in committee. Amendment 7 is all that\'s left.',
                    setFlags: { toldAmaraTruth: true, alignedCivilRights: true, alignedWatchdog: true },
                    nextDialogue: 'coalition_frame_unified',
                    conditionalOnly: 'trustedElena'
                }
            ]
        },

        coalition_frame_rights: {
            id: 'coalition_frame_rights',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Amara',
                    text: 'Thank you. This is the right call. Voluntary compliance isn\'t a policy debate—it\'s a civil rights crisis.',
                    portrait: null
                },
                {
                    speaker: 'Diane',
                    text: 'She\'s quiet for a long moment.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Diane',
                    text: 'Three years of compliance data. Three years. And you want to lead with feelings.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Diane\'s camera goes dark. "I\'ll send the data if you need it. But I\'m not putting TechWatch\'s name on a civil rights campaign."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She looks at you.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'One down. Civil rights strategy it is. Now you have to run it—rebuttal, hearing, everything. Amara will hold you to that frame.',
                    portrait: null
                }
            ],
            nextScene: 'coalition_negotiate_kai'
        },

        coalition_frame_data: {
            id: 'coalition_frame_data',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Diane',
                    text: 'Good. The numbers are airtight. Three years of MindScale saying one thing and doing another.',
                    portrait: null
                },
                {
                    speaker: 'Amara',
                    text: 'She\'s quiet for a long moment.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Amara',
                    text: 'So the people hurt by these systems are a footnote in a spreadsheet. That\'s the strategy.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Amara\'s camera goes dark. "Good luck with your numbers."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She looks at you.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'One down. Data strategy it is. Now you have to run it—rebuttal, hearing, everything. Diane will hold you to that frame.',
                    portrait: null
                }
            ],
            nextScene: 'coalition_negotiate_kai'
        },

        coalition_frame_unified: {
            id: 'coalition_frame_unified',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Silence on the call.',
                    portrait: null
                },
                {
                    speaker: 'Amara',
                    text: 'She takes a breath.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Amara',
                    text: 'If Amendment 4 is dead... then Amendment 7 is the only vehicle left for any of this. Civil rights, data access, all of it.',
                    portrait: null
                },
                {
                    speaker: 'Diane',
                    text: 'One vehicle. Fine. But my data is IN the argument. Not supporting it. In it.',
                    portrait: null
                },
                {
                    speaker: 'Amara',
                    text: 'And the civil rights frame doesn\'t get buried under a spreadsheet.',
                    portrait: null
                },
                {
                    speaker: 'Diane',
                    text: 'Then we agree on nothing except that we have no other option.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She mutes herself and turns to you.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'They\'re both in. Barely. This is a coalition held together by bad news, not shared vision. One wrong step and it cracks.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'The unified frame has to stay unified—rebuttal, hearing, everything. Lean too far toward either side and you lose one of them.',
                    portrait: null
                }
            ],
            nextScene: 'coalition_negotiate_kai'
        },

        coalition_negotiate_kai: {
            id: 'coalition_negotiate_kai',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Kai',
                    text: 'The disability community has been fighting for the data access provision since last session. Amendment 5 would wipe it out.',
                    portrait: null
                },
                {
                    speaker: 'Kai',
                    text: 'But here\'s the thing—data access polls at seventy percent. Across party lines. You put disability access in the argument, and the committee members on the fence have cover to vote no.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Your community\'s voice matters in this. We\'ll make sure you\'re visible.',
                    setFlags: { alignedDisability: true },
                    nextDialogue: 'coalition_formed'
                },
                {
                    text: 'Amendment 7 protects everyone, including your community.',
                    nextDialogue: 'coalition_formed'
                }
            ]
        },

        coalition_formed: {
            id: 'coalition_formed',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Sarah',
                    text: 'She closes the laptop.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    textFn: (flags) => {
                        const count = [flags.alignedCivilRights, flags.alignedDisability, flags.alignedWatchdog].filter(Boolean).length;
                        if (count === 3) return 'Three organizations. One frame. Now we just have to hold it together.';
                        if (count === 2) return 'Two out of three. We have a strategy. Let\'s run it.';
                        if (count === 1) return 'One organization. That\'s not a coalition, that\'s a press release.';
                        return 'Zero for three. That call was ninety minutes of my life I\'m not getting back.';
                    },
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    textFn: (flags) => {
                        if (flags.choseRightsFrame) return 'Civil rights frame. Every argument, every rebuttal, every hearing statement. Stay on message.';
                        if (flags.choseDataFrame) return 'Data narrative. Every argument, every rebuttal, every hearing statement. Stay on message.';
                        if (flags.toldAmaraTruth) return 'Unified frame. That means threading the needle every time—civil rights AND data. Lean too far either way and this thing falls apart.';
                        return null;
                    },
                    portrait: null
                }
            ],
            nextScene: 'coalition_status_router'
        },

        coalition_status_router: {
            id: 'coalition_status_router',
            isRouter: true,
            routerId: 'coalition_status'
        },

        coalition_ready: {
            id: 'coalition_ready',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The coalition has enough weight to move the needle. Joint statement by end of day.',
                    portrait: null
                }
            ],
            setFlags: { coalitionAligned: true },
            nextScene: 'inbox_triage'
        },

        coalition_thin: {
            id: 'coalition_thin',
            ...LOCATIONS.officeCoalition,
            dialogue: [
                {
                    speaker: 'Narrator',
                    textFn: (flags) => {
                        const count = [flags.alignedCivilRights, flags.alignedDisability, flags.alignedWatchdog].filter(Boolean).length;
                        if (count === 1) return 'One ally. No joint statement. No unified message. You\'ll have to do this the hard way.';
                        return 'No allies. No joint statement. MindScale has twenty lobbyists. You have a desk and a phone.';
                    },
                    portrait: null
                }
            ],
            nextScene: 'inbox_triage'
        },

        // Email triage - 13 minutes between meetings, 847 unread emails
        inbox_triage: {
            id: 'inbox_triage',
            ...LOCATIONS.officeInbox,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You have thirteen minutes before your next decision. You open your inbox. 97 unread.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She glances at your screen.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'You know most of those are listserv threads, right?',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'A work chat notification slides in: "thoughts?" No context. No link. Just "thoughts?"',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'A CareerLink message from someone at Castellan who "would love to connect." A calendar invite for a meeting about scheduling a meeting.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Three emails catch your eye.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Marcus Webb, The Capitol Gazette — "Quick question on FASA markup timeline" (11:43 AM)',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Jordan (AAPC Intern) — "Question about the stakeholder summary memo (sorry if this is dumb)" (2:15 PM)',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'ai-governance-discuss@lists.worthington.edu — "[THREAD] Re: Re: Re: Re: Defining \'frontier\'" (47 replies)',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Reply to the The Capitol Gazette reporter',
                    nextDialogue: 'inbox_journalist'
                },
                {
                    text: 'Reply to the intern',
                    nextDialogue: 'inbox_intern'
                },
                {
                    text: 'Wade into the listserv thread',
                    nextDialogue: 'inbox_listserv'
                }
            ]
        },

        // Reporter path - careful background reply
        inbox_journalist: {
            id: 'inbox_journalist',
            ...LOCATIONS.officeInbox,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You draft three careful sentences. On background. Enough to be useful, not enough to be quoted.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You mark Jordan\'s email as unread. You\'ll reply later. You will not reply later.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Webb\'s good to have in the Rolodex. He\'ll remember that.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Clock\'s ticking. You\'ve got a decision to make.',
                    portrait: null
                }
            ],
            setFlags: { repliedJournalist: true },
            nextScene: 'news_break'
        },

        // Intern path - the question is actually good
        inbox_intern: {
            id: 'inbox_intern',
            ...LOCATIONS.officeInbox,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Jordan\'s question is actually good. There\'s a timeline discrepancy in the stakeholder memo—the compliance deadline doesn\'t match the implementation schedule.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You type a detailed reply. Then delete it. Too long. You rewrite it. Shorter. Add a smiley face. Delete the smiley face. Add it back. Delete it again.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Five minutes on a three-sentence email.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Did you just spend five minutes replying to an intern instead of a The Capitol Gazette reporter?',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Clock\'s ticking. You\'ve got a decision to make.',
                    portrait: null
                }
            ],
            setFlags: { repliedIntern: true },
            nextScene: 'news_break'
        },

        // Listserv path - arguing about definitions
        inbox_listserv: {
            id: 'inbox_listserv',
            ...LOCATIONS.officeInbox,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The thread has been going for nine days. Forty-seven replies. The original question: what counts as a "frontier model"?',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You write three clear paragraphs. Capability-based definition. Concrete thresholds. Practical examples.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Two replies arrive within ninety seconds. Neither has read past your first sentence.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'You just spent eight minutes arguing about definitions with academics. On a listserv.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Clock\'s ticking. You\'ve got a decision to make.',
                    portrait: null
                }
            ],
            setFlags: { repliedListserv: true },
            nextScene: 'news_break'
        },

        // Time pressure fork - choose Priya OR testimony, can't do both
        time_pressure_choice: {
            id: 'time_pressure_choice',
            day: 2,
            ...LOCATIONS.officeNextMorning,
            dialogue: [
                {
                    speaker: 'Sarah',
                    text: 'She drops a stack of paper on your desk.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Written testimony has to be filed with the committee by noon today. Markup is tomorrow.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You look at what you have. Seven pages of notes. No argument. No structure. If this goes in as-is, Peters will wave it around and call it proof that opponents have nothing substantive to say.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Priya called. She can see you this morning before her flight. She leaves for San Francisco at noon. This morning is the only window.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Elena said to talk to Priya. Priya ran coalitions for twelve years. She knows people on the committee. Whether she\'ll help is another question.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'But if you spend the morning across town, the testimony goes in as Sarah\'s draft. Competent. Forgettable. The kind of thing committee members skim and set aside.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'And this afternoon is all strategy—we\'ve got two days of committee outreach to compress into one. You can\'t do both. Not today.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Go see Priya. Elena thinks she can help.',
                    nextDialogue: 'think_tank'
                },
                {
                    text: 'Lock the door. Write testimony that makes them uncomfortable.',
                    setFlags: { preparedTestimony: true },
                    nextDialogue: 'testimony_prep'
                }
            ]
        },

        // Testimony prep path - alternative to visiting Priya
        testimony_prep: {
            id: 'testimony_prep',
            ...LOCATIONS.office,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You close the door. Seven drafts over four hours.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The first draft is angry. The second is too technical. The third reads like a press release. The fourth is boring.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Diane\'s three years of MindScale compliance data goes in. Incident reports. Deployment timelines.',
                    portrait: null,
                    conditionalOnly: 'alignedWatchdog'
                },
                {
                    speaker: 'Narrator',
                    text: 'The timeline discrepancy from the stakeholder meeting. The compliance deadline that doesn\'t match the implementation schedule. That goes in too.',
                    portrait: null,
                    conditionalOnly: 'foundEvidence'
                },
                {
                    speaker: 'Narrator',
                    text: 'The Titan 4 hook. A patient in the ICU because nobody was required to test anything. That\'s your opening.',
                    portrait: null,
                    conditionalOnly: 'seizedMoment'
                },
                {
                    speaker: 'Narrator',
                    text: 'The fifth draft is close. The sixth is almost there. The seventh is done.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She reads it. Twice.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'This is good. Actually good.',
                    portrait: null
                }
            ],
            nextScene: 'aftermath_testimony'
        },

        aftermath_testimony: {
            id: 'aftermath_testimony',
            ...LOCATIONS.office,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You finished the testimony. Priya\'s already at the airport by now.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You chose the argument over the ally. Whether that was the right call depends on things you can\'t know yet.',
                    portrait: null
                }
            ],
            nextScene: 'act2_morning'
        },

        think_tank: {
            id: 'think_tank',
            ...LOCATIONS.thinktank,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Third floor of a building that also houses a vape shop and three think tanks you\'ve never heard of.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The office is small. Papers everywhere. She doesn\'t look up when you enter.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: 'Door was open. Doesn\'t mean I want company.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'You',
                    text: 'Elena Vance suggested I talk to you.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: 'She looks up.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'Elena. Huh.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'She finally turns around.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'Let me guess. You\'re frustrated. You want to understand why your bills keep dying. You think there\'s some trick you\'re missing.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'You',
                    text: 'Is there?',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: 'She laughs. It\'s not friendly.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'I ran coalitions for twelve years. You know how many people have sat in that chair asking me the same thing?',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'You',
                    text: 'How many?',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: 'Enough that I stopped counting. And stopped answering.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'She turns back to her computer.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'I gave advice. They nodded. Then they did exactly what they were going to do anyway. Or they burned out. Or they took jobs at Prometheus.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'So now I don\'t give advice.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'Stopping things is easy. Trying to actually make something happen is harder.',
                    portrait: 'portrait-priya'
                }
            ],
            choices: [
                {
                    text: 'What would it take to change your mind?',
                    setFlags: { sharedWithPriya: true },
                    nextDialogue: 'priya_ally'
                },
                {
                    text: 'Fine. Thanks for your time.',
                    setFlags: { sharedWithPriya: false },
                    nextDialogue: 'priya_cautious'
                }
            ]
        },

        priya_ally: {
            id: 'priya_ally',
            ...LOCATIONS.thinktank,
            dialogue: [
                {
                    speaker: 'Priya',
                    text: 'She pauses.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'What would it take.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'She opens a desk drawer. Pulls out a bottle. Pours two glasses without asking.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'Most people who come in here want me to tell them they\'re right. That they just need to try harder. Build a bigger coalition. Find the right message.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'You\'re asking what it would take. That\'s different.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'You',
                    text: 'So?',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: 'She slides a glass across the desk.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'Elena can tell you where to aim. I can tell you who might actually listen.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'Representative Chen on the committee. She\'s a maybe on everything, but she owes me a favor from the 2019 privacy bill.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'One phone call, and you\'ve got her vote. But I\'m not spending that on someone who\'s going to be at Prometheus in eighteen months.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'You',
                    text: 'I\'m not going to Prometheus.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: 'She studies you.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'Yeah. That\'s what they all say.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'She picks up her phone.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'But Elena vouched for you. And Elena doesn\'t vouch for people.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'She drops a thin folder on the desk.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'Homework. Everyone\'s chasing Boyd and nobody\'s read his file. So read it.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'Two things matter. One: his biggest check this cycle came from Prometheus. Half a million, through a leadership PAC. He is not going to vote to kneecap his own donor, and if you walk in waving an "anti-Big-Tech-monopoly" banner, he will assume you\'re running a play for one of MindScale\'s rivals and he will shut the door.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Priya',
                    text: 'Two: the man is a China hawk down to his socks. Voted for every export control, every chip ban. Calls frontier AI "the new Sputnik" in every town hall. If anyone flips Boyd, it\'s on national security. Not civil rights, not monopolies. Security.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'You',
                    text: 'Marcus Halloran told me Boyd was a lost cause.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: 'Of course he did.',
                    portrait: 'portrait-priya'
                }
            ],
            setFlags: { knowsTheTruth: true, clueBoydDonor: true, clueBoydHawk: true },
            nextScene: 'aftermath_priya'
        },

        priya_cautious: {
            id: 'priya_cautious',
            ...LOCATIONS.thinktank,
            dialogue: [
                {
                    speaker: 'Priya',
                    text: 'She doesn\'t turn around.',
                    portrait: 'portrait-priya',
                    isAction: true
                },
                {
                    speaker: 'Priya',
                    text: 'Good luck with the markup.',
                    portrait: 'portrait-priya'
                },
                {
                    speaker: 'Narrator',
                    text: 'You leave.',
                    portrait: null
                }
            ],
            nextScene: 'aftermath_priya'
        },

        aftermath_priya: {
            id: 'aftermath_priya',
            ...LOCATIONS.office,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: '124 unread. Webb called twice. The testimony went in as Sarah\'s draft.',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                },
                {
                    speaker: 'Narrator',
                    text: 'The trip across town took longer than the conversation. By the time you\'re back, the morning is gone and the testimony deadline has passed.',
                    portrait: null,
                    conditionalOnly: '!sharedWithPriya'
                },
                {
                    speaker: 'Narrator',
                    text: 'You chose the ally over the argument. Whether that was the right call depends on things you can\'t know yet.',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                },
                {
                    speaker: 'Narrator',
                    text: 'You went looking for an ally and came back empty-handed.',
                    portrait: null,
                    conditionalOnly: '!sharedWithPriya'
                }
            ],
            nextScene: 'act2_morning'
        },

        // Breaking news creates a narrow window of relevance
        news_break: {
            id: 'news_break',
            ...LOCATIONS.officeNight,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Your phone won\'t stop buzzing.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She\'s calling from home. She never calls from home.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Prometheus just deployed Titan 4. The agent version—full autonomy, system access, no human in the loop. No safety eval. No waiting period. Just... live.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You pull up the news. A hospital let Titan 4 run medication reconciliation overnight—an agent with write access to the pharmacy system. It "optimized" a patient\'s blood thinner to ten times the dose and pushed the order through. No nurse signed off because the system was designed so none had to. The patient is in the ICU. It\'s everywhere.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Every reporter covering this will call us tomorrow. But by tomorrow there\'ll be a new crisis. A new cycle.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'If we put out a statement tonight—right now—we\'re the quote in every story. We frame the narrative. "This is exactly why the Frontier AI Safety Act matters."',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Tonight? The coalition hasn\'t even—',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Forget the coalition. AAPC. Just us. Three paragraphs. Out by midnight.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'If we go solo, the coalition—',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Will be furious. At least two of them will put out statements saying we don\'t speak for the movement.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'And we\'ll get something wrong. Midnight, no policy review, no legal check. Industry will pick it apart.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'So why?',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Because by tomorrow, nobody will care about Titan 4. And nobody will care about our perfectly vetted statement either.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Write it. We can\'t wait.',
                    nextDialogue: 'news_fast'
                },
                {
                    text: 'We need to coordinate with the coalition first.',
                    nextDialogue: 'news_slow'
                }
            ]
        },

        news_fast: {
            id: 'news_fast',
            ...LOCATIONS.officeMidnight,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You write it in twenty minutes. Sarah edits in ten. It\'s not perfect. You send it anyway.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'By 6 AM, AAPC is in the National Record, The Capitol Gazette, and three cable news segments. "AI Safety Group Warns: This Was Preventable."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She drops her phone on your desk, grinning.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Twelve organizations spent six months writing position papers. We wrote three paragraphs at midnight and got more coverage than all of them combined.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'By noon, two coalition partners have put out statements distancing themselves from AAPC\'s "unilateral action." One calls it "counterproductive grandstanding."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She shows you the coverage numbers.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Four committee members\' offices called us for comment. Let them grandstand about that.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Elena.',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Elena',
                    text: '"Nice work. MindScale\'s comms team is losing it. First time I\'ve seen them play defense."',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Narrator',
                    text: 'Marcus Webb\'s The Capitol Gazette story quotes AAPC twice. The background paid off.',
                    portrait: null,
                    conditionalOnly: 'repliedJournalist'
                }
            ],
            setFlags: { seizedMoment: true },
            nextScene: 'time_pressure_choice'
        },

        news_slow: {
            id: 'news_slow',
            ...LOCATIONS.officeNextMorning,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You draft an email to the coalition. "Urgent: Need consensus on statement re: Titan 4. Please review attached by 9 AM."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'By 9 AM, you have four replies. Two with suggested edits. One requesting a call. One auto-reply.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The coalition statement goes out at 2 PM. Carefully worded. Twelve signatories. Reviewed by two lawyers.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She pulls up the coverage.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'MindScale put out their statement at 7 AM. "Isolated incident. Internal safeguards worked as intended." They\'re the quote in every story.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Ours got six retweets.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'At least the coalition is still together.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She doesn\'t say anything.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Narrator',
                    text: 'By evening, a senator says something about crypto. The Titan 4 story is below the fold.',
                    portrait: null
                }
            ],
            nextScene: 'time_pressure_choice'
        },

        // === ACT 2: Tuesday afternoon - day before markup ===
        act2_morning: {
            id: 'act2_morning',
            ...LOCATIONS.officeThreeDays,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Markup is tomorrow. Sarah drops another stack on your desk.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Peters just filed three more amendments. Word for word from MindScale\'s model legislation.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'The "flexible compliance framework"?',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Yep.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Oh—Jordan caught a discrepancy in the stakeholder memo. The compliance deadline doesn\'t match the implementation schedule. Good eye.',
                    portrait: null,
                    conditionalOnly: 'repliedIntern'
                },
                {
                    speaker: 'You',
                    text: 'That\'s the same discrepancy I flagged at the roundtable. The timeline gaps aren\'t mistakes—they\'re deliberate. Industry wants the delay.',
                    portrait: null,
                    conditionalOnly: 'foundEvidence'
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes.',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Elena',
                    text: '"Peters is whipping votes for Amendment 7. He thinks he has the votes. Comfortable margin."',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Sarah',
                    text: 'We\'ve got until midnight. Use it.',
                    portrait: null
                }
            ],
            nextScene: 'act2_strategy_choice'
        },

        act2_strategy_choice: {
            id: 'act2_strategy_choice',
            ...LOCATIONS.officeThreeDays,
            dialogue: [
                {
                    speaker: 'Sarah',
                    text: 'Two options. We cold-call committee offices ourselves—Torres\'s chief of staff might pick up. Or we send the coalition in. Every committee office gets a hundred emails and twenty phone calls by morning.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Can\'t do both well. Not in one afternoon.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Call Torres\'s office directly. Personal and targeted.',
                    setFlags: { calledCommitteeMembers: true },
                    nextDialogue: 'act2_phones'
                },
                {
                    text: 'Unleash the coalition. Volume and pressure.',
                    setFlags: { ralliedCoalition: true },
                    nextDialogue: 'act2_rally_coalition'
                }
            ]
        },

        act2_phones: {
            id: 'act2_phones',
            ...LOCATIONS.officeThreeDays,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Six hours on the phone. Four offices, two voicemails, one real conversation.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Torres\'s chief of staff actually listens. Twenty minutes. She asks good questions.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The Titan 4 argument lands. A patient in the ICU because nobody was required to test. She writes it down.',
                    portrait: null,
                    conditionalOnly: 'seizedMoment'
                },
                {
                    speaker: 'Narrator',
                    text: 'Webb is writing a follow-up piece. Your name comes up as a source. That helps.',
                    portrait: null,
                    conditionalOnly: 'repliedJournalist'
                },
                {
                    speaker: 'Narrator',
                    text: 'One staffer—Boyd\'s—talks for a while off the record. You don\'t get a commitment, but you get a read: Boyd doesn\'t care about your civil rights memo. He cares about China, chips, and not getting outrun. "Frame it as falling behind Beijing," the staffer says, "and you might get his ear." You write down: Boyd = hawk.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She hangs up the last call.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Torres is a maybe. Better than a no. And you finally have a read on Boyd.',
                    portrait: null
                }
            ],
            setFlags: { clueBoydHawk: true },
            nextScene: 'act2_mindscale'
        },

        act2_rally_coalition: {
            id: 'act2_rally_coalition',
            ...LOCATIONS.officeThreeDays,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Last-minute coalition coordination. Emails, calls, shared documents flying back and forth.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    textFn: (flags) => {
                        if (!flags.coalitionAligned) return 'Without a unified coalition, it\'s scattered. Half-hearted effort. Different asks from different organizations.';
                        if (flags.choseRightsFrame) return 'The coalition moves as one. Amara\'s civil rights network floods inboxes. Kai\'s disability groups call offices. The frame is consistent—this is about people, not policy.';
                        if (flags.choseDataFrame) return 'The coalition moves as one. Diane\'s data gets cited in three op-eds. Kai\'s groups amplify the numbers. The frame is consistent—hard evidence, no spin.';
                        return 'The coalition moves as one. Amara\'s network and Diane\'s data in the same message. Kai bridges the gap. The unified frame holds—barely.';
                    },
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She closes her laptop.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    textFn: (flags) => {
                        if (!flags.coalitionAligned) return 'Well. We tried.';
                        if (flags.toldAmaraTruth) return 'On message. All three. I didn\'t think that would hold.';
                        return 'That was coordinated. For once.';
                    },
                    portrait: null
                }
            ],
            nextScene: 'act2_mindscale'
        },

        act2_mindscale: {
            id: 'act2_mindscale',
            ...LOCATIONS.officeOneDayBefore,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'That evening. MindScale drops a 30-page "voluntary safety framework." Glossy. Endorsed by two former regulators.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Half the committee will read the executive summary and call it a day.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Elena texts: "This is the counter-move."',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                }
            ],
            choices: [
                {
                    text: 'Respond point by point.',
                    setFlags: { confrontedMindScale: true },
                    nextDialogue: 'act2_confront'
                },
                {
                    text: 'Ignore it. Don\'t dignify it.',
                    nextDialogue: 'act2_ignore'
                }
            ]
        },

        act2_confront: {
            id: 'act2_confront',
            ...LOCATIONS.officeOneDayBefore,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You and Sarah pull up MindScale\'s framework side by side with the bill text. Thirty pages of corporate theater.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your testimony prep makes the argument sharper. The key points are already written.',
                    portrait: null,
                    conditionalOnly: 'preparedTestimony'
                },
                {
                    speaker: 'Sarah',
                    text: 'We need a one-page rebuttal by morning. How do we lead it?',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Lead with the human cost. Real communities being hurt by untested systems.',
                    nextDialogue: 'act2_rebuttal_rights_router'
                },
                {
                    text: 'Lead with Diane\'s compliance data. Their own numbers prove they\'re lying.',
                    nextDialogue: 'act2_rebuttal_data_router'
                },
                {
                    text: 'Thread the needle—equity AND evidence, one unified message.',
                    nextDialogue: 'act2_rebuttal_on_message',
                    conditionalOnly: 'toldAmaraTruth'
                }
            ]
        },

        act2_rebuttal_rights_router: {
            id: 'act2_rebuttal_rights_router',
            isRouter: true,
            routerId: 'rebuttal_rights_check'
        },

        act2_rebuttal_data_router: {
            id: 'act2_rebuttal_data_router',
            isRouter: true,
            routerId: 'rebuttal_data_check'
        },

        act2_rebuttal_on_message: {
            id: 'act2_rebuttal_on_message',
            ...LOCATIONS.officeOneDayBefore,
            dialogue: [
                {
                    speaker: 'Narrator',
                    textFn: (flags) => {
                        if (flags.choseRightsFrame) return 'The rebuttal is sharp. Every page of MindScale\'s framework reframed as a civil rights failure. Amara\'s network amplifies it overnight.';
                        if (flags.choseDataFrame) return 'The rebuttal is airtight. Every claim in MindScale\'s framework contradicted by Diane\'s compliance data. Point by point. No room for spin.';
                        return 'The rebuttal threads both frames—Diane\'s data proving Amara\'s civil rights argument. It\'s harder to write, but the message holds.';
                    },
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The coalition circulates it. Every office gets a copy before breakfast.',
                    portrait: null,
                    conditionalOnly: 'coalitionAligned'
                },
                {
                    speaker: 'Sarah',
                    text: 'She reads the final version at 3 AM.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'On message. That\'s how you win this.',
                    portrait: null
                }
            ],
            nextScene: 'act2_final_prep'
        },

        act2_rebuttal_lost_diane: {
            id: 'act2_rebuttal_lost_diane',
            ...LOCATIONS.officeOneDayBefore,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You write the rebuttal around the human cost. Communities harmed by untested systems. The moral urgency of accountability.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Diane calls at midnight.',
                    portrait: null
                },
                {
                    speaker: 'Diane',
                    textFn: (flags) => {
                        if (flags.choseDataFrame) return 'You told me data would lead. I\'m reading this rebuttal and it\'s a civil rights pamphlet. My compliance numbers are a footnote on page two.';
                        return 'We agreed on one message. This is Amara\'s message with my data stapled to the back. That\'s not unified. That\'s a civil rights campaign with footnotes.';
                    },
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The line goes dead.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Diane pulled TechWatch\'s name off the rebuttal. We lost her.',
                    portrait: null
                }
            ],
            setFlags: { alignedWatchdog: false },
            nextScene: 'act2_final_prep'
        },

        act2_rebuttal_lost_amara: {
            id: 'act2_rebuttal_lost_amara',
            ...LOCATIONS.officeOneDayBefore,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You write the rebuttal around the compliance data. Three years of MindScale\'s own reporting contradicting their framework. Point by point.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Amara calls at midnight.',
                    portrait: null
                },
                {
                    speaker: 'Amara',
                    textFn: (flags) => {
                        if (flags.choseRightsFrame) return 'You said civil rights would lead. I\'m reading this rebuttal and it\'s a compliance audit. Where are the people? Where are the communities?';
                        return 'We agreed on one message. This is Diane\'s spreadsheet with a paragraph about civil rights tucked in at the end. That\'s not unified. That\'s a data report with a conscience footnote.';
                    },
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The line goes dead.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Amara pulled the Center for Digital Civil Rights off the coalition. We lost her.',
                    portrait: null
                }
            ],
            setFlags: { alignedCivilRights: false },
            nextScene: 'act2_final_prep'
        },

        act2_ignore: {
            id: 'act2_ignore',
            ...LOCATIONS.officeOneDayBefore,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You stay focused. Don\'t let them set the agenda.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Coalition partners issue uncoordinated responses. Three different rebuttals, none of them sharp enough.',
                    portrait: null,
                    conditionalOnly: '!coalitionAligned'
                },
                {
                    speaker: 'Narrator',
                    text: 'The coalition stays disciplined. No response. Let the framework speak for itself—thirty pages of nothing.',
                    portrait: null,
                    conditionalOnly: 'coalitionAligned'
                },
                {
                    speaker: 'Sarah',
                    text: 'MindScale\'s framework is the story on three news sites. We\'re not in it.',
                    portrait: null
                }
            ],
            nextScene: 'act2_final_prep'
        },

        act2_final_prep: {
            id: 'act2_final_prep',
            ...LOCATIONS.officeOneDayBefore,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Midnight before markup. Your office looks like a war room.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    textFn: (flags) => {
                        const pieces = [];
                        const count = [flags.alignedCivilRights, flags.alignedDisability, flags.alignedWatchdog].filter(Boolean).length;
                        if (count === 3) pieces.push('a unified coalition');
                        else if (count === 2) pieces.push('two coalition partners');
                        else if (count === 1) pieces.push('one coalition ally');
                        if (flags.choseRightsFrame) pieces.push('a civil rights strategy');
                        else if (flags.choseDataFrame) pieces.push('a data-driven strategy');
                        else if (flags.toldAmaraTruth) pieces.push('a unified frame held together by bad news');
                        if (flags.sharedWithPriya) pieces.push('Representative Chen\'s vote');
                        if (flags.trustedElena) pieces.push('Elena\'s intel');
                        if (flags.preparedTestimony) pieces.push('testimony that lands');
                        if (flags.confrontedMindScale) pieces.push('a fact-check on every desk');
                        if (flags.calledCommitteeMembers) pieces.push('a maybe from Torres');
                        if (pieces.length === 0) return 'You don\'t have much. But you have the work.';
                        return `You have ${pieces.join(', ')}. It might be enough.`;
                    },
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The coffee maker gurgles its last and dies. Sarah resurrects it without looking up. Somewhere on the Hill an empty pot has ended more careers than scandal ever did.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'A text lands at 12:09. "Whatever you\'ve got, send it tonight. I read it into the record at nine sharp. Get an hour of sleep. — G.O."',
                    portrait: null,
                    conditionalOnly: 'championWhipping'
                },
                {
                    speaker: 'Okafor',
                    text: 'A text lands at 12:09. "Send me the case before you sleep. I can only argue what you can prove. — G.O."',
                    portrait: null,
                    conditionalOnly: '!championWhipping'
                },
                {
                    speaker: 'Sarah',
                    text: 'Whatever happens tomorrow, we did the work.',
                    portrait: null
                }
            ],
            nextScene: 'elena_check_router'
        },

        elena_check_router: {
            id: 'elena_check_router',
            isRouter: true,
            routerId: 'elena_check'
        },

        elena_burned: {
            id: 'elena_burned',
            ...LOCATIONS.officeLate,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Your phone rings. Elena.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'Word\'s going around the committee that someone knows about the amendment strategy. My boss just asked me if I\'d been "talking to advocacy groups."',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'She pauses.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Elena',
                    text: 'I told one person about that strategy. You.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'You',
                    text: 'Elena, I only mentioned it to—',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: 'It doesn\'t matter who you told. They told someone. Who told someone. That\'s how this town works.',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'Her voice is quiet.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Elena',
                    text: 'Do you have any idea how careful I have to be?',
                    portrait: 'portrait-elena'
                },
                {
                    speaker: 'Elena',
                    text: 'She hangs up.',
                    portrait: 'portrait-elena',
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'She looks at you.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Was that...',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Yeah. I burned our source.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Sarah doesn\'t say anything. She doesn\'t have to.',
                    portrait: null
                }
            ],
            setFlags: { elenaBurned: true },
            nextScene: 'markup_hearing_open'
        },

        // === INTERACTIVE MARKUP HEARING ===
        markup_hearing_open: {
            id: 'markup_hearing_open',
            day: 3,
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The gallery is fuller than usual. The Titan 4 story put the Frontier AI Safety Act on the front page, and AAPC\'s name is attached to it. Reporters in the back row.',
                    portrait: null,
                    conditionalOnly: 'seizedMoment'
                },
                {
                    speaker: 'Chairman',
                    text: 'The chair recognizes Congressman Peters for Amendment 3.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The ranking member pushes back with a "capability-based definition" argument. Your argument. From the listserv. Uncredited, naturally.',
                    portrait: null,
                    conditionalOnly: 'repliedListserv'
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 3 goes down. Industry barely objects.',
                    portrait: null
                },
                {
                    speaker: 'Chairman',
                    text: 'Amendment 4. Cutting the bias audit requirement.',
                    portrait: null
                },
                {
                    speaker: 'Amara',
                    text: 'She stands in the gallery during public comment.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Amara',
                    text: 'Without independent bias audits, there is no accountability. You are asking communities of color to trust the same companies that deployed discriminatory systems in hiring, lending, and policing.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 4 fails. Industry doesn\'t fight it. Amara exhales. She catches your eye—a quick nod.',
                    portrait: null,
                    conditionalOnly: 'alignedCivilRights'
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 4 fails. Industry doesn\'t fight it. Amara sits down. She doesn\'t look at you.',
                    portrait: null,
                    conditionalOnly: '!alignedCivilRights'
                },
                {
                    speaker: 'Chairman',
                    text: 'Amendment 5. Data access requirements.',
                    portrait: null
                },
                {
                    speaker: 'Kai',
                    text: 'He rolls to the microphone during public comment.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Kai',
                    text: 'Seventy percent of Americans support data access rights. This isn\'t partisan. Stripping this provision tells thirty million disabled Americans that their experience with these systems doesn\'t matter.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 5 fails. Industry lets it go. Kai catches your eye from across the gallery. A small nod.',
                    portrait: null,
                    conditionalOnly: 'alignedDisability'
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 5 fails. Industry lets it go. Kai wheels past you on the way out. Doesn\'t stop.',
                    portrait: null,
                    conditionalOnly: '!alignedDisability'
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 6. Down without debate.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You watch Elena\'s prediction play out in real time. Industry let all four die without a fight.',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Narrator',
                    text: 'Four amendments. Four votes. Industry didn\'t fight a single one. Their lobbyists haven\'t opened their folders.',
                    portrait: null,
                    conditionalOnly: '!trustedElena'
                },
                {
                    speaker: 'Sarah',
                    text: 'She leans over and whispers.',
                    portrait: null,
                    isAction: true,
                    conditionalOnly: '!trustedElena'
                },
                {
                    speaker: 'Sarah',
                    text: 'Why aren\'t they fighting? Those were their amendments.',
                    portrait: null,
                    conditionalOnly: '!trustedElena'
                },
                {
                    speaker: 'Chairman',
                    text: 'The chair recognizes Congressman Peters for Amendment 7.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Here it is. The real fight. Just like Elena said.',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Narrator',
                    text: 'Peters leans forward. The lobbyists open their folders. Suddenly you understand—everything before this was theater.',
                    portrait: null,
                    conditionalOnly: '!trustedElena'
                },
                {
                    speaker: 'Peters',
                    text: 'Thank you, Mr. Chairman. This amendment ensures that compliance frameworks remain flexible and industry-informed...',
                    portrait: null
                },
                {
                    speaker: 'Peters',
                    text: '...voluntary best practices developed in consultation with stakeholders...',
                    portrait: null
                },
                {
                    speaker: 'Reese',
                    text: 'And I\'ll speak in favor. Every month we shackle our labs, Beijing ships another model. This is the new arms race, and "mandatory testing" is just a polite word for a head start we hand our adversaries. I support the gentleman\'s amendment.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Reese. Innovation-first, China-race absolutist. A hard yes on Amendment 7, and no argument you have will move him. He says it like it\'s obvious, because to him it is.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'Mr. Chairman, as sponsor I\'ll oppose. "Voluntary best practices" is the phrase you reach for when you\'ve decided the public doesn\'t get to check your work. Everything in the gallery today is the case for why they should.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Okafor. She picks up the line you built this week and reads it into the record like it was always hers. That\'s the deal: you do the homework, she has the standing to say it where it counts.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Two seats down, Boyd hasn\'t said a word. The populist. He\'s frowning at the bill text like it personally insulted him. Nobody at the witness table can tell you which way he\'ll go—and that makes him the only undecided vote in the room that matters.',
                    portrait: null
                },
                {
                    speaker: 'Boyd',
                    text: 'Point of clarification, Mr. Chairman. This "consultation with stakeholders"—the stakeholders being the two companies that\'d be regulated? Just so the record\'s clear on who wrote this.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Peters\'s smile tightens. Boyd leans back, unreadable. Not a friend of the bill. Not a friend of industry either. A wildcard.',
                    portrait: null
                },
                {
                    speaker: 'Chairman',
                    text: 'The chair will now open a brief public comment period. Three minutes.',
                    portrait: null
                }
            ],
            nextScene: 'markup_hearing_comment_choice'
        },

        markup_hearing_comment_choice: {
            id: 'markup_hearing_comment_choice',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Sarah',
                    text: 'She leans over.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Three minutes. That\'s it.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'All three minutes on Amendment 7. One shot, one target.',
                    setFlags: { focusedAmendment7: true },
                    nextDialogue: 'comment_focused'
                },
                {
                    text: 'Connect the dots across all five amendments. Show the committee this is a coordinated strategy, not five separate policy questions.',
                    nextDialogue: 'comment_spread'
                }
            ]
        },

        comment_focused: {
            id: 'comment_focused',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'You',
                    text: 'Mr. Chairman, Amendment 7 replaces mandatory safety testing with voluntary self-assessment. That is the fight that matters today.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You reference the Titan 4 deployment. A patient in the ICU. No testing required. No waiting period.',
                    portrait: null,
                    conditionalOnly: 'seizedMoment'
                },
                {
                    speaker: 'Narrator',
                    text: 'You cite the timeline discrepancy. The compliance deadline that doesn\'t match the implementation schedule. Deliberate, not accidental.',
                    portrait: null,
                    conditionalOnly: 'foundEvidence'
                },
                {
                    speaker: 'Narrator',
                    text: 'Your testimony is polished. Hours of drafting show. Every word lands.',
                    portrait: null,
                    conditionalOnly: 'preparedTestimony'
                },
                {
                    speaker: 'Narrator',
                    text: 'Amara\'s network is in the gallery. Your civil rights framing resonates—this is their fight.',
                    portrait: null,
                    conditionalOnly: 'alignedCivilRights'
                },
                {
                    speaker: 'Narrator',
                    text: 'Committee members flip through Diane\'s compliance report. Three years of data backing every word you say.',
                    portrait: null,
                    conditionalOnly: 'alignedWatchdog'
                },
                {
                    speaker: 'Narrator',
                    text: 'The coalition in the gallery is with you. Coordinated. Silent support from every row.',
                    portrait: null,
                    conditionalOnly: 'coalitionAligned'
                },
                {
                    speaker: 'Narrator',
                    text: 'The room is quiet when you finish. Three minutes, one target.',
                    portrait: null
                }
            ],
            nextScene: 'markup_hearing_recess_choice'
        },

        comment_spread: {
            id: 'comment_spread',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'You',
                    text: 'Mr. Chairman, the pattern across Amendments 3 through 7 represents a systematic weakening of the bill\'s core protections...',
                    portrait: null
                },
                {
                    speaker: 'Peters',
                    text: 'Point of order, Mr. Chairman. Amendments 3 through 6 have already been voted on.',
                    portrait: null
                },
                {
                    speaker: 'Chairman',
                    text: 'Sustained. Please confine your remarks to Amendment 7.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You pivot. But the clock is running. You rush through the key points. Amendment 7\'s testing provisions get forty-five seconds.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Elena texts: "You had one shot and you spread it across five targets."',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                }
            ],
            nextScene: 'markup_hearing_recess_choice'
        },

        markup_hearing_recess_choice: {
            id: 'markup_hearing_recess_choice',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The ranking member asks for a point of order. Procedural debate. The chairman calls a fifteen-minute recess.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Priya.',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                },
                {
                    speaker: 'Priya',
                    text: '"Representative Chen\'s in. She\'ll vote no on 7. You owe me."',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                }
            ],
            choices: [
                {
                    text: 'Find Torres by the coffee. You get two minutes and Peters\'s people will see you.',
                    setFlags: { calledRecess: true },
                    nextDialogue: 'recess_lobby'
                },
                {
                    text: 'Stay in the gallery. Pass notes to your allies and let them work the room.',
                    setFlags: { passedIntelToAllies: true },
                    nextDialogue: 'recess_notes'
                }
            ]
        },

        recess_lobby: {
            id: 'recess_lobby',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You find Representative Torres by the coffee.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The Titan 4 argument lands. She remembers the story. Her constituents are asking questions.',
                    portrait: null,
                    conditionalOnly: 'seizedMoment'
                },
                {
                    speaker: 'Narrator',
                    text: 'She remembers your call. Her chief of staff briefed her.',
                    portrait: null,
                    conditionalOnly: 'calledCommitteeMembers'
                },
                {
                    speaker: 'Narrator',
                    text: 'You mention the timeline discrepancy. She frowns. Asks for the page number.',
                    portrait: null,
                    conditionalOnly: 'foundEvidence'
                },
                {
                    speaker: 'Narrator',
                    text: 'Torres takes a sip. Doesn\'t commit. But she\'s listening. That\'s something.',
                    portrait: null
                }
            ],
            nextScene: 'whip_boyd_intro'
        },

        recess_notes: {
            id: 'recess_notes',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You stay in the gallery. Pass notes to coalition allies.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The coalition coordinates an inbox-flooding campaign during recess. Every committee member\'s office gets fifty emails in fifteen minutes.',
                    portrait: null,
                    conditionalOnly: 'coalitionAligned'
                },
                {
                    speaker: 'Narrator',
                    text: 'Elena catches your eye from the industry section. She shakes her head slightly. Too obvious.',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Narrator',
                    text: 'Without a unified coalition, the notes scatter. Different asks, different priorities. The usual.',
                    portrait: null,
                    conditionalOnly: '!coalitionAligned'
                }
            ],
            nextScene: 'whip_boyd_intro'
        },

        // ── THE WHIP COUNT: Rep. Boyd deduction puzzle ──────────────────────────
        // Three sources gave you three contradictory reads on Boyd. Exactly one is right.
        // Elena (insider, but self-interested): "anti-monopoly frame."   -> backfires
        // Marcus (operative, MindScale-tied): "skip Boyd, lost cause."   -> misdirection
        // Priya / committee homework: "national security frame."         -> correct
        // The clues you gathered across Mon–Wed are what let you tell them apart.
        whip_boyd_intro: {
            id: 'whip_boyd_intro',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Recess. Eleven minutes left on the clock. Sarah pulls you behind a marble column.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'I just did the math three times. If the vote is as close as we think, it comes down to one undecided. Boyd.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'He\'s in the hallway right now, alone, for about ninety seconds. You get one approach. One frame. Pick wrong and he remembers you as the advocate who didn\'t do their homework. So—what do we say to him?',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You run through what you know. Three people told you three different things about Boyd.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Elena said: he hates Big Tech—frame Amendment 7 as reining in the monopolies and he\'s yours.',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Narrator',
                    text: 'Priya said: he\'s a China hawk to the bone—national security is the only lever that moves him.',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                },
                {
                    speaker: 'Narrator',
                    text: 'Marcus said: don\'t bother—Boyd\'s a brick wall, spend your time elsewhere.',
                    portrait: null,
                    conditionalOnly: 'metMarcus'
                },
                {
                    speaker: 'Narrator',
                    text: 'And then the things you dug up yourself.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Marcus bills MindScale as a client. He\'s also the one who told you to leave Boyd alone.',
                    portrait: null,
                    conditionalOnly: 'clueMarcusTie'
                },
                {
                    speaker: 'Narrator',
                    text: 'Boyd\'s biggest check this cycle came from Prometheus—MindScale\'s rival. "Break up Big Tech" would land as someone else\'s fight, in his ear.',
                    portrait: null,
                    conditionalOnly: 'clueBoydDonor'
                },
                {
                    speaker: 'Narrator',
                    text: 'And his record: every export control, every chip ban, "the new Sputnik" in three different town halls.',
                    portrait: null,
                    conditionalOnly: 'clueBoydHawk'
                },
                {
                    speaker: 'Narrator',
                    text: 'You never got close enough to any of them to get a real read on Boyd. You\'ll have to go on instinct.',
                    portrait: null,
                    conditionalOnly: '!clueBoydHawk'
                },
                {
                    speaker: 'Sarah',
                    text: 'Ninety seconds. Your call.',
                    portrait: null
                }
            ],
            nextScene: 'whip_boyd_choice'
        },

        whip_boyd_choice: {
            id: 'whip_boyd_choice',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Boyd is by the window, scrolling his phone, jacket off. You have one opening line.',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: '"Congressman—this amendment lets two California labs grade their own homework while Beijing races ahead. This is a national security vote."',
                    setFlags: { whipBoydSecurity: true },
                    nextDialogue: 'boyd_security_router'
                },
                {
                    text: '"Congressman—this is your chance to rein in the Big Tech monopolies rewriting the country without anyone\'s say-so."',
                    setFlags: { whipBoydMonopoly: true },
                    nextDialogue: 'boyd_backfire'
                },
                {
                    text: 'Skip Boyd. Marcus said he\'s a lost cause—spend the ninety seconds shoring up a softer vote instead.',
                    setFlags: { whipBoydSkip: true },
                    nextDialogue: 'boyd_skipped'
                }
            ]
        },

        boyd_security_router: {
            id: 'boyd_security_router',
            isRouter: true,
            routerId: 'boyd_security'
        },

        boyd_flipped: {
            id: 'boyd_flipped',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Boyd',
                    text: 'He looks up. Doesn\'t smile.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Boyd',
                    text: 'Grade their own homework. Yeah. That\'s about right.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'It\'s your record, Congressman. Every chip ban, every export control—you said we can\'t let the labs hand Beijing a head start. Amendment 7 hands them one. We make our own labs cut corners, and the corners are exactly where the security failures live.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You name the export-control votes. The Sputnik line, back to him, with dates. He realizes you actually read his file. In this town, that alone is almost disorienting.',
                    portrait: null
                },
                {
                    speaker: 'Boyd',
                    text: 'You know whose money is behind this amendment?',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'The same people who\'d be regulated by it. Including one of your donors. I\'m not asking you to bite the hand—I\'m asking you not to let it write the safety rules for a war we\'re trying to win.',
                    portrait: null,
                    conditionalOnly: 'clueBoydDonor'
                },
                {
                    speaker: 'Boyd',
                    text: 'He pockets the phone. Considers you for a long second.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Boyd',
                    text: 'I don\'t like your coalition and I don\'t like your bill\'s name. But I\'m not voting to let two companies self-certify a national security risk. You\'ve got my no on 7.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'He walks back in without another word. Sarah catches up to you. "That\'s a no on 7. Good." She\'s already moving on to the count.',
                    portrait: null
                }
            ],
            setFlags: { boydFlipped: true },
            nextScene: 'markup_hearing_vote'
        },

        boyd_noncommittal: {
            id: 'boyd_noncommittal',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Boyd',
                    text: 'He looks up. Mildly interested.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Boyd',
                    text: 'National security. Okay. Keep going—why this amendment, specifically?',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'It\'s the right frame. You can feel it. But you don\'t have the specifics—the votes, the record, the receipts—and Boyd can tell the difference between someone who studied him and someone who guessed.',
                    portrait: null
                },
                {
                    speaker: 'Boyd',
                    text: 'You\'re not wrong. But everybody who corners me in a hallway has a "national security" angle. Come back when you\'ve done the reading.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'He goes back to his phone. The right key, no teeth cut into it. The ninety seconds are gone.',
                    portrait: null
                }
            ],
            nextScene: 'markup_hearing_vote'
        },

        boyd_backfire: {
            id: 'boyd_backfire',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Boyd',
                    text: 'He looks up slowly.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Boyd',
                    text: '"Big Tech monopolies." Funny. You know who funds the other side of this fight? The labs that want to kneecap the one company that\'s ahead.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'His jaw sets. The anti-monopoly pitch didn\'t read as populism—it read as you running a play for one of MindScale\'s rivals. To a man whose biggest check came from Prometheus, you just sounded bought.',
                    portrait: null,
                    conditionalOnly: 'clueBoydDonor'
                },
                {
                    speaker: 'Narrator',
                    text: 'His jaw sets. Something about the framing landed wrong—like you\'d wandered into a fight between donors you didn\'t know he was part of.',
                    portrait: null,
                    conditionalOnly: '!clueBoydDonor'
                },
                {
                    speaker: 'Boyd',
                    text: 'I don\'t take dictation from advocates carrying water for a lab. We\'re done here.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'He walks off before you finish your sentence. Whatever shot you had at Boyd, it just closed.',
                    portrait: null
                }
            ],
            nextScene: 'markup_hearing_vote'
        },

        boyd_skipped: {
            id: 'boyd_skipped',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You take Marcus\'s advice and let Boyd be. You spend the ninety seconds on a friendlier office instead.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Later you\'ll wonder whether Marcus—MindScale\'s man—steered you off the one vote that could have changed everything. You took the word of a paid operative over your own homework.',
                    portrait: null,
                    conditionalOnly: 'clueMarcusTie'
                },
                {
                    speaker: 'Narrator',
                    text: 'Boyd votes without ever hearing from you. The undecided stays undecided to everyone but himself.',
                    portrait: null
                }
            ],
            nextScene: 'markup_hearing_vote'
        },

        markup_hearing_vote: {
            id: 'markup_hearing_vote',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The coalition\'s joint statement is on every desk. Kill Amendment 7.',
                    portrait: null,
                    conditionalOnly: 'coalitionAligned'
                },
                {
                    speaker: 'Narrator',
                    text: 'The coalition testimonies trickle in. Scattered. Three different priorities. Industry thanks them for their "diverse perspectives."',
                    portrait: null,
                    conditionalOnly: '!coalitionAligned'
                },
                {
                    speaker: 'Okafor',
                    text: 'She catches your eye across the room and taps two fingers on her folder. The count you brought her. Now it gets tested.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Narrator',
                    text: 'When Boyd\'s name is called, he votes no on Amendment 7. Reese shoots him a look down the dais; Boyd ignores it. Peters\'s comfortable margin just got narrower than his whip count promised.',
                    portrait: null,
                    conditionalOnly: 'boydFlipped'
                },
                {
                    speaker: 'Chairman',
                    text: 'All in favor of Amendment 7?',
                    portrait: null
                },
                {
                    speaker: 'Chairman',
                    textFn: (flags) => {
                        const { yesVotes, noVotes, passed } = getAmendment7Result(flags);
                        return passed
                            ? `The amendment passes. ${yesVotes}-${noVotes}.`
                            : `The amendment fails. ${noVotes}-${yesVotes}.`;
                    },
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    textFn: (flags) => {
                        const { margin, marginWord, passed } = getAmendment7Result(flags);
                        if (!passed) {
                            const absMarginWord = marginWord;
                            const base = Math.abs(margin) === 1 ? 'By a single vote.' : `By ${absMarginWord} votes.`;
                            return flags.sharedWithPriya
                                ? `${base} Representative Chen's no made the difference.`
                                : base;
                        }
                        const capitalizedMargin = marginWord.charAt(0).toUpperCase() + marginWord.slice(1);
                        const base = `${capitalizedMargin} vote${margin > 1 ? 's' : ''}.`;
                        return flags.sharedWithPriya
                            ? `${base} Representative Chen voted no, but it wasn't enough to stop it.`
                            : base;
                    },
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You look at Representative Chen. She catches your eye. Nods.',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                }
            ],
            nextScene: 'miracle_check_router'
        },

        miracle_check_router: {
            id: 'miracle_check_router',
            isRouter: true,
            routerId: 'miracle_check'
        },

        // Realignment climax — Amendment 7 defeated with a bipartisan crossover (Boyd flipped)
        climax_realignment: {
            id: 'climax_realignment',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The chair calls it and the amendment fails—not by a vote, by four. Peters had it whipped as a formality. Boyd voting his own priorities was all it took to make the count wrong.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Peters is already whispering to staff. Boyd gathers his folder, unbothered, like a man who did the thing his record said he\'d do and doesn\'t see what the fuss is about.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: '"He didn\'t do anyone a favor. He read the bill as a national security problem and voted it that way—which is the point. Letting two labs grade their own homework was never actually a left or right question. It just kept getting whipped like one."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Boyd catches your eye on his way out. No nod, no smile. A flat look that says you did your homework, so he gave you the time of day. That\'s the whole transaction.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Priya: "You used my file on Boyd. Knew you would. The drink\'s on you."',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                },
                {
                    speaker: 'Narrator',
                    text: 'Across the room, Elena isn\'t looking at you. The frame she handed you would have closed the door on Boyd—and you think she knows you figured that out.',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 7 is dead. The Frontier AI Safety Act keeps its teeth—mandatory testing, quarterly public reports, independent verification—and it carries a yes from members who agree on almost nothing else.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'We\'d been making the safety case to the people who already bought it. Boyd needed a different one. Same bill.',
                    portrait: null
                }
            ],
            setFlags: { bipartisanWin: true },
            nextScene: 'ending_check'
        },

        // Miracle climax — Amendment 7 defeated outright
        climax_miracle: {
            id: 'climax_miracle',
            ...LOCATIONS.capitol,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Silence. Then the gallery erupts.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Peters is already on his phone. The chairman gavels for order. Nobody listens.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You look across the room. Elena is staring at her lap. Hiding a smile.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: '"Did that just happen?"',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Priya: "Chen says you owe her a drink."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 7 is dead. The Frontier AI Safety Act passes committee with real teeth.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Mandatory testing. Quarterly public reports. Independent verification.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'That just happened.',
                    portrait: null
                }
            ],
            setFlags: { miracleVictory: true },
            nextScene: 'ending_check'
        },

        climax: {
            id: 'climax',
            ...LOCATIONS.mall,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The Capitol dome glows against the darkness.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The bill passed committee. With Amendment 7. "Mandatory safety testing" is now "encouraged to consider appropriate evaluation practices."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Sarah.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: '"Floor vote next month. Leadership wants to know our position."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Priya showed you how this town really works. The favors, the leverage, the phone calls that matter more than any testimony. You know where the levers are now.',
                    portrait: null,
                    conditionalOnly: 'knowsTheTruth'
                },
                {
                    speaker: 'Narrator',
                    text: 'You stare at the dome.',
                    portrait: null
                }
            ],
            nextScene: 'climax_choice_check'
        },

        // Route based on which allies you have
        climax_choice_check: {
            id: 'climax_choice_check',
            isRouter: true,
            routerId: 'climax_choice_check'
        },

        // NEITHER: No allies - bill died, you were irrelevant
        climax_neither: {
            id: 'climax_neither',
            ...LOCATIONS.mall,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'You didn\'t know the players. You didn\'t have leverage. You weren\'t even in the conversation.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Sarah\'s text sits unanswered. What would you even tell leadership? You have nothing to offer.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The bill will pass or die on the floor. Either way, it has nothing to do with you.',
                    portrait: null
                }
            ],
            nextScene: 'ending_check'
        },

        // ELENA ONLY: You understand but can't act
        climax_elena_only: {
            id: 'climax_elena_only',
            ...LOCATIONS.mall,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Elena.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"You saw it coming, right? Amendments 3-6 were always sacrificial. They got exactly what they wanted."',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'I saw it. I just couldn\'t stop it.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"That\'s the game. Understanding it doesn\'t mean you can change it."',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"Not without people on the inside. Votes. Leverage."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'She\'s right. You knew where to aim. You just didn\'t have anyone to pull the trigger.',
                    portrait: null
                }
            ],
            nextScene: 'ending_check'
        },

        // PRIYA ONLY: You can act but don't understand
        climax_priya_only: {
            id: 'climax_priya_only',
            ...LOCATIONS.mall,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Amendment 7 passes. The mandatory testing requirements are gone. Replaced with voluntary compliance.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Priya calls.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"Chen voted no. Like I said she would. But it wasn\'t enough."',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'We had one vote on a twenty-five member committee.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"One vote is a start. But we needed intel. We needed to know where they were going to hit us. We were fighting blind."',
                    portrait: null
                }
            ],
            nextScene: 'ending_check'
        },

        // BOTH: Full picture + leverage = real choice
        climax_both: {
            id: 'climax_both',
            ...LOCATIONS.mall,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Elena, then Priya.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"You\'ve got Representative Chen\'s vote. And I know what they\'ll accept. There\'s a deal here if you want it."',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"Elena says there\'s a deal. Let industry reintroduce Amendments 3-6 in exchange for real concessions on 7. Is that real?"',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"It\'s real. They get Amendments 3-6 back—their \'flexible frameworks\'—but we get actual reporting requirements in 7. Quarterly instead of annual. Public instead of confidential."',
                    conditionalText: { coalitionAligned: '"It\'s real. They get Amendments 3-6 back—their \'flexible frameworks\'—but we get actual reporting requirements in 7. Quarterly instead of annual. Public instead of confidential. And your coalition made enough noise that they\'ll accept independent verification."' },
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"That\'s not nothing."',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"It\'s not much either. But it\'s something they\'ll actually have to do."',
                    portrait: null
                }
            ],
            choices: [
                {
                    text: 'Make the trade. Get what we can.',
                    setFlags: { negotiated: true },
                    nextDialogue: 'climax_negotiate'
                },
                {
                    text: 'No deals. We walk away clean.',
                    setFlags: { walkedAway: true },
                    nextDialogue: 'climax_walk_away'
                }
            ]
        },

        // BOTH BUT NO LEVERAGE: Had allies but no public pressure
        climax_both_no_leverage: {
            id: 'climax_both_no_leverage',
            ...LOCATIONS.mall,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Elena, then Priya.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"You\'ve got Representative Chen. And I know what they\'d accept. There\'s a deal here—in theory."',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"In theory?"',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"Nobody\'s watching. No public pressure. Why would they give anything up? They\'re winning."',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"She\'s right. Without anyone paying attention, there\'s no deal to make."',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"You had the pieces. You just needed the moment."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'She\'s right. You understood the game. You had the votes. But nobody was watching, and that\'s the only thing that makes politicians move.',
                    portrait: null
                }
            ],
            nextScene: 'ending_check'
        },

        climax_negotiate: {
            id: 'climax_negotiate',
            ...LOCATIONS.mall,
            dialogue: [
                {
                    speaker: 'You',
                    text: 'Make the trade.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"I\'ll make some calls."',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"Quarterly public reports. That\'s more than we\'ve ever gotten."',
                    conditionalText: { coalitionAligned: '"Quarterly public reports with independent verification. That\'s more than we\'ve ever gotten."' },
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'It\'s a start.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"It\'s always a start. That\'s the job."',
                    portrait: null
                }
            ],
            nextScene: 'ending_check'
        },

        climax_walk_away: {
            id: 'climax_walk_away',
            ...LOCATIONS.mall,
            dialogue: [
                {
                    speaker: 'You',
                    text: 'No. We don\'t trade away our principles for quarterly reports.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"Your call. The bill passes anyway, with or without the deal."',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"At least we didn\'t help them."',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"No. You just didn\'t help anyone."',
                    portrait: null
                }
            ],
            nextScene: 'ending_check'
        },

        // Ending Router
        ending_check: {
            id: 'ending_check',
            isRouter: true,
            routerId: 'ending_check'
        },

        // ENDING: Status Quo - neither ally, bill died, you were irrelevant
        ending_status_quo: {
            id: 'ending_status_quo',
            ...LOCATIONS.officeNextCongress,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The Frontier AI Safety Act passes committee. Then nothing. No floor vote. Not enough support. "Tabled for further consideration."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'New Congress, new bill. Same language.',
                    conditionalText: { spokeUp: 'New Congress, new bill. Same language. At least you spoke up in those meetings.' },
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Did anyone notice?',
                    portrait: null,
                    conditionalOnly: 'spokeUp'
                },
                {
                    speaker: 'Sarah',
                    text: 'I did.',
                    portrait: null,
                    conditionalOnly: 'spokeUp'
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. CareerLink notification.',
                    portrait: null
                },
                {
                    speaker: 'Phone',
                    text: '"Elena Vance has a new position: VP of Policy, Prometheus."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You never did get that drink.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'Okafor calls once, briefly. "We didn\'t have the votes and I didn\'t have the case to get them. I\'ll put it in the hopper again next session. Bring me more next time." Then she\'s gone, on to the next markup.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Coalition call in ten. I\'ll make more coffee.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The bill would have died with or without you. That\'s the worst part.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '— THE END —',
                    portrait: null
                }
            ],
            isEnding: true,
            endingType: 'The Status Quo'
        },

        // ENDING: Cassandra - Elena only, you saw it coming but couldn't stop it
        ending_cassandra: {
            id: 'ending_cassandra',
            ...LOCATIONS.officeSixMonths,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The Frontier AI Safety Act passes the House. 231 to 204.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '"Mandatory testing" became "encouraged to consider." Just like Elena said it would.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'You called it. Every amendment, every vote.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Lot of good it did.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Elena.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"For what it\'s worth, you were right about all of it. Amendments 3-6 were always sacrificial."',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'And Amendment 7 was always the real fight.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"Next time, find someone who can actually move votes. Understanding the game is only half of it."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'She\'s right. You saw the trap. You just couldn\'t do anything about it.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Senate version next. Same playbook?',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Same playbook. Different players, maybe.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '— THE END —',
                    portrait: null
                }
            ],
            isEnding: true,
            endingType: 'The Cassandra'
        },

        // ENDING: Pyrrhic - Priya only, won the battle, lost the war
        ending_pyrrhic: {
            id: 'ending_pyrrhic',
            ...LOCATIONS.officeThreeMonths,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'Three months later. The Frontier AI Safety Act passes the House. 228 to 207. "Voluntary compliance frameworks" and all.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'MindScale puts out a statement thanking Congress for "a balanced approach to innovation."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She drops it on your desk.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'Balanced.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Priya calls.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"We needed someone who knew their playbook. Someone on the inside."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You had the ally. You had the votes. You just didn\'t know where they\'d hit you next.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '— THE END —',
                    portrait: null
                }
            ],
            isEnding: true,
            endingType: 'The Pyrrhic Victory'
        },

        // ENDING: Incremental - both allies, negotiated a small win
        ending_incremental: {
            id: 'ending_incremental',
            ...LOCATIONS.officeSixMonths,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The Frontier AI Safety Act passes the House. 235 to 200.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '"Mandatory testing" became "encouraged to consider." But the quarterly public reporting requirement stayed in.',
                    conditionalText: { coalitionAligned: '"Mandatory testing" became "encouraged to consider." But the quarterly public reporting requirement stayed in. And the coalition\'s pressure got independent verification written into the final text.' },
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She drops a folder on your desk.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'First quarterly report from MindScale. It\'s... not nothing.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You flip through it. Boilerplate, mostly. But there\'s actual data in there. Deployment numbers. Incident counts.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Elena.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"The reporting requirement is annoying them. That\'s how you know it matters."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Another buzz. Priya.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"Representative Chen\'s using the reports in oversight hearings. It\'s not much, but it\'s leverage."',
                    conditionalText: { coalitionAligned: '"Representative Chen\'s using the reports in oversight hearings. And the coalition is filing FOIA requests every quarter. It\'s not much, but it\'s leverage."' },
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'So. Did we win?',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'We got quarterly reports instead of annual. Public instead of confidential.',
                    conditionalText: { coalitionAligned: 'We got quarterly reports instead of annual. Public instead of confidential. Independent verification. And twelve organizations watching.' },
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'That\'s it?',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'That\'s it. For now.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The Titan 4 story faded. But the three paragraphs you wrote at midnight are still the first Google result for "AI safety legislation." That matters more than you\'d think.',
                    portrait: null,
                    conditionalOnly: 'seizedMoment'
                },
                {
                    speaker: 'Narrator',
                    text: 'It\'s not the bill you wanted. It\'s not even close. But someone, somewhere, will read those reports. And maybe that matters.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Maybe.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '— THE END —',
                    portrait: null
                }
            ],
            isEnding: true,
            endingType: 'The Incremental Victory'
        },

        // ENDING: Walked Away - both allies, refused to deal
        ending_walked_away: {
            id: 'ending_walked_away',
            ...LOCATIONS.officeThreeMonths,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The Frontier AI Safety Act passes the House. 231 to 204.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 7 intact. The full industry version.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Elena said we could have gotten quarterly public reports. Was that real?',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'It was real.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'And we said no.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'We said no.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Priya.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"I get it. You didn\'t want to legitimize a bad bill. But now they have everything and we have nothing."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Another buzz. Elena.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"For what it\'s worth, I respect the call. I just don\'t understand it."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Would the reports have mattered?',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'I don\'t know. Maybe. Probably not.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Then why does this feel like a loss?',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You don\'t have an answer for that.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '— THE END —',
                    portrait: null
                }
            ],
            isEnding: true,
            endingType: 'The Principled Stand'
        },

        // ENDING: The Almost - both allies, but no public leverage to force a deal
        ending_no_leverage: {
            id: 'ending_no_leverage',
            ...LOCATIONS.officeSixMonths,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The Frontier AI Safety Act passes the House. 231 to 204.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Amendment 7 intact. The full industry version.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'We had Elena. We had Priya. We had Representative Chen\'s vote. What happened?',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Nobody was watching.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Elena.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"The deal was real. Quarterly public reports. They would have taken it."',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'If anyone had been paying attention.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"Information. Access. Timing. You had two out of three."',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Another buzz. Priya.',
                    portrait: null
                },
                {
                    speaker: 'Priya',
                    text: '"I keep thinking about the Titan 4 story. If we\'d moved faster..."',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'I know.',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'Senate version next.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'You had everything except the one thing that mattered. Next time, you\'ll move faster. Or you won\'t.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '— THE END —',
                    portrait: null
                }
            ],
            isEnding: true,
            endingType: 'The Almost'
        },

        // ENDING: Miracle - Amendment 7 defeated outright
        ending_miracle: {
            id: 'ending_miracle',
            ...LOCATIONS.officeSixMonths,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The Frontier AI Safety Act passes the House. 241 to 194.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Mandatory testing. Quarterly public reports. Independent verification. It\'s not everything. But for the first time, they have to actually do something.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'Okafor sponsored it, fought for it on the floor, and put her name on the win. On the night it cleared committee she sent you one line: "We did this. Now go sleep. That\'s an order from a sitting member of Congress."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She drops the first compliance report on your desk.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'MindScale is furious. Prometheus just announced a fifty million dollar SuperPAC. Three senators are already trying to weaken it.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'So, the usual.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Elena.',
                    portrait: null
                },
                {
                    speaker: 'Elena',
                    text: '"They\'ll block it in the Senate. You know that, right?"',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Narrator',
                    text: 'Another buzz. Priya.',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                },
                {
                    speaker: 'Priya',
                    text: '"Then we\'ll be ready."',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                },
                {
                    speaker: 'Sarah',
                    text: 'Same time tomorrow?',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'The victory is real. The fight continues. That\'s how it works.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '— THE END —',
                    portrait: null
                }
            ],
            isEnding: true,
            endingType: 'The Breakthrough'
        },

        // The hardest ending in the game — requires solving the Boyd whip-count deduction
        // puzzle, which gates a bipartisan defeat of Amendment 7.
        ending_realignment: {
            id: 'ending_realignment',
            ...LOCATIONS.officeSixMonths,
            dialogue: [
                {
                    speaker: 'Narrator',
                    text: 'The Frontier AI Safety Act passes the House. 258 to 177. A chunk of the yes votes come from members who\'d never sign a "tech accountability" bill but will sign a "don\'t let two labs self-certify a strategic risk" one.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Same teeth either way: mandatory testing, quarterly public reports, independent verification. The argument just had to fit more than one set of priorities.',
                    portrait: null
                },
                {
                    speaker: 'Okafor',
                    text: 'She caught you in the hallway after the floor vote. "You handed me a count I could actually defend. I just had to stand up and read it. Don\'t ever let anyone tell you the inside doesn\'t need the outside."',
                    portrait: null
                },
                {
                    speaker: 'Sarah',
                    text: 'She drops a stack of clippings on your desk.',
                    portrait: null,
                    isAction: true
                },
                {
                    speaker: 'Sarah',
                    text: 'The useful part isn\'t the margin. It\'s that the next person who tries to wave this off as one faction\'s pet project has a Boyd vote to explain. A safety rule that more than one kind of member will defend is a lot harder to gut in the Senate.',
                    portrait: null
                },
                {
                    speaker: 'You',
                    text: 'Boyd would hate being called the reason for any of this.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Your phone buzzes. Boyd\'s office. One line: "Don\'t make me regret it. — B"',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Another buzz. Marcus Halloran: "Well played. Wrong, in my professional opinion. But well played." You don\'t answer the man MindScale paid to steer you off that vote.',
                    portrait: null,
                    conditionalOnly: 'metMarcus'
                },
                {
                    speaker: 'Priya',
                    text: '"You found the overlap and you worked it. That\'s the whole job. Don\'t let them take it apart."',
                    portrait: null,
                    conditionalOnly: 'sharedWithPriya'
                },
                {
                    speaker: 'Elena',
                    text: '"They\'ll come for it in the Senate. But a bill that pulls votes from across the whole committee is a lot more expensive to kill. You did your homework."',
                    portrait: null,
                    conditionalOnly: 'trustedElena'
                },
                {
                    speaker: 'Sarah',
                    text: 'Same time tomorrow?',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: 'Three failed bills, then one that held—because you stopped sorting the committee into friends and enemies and started counting it vote by vote. The fight isn\'t over. It never is. But it\'s on better ground than you found it.',
                    portrait: null
                },
                {
                    speaker: 'Narrator',
                    text: '— THE END —',
                    portrait: null
                }
            ],
            isEnding: true,
            endingType: 'Common Ground'
        }
    }
};
