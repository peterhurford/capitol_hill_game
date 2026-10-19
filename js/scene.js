// Scene Management - Handles scene transitions, backgrounds, and game state

class SceneManager {
    constructor(dialogueEngine, overworld = null) {
        this.dialogue = dialogueEngine;
        this.overworld = overworld;
        this.currentLocation = null;  // a change of location (or staged room) sends the player into the overworld
        this.skipWalkOnce = false;    // set by a walk-to choice: the player already walked to where the next scene happens
        this.sceneBackground = document.getElementById('scene-background');
        this.locationIndicator = document.getElementById('location-indicator');

        this.currentScene = null;
        this.loadSeq = 0;  // bumped on every scene load so a load from a save cancels the old scene's pending timeouts
        this.currentDay = 1;
        this.gameFlags = {};
        this.transitionDuration = 500; // ms
        this.dayNames = ['Monday', 'Tuesday', 'Wednesday'];
    }

    // Initialize game state
    initGame() {
        // Copy initial flags
        this.gameFlags = { ...STORY.initialFlags };
        this.currentLocation = null;
    }

    // Load a scene by ID
    loadScene(sceneId) {
        const scene = STORY.scenes[sceneId];

        if (!scene) {
            console.error(`Scene not found: ${sceneId}`);
            return;
        }

        // Handle router scenes using the unified routing system
        if (scene.isRouter && scene.routerId) {
            const targetScene = routeScene(scene.routerId, this.gameFlags);
            if (targetScene) {
                this.loadScene(targetScene);
            }
            return;
        }

        this.currentScene = scene;
        this.currentSceneId = sceneId;
        const seq = ++this.loadSeq;

        // Track day progression
        if (scene.day) {
            this.currentDay = scene.day;
        }

        // Auto-save progress
        if (window.game) {
            window.game.saveGame(sceneId);
        }

        // Process conditional dialogue before transitioning
        const processedScene = this.processConditionalDialogue(scene);

        // Transition to new scene
        this.transitionToScene(processedScene, seq);
    }

    // Process conditional dialogue based on game flags
    processConditionalDialogue(scene) {
        if (!scene.dialogue) return scene;

        const processedDialogue = scene.dialogue
            .filter(line => {
                // Filter out lines that only appear under certain conditions
                if (line.conditionalOnly) {
                    const isNegated = line.conditionalOnly.startsWith('!');
                    const flagName = isNegated ? line.conditionalOnly.slice(1) : line.conditionalOnly;
                    const flagValue = this.gameFlags[flagName];
                    return isNegated ? !flagValue : flagValue;
                }
                return true;
            })
            .map(line => {
                // Apply computed text function (takes precedence over conditionalText)
                if (line.textFn) {
                    return { ...line, text: line.textFn(this.gameFlags) };
                }
                // Apply conditional text replacements
                if (line.conditionalText) {
                    for (const [flagName, altText] of Object.entries(line.conditionalText)) {
                        if (this.gameFlags[flagName]) {
                            return { ...line, text: altText };
                        }
                    }
                }
                return line;
            });

        return { ...scene, dialogue: processedDialogue };
    }

    // Handle scene transition with fade
    transitionToScene(scene, seq = this.loadSeq) {
        let walk = this.overworld &&
            (scene.location !== this.currentLocation || this.overworld.roomFor(scene) !== this.overworld.roomKey);
        if (walk && this.skipWalkOnce && this.overworld.roomFor(scene) === this.overworld.roomKey) {
            walk = false;
            this.currentLocation = scene.location;
            this.overworld.setTimeOfDay(scene.location);
        }
        this.skipWalkOnce = false;

        // Fade out
        this.sceneBackground.style.opacity = '0';
        if (walk) this.overworld.fadeOut();
        this.locationIndicator.classList.remove('visible');
        this.dialogue.hideDialogueBox();

        setTimeout(() => {
            if (seq !== this.loadSeq) return;
            // Update background
            this.sceneBackground.className = scene.background || '';

            // Update location with day tracker
            if (scene.location) {
                if (scene.isEnding) {
                    this.locationIndicator.textContent = scene.location;
                } else {
                    const dayName = this.dayNames[this.currentDay - 1] || 'Day ' + this.currentDay;
                    this.locationIndicator.textContent = dayName + ' — ' + scene.location;
                }
            }

            // Fade in
            this.sceneBackground.style.opacity = '1';

            const startDialogue = () => {
                if (scene.dialogue && scene.dialogue.length > 0) {
                    this.dialogue.startDialogue(scene.dialogue, () => {
                        this.onDialogueComplete(scene);
                    });
                }
            };

            // On entering a room, the scene's opening Narrator lines play first; then the player
            // walks to the target, and pressing E starts the rest. All-narration scenes skip the walk.
            const enterRoom = () => {
                const lines = scene.dialogue || [];
                let n = 0;
                while (n < lines.length && lines[n].speaker === 'Narrator') n++;
                const intro = lines.slice(0, n), rest = lines.slice(n);
                const finish = () => this.onDialogueComplete(scene);
                const walkThenTalk = () => {
                    if (!rest.length) return finish();
                    this.dialogue.hideDialogueBox();
                    this.overworld.beginWalk(() => this.dialogue.startDialogue(rest, finish));
                };
                if (intro.length) this.dialogue.startDialogue(intro, walkThenTalk);
                else walkThenTalk();
            };

            if (walk) {
                this.currentLocation = scene.location;
                this.overworld.enterScene(scene.id, scene);
            } else if (this.overworld) {
                this.overworld.syncCast(scene);
            }

            setTimeout(() => {
                if (seq !== this.loadSeq) return;
                this.locationIndicator.classList.add('visible');
                if (walk) enterRoom();
                else startDialogue();
            }, 300);
        }, this.transitionDuration);
    }

