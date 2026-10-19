// Main Game Controller - Entry point and game loop

class Game {
    constructor() {
        this.dialogue = new DialogueEngine();
        this.overworld = new Overworld();
        this.scene = new SceneManager(this.dialogue, this.overworld);

        this.mainMenu = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        this.startBtn = document.getElementById('start-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.loadBtn = document.getElementById('load-btn');
        this.saveMenu = document.getElementById('save-menu');
        this.saveSlots = document.getElementById('save-slots');
        this.menuToggle = document.getElementById('menu-toggle');
        this.quitBtn = document.getElementById('quit-btn');

        this.isPlaying = false;

        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();

        // Check for saved game
        this.checkSavedGame();
    }

    setupEventListeners() {
        // Start button
        this.startBtn.addEventListener('click', () => {
            this.startNewGame();
        });

        // Continue button (if saved game exists)
        this.continueBtn.addEventListener('click', () => {
            this.continueGame();
        });

        this.loadBtn.addEventListener('click', () => this.openSaveMenu());
        this.menuToggle.addEventListener('click', () => this.openSaveMenu());
        document.getElementById('save-close').addEventListener('click', () => this.closeSaveMenu());
        this.quitBtn.addEventListener('click', () => {
            this.closeSaveMenu();
            this.showMainMenu();
        });

        // Click to advance dialogue
        document.addEventListener('click', (e) => {
            if (this.isPlaying && !this.overworld.isWalking && !this.saveMenuOpen() &&
                !e.target.closest('#menu-toggle') &&
                !e.target.classList.contains('choice-btn') && !e.target.classList.contains('menu-btn')) {
                this.dialogue.advance();
            }
        });

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.overworld.keyUp(e.code));
    }

    // Keyboard: WASD/arrows walk and E/Space/Enter interact in the overworld; in dialogue the same
    // action keys or Right/Down advance; with choices up, W/S/A/D or arrows move the highlight, and
    // E/Space/Enter or 1-9 pick.
    handleKeyDown(e) {
        const code = e.code;
        if (this.saveMenuOpen()) {
            if (code === 'Escape') this.closeSaveMenu();
            return;
        }
        if (!this.isPlaying) return;
        if (code === 'Escape') {
            this.openSaveMenu();
            return;
        }
        const isAction = code === 'KeyE' || code === 'Space' || code === 'Enter';
        const isMove = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code);
        if (isAction || isMove) e.preventDefault();

        if (this.overworld.isWalking) {
            if (isMove) this.overworld.keyDown(code);
            else if (isAction && !e.repeat) this.overworld.interact();
            return;
        }

        if (this.dialogue.choiceButtons().length) {
            if (['KeyW', 'KeyA', 'ArrowUp', 'ArrowLeft'].includes(code)) this.dialogue.moveChoice(-1);
            else if (['KeyS', 'KeyD', 'ArrowDown', 'ArrowRight'].includes(code)) this.dialogue.moveChoice(1);
            else if (isAction && !e.repeat) this.dialogue.confirmChoice();
            else if (/^Digit[1-9]$/.test(code)) this.dialogue.confirmChoice(Number(code.slice(5)) - 1);
            return;
        }

