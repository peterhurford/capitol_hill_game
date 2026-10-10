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

        // Click to advance dialogue
        document.addEventListener('click', (e) => {
            if (this.isPlaying && !this.overworld.isWalking &&
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
        if (!this.isPlaying) return;
        const code = e.code;
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
        const savedGame = localStorage.getItem('capitol_save');
        if (savedGame) {
            this.continueBtn.disabled = false;
        }
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
                const data = JSON.parse(savedGame);
                this.scene.gameFlags = data.flags || {};
                this.scene.currentDay = data.currentDay || 1;
                this.scene.currentLocation = null;
                this.showGameScreen();
                this.scene.loadScene(data.currentScene || 'intro');
            } catch (e) {
                console.error('Failed to load saved game:', e);
                this.startNewGame();
            }
        }
    }

    // Save game state
    saveGame(sceneId) {
        const saveData = {
            currentScene: sceneId,
            flags: this.scene.getFlags(),
            currentDay: this.scene.currentDay,
            timestamp: Date.now()
        };
        localStorage.setItem('capitol_save', JSON.stringify(saveData));
    }

    // Show main menu
    showMainMenu() {
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
