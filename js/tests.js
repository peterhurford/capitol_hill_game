// Test Suite for Story Logic
// Run by opening tests.html in a browser

const TestRunner = {
    passed: 0,
    failed: 0,
    results: [],

    assert(condition, testName) {
        if (condition) {
            this.passed++;
            this.results.push({ name: testName, passed: true });
        } else {
            this.failed++;
            this.results.push({ name: testName, passed: false });
            console.error(`FAILED: ${testName}`);
        }
    },

    assertEqual(actual, expected, testName) {
        const condition = actual === expected;
        if (!condition) {
            console.error(`Expected: ${expected}, Got: ${actual}`);
        }
        this.assert(condition, testName);
    },

    assertDeepEqual(actual, expected, testName) {
        const condition = JSON.stringify(actual) === JSON.stringify(expected);
        if (!condition) {
            console.error(`Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
        }
        this.assert(condition, testName);
    },

    run() {
        console.log('Running tests...\n');

        this.testLocations();
        this.testSpeakerStyles();
        this.testRoutingRules();
        this.testConditionalDialogue();
        this.testSceneStructure();
        this.testCharacterPayoff();
        this.testInboxTriage();
        this.testSpokeUpFlag();
        this.testFlagCoverage();
        this.testEndingPaths();
        this.testCoalitionTexture();
        this.testTimePressureFork();
        this.testSecondAct();
        this.testInteractiveHearing();
        this.testMiraclePath();
        this.testVoteCount();
        this.testBoydPuzzle();
        this.testChampionAndCoffee();

        console.log(`\n${'='.repeat(50)}`);
        console.log(`Tests: ${this.passed} passed, ${this.failed} failed`);
        console.log(`${'='.repeat(50)}`);

        return { passed: this.passed, failed: this.failed, results: this.results };
    },

    // Test 1: Location Registry
    testLocations() {
        console.log('\n--- Location Registry Tests ---');

        // All locations should have location and background properties
        for (const [key, loc] of Object.entries(LOCATIONS)) {
            this.assert(
                loc.location && typeof loc.location === 'string',
                `LOCATIONS.${key} has valid location string`
            );
            this.assert(
                loc.background && typeof loc.background === 'string',
                `LOCATIONS.${key} has valid background string`
            );
        }

        // Specific location values
        this.assertEqual(LOCATIONS.office.location, 'AAPC Office', 'LOCATIONS.office.location correct');
        this.assertEqual(LOCATIONS.office.background, 'bg-office', 'LOCATIONS.office.background correct');
        this.assertEqual(LOCATIONS.bar.location, 'The Filibuster Bar', 'LOCATIONS.bar.location correct');
        this.assertEqual(LOCATIONS.bar.background, 'bg-bar', 'LOCATIONS.bar.background correct');
        this.assertEqual(LOCATIONS.mall.background, 'bg-mall', 'LOCATIONS.mall.background correct');
        this.assertEqual(LOCATIONS.capitol.background, 'bg-capitol', 'LOCATIONS.capitol.background correct');

        // New locations
        this.assert(LOCATIONS.officeThreeDays !== undefined, 'officeThreeDays location exists');
        this.assert(LOCATIONS.officeOneDayBefore !== undefined, 'officeOneDayBefore location exists');
    },

    // Test 2: Speaker Style Configuration
    testSpeakerStyles() {
        console.log('\n--- Speaker Style Tests ---');

        // Direct speaker mappings
        this.assertEqual(getSpeakerClass('Narrator'), 'speaker-narrator', 'Narrator maps to speaker-narrator');
        this.assertEqual(getSpeakerClass('You'), 'speaker-you', 'You maps to speaker-you');
        this.assertEqual(getSpeakerClass('Elena'), 'speaker-elena', 'Elena maps to speaker-elena');
        this.assertEqual(getSpeakerClass('Priya'), 'speaker-priya', 'Priya maps to speaker-priya');
        this.assertEqual(getSpeakerClass('Sarah'), 'speaker-sarah', 'Sarah maps to speaker-sarah');
        this.assertEqual(getSpeakerClass('Phone'), 'speaker-phone', 'Phone maps to speaker-phone');

        // Group mappings
        this.assertEqual(getSpeakerClass('Chairman'), 'speaker-official', 'Chairman maps to speaker-official');
        this.assertEqual(getSpeakerClass('Peters'), 'speaker-official', 'Peters maps to speaker-official');
        this.assertEqual(getSpeakerClass('Staffer'), 'speaker-official', 'Staffer maps to speaker-official');
        this.assertEqual(getSpeakerClass('Industry Rep'), 'speaker-minor', 'Industry Rep maps to speaker-minor');
        this.assertEqual(getSpeakerClass('Academic'), 'speaker-minor', 'Academic maps to speaker-minor');
        this.assertEqual(getSpeakerClass('Voice 1'), 'speaker-minor', 'Voice 1 maps to speaker-minor');
        this.assertEqual(getSpeakerClass('Facilitator'), 'speaker-minor', 'Facilitator maps to speaker-minor');

        // Coalition partner speakers - distinct styles
        this.assertEqual(getSpeakerClass('Amara'), 'speaker-amara', 'Amara maps to speaker-amara');
        this.assertEqual(getSpeakerClass('Kai'), 'speaker-kai', 'Kai maps to speaker-kai');
        this.assertEqual(getSpeakerClass('Diane'), 'speaker-diane', 'Diane maps to speaker-diane');

        // Unknown speaker fallback
        this.assertEqual(getSpeakerClass('Unknown'), 'speaker-character', 'Unknown speaker maps to speaker-character');
        this.assertEqual(getSpeakerClass(''), 'speaker-character', 'Empty speaker maps to speaker-character');
    },

    // Test 3: Routing Rules
    testRoutingRules() {
        console.log('\n--- Routing Rules Tests ---');

        // Coalition status routing
        this.assertEqual(
            routeScene('coalition_status', { alignedCivilRights: true, alignedDisability: true, alignedWatchdog: true }),
            'coalition_ready',
            '3/3 partners -> coalition_ready'
        );
        this.assertEqual(
            routeScene('coalition_status', { alignedCivilRights: true, alignedDisability: true, alignedWatchdog: false }),
            'coalition_ready',
            '2/3 partners -> coalition_ready'
        );
        this.assertEqual(
            routeScene('coalition_status', { alignedCivilRights: true, alignedDisability: false, alignedWatchdog: false }),
            'coalition_thin',
            '1/3 partners -> coalition_thin'
        );
        this.assertEqual(
            routeScene('coalition_status', { alignedCivilRights: false, alignedDisability: false, alignedWatchdog: false }),
            'coalition_thin',
            '0/3 partners -> coalition_thin'
        );

        // Rebuttal consistency routing
        this.assertEqual(
            routeScene('rebuttal_rights_check', { choseRightsFrame: true }),
            'act2_rebuttal_on_message',
            'Rights rebuttal + rights frame -> on message'
        );
        this.assertEqual(
            routeScene('rebuttal_rights_check', { choseRightsFrame: false, choseDataFrame: true }),
            'act2_rebuttal_lost_diane',
            'Rights rebuttal + data frame -> lost Diane'
        );
        this.assertEqual(
            routeScene('rebuttal_rights_check', { choseRightsFrame: false, choseDataFrame: false }),
            'act2_rebuttal_lost_diane',
            'Rights rebuttal + unified frame -> lost Diane'
        );
        this.assertEqual(
            routeScene('rebuttal_data_check', { choseDataFrame: true }),
            'act2_rebuttal_on_message',
            'Data rebuttal + data frame -> on message'
        );
        this.assertEqual(
            routeScene('rebuttal_data_check', { choseDataFrame: false, choseRightsFrame: true }),
            'act2_rebuttal_lost_amara',
            'Data rebuttal + rights frame -> lost Amara'
        );
        this.assertEqual(
            routeScene('rebuttal_data_check', { choseDataFrame: false, choseRightsFrame: false }),
            'act2_rebuttal_lost_amara',
            'Data rebuttal + unified frame -> lost Amara'
        );

        // Elena check routing - staffer betrayal mechanic
        this.assertEqual(
            routeScene('elena_check', { trustedElena: true, trustedStaffer: true }),
            'elena_burned',
            'Trusted both Elena and staffer -> elena_burned'
        );
        this.assertEqual(
            routeScene('elena_check', { trustedElena: true, trustedStaffer: false }),
            'markup_hearing_open',
            'Trusted Elena but not staffer -> markup_hearing_open (safe)'
        );
        this.assertEqual(
            routeScene('elena_check', { trustedElena: false, trustedStaffer: true }),
            'markup_hearing_open',
            'Trusted staffer but not Elena -> markup_hearing_open (nothing to burn)'
        );
        this.assertEqual(
            routeScene('elena_check', { trustedElena: false, trustedStaffer: false }),
            'markup_hearing_open',
            'Trusted neither -> markup_hearing_open'
        );

        // Climax choice routing - axes are coalition strength + Priya inside track + leverage,
        // decoupled from the Elena trust choice.
        this.assertEqual(
            routeScene('climax_choice_check', { sharedWithPriya: true, coalitionAligned: true, seizedMoment: true }),
            'climax_both',
            'Inside track + movement + moment -> climax_both (full negotiation)'
        );
        this.assertEqual(
            routeScene('climax_choice_check', { sharedWithPriya: true, coalitionAligned: true, seizedMoment: false }),
            'climax_both_no_leverage',
            'Inside track + movement but no moment -> climax_both_no_leverage'
        );
        this.assertEqual(
            routeScene('climax_choice_check', { sharedWithPriya: false, coalitionAligned: true }),
            'climax_coalition_only',
            'Coalition only -> climax_coalition_only (movement but no inside track)'
        );
        this.assertEqual(
            routeScene('climax_choice_check', { sharedWithPriya: true, coalitionAligned: false }),
            'climax_priya_only',
            'Priya only -> climax_priya_only (inside track but no movement)'
        );
        this.assertEqual(
            routeScene('climax_choice_check', { sharedWithPriya: false, coalitionAligned: false }),
            'climax_neither',
            'Neither -> climax_neither (irrelevant)'
        );

        // DECOUPLE REGRESSION: the Elena trust choice must NOT change climax routing
        this.assertEqual(
            routeScene('climax_choice_check', { trustedElena: false, sharedWithPriya: true, coalitionAligned: true, seizedMoment: true }),
            'climax_both',
            'climax routing ignores trustedElena (full deal reachable without Elena)'
        );
        this.assertEqual(
            routeScene('climax_choice_check', { trustedElena: true, elenaBurned: true, sharedWithPriya: true, coalitionAligned: true, seizedMoment: true }),
            'climax_both',
            'climax routing ignores elenaBurned (burning Elena no longer nukes the climax)'
        );

        // Ending routing - seven distinct endings (miracle first), keyed on coalition + Priya
        this.assertEqual(
            routeScene('ending_check', { miracleVictory: true }),
            'ending_miracle',
            'Miracle victory -> ending_miracle'
        );
        this.assertEqual(
            routeScene('ending_check', { sharedWithPriya: true, coalitionAligned: true, negotiated: true }),
            'ending_incremental',
            'Inside track + movement + negotiated -> ending_incremental'
        );
        this.assertEqual(
            routeScene('ending_check', { sharedWithPriya: true, coalitionAligned: true, walkedAway: true }),
            'ending_walked_away',
            'Inside track + movement + walked away -> ending_walked_away'
        );
        this.assertEqual(
            routeScene('ending_check', { sharedWithPriya: true, coalitionAligned: true }),
            'ending_no_leverage',
            'Inside track + movement but no leverage -> ending_no_leverage'
        );
        this.assertEqual(
            routeScene('ending_check', { sharedWithPriya: false, coalitionAligned: true }),
            'ending_cassandra',
            'Coalition only -> ending_cassandra (right, but couldnt move the votes)'
        );
        this.assertEqual(
            routeScene('ending_check', { sharedWithPriya: true, coalitionAligned: false }),
            'ending_pyrrhic',
            'Priya only -> ending_pyrrhic'
        );
        this.assertEqual(
            routeScene('ending_check', { sharedWithPriya: false, coalitionAligned: false }),
            'ending_status_quo',
            'Nothing held together -> ending_status_quo'
        );

        // DECOUPLE REGRESSION: the Elena trust choice must NOT change ending routing
        this.assertEqual(
            routeScene('ending_check', { trustedElena: false, sharedWithPriya: true, coalitionAligned: true, negotiated: true }),
            'ending_incremental',
            'ending routing ignores trustedElena (incremental reachable without Elena)'
        );
        this.assertEqual(
            routeScene('ending_check', { trustedElena: true, elenaBurned: true, sharedWithPriya: true, coalitionAligned: true, negotiated: true }),
            'ending_incremental',
            'ending routing ignores elenaBurned (incremental survives a burned Elena)'
        );

        // Invalid router returns null
        this.assertEqual(
            routeScene('nonexistent_router', {}),
            null,
            'Invalid router ID returns null'
        );
    },

    // Test 5: Conditional Dialogue Processing
    testConditionalDialogue() {
        console.log('\n--- Conditional Dialogue Tests ---');

        // Create a mock scene manager to test processConditionalDialogue
        const mockManager = {
            gameFlags: { spokeUp: false },
            processConditionalDialogue: SceneManager.prototype.processConditionalDialogue
        };

        // Test conditionalText replacement
        const sceneWithConditional = {
            dialogue: [
                { speaker: 'Sarah', text: 'Default text', conditionalText: { spokeUp: 'Spoke up text' } },
                { speaker: 'Narrator', text: 'Always shown' }
            ]
        };

        // Without spokeUp flag
        mockManager.gameFlags = { spokeUp: false };
        let processed = mockManager.processConditionalDialogue(sceneWithConditional);
        this.assertEqual(
            processed.dialogue[0].text,
            'Default text',
            'conditionalText: shows default when flag is false'
        );

        // With spokeUp flag
        mockManager.gameFlags = { spokeUp: true };
        processed = mockManager.processConditionalDialogue(sceneWithConditional);
        this.assertEqual(
            processed.dialogue[0].text,
            'Spoke up text',
            'conditionalText: shows alternate when flag is true'
        );

        // Test conditionalOnly filtering
        const sceneWithConditionalOnly = {
            dialogue: [
                { speaker: 'You', text: 'Always shown' },
                { speaker: 'You', text: 'Only if spoke up', conditionalOnly: 'spokeUp' },
                { speaker: 'Sarah', text: 'Only if did not speak up', conditionalOnly: '!spokeUp' }
            ]
        };

        // Without spokeUp flag
        mockManager.gameFlags = { spokeUp: false };
        processed = mockManager.processConditionalDialogue(sceneWithConditionalOnly);
        this.assertEqual(
            processed.dialogue.length,
            2,
            'conditionalOnly: filters to 2 lines when spokeUp=false'
        );
        this.assertEqual(
            processed.dialogue[1].text,
            'Only if did not speak up',
            'conditionalOnly: includes !spokeUp line when flag is false'
        );

        // With spokeUp flag
        mockManager.gameFlags = { spokeUp: true };
        processed = mockManager.processConditionalDialogue(sceneWithConditionalOnly);
        this.assertEqual(
            processed.dialogue.length,
            2,
            'conditionalOnly: filters to 2 lines when spokeUp=true'
        );
        this.assertEqual(
            processed.dialogue[1].text,
            'Only if spoke up',
            'conditionalOnly: includes spokeUp line when flag is true'
        );

        // Test textFn processing
        const sceneWithTextFn = {
            dialogue: [
                { speaker: 'Chairman', textFn: (flags) => flags.myFlag ? 'Yes' : 'No' },
                { speaker: 'Narrator', text: 'Static text', conditionalText: { myFlag: 'Alt text' } }
            ]
        };

        mockManager.gameFlags = { myFlag: true };
        processed = mockManager.processConditionalDialogue(sceneWithTextFn);
        this.assertEqual(
            processed.dialogue[0].text,
            'Yes',
            'textFn: computes text from flags'
        );
        this.assertEqual(
            processed.dialogue[1].text,
            'Alt text',
            'textFn: conditionalText still works on other lines'
        );

        mockManager.gameFlags = { myFlag: false };
        processed = mockManager.processConditionalDialogue(sceneWithTextFn);
        this.assertEqual(
            processed.dialogue[0].text,
            'No',
            'textFn: recomputes when flags change'
        );
    },

    // Test 6: Scene Structure Validation
    testSceneStructure() {
        console.log('\n--- Scene Structure Tests ---');

        const sceneIds = Object.keys(STORY.scenes);

        this.assert(sceneIds.length > 0, 'STORY.scenes has scenes defined');
        this.assert(sceneIds.includes('intro'), 'intro scene exists');
        this.assert(sceneIds.includes('the_filibuster'), 'the_filibuster scene exists');
        this.assert(sceneIds.includes('ending_status_quo'), 'ending_status_quo scene exists');
        this.assert(sceneIds.includes('ending_cassandra'), 'ending_cassandra scene exists');
        this.assert(sceneIds.includes('ending_pyrrhic'), 'ending_pyrrhic scene exists');
        this.assert(sceneIds.includes('ending_incremental'), 'ending_incremental scene exists');
        this.assert(sceneIds.includes('ending_walked_away'), 'ending_walked_away scene exists');
        this.assert(sceneIds.includes('ending_no_leverage'), 'ending_no_leverage scene exists');
        this.assert(sceneIds.includes('ending_miracle'), 'ending_miracle scene exists');
        this.assert(sceneIds.includes('ending_realignment'), 'ending_realignment scene exists');
        this.assert(sceneIds.includes('climax_realignment'), 'climax_realignment scene exists');
        this.assert(sceneIds.includes('climax_both_no_leverage'), 'climax_both_no_leverage scene exists');

        // Staffer betrayal scenes
        this.assert(sceneIds.includes('staffer_approach'), 'staffer_approach scene exists');
        this.assert(sceneIds.includes('staffer_trust'), 'staffer_trust scene exists');
        this.assert(sceneIds.includes('staffer_dismiss'), 'staffer_dismiss scene exists');
        this.assert(sceneIds.includes('elena_check_router'), 'elena_check_router scene exists');
        this.assert(sceneIds.includes('elena_burned'), 'elena_burned scene exists');

        // Verify scenes have required properties
        for (const [id, scene] of Object.entries(STORY.scenes)) {
            // Router scenes have different structure
            if (scene.isRouter) {
                this.assert(
                    scene.routerId,
                    `Router scene ${id} has routerId`
                );
                continue;
            }

            this.assert(
                scene.id === id,
                `Scene ${id} has matching id property`
            );
            this.assert(
                scene.location && typeof scene.location === 'string',
                `Scene ${id} has location`
            );
            this.assert(
                scene.background && typeof scene.background === 'string',
                `Scene ${id} has background`
            );
        }

        // Ending scenes have correct properties
        const endings = ['ending_status_quo', 'ending_cassandra', 'ending_pyrrhic', 'ending_incremental', 'ending_walked_away', 'ending_no_leverage', 'ending_miracle', 'ending_realignment'];
        for (const endingId of endings) {
            const ending = STORY.scenes[endingId];
            this.assert(ending.isEnding === true, `${endingId} has isEnding=true`);
            this.assert(ending.endingType, `${endingId} has endingType`);
        }

    },

    // Test 7: Character Differentiation and Payoff
    testCharacterPayoff() {
        console.log('\n--- Character Payoff Tests ---');

        // PRIYA: Should NOT mention Amendment 7 (that's Elena's intel)
        const priyaAlly = STORY.scenes.priya_ally;
        const amendment7Line = priyaAlly.dialogue.find(d => d.text && d.text.includes('Amendment 7'));
        this.assert(
            amendment7Line === undefined,
            'Priya does not mention Amendment 7 (differentiated from Elena)'
        );

        // PRIYA: Should mention her unique value - knowing WHO can be moved
        const elenaAimLine = priyaAlly.dialogue.find(d => d.text && d.text.includes('Elena can tell you where to aim'));
        this.assert(
            elenaAimLine !== undefined,
            'Priya explicitly differentiates her value from Elena'
        );

        // ELENA: Markup hearing open should show her intel paying off
        const markupOpen = STORY.scenes.markup_hearing_open;
        const elenaPayoff = markupOpen.dialogue.find(d =>
            d.text && d.text.includes('Elena\'s prediction') && d.conditionalOnly === 'trustedElena'
        );
        this.assert(
            elenaPayoff !== undefined,
            'Markup shows Elena\'s intel paying off (conditionally)'
        );

        // PRIYA: Markup hearing recess should show her votes paying off (Representative Chen)
        const recessChoice = STORY.scenes.markup_hearing_recess_choice;
        const priyaLine = recessChoice.dialogue.find(d => d.speaker === 'Priya' && d.conditionalOnly === 'sharedWithPriya');
        this.assert(
            priyaLine !== undefined,
            'Markup recess shows Priya\'s vote paying off (conditionally)'
        );

        // Vote count in markup_hearing_vote uses textFn
        const vote = STORY.scenes.markup_hearing_vote;
        const voteCountLine = vote.dialogue.find(d => d.textFn && d.speaker === 'Chairman');
        this.assert(voteCountLine !== undefined, 'Vote count line uses textFn');

        // NEWS: seizedMoment is set by news_fast (gates best ending)
        const newsFast = STORY.scenes.news_fast;
        this.assert(
            newsFast !== undefined && newsFast.setFlags && newsFast.setFlags.seizedMoment === true,
            'news_fast sets seizedMoment flag'
        );
        const newsSlow = STORY.scenes.news_slow;
        this.assert(
            newsSlow !== undefined && (!newsSlow.setFlags || !newsSlow.setFlags.seizedMoment),
            'news_slow does NOT set seizedMoment flag'
        );

        // NEWS: news_break offers the choice between fast and slow
        const newsBreak = STORY.scenes.news_break;
        this.assert(newsBreak !== undefined, 'news_break scene exists');
        const fastChoice = newsBreak.choices.find(c => c.nextDialogue === 'news_fast');
        const slowChoice = newsBreak.choices.find(c => c.nextDialogue === 'news_slow');
        this.assert(fastChoice !== undefined, 'news_break has choice leading to news_fast');
        this.assert(slowChoice !== undefined, 'news_break has choice leading to news_slow');

        // STAFFER: Choice to share Elena's intel only appears if you trusted Elena
        const stafferApproach = STORY.scenes.staffer_approach;
        const shareElenaChoice = stafferApproach.choices.find(c =>
            c.text && c.text.includes('Elena') && c.conditionalOnly === 'trustedElena'
        );
        this.assert(
            shareElenaChoice !== undefined,
            'Sharing Elena intel with staffer requires trustedElena'
        );

        // STAFFER: elena_burned scene sets the elenaBurned flag
        const elenaBurned = STORY.scenes.elena_burned;
        this.assert(
            elenaBurned !== undefined && elenaBurned.setFlags && elenaBurned.setFlags.elenaBurned === true,
            'elena_burned scene sets elenaBurned flag'
        );

        // STAFFER: Elena confronts you in elena_burned
        const elenaConfrontLine = elenaBurned.dialogue.find(d =>
            d.speaker === 'Elena' && d.text && d.text.includes('how careful')
        );
        this.assert(
            elenaConfrontLine !== undefined,
            'Elena confronts player about burning her source'
        );

        // Each climax path should be distinct
        this.assert(STORY.scenes.climax_neither !== undefined, 'climax_neither exists (no allies)');
        this.assert(STORY.scenes.climax_coalition_only !== undefined, 'climax_coalition_only exists (movement only)');
        this.assert(STORY.scenes.climax_elena_only === undefined, 'climax_elena_only removed (Elena decoupled from climax)');
        this.assert(STORY.scenes.climax_priya_only !== undefined, 'climax_priya_only exists (inside track only)');
        this.assert(STORY.scenes.climax_both !== undefined, 'climax_both exists (full negotiation)');
        this.assert(STORY.scenes.climax_both_no_leverage !== undefined, 'climax_both_no_leverage exists (no public pressure)');
        this.assert(STORY.scenes.climax_miracle !== undefined, 'climax_miracle exists (miracle path)');

        // Coalition-only path should reflect a movement that couldn't reach the votes
        const coalitionOnly = STORY.scenes.climax_coalition_only;
        const pressureLine = coalitionOnly.dialogue.find(d => d.text && d.text.includes('built the pressure'));
        this.assert(
            pressureLine !== undefined,
            'Coalition-only climax reflects a movement without an inside track'
        );

        // Priya-only path should reflect an inside vote with no movement behind it
        const priyaOnly = STORY.scenes.climax_priya_only;
        const noMovement = priyaOnly.dialogue.find(d => d.text && d.text.includes('delegation of two'));
        this.assert(
            noMovement !== undefined,
            'Priya-only climax shows an inside vote with no movement behind it'
        );
    },

    // Test 8: Inbox Triage Scene
    testInboxTriage() {
        console.log('\n--- Inbox Triage Tests ---');

        // All four inbox scenes exist
        const inboxScenes = ['inbox_triage', 'inbox_journalist', 'inbox_intern', 'inbox_listserv'];
        for (const sceneId of inboxScenes) {
            this.assert(
                STORY.scenes[sceneId] !== undefined,
                `${sceneId} scene exists`
            );
        }

        // inbox_triage has three choices
        const triage = STORY.scenes.inbox_triage;
        this.assertEqual(
            triage.choices.length,
            3,
            'inbox_triage has 3 choices'
        );

        // Each outcome scene sets exactly one flag
        const journalist = STORY.scenes.inbox_journalist;
        this.assert(
            journalist.setFlags.repliedJournalist === true,
            'inbox_journalist sets repliedJournalist'
        );
        this.assertEqual(
            Object.keys(journalist.setFlags).length,
            1,
            'inbox_journalist sets exactly one flag'
        );

        const intern = STORY.scenes.inbox_intern;
        this.assert(
            intern.setFlags.repliedIntern === true,
            'inbox_intern sets repliedIntern'
        );

        const listserv = STORY.scenes.inbox_listserv;
        this.assert(
            listserv.setFlags.repliedListserv === true,
            'inbox_listserv sets repliedListserv'
        );

        // All three outcome scenes lead to news_break
        this.assertEqual(
            journalist.nextScene,
            'news_break',
            'inbox_journalist leads to news_break'
        );
        this.assertEqual(
            intern.nextScene,
            'news_break',
            'inbox_intern leads to news_break'
        );
        this.assertEqual(
            listserv.nextScene,
            'news_break',
            'inbox_listserv leads to news_break'
        );

        // Coalition formed routes through status router to inbox_triage
        this.assertEqual(
            STORY.scenes.coalition_formed.nextScene,
            'coalition_status_router',
            'coalition_formed routes to coalition_status_router'
        );
        this.assertEqual(
            STORY.scenes.coalition_ready.nextScene,
            'inbox_triage',
            'coalition_ready routes to inbox_triage'
        );
        this.assertEqual(
            STORY.scenes.coalition_thin.nextScene,
            'inbox_triage',
            'coalition_thin routes to inbox_triage'
        );
    },

    // Test 9: spokeUp Flag Logic
    testSpokeUpFlag() {
        console.log('\n--- spokeUp Flag Tests ---');

        // spokeUp should be set by the stakeholder_meeting choice that leads to stakeholder_speak
        const stakeholderMeeting = STORY.scenes.stakeholder_meeting;
        const speakChoice = stakeholderMeeting.choices.find(c => c.nextDialogue === 'stakeholder_speak');
        this.assert(
            speakChoice && speakChoice.setFlags && speakChoice.setFlags.spokeUp === true,
            'stakeholder_speak choice sets spokeUp flag'
        );

        // Coalition scenes should NOT set spokeUp
        const coalitionFormed = STORY.scenes.coalition_formed;
        this.assert(
            !coalitionFormed.setFlags || !coalitionFormed.setFlags.spokeUp,
            'coalition_formed does NOT set spokeUp'
        );

        // stakeholder_silent should NOT set spokeUp
        const stakeholderSilent = STORY.scenes.stakeholder_silent;
        this.assert(
            !stakeholderSilent.setFlags || !stakeholderSilent.setFlags.spokeUp,
            'stakeholder_silent does NOT set spokeUp'
        );

        // spokeUp should be used in ending_status_quo conditional dialogue
        const statusQuo = STORY.scenes.ending_status_quo;
        const spokeUpLine = statusQuo.dialogue.find(d => d.conditionalOnly === 'spokeUp');
        this.assert(
            spokeUpLine !== undefined,
            'ending_status_quo has dialogue conditional on spokeUp'
        );
    },

    // Test 10: Flag Coverage (no dead flags)
    testFlagCoverage() {
        console.log('\n--- Flag Coverage Tests ---');

        // foundEvidence should be set in stakeholder_speak
        const stakeholderSpeak = STORY.scenes.stakeholder_speak;
        this.assert(
            stakeholderSpeak.setFlags && stakeholderSpeak.setFlags.foundEvidence === true,
            'foundEvidence is set in stakeholder_speak'
        );

        const elenaTrusted = STORY.scenes.elena_trusted;
        this.assert(
            !elenaTrusted.setFlags || !elenaTrusted.setFlags.foundEvidence,
            'foundEvidence is NOT set in elena_trusted (moved to stakeholder)'
        );

        // foundEvidence should be used in act2_morning conditional dialogue
        const act2Morning = STORY.scenes.act2_morning;
        const evidenceLine = act2Morning.dialogue.find(d => d.conditionalOnly === 'foundEvidence');
        this.assert(
            evidenceLine !== undefined,
            'foundEvidence is used in act2_morning conditional dialogue'
        );

        // knowsTheTruth should be set in priya_ally
        const priyaAlly = STORY.scenes.priya_ally;
        this.assert(
            priyaAlly.setFlags && priyaAlly.setFlags.knowsTheTruth === true,
            'knowsTheTruth is set in priya_ally'
        );

        // knowsTheTruth should be used in climax conditional dialogue
        const climax = STORY.scenes.climax;
        const truthLine = climax.dialogue.find(d => d.conditionalOnly === 'knowsTheTruth');
        this.assert(
            truthLine !== undefined,
            'knowsTheTruth is used in climax conditional dialogue'
        );

        // All flags exist in initialFlags
        const expectedFlags = [
            'alignedCivilRights', 'alignedDisability', 'alignedWatchdog',
            'toldAmaraTruth', 'choseRightsFrame', 'choseDataFrame',
            'preparedTestimony', 'calledCommitteeMembers', 'ralliedCoalition',
            'confrontedMindScale', 'focusedAmendment7', 'calledRecess',
            'passedIntelToAllies', 'miracleVictory',
            // Conservative cast + Boyd whip-count deduction puzzle
            'metMarcus', 'clueMarcusTie', 'clueBoydDonor', 'clueBoydHawk',
            'whipBoydMonopoly', 'whipBoydSecurity', 'whipBoydSkip',
            'boydFlipped', 'bipartisanWin'
        ];
        for (const flag of expectedFlags) {
            this.assert(
                flag in STORY.initialFlags,
                `${flag} exists in initialFlags`
            );
        }

    },

    // Test 11: Complete Ending Paths
    testEndingPaths() {
        console.log('\n--- Ending Path Tests ---');

        const testCases = [
            {
                name: 'Miracle (Amendment 7 defeated)',
                flags: { miracleVictory: true },
                expectedEnding: 'ending_miracle',
                expectedType: 'The Breakthrough'
            },
            {
                name: 'Status Quo (nothing held)',
                flags: { sharedWithPriya: false, coalitionAligned: false },
                expectedEnding: 'ending_status_quo',
                expectedType: 'The Status Quo'
            },
            {
                name: 'Cassandra (coalition only)',
                flags: { coalitionAligned: true, sharedWithPriya: false },
                expectedEnding: 'ending_cassandra',
                expectedType: 'The Cassandra'
            },
            {
                name: 'Pyrrhic (inside track only)',
                flags: { sharedWithPriya: true, coalitionAligned: false },
                expectedEnding: 'ending_pyrrhic',
                expectedType: 'The Pyrrhic Victory'
            },
            {
                name: 'Incremental (inside track + movement + negotiated)',
                flags: { sharedWithPriya: true, coalitionAligned: true, negotiated: true },
                expectedEnding: 'ending_incremental',
                expectedType: 'The Incremental Victory'
            },
            {
                name: 'Walked Away (inside track + movement + refused deal)',
                flags: { sharedWithPriya: true, coalitionAligned: true, walkedAway: true },
                expectedEnding: 'ending_walked_away',
                expectedType: 'The Principled Stand'
            },
            {
                name: 'The Almost (inside track + movement, no leverage)',
                flags: { sharedWithPriya: true, coalitionAligned: true },
                expectedEnding: 'ending_no_leverage',
                expectedType: 'The Almost'
            },
            {
                name: 'Decoupled: incremental survives a burned Elena',
                flags: { trustedElena: true, elenaBurned: true, sharedWithPriya: true, coalitionAligned: true, negotiated: true },
                expectedEnding: 'ending_incremental',
                expectedType: 'The Incremental Victory'
            },
            {
                name: 'Decoupled: distrusting Elena does not block the best non-vote ending',
                flags: { trustedElena: false, sharedWithPriya: true, coalitionAligned: true, negotiated: true },
                expectedEnding: 'ending_incremental',
                expectedType: 'The Incremental Victory'
            }
        ];

        for (const testCase of testCases) {
            const endingId = routeScene('ending_check', testCase.flags);
            const ending = STORY.scenes[endingId];

            this.assertEqual(
                endingId,
                testCase.expectedEnding,
                `${testCase.name}: routes to ${testCase.expectedEnding}`
            );
            this.assert(
                ending !== undefined,
                `${testCase.name}: ending scene exists`
            );
            this.assertEqual(
                ending.endingType,
                testCase.expectedType,
                `${testCase.name}: has correct ending type`
            );
        }

        // Verify endings reflect incremental victories
        const incremental = STORY.scenes.ending_incremental;
        const quarterlyReports = incremental.dialogue.find(d => d.text && d.text.includes('quarterly'));
        this.assert(
            quarterlyReports !== undefined,
            'Incremental ending shows small concrete win (quarterly reports)'
        );

        // Verify the "best" ending still feels small
        const notClose = incremental.dialogue.find(d => d.text && d.text.includes('not even close'));
        this.assert(
            notClose !== undefined,
            'Even best ending acknowledges victory is small'
        );
    },

    // Test 12: Coalition Group Call & Frame Strategy
    testCoalitionTexture() {
        console.log('\n--- Coalition & Framing Crisis Tests ---');

        // Coalition group call scenes exist
        const coalitionScenes = [
            'coalition_call_intro', 'coalition_group_pitch',
            'coalition_frame_rights', 'coalition_frame_data', 'coalition_frame_unified',
            'coalition_negotiate_kai', 'coalition_formed'
        ];
        for (const sceneId of coalitionScenes) {
            this.assert(
                STORY.scenes[sceneId] !== undefined,
                `${sceneId} scene exists`
            );
        }

        // Group pitch has 3 frame choices
        const pitch = STORY.scenes.coalition_group_pitch;
        this.assertEqual(pitch.choices.length, 3, 'Group pitch has 3 frame choices');

        // Civil rights choice sets choseRightsFrame and alignedCivilRights
        const rightsChoice = pitch.choices.find(c => c.setFlags && c.setFlags.choseRightsFrame);
        this.assert(rightsChoice !== undefined, 'Group pitch has civil rights choice');
        this.assert(rightsChoice.setFlags.alignedCivilRights === true, 'Rights choice aligns civil rights');
        this.assert(!rightsChoice.setFlags.alignedWatchdog, 'Rights choice does NOT align watchdog');

        // Data choice sets choseDataFrame and alignedWatchdog
        const dataChoice = pitch.choices.find(c => c.setFlags && c.setFlags.choseDataFrame);
        this.assert(dataChoice !== undefined, 'Group pitch has data choice');
        this.assert(dataChoice.setFlags.alignedWatchdog === true, 'Data choice aligns watchdog');
        this.assert(!dataChoice.setFlags.alignedCivilRights, 'Data choice does NOT align civil rights');

        // Unified choice is NOT gated on trustedElena anymore — it is a gambit available to all,
        // routed through a risk check, and sets no alignment flags on the choice itself.
        const unifiedChoice = pitch.choices.find(c => c.nextDialogue === 'coalition_unify_router');
        this.assert(unifiedChoice !== undefined, 'Group pitch has unified gambit routing through the unify risk check');
        this.assert(unifiedChoice.conditionalOnly === undefined, 'Unified gambit is NOT gated on trustedElena (or any flag)');
        this.assert(!unifiedChoice.setFlags, 'Unified gambit sets no flags on the choice (outcome depends on the risk check)');

        // The unify risk check: receipts (foundEvidence) make it land; otherwise it fractures
        this.assert(STORY.scenes.coalition_unify_router !== undefined, 'coalition_unify_router exists');
        this.assertEqual(STORY.scenes.coalition_unify_router.routerId, 'coalition_unify_check', 'unify router has correct routerId');
        this.assertEqual(
            routeScene('coalition_unify_check', { foundEvidence: true }),
            'coalition_frame_unified',
            'Unify gambit with evidence -> coalition_frame_unified (it lands)'
        );
        this.assertEqual(
            routeScene('coalition_unify_check', { foundEvidence: false }),
            'coalition_frame_fractured',
            'Unify gambit without evidence -> coalition_frame_fractured (it backfires)'
        );

        // The unified SCENE (the success) is where the alignment flags get set
        const unifiedScene = STORY.scenes.coalition_frame_unified;
        this.assert(unifiedScene.setFlags.toldAmaraTruth === true, 'coalition_frame_unified sets toldAmaraTruth');
        this.assert(unifiedScene.setFlags.alignedCivilRights === true, 'coalition_frame_unified aligns civil rights');
        this.assert(unifiedScene.setFlags.alignedWatchdog === true, 'coalition_frame_unified aligns watchdog');

        // The fracture (failure) aligns NEITHER partner — worse than committing to one frame
        const fracturedScene = STORY.scenes.coalition_frame_fractured;
        this.assert(fracturedScene !== undefined, 'coalition_frame_fractured exists');
        this.assert(!fracturedScene.setFlags || !fracturedScene.setFlags.alignedCivilRights, 'Fractured frame does NOT align civil rights');
        this.assert(!fracturedScene.setFlags || !fracturedScene.setFlags.alignedWatchdog, 'Fractured frame does NOT align watchdog');

        // Frame reaction scenes route to Kai negotiation
        this.assertEqual(STORY.scenes.coalition_frame_rights.nextScene, 'coalition_negotiate_kai', 'Rights frame routes to Kai');
        this.assertEqual(STORY.scenes.coalition_frame_data.nextScene, 'coalition_negotiate_kai', 'Data frame routes to Kai');
        this.assertEqual(STORY.scenes.coalition_frame_unified.nextScene, 'coalition_negotiate_kai', 'Unified frame routes to Kai');
        this.assertEqual(STORY.scenes.coalition_frame_fractured.nextScene, 'coalition_negotiate_kai', 'Fractured frame routes to Kai');

        // Kai has one choice that aligns and one that doesn't
        const kai = STORY.scenes.coalition_negotiate_kai;
        const kaiAlign = kai.choices.find(c => c.setFlags && c.setFlags.alignedDisability);
        const kaiDismiss = kai.choices.find(c => !c.setFlags || !c.setFlags.alignedDisability);
        this.assert(kaiAlign !== undefined, 'Kai has a choice that aligns disability');
        this.assert(kaiDismiss !== undefined, 'Kai has a choice that does NOT align disability');

        // coalition_ready (2+ partners) sets coalitionAligned
        this.assert(
            STORY.scenes.coalition_ready.setFlags.coalitionAligned === true,
            'coalition_ready sets coalitionAligned'
        );

        // coalition_thin (0-1 partners) does NOT set coalitionAligned
        this.assert(
            !STORY.scenes.coalition_thin.setFlags,
            'coalition_thin does NOT set coalitionAligned'
        );

        // coalition_formed routes to coalition_status_router
        this.assertEqual(
            STORY.scenes.coalition_formed.nextScene,
            'coalition_status_router',
            'coalition_formed routes to coalition_status_router'
        );

        // Rebuttal consistency: act2_confront has 3 choices (rights, data, unified)
        const confront = STORY.scenes.act2_confront;
        this.assertEqual(confront.choices.length, 3, 'act2_confront has 3 rebuttal choices');
        const unifiedRebuttal = confront.choices.find(c => c.conditionalOnly === 'toldAmaraTruth');
        this.assert(unifiedRebuttal !== undefined, 'Unified rebuttal requires toldAmaraTruth');

        // Rebuttal outcomes
        this.assert(STORY.scenes.act2_rebuttal_on_message !== undefined, 'act2_rebuttal_on_message exists');
        this.assert(STORY.scenes.act2_rebuttal_lost_diane !== undefined, 'act2_rebuttal_lost_diane exists');
        this.assert(STORY.scenes.act2_rebuttal_lost_amara !== undefined, 'act2_rebuttal_lost_amara exists');

        // Lost partner scenes set flags
        this.assert(STORY.scenes.act2_rebuttal_lost_diane.setFlags.alignedWatchdog === false, 'Lost Diane unsets alignedWatchdog');
        this.assert(STORY.scenes.act2_rebuttal_lost_amara.setFlags.alignedCivilRights === false, 'Lost Amara unsets alignedCivilRights');

        // All rebuttal paths lead to act2_final_prep
        this.assertEqual(STORY.scenes.act2_rebuttal_on_message.nextScene, 'act2_final_prep', 'On message -> act2_final_prep');
        this.assertEqual(STORY.scenes.act2_rebuttal_lost_diane.nextScene, 'act2_final_prep', 'Lost Diane -> act2_final_prep');
        this.assertEqual(STORY.scenes.act2_rebuttal_lost_amara.nextScene, 'act2_final_prep', 'Lost Amara -> act2_final_prep');

        // act2_ignore routes to act2_final_prep (no consistency check)
        this.assertEqual(STORY.scenes.act2_ignore.nextScene, 'act2_final_prep', 'act2_ignore routes to act2_final_prep');

        // Staffer scenes route to marcus_intro (conservative cast), which leads to the coalition call
        this.assertEqual(
            STORY.scenes.staffer_trust.nextScene,
            'marcus_intro',
            'staffer_trust routes to marcus_intro'
        );
        // marcus_intro now ends in a choice fork; every branch leads to the coalition call
        this.assert(
            STORY.scenes.marcus_intro.choices.length >= 2,
            'marcus_intro ends in a choice (move on vs. get suspicious)'
        );
        this.assert(
            STORY.scenes.marcus_intro.choices.every(c => c.nextScene === 'coalition_call_intro'),
            'every marcus_intro choice routes to coalition_call_intro'
        );
        this.assertEqual(
            STORY.scenes.staffer_dismiss.nextScene,
            'marcus_intro',
            'staffer_dismiss routes to marcus_intro'
        );
    },

    // Test 13: Time Pressure Fork (Feature 2)
    testTimePressureFork() {
        console.log('\n--- Time Pressure Fork Tests ---');

        // time_pressure_choice exists with 2 choices
        const tpc = STORY.scenes.time_pressure_choice;
        this.assert(tpc !== undefined, 'time_pressure_choice scene exists');
        this.assertEqual(tpc.choices.length, 2, 'time_pressure_choice has 2 choices');

        // Priya path leads to think_tank
        const priyaChoice = tpc.choices.find(c => c.nextDialogue === 'think_tank');
        this.assert(priyaChoice !== undefined, 'Time pressure has Priya path');

        // Testimony path leads to testimony_prep and sets flag
        const testimonyChoice = tpc.choices.find(c => c.nextDialogue === 'testimony_prep');
        this.assert(testimonyChoice !== undefined, 'Time pressure has testimony path');
        this.assert(
            testimonyChoice.setFlags.preparedTestimony === true,
            'Testimony choice sets preparedTestimony flag'
        );

        // testimony_prep and aftermath_testimony exist
        this.assert(STORY.scenes.testimony_prep !== undefined, 'testimony_prep scene exists');
        this.assert(STORY.scenes.aftermath_testimony !== undefined, 'aftermath_testimony scene exists');
        this.assert(STORY.scenes.aftermath_priya !== undefined, 'aftermath_priya scene exists');

        // aftermath_testimony leads to act2_morning (news already happened)
        this.assertEqual(
            STORY.scenes.aftermath_testimony.nextScene,
            'act2_morning',
            'aftermath_testimony leads to act2_morning'
        );

        // aftermath_priya leads to act2_morning (news already happened)
        this.assertEqual(
            STORY.scenes.aftermath_priya.nextScene,
            'act2_morning',
            'aftermath_priya leads to act2_morning'
        );

        // priya_ally routes to aftermath_priya
        this.assertEqual(
            STORY.scenes.priya_ally.nextScene,
            'aftermath_priya',
            'priya_ally leads to aftermath_priya'
        );
    },

    // Test 14: Second Act (Feature 4)
    testSecondAct() {
        console.log('\n--- Second Act Tests ---');

        // All act2 scenes exist
        const act2Scenes = [
            'act2_morning', 'act2_strategy_choice', 'act2_phones',
            'act2_rally_coalition', 'act2_mindscale', 'act2_confront',
            'act2_ignore', 'act2_final_prep'
        ];
        for (const sceneId of act2Scenes) {
            this.assert(
                STORY.scenes[sceneId] !== undefined,
                `${sceneId} scene exists`
            );
        }

        // news_fast routes to time_pressure_choice
        this.assertEqual(
            STORY.scenes.news_fast.nextScene,
            'time_pressure_choice',
            'news_fast leads to time_pressure_choice'
        );

        // news_slow routes to time_pressure_choice
        this.assertEqual(
            STORY.scenes.news_slow.nextScene,
            'time_pressure_choice',
            'news_slow leads to time_pressure_choice'
        );

        // Strategy choice has 2 options
        const strategy = STORY.scenes.act2_strategy_choice;
        this.assertEqual(strategy.choices.length, 2, 'act2_strategy_choice has 2 choices');

        // Phones choice sets calledCommitteeMembers
        const phonesChoice = strategy.choices.find(c => c.nextDialogue === 'act2_phones');
        this.assert(
            phonesChoice.setFlags.calledCommitteeMembers === true,
            'Phones choice sets calledCommitteeMembers'
        );

        // Rally choice sets ralliedCoalition
        const rallyChoice = strategy.choices.find(c => c.nextDialogue === 'act2_rally_coalition');
        this.assert(
            rallyChoice.setFlags.ralliedCoalition === true,
            'Rally choice sets ralliedCoalition'
        );

        // MindScale confrontation sets flag
        const confrontChoice = STORY.scenes.act2_mindscale.choices.find(c => c.nextDialogue === 'act2_confront');
        this.assert(
            confrontChoice.setFlags.confrontedMindScale === true,
            'Confront choice sets confrontedMindScale'
        );

        // act2_final_prep leads to elena_check_router
        this.assertEqual(
            STORY.scenes.act2_final_prep.nextScene,
            'elena_check_router',
            'act2_final_prep leads to elena_check_router'
        );
    },

    // Test 15: Interactive Hearing (Feature 1)
    testInteractiveHearing() {
        console.log('\n--- Interactive Hearing Tests ---');

        // All hearing scenes exist
        const hearingScenes = [
            'markup_hearing_open', 'markup_hearing_comment_choice',
            'comment_focused', 'comment_spread',
            'markup_hearing_recess_choice', 'recess_lobby',
            'recess_notes', 'markup_hearing_vote',
            'miracle_check_router'
        ];
        for (const sceneId of hearingScenes) {
            this.assert(
                STORY.scenes[sceneId] !== undefined,
                `${sceneId} scene exists`
            );
        }

        // Comment choice sets focusedAmendment7
        const commentChoice = STORY.scenes.markup_hearing_comment_choice;
        this.assertEqual(commentChoice.choices.length, 2, 'Comment choice has 2 options');
        const focusChoice = commentChoice.choices.find(c => c.nextDialogue === 'comment_focused');
        this.assert(
            focusChoice.setFlags.focusedAmendment7 === true,
            'Focus choice sets focusedAmendment7'
        );

        // Recess choice has 2 options
        const recessChoice = STORY.scenes.markup_hearing_recess_choice;
        this.assertEqual(recessChoice.choices.length, 2, 'Recess choice has 2 options');

        // Lobby sets calledRecess
        const lobbyChoice = recessChoice.choices.find(c => c.nextDialogue === 'recess_lobby');
        this.assert(
            lobbyChoice.setFlags.calledRecess === true,
            'Lobby choice sets calledRecess'
        );

        // Notes sets passedIntelToAllies
        const notesChoice = recessChoice.choices.find(c => c.nextDialogue === 'recess_notes');
        this.assert(
            notesChoice.setFlags.passedIntelToAllies === true,
            'Notes choice sets passedIntelToAllies'
        );

        // markup_hearing_vote leads to miracle_check_router
        this.assertEqual(
            STORY.scenes.markup_hearing_vote.nextScene,
            'miracle_check_router',
            'markup_hearing_vote leads to miracle_check_router'
        );
    },

    // Test 16: Miracle Path
    testMiraclePath() {
        console.log('\n--- Miracle Path Tests ---');

        // climax_miracle exists, sets miracleVictory, and routes to ending_check
        const cm = STORY.scenes.climax_miracle;
        this.assert(cm !== undefined, 'climax_miracle scene exists');
        this.assert(cm.setFlags.miracleVictory === true, 'climax_miracle sets miracleVictory');
        this.assertEqual(cm.nextScene, 'ending_check', 'climax_miracle leads to ending_check');

        // Perfect play: 5 swings + Priya + all 3 partners → miracle (Elena NOT required)
        // Unified frame (neither choseRightsFrame nor choseDataFrame) enables both hearing swings
        const miracleFlags = {
            sharedWithPriya: true,
            alignedCivilRights: true, alignedDisability: true, alignedWatchdog: true,
            coalitionAligned: true,
            seizedMoment: true, focusedAmendment7: true,
            calledRecess: true, calledCommitteeMembers: true
        };
        this.assertEqual(
            routeScene('miracle_check', miracleFlags),
            'climax_miracle',
            'Perfect play (5 swings + Priya + 3/3 coalition) -> climax_miracle'
        );

        // DECOUPLE: the miracle no longer requires trusting Elena
        this.assertEqual(
            routeScene('miracle_check', { ...miracleFlags, trustedElena: false }),
            'climax_miracle',
            '5 swings + 3/3 + Priya WITHOUT Elena -> still climax_miracle (Elena decoupled)'
        );

        // DECOUPLE: a burned Elena does not block the miracle
        this.assertEqual(
            routeScene('miracle_check', { ...miracleFlags, trustedElena: true, elenaBurned: true }),
            'climax_miracle',
            '5 swings + 3/3 + Priya with a burned Elena -> still climax_miracle (decoupled)'
        );

        // 5 swings but NO Priya → no miracle
        this.assertEqual(
            routeScene('miracle_check', { ...miracleFlags, sharedWithPriya: false }),
            'climax',
            'Without Priya -> climax (not perfect play + fewer swings)'
        );

        // 5 swings but missing one coalition partner → still a defeat → the Breakthrough.
        // (The partner count no longer gates the Breakthrough; it only gates Common Ground,
        // which also requires Boyd. A defeat never falls through to the pass-written climax.)
        this.assertEqual(
            routeScene('miracle_check', { ...miracleFlags, alignedWatchdog: false }),
            'climax_miracle',
            '2/3 coalition (Diane left) but amendment defeated -> climax_miracle (Breakthrough)'
        );
        this.assertEqual(
            routeScene('miracle_check', { ...miracleFlags, alignedCivilRights: false }),
            'climax_miracle',
            '2/3 coalition (Amara left) but amendment defeated -> climax_miracle (Breakthrough)'
        );

        // Testimony path: 5 swings, no Priya → still a defeat → the Breakthrough (not Common Ground,
        // which needs Boyd, and Boyd needs Priya's donor clue). Testimony players get a real win ending.
        const testimonyMax = {
            seizedMoment: true, preparedTestimony: true, focusedAmendment7: true,
            calledRecess: true, calledCommitteeMembers: true
        };
        this.assert(!getAmendment7Result(testimonyMax).passed, 'Testimony path reaches 5 swings and defeats the amendment');
        this.assertEqual(
            routeScene('miracle_check', testimonyMax),
            'climax_miracle',
            'Testimony path defeat (no Priya) -> climax_miracle (Breakthrough), not the pass climax'
        );

        // Missing seizedMoment → only 2 swings, passes
        this.assertEqual(
            routeScene('miracle_check', { ...miracleFlags, seizedMoment: false }),
            'climax',
            'Without seizedMoment (2 swings) -> climax (amendment passes)'
        );

        // 3 swings (margin 3) → climax even with all ally flags
        const comfortableFlags = {
            trustedElena: true, sharedWithPriya: true,
            alignedCivilRights: true, alignedDisability: true, alignedWatchdog: true,
            seizedMoment: true, focusedAmendment7: true
        };
        this.assertEqual(
            routeScene('miracle_check', comfortableFlags),
            'climax',
            '3 swings (margin 3) -> climax (amendment passes)'
        );
    },

    // Test 17: Vote Count
    testVoteCount() {
        console.log('\n--- Vote Count Tests ---');

        // 25-member committee: base 17 yes, 8 no
        const defaultResult = getAmendment7Result({});
        this.assertEqual(defaultResult.yesVotes, 17, 'Default: 17 yes votes');
        this.assertEqual(defaultResult.noVotes, 8, 'Default: 8 no votes');
        this.assertEqual(defaultResult.margin, 9, 'Default: margin 9');
        this.assert(defaultResult.passed, 'Default: amendment passes');

        // seizedMoment only: 16-9
        const seizedResult = getAmendment7Result({ seizedMoment: true });
        this.assertEqual(seizedResult.yesVotes, 16, 'Seized moment: 16 yes votes');
        this.assertEqual(seizedResult.swings, 1, 'Seized moment: 1 swing');

        // sharedWithPriya only: 16-9
        const priyaResult = getAmendment7Result({ sharedWithPriya: true });
        this.assertEqual(priyaResult.yesVotes, 16, 'Priya: 16 yes votes');

        // Combination: calledRecess + seizedMoment with civil rights frame = 2 swings
        const lobbyRights = getAmendment7Result({ calledRecess: true, seizedMoment: true, choseRightsFrame: true });
        this.assertEqual(lobbyRights.swings, 2, 'Recess + seized + rights frame = 2 swings');

        // calledRecess + seizedMoment with data frame = 1 swing (recess doesn't work with data)
        const lobbyData = getAmendment7Result({ calledRecess: true, seizedMoment: true, choseDataFrame: true });
        this.assertEqual(lobbyData.swings, 1, 'Recess + seized + data frame = 1 swing (recess ineffective)');

        // calledRecess + seizedMoment with unified frame (neither flag) = 2 swings
        const lobbyUnified = getAmendment7Result({ calledRecess: true, seizedMoment: true });
        this.assertEqual(lobbyUnified.swings, 2, 'Recess + seized + unified frame = 2 swings');

        // Combination: passedIntelToAllies + coalitionAligned with data frame = 1 swing
        const notesData = getAmendment7Result({ passedIntelToAllies: true, coalitionAligned: true, choseDataFrame: true });
        this.assertEqual(notesData.swings, 1, 'Notes + coalition + data frame = 1 swing');

        // passedIntelToAllies + coalitionAligned with rights frame = 0 swings (intel doesn't work with rights)
        const notesRights = getAmendment7Result({ passedIntelToAllies: true, coalitionAligned: true, choseRightsFrame: true });
        this.assertEqual(notesRights.swings, 0, 'Notes + coalition + rights frame = 0 swings (intel ineffective)');

        // passedIntelToAllies + coalitionAligned with unified frame = 1 swing
        const notesUnified = getAmendment7Result({ passedIntelToAllies: true, coalitionAligned: true });
        this.assertEqual(notesUnified.swings, 1, 'Notes + coalition + unified frame = 1 swing');

        // preparedTestimony + focusedAmendment7 = 2 swings
        const testimonyResult = getAmendment7Result({ preparedTestimony: true, focusedAmendment7: true });
        this.assertEqual(testimonyResult.swings, 2, 'Testimony + focus = 2 swings');

        // 5 swings via civil rights path: seize + Priya + focus + recess(rights) + calls
        const fiveSwingsRights = getAmendment7Result({
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            calledRecess: true, calledCommitteeMembers: true,
            choseRightsFrame: true
        });
        this.assertEqual(fiveSwingsRights.swings, 5, '5 swings via civil rights path');
        this.assertEqual(fiveSwingsRights.margin, -1, '5 swings rights: margin -1');
        this.assert(!fiveSwingsRights.passed, '5 swings rights: amendment fails');

        // 5 swings via data path: seize + Priya + focus + intel(data+coalition) + calls
        const fiveSwingsData = getAmendment7Result({
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            passedIntelToAllies: true, coalitionAligned: true, calledCommitteeMembers: true,
            choseDataFrame: true
        });
        this.assertEqual(fiveSwingsData.swings, 5, '5 swings via data path');
        this.assertEqual(fiveSwingsData.margin, -1, '5 swings data: margin -1');

        // 5 swings via unified path: seize + Priya + focus + recess(unified) + calls
        const fiveSwingsUnified = getAmendment7Result({
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            calledRecess: true, calledCommitteeMembers: true
        });
        this.assertEqual(fiveSwingsUnified.swings, 5, '5 swings via unified path');

        // confrontedMindScale does NOT add a swing
        const withConfront = getAmendment7Result({
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            calledRecess: true, calledCommitteeMembers: true,
            confrontedMindScale: true, coalitionAligned: true
        });
        this.assertEqual(withConfront.swings, 5, 'confrontedMindScale does not add swing');
        this.assert(!withConfront.passed, '5 swings: amendment fails outright');
    },

    // Test 17: Boyd whip-count deduction puzzle (the hardest puzzle)
    testBoydPuzzle() {
        console.log('\n--- Boyd Deduction Puzzle Tests ---');

        // All Boyd-thread scenes exist
        const boydScenes = [
            'marcus_intro', 'whip_boyd_intro', 'whip_boyd_choice',
            'boyd_security_router', 'boyd_flipped', 'boyd_noncommittal',
            'boyd_backfire', 'boyd_skipped', 'climax_realignment', 'ending_realignment'
        ];
        for (const id of boydScenes) {
            this.assert(STORY.scenes[id] !== undefined, `${id} scene exists`);
        }

        // Recess scenes feed into the Boyd sequence (not straight to the vote)
        this.assertEqual(STORY.scenes.recess_lobby.nextScene, 'whip_boyd_intro', 'recess_lobby -> whip_boyd_intro');
        this.assertEqual(STORY.scenes.recess_notes.nextScene, 'whip_boyd_intro', 'recess_notes -> whip_boyd_intro');
        // Boyd sequence rejoins the vote
        this.assertEqual(STORY.scenes.boyd_flipped.nextScene, 'markup_hearing_vote', 'boyd_flipped -> markup_hearing_vote');
        this.assertEqual(STORY.scenes.boyd_skipped.nextScene, 'markup_hearing_vote', 'boyd_skipped -> markup_hearing_vote');

        // The three framing choices set the right flags and route correctly
        const choice = STORY.scenes.whip_boyd_choice;
        this.assertEqual(choice.choices.length, 3, 'Boyd whip has 3 framing options');
        const security = choice.choices.find(c => c.setFlags && c.setFlags.whipBoydSecurity);
        const monopoly = choice.choices.find(c => c.setFlags && c.setFlags.whipBoydMonopoly);
        const skip = choice.choices.find(c => c.setFlags && c.setFlags.whipBoydSkip);
        this.assertEqual(security.nextDialogue, 'boyd_security_router', 'Security frame -> boyd_security_router');
        this.assertEqual(monopoly.nextDialogue, 'boyd_backfire', 'Monopoly frame -> boyd_backfire (wrong)');
        this.assertEqual(skip.nextDialogue, 'boyd_skipped', 'Skip -> boyd_skipped (wrong)');

        // boyd_flipped is the only scene that sets boydFlipped
        this.assert(STORY.scenes.boyd_flipped.setFlags.boydFlipped === true, 'boyd_flipped sets boydFlipped');
        this.assert(!STORY.scenes.boyd_noncommittal.setFlags, 'boyd_noncommittal does not flip Boyd');

        // DEDUCTION GATE: the correct frame only flips Boyd if you assembled BOTH homework
        // sources — his donor (Priya) AND his hawk record (committee calls / champion). One alone
        // is a hunch he won't commit to.
        this.assertEqual(
            routeScene('boyd_security', { clueBoydHawk: true, clueBoydDonor: true }),
            'boyd_flipped',
            'Security frame + both clues -> boyd_flipped'
        );
        this.assertEqual(
            routeScene('boyd_security', { clueBoydHawk: true, clueBoydDonor: false }),
            'boyd_noncommittal',
            'Security frame + hawk only -> boyd_noncommittal (one source short)'
        );
        this.assertEqual(
            routeScene('boyd_security', { clueBoydHawk: false, clueBoydDonor: true }),
            'boyd_noncommittal',
            'Security frame + donor only -> boyd_noncommittal (one source short)'
        );
        this.assertEqual(
            routeScene('boyd_security', { clueBoydHawk: false, clueBoydDonor: false }),
            'boyd_noncommittal',
            'Security frame + no homework -> boyd_noncommittal'
        );

        // Clue seeding is SPLIT across distinct sources — no single source hands you the answer:
        //   donor  <- Priya's file (priya_ally), and ONLY donor
        //   hawk   <- committee calls (act2_phones) / the champion's whip count
        //   Marcus tie <- Elena (trusted), or earned via your own suspicion on the distrust path
        this.assert(STORY.scenes.elena_trusted.setFlags.clueMarcusTie === true, 'elena_trusted seeds clueMarcusTie (Elena hands it to you)');
        this.assert(STORY.scenes.priya_ally.setFlags.clueBoydDonor === true, 'priya_ally seeds clueBoydDonor');
        this.assert(!STORY.scenes.priya_ally.setFlags.clueBoydHawk, 'priya_ally does NOT seed clueBoydHawk (no longer a one-stop answer key)');
        this.assert(STORY.scenes.act2_phones.setFlags.clueBoydHawk === true, 'act2_phones (committee calls) seeds clueBoydHawk');
        this.assert(STORY.scenes.marcus_intro.setFlags.metMarcus === true, 'marcus_intro sets metMarcus');

        // DISTRUST THREAD: a wary player who never trusted Elena can still earn the Marcus tie
        // through an active skeptical choice at marcus_intro.
        const marcusSkeptic = STORY.scenes.marcus_intro.choices.find(c => c.setFlags && c.setFlags.clueMarcusTie === true);
        this.assert(marcusSkeptic !== undefined, 'marcus_intro offers a skeptical choice that earns clueMarcusTie');
        this.assert(marcusSkeptic.conditionalOnly === '!clueMarcusTie', 'The earn-it-yourself option only shows if you do not already have the clue');

        // BETRAYAL COST: burning Elena now costs you the Marcus read she gave you (no longer nukes endings)
        this.assert(STORY.scenes.elena_burned.setFlags.clueMarcusTie === false, 'elena_burned clears clueMarcusTie (the betrayal cost)');

        // VOTE MATH: boydFlipped adds a swing
        const boydSwing = getAmendment7Result({ boydFlipped: true });
        this.assertEqual(boydSwing.swings, 1, 'boydFlipped adds one swing');

        // Boyd as the deciding 5th vote: 4 swings (passes) -> +Boyd makes it fail
        const fourSwings = getAmendment7Result({
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            calledCommitteeMembers: true
        });
        this.assertEqual(fourSwings.swings, 4, 'Four swings without Boyd');
        this.assert(fourSwings.passed, 'Four swings: amendment passes (wrong deduction outcome)');
        const fourPlusBoyd = getAmendment7Result({
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            calledCommitteeMembers: true, boydFlipped: true
        });
        this.assertEqual(fourPlusBoyd.swings, 5, 'Four swings + Boyd = 5 swings');
        this.assert(!fourPlusBoyd.passed, 'Boyd as deciding vote: amendment fails');

        // Six swings (full miracle play + Boyd) -> decisive bipartisan margin
        const sixSwings = getAmendment7Result({
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            calledRecess: true, calledCommitteeMembers: true, boydFlipped: true
        });
        this.assertEqual(sixSwings.swings, 6, 'Six swings with Boyd');
        this.assertEqual(sixSwings.margin, -3, 'Six swings: margin -3 (11-14)');
        this.assert(!sixSwings.passed, 'Six swings: amendment fails decisively');

        // ROUTING: Common Ground = the full count (Priya + whole coalition) PLUS Boyd.
        const realignFlags = {
            boydFlipped: true,
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            calledRecess: true, calledCommitteeMembers: true,
            trustedElena: true, elenaBurned: false,
            alignedCivilRights: true, alignedDisability: true, alignedWatchdog: true
        };
        this.assertEqual(
            routeScene('miracle_check', realignFlags),
            'climax_realignment',
            'Full count + Boyd + amendment fails -> climax_realignment (Common Ground)'
        );

        // ANTI-SHORTCUT: Boyd cracked but coalition skipped -> the Breakthrough, NOT Common Ground.
        // 5 swings (seized+Priya+focus+committee calls+Boyd) fails the amendment, but with no
        // coalition partners aligned it is not the full count, so it must NOT reach climax_realignment.
        const boydNoCoalition = {
            boydFlipped: true,
            seizedMoment: true, sharedWithPriya: true, focusedAmendment7: true,
            calledCommitteeMembers: true
        };
        this.assert(!getAmendment7Result(boydNoCoalition).passed, 'Boyd-no-coalition build still defeats the amendment');
        this.assertEqual(
            routeScene('miracle_check', boydNoCoalition),
            'climax_miracle',
            'Boyd flipped but coalition skipped -> climax_miracle (Breakthrough, not Common Ground)'
        );

        // Boyd flipped but amendment still passes (too few other swings) -> ordinary climax
        this.assertEqual(
            routeScene('miracle_check', { boydFlipped: true, seizedMoment: true }),
            'climax',
            'Boyd flipped but amendment passes -> climax (no defeat, no win ending)'
        );

        // ANY defeat lands on a "you won" scene, never the pass-written climax (the old fallthrough bug)
        this.assertEqual(
            routeScene('miracle_check', boydNoCoalition),
            'climax_miracle',
            'A defeated amendment never falls through to the pass-written climax'
        );

        // climax_realignment sets bipartisanWin and routes to ending_check
        this.assert(STORY.scenes.climax_realignment.setFlags.bipartisanWin === true, 'climax_realignment sets bipartisanWin');
        this.assertEqual(STORY.scenes.climax_realignment.nextScene, 'ending_check', 'climax_realignment -> ending_check');

        // ENDING: bipartisanWin -> ending_realignment, and it outranks miracle
        this.assertEqual(
            routeScene('ending_check', { bipartisanWin: true }),
            'ending_realignment',
            'bipartisanWin -> ending_realignment'
        );
        this.assertEqual(
            routeScene('ending_check', { bipartisanWin: true, miracleVictory: true }),
            'ending_realignment',
            'Realignment outranks miracle in ending_check'
        );
        this.assertEqual(STORY.scenes.ending_realignment.endingType, 'Common Ground', 'ending_realignment has correct type');

        // Conservative cast renders with distinct speaker styles
        this.assertEqual(getSpeakerClass('Boyd'), 'speaker-boyd', 'Boyd has speaker-boyd class');
        this.assertEqual(getSpeakerClass('Marcus'), 'speaker-marcus', 'Marcus has speaker-marcus class');
        this.assertEqual(getSpeakerClass('Reese'), 'speaker-official', 'Reese rendered as committee official');
    },

    // Test 18: Internal Champion (Rep. Okafor) + Coffee Motif
    testChampionAndCoffee() {
        console.log('\n--- Champion & Coffee Tests ---');

        // New flags are declared in initial state
        this.assert('hadCoffee' in STORY.initialFlags, 'hadCoffee flag declared');
        this.assert('championOnboard' in STORY.initialFlags, 'championOnboard flag declared');
        this.assert('championWhipping' in STORY.initialFlags, 'championWhipping flag declared');

        // Champion scenes exist
        for (const id of ['champion_intro', 'champion_intro_whip', 'champion_intro_clean']) {
            this.assert(STORY.scenes[id] !== undefined, `${id} scene exists`);
        }

        // Okafor has a distinct speaker style
        this.assertEqual(getSpeakerClass('Okafor'), 'speaker-okafor', 'Okafor maps to speaker-okafor');

        // COFFEE: intro establishes the motif and sets hadCoffee, then routes to the champion
        this.assert(STORY.scenes.intro.setFlags && STORY.scenes.intro.setFlags.hadCoffee === true, 'intro sets hadCoffee');
        this.assertEqual(STORY.scenes.intro.nextScene, 'champion_intro', 'intro -> champion_intro');

        // The champion is met on the main path before the rest of Day 1
        this.assertEqual(STORY.scenes.champion_intro_whip.nextScene, 'the_filibuster', 'champion_intro_whip -> the_filibuster');
        this.assertEqual(STORY.scenes.champion_intro_clean.nextScene, 'the_filibuster', 'champion_intro_clean -> the_filibuster');

        // Both choices commit the champion; only the whip choice does the homework
        const ci = STORY.scenes.champion_intro;
        this.assertEqual(ci.choices.length, 2, 'champion_intro has 2 choices');
        const whip = ci.choices.find(c => c.nextDialogue === 'champion_intro_whip');
        const clean = ci.choices.find(c => c.nextDialogue === 'champion_intro_clean');
        this.assert(whip.setFlags.championOnboard === true, 'whip choice sets championOnboard');
        this.assert(clean.setFlags.championOnboard === true, 'clean choice also sets championOnboard');
        this.assert(whip.setFlags.championWhipping === true, 'whip choice sets championWhipping');
        this.assert(!clean.setFlags.championWhipping, 'clean choice does not set championWhipping');

        // The champion's whip count is a third legitimate source of the Boyd hawk clue
        this.assert(whip.setFlags.clueBoydHawk === true, 'whip choice seeds clueBoydHawk (homework via the champion)');
        this.assert(!clean.setFlags.clueBoydHawk, 'clean choice does not seed clueBoydHawk');

        // The champion's hawk clue still only flips Boyd when combined with the donor clue
        // (the second source) and the security frame — homework from two places, then the deduction.
        this.assertEqual(
            routeScene('boyd_security', { clueBoydHawk: true, clueBoydDonor: true }),
            'boyd_flipped',
            'Champion-sourced hawk clue + Priya donor clue + security frame -> boyd_flipped'
        );
        this.assertEqual(
            routeScene('boyd_security', { clueBoydHawk: true, clueBoydDonor: false }),
            'boyd_noncommittal',
            'Champion hawk clue alone (no donor) -> boyd_noncommittal'
        );

        // Okafor shows up where it matters: defending the bill at markup and at the vote
        const openSpeakers = STORY.scenes.markup_hearing_open.dialogue.map(d => d.speaker);
        this.assert(openSpeakers.includes('Okafor'), 'Okafor speaks at the markup hearing');
        const voteSpeakers = STORY.scenes.markup_hearing_vote.dialogue.map(d => d.speaker);
        this.assert(voteSpeakers.includes('Okafor'), 'Okafor is present at the Amendment 7 vote');

        // Champion + coffee pay off in the endings
        for (const id of ['ending_realignment', 'ending_miracle', 'ending_status_quo']) {
            const speakers = STORY.scenes[id].dialogue.map(d => d.speaker);
            this.assert(speakers.includes('Okafor'), `${id} pays off the champion`);
        }
    }
};

// Export for use in HTML test runner
if (typeof window !== 'undefined') {
    window.TestRunner = TestRunner;
}
