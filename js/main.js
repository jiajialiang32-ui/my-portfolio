import { initAssets } from './assets.js';
import { initInput } from './input.js';
import { initUI } from './ui.js';
import { initAudio, playEffectSound, sounds } from './audio.js';
import { updatePlayer } from './player.js';
import { updateWorld, drawWorld } from './world.js';
import { playerConfig, interactiveObjectsConfig } from './config.js';
import { updateParticles, spawnParticle, drawParticles } from './particles.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Centralized game state
const gameState = {
    player: { ...playerConfig }, // Initial player state from config
    world: {
        angle: 0,
    },
    interactiveObjects: JSON.parse(JSON.stringify(interactiveObjectsConfig)), // Deep copy
    particles: [],
    nearObject: null,
};

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
}

function update(state) {
    updatePlayer(state.player, state.world);
    updateWorld(state);
    updateParticles(state.particles);

    // This logic was part of the old update function, let's move it here
    // to be managed by the main game loop.
    const promptEl = document.getElementById('interaction-prompt');
    const hasUserInteracted = true; // Assuming user has interacted
    const isMobile = window.innerWidth <= 768;

    if (hasUserInteracted && state.nearObject) {
        let promptText = '';
        let addBouncingClass = false;

        if (state.nearObject.id === 'orange-cat') {
            promptText = isMobile ? 'Tap to Interact' : 'Press [SPACE] to Interact';
            addBouncingClass = true;
        } else if (state.nearObject.id === 'wish') {
            const allCoinsCollected = state.interactiveObjects.filter(obj => obj.type === 'coin').every(obj => obj.collected);
            promptText = allCoinsCollected ? (isMobile ? 'Tap to Make a Wish' : 'Make a wish and press [Space] to toss your coins') : 'collect all the coins';
        } else {
            promptText = isMobile ? 'Tap to Open' : 'Press [SPACE] to Open';
        }
        
        promptEl.textContent = promptText;
        promptEl.style.display = 'block';
        promptEl.classList.toggle('bouncing-prompt', addBouncingClass);
    } else {
        promptEl.style.display = 'none';
        promptEl.classList.remove('bouncing-prompt');
    }
}

function draw(state) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWorld(ctx, canvas, state);
    drawParticles(ctx, state.particles);
}

function gameLoop() {
    update(gameState);
    draw(gameState);
    requestAnimationFrame(gameLoop);
}

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Pass gameState to modules that need to modify it directly (like input)
    initAssets(gameState);
    initInput(gameState); 
    initUI(gameState);
    initAudio();
    gameLoop();
}

init();