    // Called when dialogue for a scene is complete
    onDialogueComplete(scene) {
        // Apply any flags set by this scene
        if (scene.setFlags) {
            Object.assign(this.gameFlags, scene.setFlags);
        }

        // Check for choices (filter by conditionalOnly flags)
        const availableChoices = scene.choices ? scene.choices.filter(choice => {
            if (choice.conditionalOnly) {
                const isNegated = choice.conditionalOnly.startsWith('!');
                const flagName = isNegated ? choice.conditionalOnly.slice(1) : choice.conditionalOnly;
                const flagValue = this.gameFlags[flagName];
                return isNegated ? !flagValue : flagValue;
            }
            return true;
        }) : [];
        if (availableChoices.length > 0) {
            const pick = (choice) => {
                this.skipWalkOnce = true;
                this.handleChoice(choice);
            };
            const walkable = this.overworld && this.overworld.startChoice(scene.id, availableChoices, pick,
                (subset) => this.dialogue.showChoices(subset, pick));
            if (walkable) {
                this.dialogue.hideDialogueBox();
            } else {
                this.dialogue.showChoices(availableChoices, (choice) => {
                    this.handleChoice(choice);
                });
            }
        } else if (scene.nextScene) {
            // Auto-advance to next scene after a brief pause
            const seq = this.loadSeq;
            setTimeout(() => {
                if (seq === this.loadSeq) this.loadScene(scene.nextScene);
            }, 500);
        } else if (scene.isEnding) {
            // Show ending
            this.showEndingScreen(scene.endingType);
        }
    }

    // Handle player choice
    handleChoice(choice) {
        // Apply flags from choice
        if (choice.setFlags) {
            Object.assign(this.gameFlags, choice.setFlags);
        }

        // Load next dialogue or scene
        if (choice.nextDialogue) {
            this.loadScene(choice.nextDialogue);
        } else if (choice.nextScene) {
            this.loadScene(choice.nextScene);
        }
    }

    // Note: Routing logic has been moved to ROUTING_RULES in story.js
    // and is handled by the unified routeScene() function

    // Show ending screen
    showEndingScreen(endingType) {
        localStorage.removeItem('capitol_save');
        const seq = this.loadSeq;
        setTimeout(() => {
            if (seq !== this.loadSeq) return;
            this.dialogue.hideDialogueBox();
            this.locationIndicator.textContent = endingType;
            this.locationIndicator.classList.add('visible');

            // Add restart option
            setTimeout(() => {
                if (seq !== this.loadSeq) return;
                const restartBtn = document.createElement('button');
                restartBtn.className = 'choice-btn visible selected';
                restartBtn.textContent = 'Play Again';
                restartBtn.style.marginTop = '50px';
                restartBtn.addEventListener('click', () => {
                    window.game.showMainMenu();
                });

                const container = document.getElementById('choice-container');
                container.innerHTML = '';
                container.appendChild(restartBtn);
                container.classList.add('visible');
            }, 2000);
        }, 1000);
    }

    // Get current flags (for debugging)
    getFlags() {
        return { ...this.gameFlags };
    }

    // Set a flag manually
    setFlag(key, value) {
        this.gameFlags[key] = value;
    }
}