        if (isAction || code === 'ArrowRight' || code === 'ArrowDown') this.dialogue.advance();
    }

    // Check localStorage for saved game
    checkSavedGame() {
        this.continueBtn.disabled = !localStorage.getItem('capitol_save');
        this.loadBtn.disabled = !this.readSlots().some(Boolean);
    }

    // Start a new game
    startNewGame() {
        localStorage.removeItem('capitol_save');
        this.scene.initGame();
        this.showGameScreen();
        this.scene.loadScene('intro');
    }

    // Continue from saved game
    continueGame() {
        const savedGame = localStorage.getItem('capitol_save');
        if (savedGame) {
            try {
                this.restoreGame(JSON.parse(savedGame));
            } catch (e) {
                console.error('Failed to load saved game:', e);
                this.startNewGame();
            }
        }
    }

    // Resume a save (autosave or slot) from the start of its scene, dropping whatever is on screen.
    restoreGame(data) {
        this.scene.loadSeq++;
        this.dialogue.reset();
        this.overworld.hide();
        this.scene.gameFlags = { ...STORY.initialFlags, ...(data.flags || {}) };
        this.scene.currentDay = data.currentDay || 1;
        this.scene.currentLocation = null;
        this.scene.skipWalkOnce = false;
        this.showGameScreen();
        this.scene.loadScene(data.currentScene || 'intro');
    }

    snapshot(sceneId) {
        const scene = STORY.scenes[sceneId];
        return {
            currentScene: sceneId,
            flags: this.scene.getFlags(),
            currentDay: this.scene.currentDay,
            location: scene ? scene.location : '',
            timestamp: Date.now()
        };
    }

    // Autosave, overwritten on every scene load
    saveGame(sceneId) {
        localStorage.setItem('capitol_save', JSON.stringify(this.snapshot(sceneId)));
    }

    // --- Manual save slots (localStorage key "capitol_slots", survive endings and new games) ---

    readSlots() {
        try {
            const slots = JSON.parse(localStorage.getItem('capitol_slots'));
            if (Array.isArray(slots)) return Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => slots[i] || null);
        } catch (e) { /* corrupt or missing: start empty */ }
        return Array(SAVE_SLOT_COUNT).fill(null);
    }

    writeSlot(i, data) {
        const slots = this.readSlots();
        slots[i] = data;
        localStorage.setItem('capitol_slots', JSON.stringify(slots));
    }

    saveMenuOpen() {
        return this.saveMenu.classList.contains('visible');
    }

    openSaveMenu() {
        this.overworld.paused = true;
        this.overworld.keys.clear();
        this.quitBtn.style.display = this.isPlaying ? '' : 'none';
        this.renderSlots();
        this.saveMenu.classList.add('visible');
    }

    closeSaveMenu() {
        this.saveMenu.classList.remove('visible');
        this.overworld.paused = false;
        this.checkSavedGame();
    }

    renderSlots(status = {}) {
        const canSave = this.isPlaying && this.scene.currentSceneId;
        this.saveSlots.innerHTML = '';
        this.readSlots().forEach((data, i) => {
            const row = document.createElement('div');
            row.className = 'save-slot';
            const info = document.createElement('div');
            info.className = 'save-info';
            const day = data ? (this.scene.dayNames[data.currentDay - 1] || 'Day ' + data.currentDay) : '';
            info.innerHTML = `<span class="save-name">Slot ${i + 1}</span>`;
            const detail = document.createElement('span');
            detail.className = 'save-detail';
            detail.textContent = status[i] || (data ? `${day} · ${data.location || data.currentScene} · ${formatSaveTime(data.timestamp)}` : 'Empty');
            info.appendChild(detail);
            row.appendChild(info);

            if (canSave) {
                row.appendChild(this.slotButton('Save', () => {
                    this.writeSlot(i, this.snapshot(this.scene.currentSceneId));
                    this.renderSlots({ [i]: 'Saved' });
                }));
            }
            const load = this.slotButton('Load', () => {
                this.closeSaveMenu();
                this.restoreGame(data);
            });
            load.disabled = !data;
            row.appendChild(load);
            this.saveSlots.appendChild(row);
        });
    }

    slotButton(label, onClick) {
        const btn = document.createElement('button');
        btn.className = 'save-action';
        btn.textContent = label;
        btn.addEventListener('click', onClick);
        return btn;
    }

    // Show main menu
    showMainMenu() {
        this.scene.loadSeq++;
        this.isPlaying = false;
        this.gameScreen.classList.remove('active');
        this.mainMenu.classList.add('active');
        this.dialogue.reset();
        this.overworld.hide();
        this.checkSavedGame();
    }

    // Show game screen
    showGameScreen() {
        this.isPlaying = true;
        this.mainMenu.classList.remove('active');
        this.gameScreen.classList.add('active');
    }
}

const SAVE_SLOT_COUNT = 3;

// "Oct 18, 9:07p"
function formatSaveTime(ts) {
    const d = new Date(ts);
    const h = d.getHours();
    const month = d.toLocaleString('en-US', { month: 'short' });
    return `${month} ${d.getDate()}, ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}${h < 12 ? 'a' : 'p'}`;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
