// Dialogue Engine - Handles text display, typewriter effect, and choices

class DialogueEngine {
    constructor() {
        this.dialogueBox = document.getElementById('dialogue-box');
        this.characterName = document.getElementById('character-name');
        this.dialogueText = document.getElementById('dialogue-text');
        this.continueIndicator = document.getElementById('continue-indicator');
        this.choiceContainer = document.getElementById('choice-container');
        this.characterPortrait = document.getElementById('character-portrait');

        this.currentDialogue = [];
        this.currentIndex = 0;
        this.isTyping = false;
        this.isAdvancing = false;
        this.typewriterSpeed = 30; // ms per character
        this.typewriterInterval = null;
        this.fullText = '';
        this.onComplete = null;
        this.onChoiceMade = null;
    }

    // Start displaying a dialogue sequence
    startDialogue(dialogueArray, onComplete) {
        this.currentDialogue = dialogueArray;
        this.currentIndex = 0;
        this.onComplete = onComplete;
        this.active = true;

        this.showDialogueBox();
        this.showCurrentLine();
    }

    // Show the dialogue box with fade-in
    showDialogueBox() {
        this.dialogueBox.classList.add('visible');
    }

    // Hide the dialogue box
    hideDialogueBox() {
        this.dialogueBox.classList.remove('visible');
        this.hidePortrait();
    }

    // Display the current line of dialogue
    showCurrentLine() {
        if (this.currentIndex >= this.currentDialogue.length) {
            // Dialogue complete
            this.hideContinueIndicator();
            this.active = false;
            if (this.onComplete) {
                this.onComplete();
            }
            return;
        }

        const line = this.currentDialogue[this.currentIndex];

        // Set character name
        this.characterName.textContent = line.speaker || '';

        // Add speaker-type class for styling
        this.dialogueBox.classList.remove(
            'speaker-narrator', 'speaker-you', 'speaker-character',
            'speaker-elena', 'speaker-priya', 'speaker-sarah',
            'speaker-phone', 'speaker-official', 'speaker-minor',
            'is-action'
        );

        // Check if this is an action/description rather than dialogue
        if (line.isAction) {
            this.dialogueBox.classList.add('is-action');
        }

        // Use centralized speaker style configuration
        const speaker = line.speaker || '';
        const speakerClass = getSpeakerClass(speaker);
        this.dialogueBox.classList.add(speakerClass);

        // Handle portrait
        if (line.portrait) {
            this.showPortrait(line.portrait);
        } else {
            this.hidePortrait();
        }

        // Start typewriter effect
        this.typewriterEffect(line.text);
    }

    // Typewriter text effect
    typewriterEffect(text) {
        // Clear any existing interval first
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }

        this.isTyping = true;
        this.fullText = text;
        this.dialogueText.textContent = '';
        this.hideContinueIndicator();

        let charIndex = 0;

        this.typewriterInterval = setInterval(() => {
            if (charIndex < text.length) {
                this.dialogueText.textContent += text.charAt(charIndex);
                charIndex++;
            } else {
                this.completeTyping();
            }
        }, this.typewriterSpeed);
    }

    // Complete the typewriter effect immediately
    skipTypewriter() {
        if (this.isTyping) {
            clearInterval(this.typewriterInterval);
            this.dialogueText.textContent = this.fullText;
            this.completeTyping();
        }
    }

    // Called when typing is complete
    completeTyping() {
        clearInterval(this.typewriterInterval);
        this.isTyping = false;
        this.showContinueIndicator();
    }

    // Advance to next line
    advance() {
        // Ignore input between scenes and after the last line, so it can't re-fire onComplete
        if (!this.active || this.isAdvancing) {
            return;
        }

        if (this.isTyping) {
            this.skipTypewriter();
            return;
        }

        this.isAdvancing = true;
        this.currentIndex++;
        this.showCurrentLine();

        // Release lock after a short delay
        setTimeout(() => {
            this.isAdvancing = false;
        }, 50);
    }

    // Show continue indicator
    showContinueIndicator() {
        this.continueIndicator.classList.add('visible');
    }

    // Hide continue indicator
    hideContinueIndicator() {
        this.continueIndicator.classList.remove('visible');
    }

    // Show character portrait
    showPortrait(portraitClass) {
        this.characterPortrait.className = portraitClass;
        this.characterPortrait.classList.add('visible');
    }

    // Hide character portrait
    hidePortrait() {
        this.characterPortrait.classList.remove('visible');
    }

    // Display choice options
    showChoices(choices, onChoiceMade) {
        this.onChoiceMade = onChoiceMade;
        this.hideContinueIndicator();
        this.hideDialogueBox();

        this.choiceContainer.innerHTML = '';

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.addEventListener('click', () => this.selectChoice(index, choice));
            button.addEventListener('mouseenter', () => this.highlightChoice(index));
            this.choiceContainer.appendChild(button);

            // Staggered animation
            setTimeout(() => {
                button.classList.add('visible');
            }, index * 100);
        });

        this.choiceContainer.classList.add('visible');
        this.choicesShownAt = Date.now();
        this.highlightChoice(0);
    }

    // Keyboard choice navigation; works on any buttons in the container (incl. "Play Again")
    choiceButtons() {
        if (!this.choiceContainer.classList.contains('visible')) return [];
        return [...this.choiceContainer.querySelectorAll('.choice-btn')];
    }

    highlightChoice(index) {
        this.choiceButtons().forEach((b, i) => b.classList.toggle('selected', i === index));
    }

    moveChoice(delta) {
        const buttons = this.choiceButtons();
        if (!buttons.length) return;
        const current = buttons.findIndex(b => b.classList.contains('selected'));
        const next = current < 0 ? 0 : (current + delta + buttons.length) % buttons.length;
        this.highlightChoice(next);
    }

    // A short guard stops a held or mashed advance key from picking the first choice blind.
    confirmChoice(index = null) {
        if (Date.now() - (this.choicesShownAt || 0) < 500) return;
        const buttons = this.choiceButtons();
        const button = index !== null ? buttons[index] : buttons.find(b => b.classList.contains('selected'));
        if (button) button.click();
    }

    // Handle choice selection
    selectChoice(index, choice) {
        // Remove visible class for fade out
        this.choiceContainer.classList.remove('visible');

        // Clear choices after animation
        setTimeout(() => {
            this.choiceContainer.innerHTML = '';
        }, 500);

        // Callback with selected choice
        if (this.onChoiceMade) {
            this.onChoiceMade(choice);
        }
    }

    // Hide choices
    hideChoices() {
        this.choiceContainer.classList.remove('visible');
        this.choiceContainer.innerHTML = '';
    }

    // Reset dialogue state
    reset() {
        this.currentDialogue = [];
        this.currentIndex = 0;
        this.isTyping = false;
        this.active = false;
        clearInterval(this.typewriterInterval);
        this.dialogueText.textContent = '';
        this.characterName.textContent = '';
        this.hideDialogueBox();
        this.hideChoices();
        this.hidePortrait();
    }
}
