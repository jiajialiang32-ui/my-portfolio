const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 动态对齐父容器大小，解决画布高度塌陷变为0的关键魔法
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // 每次缩放重新强制关闭抗锯齿
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // 初始化执行

// ==========================================
// 1. 预加载你在 Figma 中抠出来的像素图片
// ==========================================
const imgBg = [];
for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `assets/Free pack/free-sky-with-clouds-background-pixel-art-set/Clouds/Clouds 3/${i}.png`;
    imgBg.push(img);
}
const imgIsland = new Image();   imgIsland.src = 'assets/Free pack/winter full/winter_global.png';

let snowPattern = null;
const imgSnowSheet = new Image();
imgSnowSheet.src = 'assets/Free pack/Snow Platform Sprites_nnekart/SnowPlat Sheet.png';
imgSnowSheet.onload = () => {
    // 创建一个离屏 canvas 来提取第一行右侧的第一个菱形花纹
    // 根据常见的 sprite sheet，这里暂时假设每个 tile 是 32x32，菱形花纹可能在第 6 列左右
    // 你可以通过修改下面的 sourceX, sourceY, sourceW, sourceH 来精确调整截取位置
    const tileW = 32;
    const tileH = 32;
    // 假设整张图 320x320，右侧大概在索引 5 到 9 之间，我们先设为列坐标 5 (160px)
    const sourceX = 160; 
    const sourceY = 0;
    
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileW;
    tileCanvas.height = tileH;
    const tCtx = tileCanvas.getContext('2d');
    tCtx.drawImage(imgSnowSheet, sourceX, sourceY, tileW, tileH, 0, 0, tileW, tileH);
    snowPattern = document.getElementById('gameCanvas').getContext('2d').createPattern(tileCanvas, 'repeat');
};

const imgHeroIdle = new Image(); imgHeroIdle.src = 'assets/Free pack/cat 1.9.png';
const imgHeroWalk = new Image(); imgHeroWalk.src = 'assets/Free pack/cat 1.9.png';
const imgAbout = new Image();    imgAbout.src = 'assets/Free pack/winter full/gifs/holiday_pyramid.gif';
const imgSkills = new Image();   imgSkills.src = 'assets/Free pack/winter full/gifs/stand_gingerbreadheart.gif';
const imgProj = new Image();     imgProj.src = 'assets/Free pack/winter full/gifs/stand_flowers.gif';
const imgContact = new Image();  imgContact.src = 'assets/Free pack/winter full/gifs/stand_cottoncandy.gif';
const imgLightTree = new Image(); imgLightTree.src = 'assets/Free pack/winter full/gifs/light_tree.gif';
const imgLightReindeer = new Image(); imgLightReindeer.src = 'assets/Free pack/winter full/gifs/light_reindeer.gif';
const imgSideTreeLeft = new Image(); imgSideTreeLeft.src = 'assets/Free pack/image.png';
const imgSideTreeRight = new Image(); imgSideTreeRight.src = 'assets/Free pack/image copy.png';
const imgSideTreeFarRight = new Image(); imgSideTreeFarRight.src = 'assets/Free pack/image copy 2.png';
const imgProjTreeLeft = new Image(); imgProjTreeLeft.src = 'assets/Free pack/image copy 3.png';
const imgProjTreeRight = new Image(); imgProjTreeRight.src = 'assets/Free pack/image copy 6.png';
const imgContactTreeLeft = new Image(); imgContactTreeLeft.src = 'assets/Free pack/image copy 5.png';
const imgContactTreeRight = new Image(); imgContactTreeRight.src = 'assets/Free pack/image copy 4.png';

const imgSnowFill = new Image();
imgSnowFill.src = 'assets/Free pack/Snowing/SnowSlow2/snow5.bmp';

const imgStreetlight = new Image();
imgStreetlight.src = 'assets/Free pack/winter full/gifs/streetlight_empty.gif';

const imgSnowAnim = [];
for (let i = 0; i < 50; i++) {
    const img = new Image();
    img.src = `assets/Free pack/Snowing/SnowSlow2/SnowSlowV2_${i}.png`;
    imgSnowAnim.push(img);
}

// 在最上方加载新素材（注意：Free pack 里的 F 是大写，中间有空格，必须严格一致）
const imgWish = new Image();
imgWish.src = 'assets/Free pack/xuyuanchi.png';

const imgFruit = new Image(); 
imgFruit.src = 'assets/Free pack/image copy 4.png';

const imgCoin = new Image();
imgCoin.src = 'assets/Free pack/coin4_16x16.png';

const imgOrangeCat = new Image();
imgOrangeCat.src = 'assets/Free pack/Free pack 2/cat 1.6.png';

// ==========================================
// NEW: Web Audio API Setup
// ==========================================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};
let isAudioInitialized = false;

// Function to unlock the audio context on the first user gesture
function initAudio() {
    if (isAudioInitialized) return;

    const resumeContextAndPlayMusic = () => {
        isAudioInitialized = true;
        playBgMusic();
    };

    if (audioContext.state === 'suspended') {
        audioContext.resume().then(resumeContextAndPlayMusic).catch(e => console.error("AudioContext resume failed", e));
    } else {
        resumeContextAndPlayMusic();
    }
}

const audioFiles = {
    coin: 'assets/Free pack/Confirm 1.wav',
    meow: 'assets/Free pack/Cat_Meow.wav',
    bubble: 'assets/Free pack/Bubble 1.wav',
    confirm: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_FEEDBACK_Woom.wav',
    wishOpen: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_InGameMenu_Open.wav',
    orangeCat: 'assets/Free pack/stu9-cute-cat-352656.mp3',
    bgMusic: 'assets/Free pack/Cute Bossa Nova.wav',
    projectSelect: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_FEEDBACK_Woop.wav',
    tabSwitch: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_MENU_Hover.wav',
    letterOpen: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_InGameMenu_Load.wav'
};

function loadAudio(url) {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function playEffectSound(key) {
    if (!isAudioInitialized || !isEffectEnabled || !audioBuffers[key]) return;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[key];
    source.connect(audioContext.destination);
    source.start(0);
}

// ==========================================
// Background Music Logic
// ==========================================
let bgMusicSource = null;
let isMusicEnabled = true;

function playBgMusic() {
    if (!isAudioInitialized || !isMusicEnabled || bgMusicSource || !audioBuffers.bgMusic) return;
    bgMusicSource = audioContext.createBufferSource();
    bgMusicSource.buffer = audioBuffers.bgMusic;
    bgMusicSource.loop = true;
    bgMusicSource.connect(audioContext.destination);
    bgMusicSource.start(0);
}

// ==========================================
// 2. 全局状态与玩家配置
// ==========================================
const player = {
    width: 128,
    height: 128,
    speed: 10,
    isMoving: false,
    facingRight: true,
    squashX: 1,
    squashY: 1,
    frameX: 0,
    lastFrameTime: 0,
    frameInterval: 80 // ms per frame
};

let worldAngle = 0;
const GLOBE_RADIUS = 840;
const GLOBE_CENTER_OFFSET = 600;

let totalAngleTraveled = 0;
let letterShown = false; // Renamed from fullCircleCompleted for clarity
const FULL_CIRCLE = Math.PI * 2;

// ==========================================
// 3. 四大交互点地标建筑配置
// ==========================================
const interactiveObjects = [
    { id: 'wish', name: '许愿池', angle: -0.35, w: 530, h: 280, img: imgWish, emoji: '✨', color: '#ffb347' ,y_offset: 35, hasWished: false},
    { id: 'about', name: '农场邮箱', angle: 0, w: 350, h: 450, img: imgAbout, emoji: '📬', color: '#b97235' },
    { id: null, name: '圣诞树', angle: 0.35, w: 200, h: 250, img: imgLightTree, emoji: '🎄', color: '#3a5f25' },
    { id: null, name: '驯鹿', angle: 0.5, w: 100, h: 170, img: imgLightReindeer, emoji: '🦌', color: '#b97235' },
    { id: null, name: 'Coin 1L', angle: 0.7, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 1', angle: 0.9, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 1R', angle: 1.0 + 0.08, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: '左侧树', angle: Math.PI / 2 - 0.25, w: 80, h: 80, img: imgSideTreeLeft, emoji: '🌲', color: '#3a5f25' },
    { id: 'skills', name: '神秘古树', angle: Math.PI / 2, w: 350, h: 450, img: imgSkills, emoji: '🌲', color: '#3a5f25' },
    { id: null, name: '右侧树', angle: Math.PI / 2 + 0.25, w: 100, h: 100, img: imgSideTreeRight, emoji: '🌲', color: '#3a5f25' },
    { id: null, name: '极右侧树', angle: Math.PI / 2 + 0.4, w: 165, h: 100, img: imgSideTreeFarRight, emoji: '🌲', color: '#3a5f25' },
    { id: null, name: 'Coin 2L', angle: 2.2, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 2', angle: 2.4, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 2R', angle: 2.5 + 0.08, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: 'orange-cat', name: '小橘猫', angle: Math.PI - 0.45, w: 128, h: 128, img: imgOrangeCat, type: 'npc',y_offset: 9, soundPlayed: false },
    { id: null, name: 'Project左侧树', angle: Math.PI - 0.25, w: 250, h: 300, img: imgProjTreeLeft, emoji: '🌲', color: '#3a5f25', y_offset: 28 },
    { id: 'projects', name: '储物木箱', angle: Math.PI, w: 350, h: 450, img: imgProj, emoji: '📦', color: '#d3a034' },
    { id: null, name: 'Project右侧树', angle: Math.PI + 0.35, w: 235, h: 90, img: imgProjTreeRight, emoji: '🌲', color: '#3a5f25', y_offset: 5 },
    { id: null, name: 'Coin 3L', angle: 3.8, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 3', angle: 4.0, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 3R', angle: 4.2, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Contact左侧树', angle: (3 * Math.PI) / 2 - 0.2, w: 80, h: 80, img: imgContactTreeLeft, emoji: '🌲', color: '#3a5f25' },
    { id: 'contact', name: '日常公告栏', angle: (3 * Math.PI) / 2, w: 350, h: 450, img: imgContact, emoji: '🎣', color: '#4d7298' },
    { id: null, name: '神秘落果', angle: (3 * Math.PI) / 2 + 0.25, w: 132, h: 57, img: imgFruit, emoji: '🍓' },
    { id: null, name: 'Coin 4L', angle: 5.2, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 4', angle: 5.4, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 4R', angle: 5.6, w: 50, h: 50, img: imgCoin, type: 'coin' },
];

// ==========================================
// 4. 键盘输入监听逻辑
// ==========================================
const keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
let joystickActive = false;

function setKeyState(key, isPressed) {
    if (key in keys) {
        keys[key] = isPressed;
        markUserInteracted();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') {
        setKeyState('a', true);
        if (e.key === 'ArrowLeft') setKeyState('ArrowLeft', true);
    }
    if (e.key.toLowerCase() === 'd' || e.key === 'ArrowRight') {
        setKeyState('d', true);
        if (e.key === 'ArrowRight') setKeyState('ArrowRight', true);
    }
});
window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') {
        setKeyState('a', false);
        if (e.key === 'ArrowLeft') setKeyState('ArrowLeft', false);
    }
    if (e.key.toLowerCase() === 'd' || e.key === 'ArrowRight') {
        setKeyState('d', false);
        if (e.key === 'ArrowRight') setKeyState('ArrowRight', false);
    }
});
window.addEventListener('click', markUserInteracted, { once: false });
window.addEventListener('touchstart', markUserInteracted, { once: false });

function isMobileViewport() {
    return window.innerWidth <= 768;
}

function openNearbyObject() {
    if (!nearObject) return false;

    if (nearObject.id === 'wish') {
        const allCoinsCollected = interactiveObjects.filter(obj => obj.type === 'coin').every(obj => obj.collected);
        if (allCoinsCollected) {
            playEffectSound('wishOpen');
            
            const wishMessages = [
                "The wishing well has sensed your coin. It wants to whisper to you: You've been doing so well lately. Make sure to treat yourself to a delicious drink today.",
                "The ripples fading across the water will wash away all your anxiety. Try going to bed half an hour early tonight, and sweet dreams!",
                "No matter how today went, the wishing well will always be here waiting for you. Tomorrow is a brand new day!",
                "Coin tossed successfully! I have a feeling that every traffic light you hit today will turn green just for you.",
                "The coin has found its coziest spot at thebottom, sharing its luck with you: there's a good chance you won't have to wait in line for coffee today!",
                "Your luck index is off the charts today! If there's something you've been hesitating about, why not just go for it today?"
            ];
            const randomMsg = wishMessages[Math.floor(Math.random() * wishMessages.length)];
            modalData['wish'] = `<h2 class="text-4xl font-bold text-[#ffb347] mb-3">WISH ✨</h2><p class="text-xl">${randomMsg}</p>`;
            nearObject.hasWished = true; // Mark that a wish has been made at least once

            openModal(nearObject.id);
            return true;
        }
    } else if (nearObject.id) {
        playEffectSound('bubble');
        openModal(nearObject.id);
        return true;
    }

    return false;
}



function resetJoystick() {
    if (!joystickKnob) return;
    joystickKnob.style.transform = 'translate(-50%, -50%)';
    setKeyState('a', false);
    setKeyState('d', false);
    joystickActive = false;
}

function bindJoystick() {
    if (!joystickBase || !joystickKnob) return;

    let active = false;
    let baseRect = null;
    let pointerId = null;

    const updateFromPoint = (clientX, clientY) => {
        if (!baseRect) return;
        const dx = clientX - (baseRect.left + baseRect.width / 2);
        const dy = clientY - (baseRect.top + baseRect.height / 2);
        const maxDist = 24;
        const clampedX = Math.max(-maxDist, Math.min(maxDist, dx));
        const clampedY = Math.max(-maxDist, Math.min(maxDist, dy));
        joystickKnob.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
        const left = clampedX < -8;
        const right = clampedX > 8;
        setKeyState('a', left);
        setKeyState('d', right);
    };

    const start = (e) => {
        initAudio(); // Ensure audio context is resumed on first joystick interaction
        e.preventDefault();
        if (active) return;
        active = true;
        joystickActive = true;
        pointerId = e.pointerId;
        baseRect = joystickBase.getBoundingClientRect();
        joystickBase.setPointerCapture?.(e.pointerId);
        updateFromPoint(e.clientX, e.clientY);
    };

    const move = (e) => {
        if (!active || e.pointerId !== pointerId) return;
        updateFromPoint(e.clientX, e.clientY);
    };

    const end = (e) => {
        if (active && pointerId !== null && e.pointerId !== undefined && e.pointerId !== pointerId) return;
        active = false;
        pointerId = null;
        resetJoystick();
    };

    joystickBase.addEventListener('pointerdown', start);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
}

// Conditionally bind joystick only on touch devices
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    bindJoystick();
} else {
    if (joystickBase) joystickBase.style.display = 'none';
}

// ==========================================
// 4.5 粒子系统
// ==========================================
const particles = [];
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.size *= 0.95; // 稍微变小
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}
function spawnParticle(x, y, facingRight) {
    const isSnow = Math.random() > 0.5;
    particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 5,
        vx: (facingRight ? -1 : 1) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
        vy: Math.random() * -2 - 0.5,
        size: Math.random() * 4 + 2,
        life: Math.random() * 20 + 10,
        maxLife: 30, // 用于计算透明度
        color: isSnow ? '#ffffff' : '#d2e3f0' // 颜色稍微偏蓝白或纯白，模拟雪/冰尘
    });
}

let nearObject = null;
let hasUserInteracted = false;

function markUserInteracted() {
    hasUserInteracted = true;
}

function update() {
    const wasMoving = player.isMoving;
    player.isMoving = false;
    
    const angularSpeed = player.speed / GLOBE_RADIUS;
    const leftPressed = keys.a || keys.ArrowLeft || joystickActive && keys.a;
    const rightPressed = keys.d || keys.ArrowRight || joystickActive && keys.d;
    
    if (leftPressed) {
        worldAngle += angularSpeed;
        player.isMoving = true;
        player.facingRight = false;
    }
    if (rightPressed) {
        worldAngle -= angularSpeed;
        player.isMoving = true;
        player.facingRight = true;
    }

    // 如果状态改变，重置帧动画
    if (wasMoving !== player.isMoving) {
        player.frameX = 0;
    }

    // Normalize worldAngle to prevent it from growing indefinitely and causing float precision issues.
    const twoPi = Math.PI * 2;
    worldAngle = ((worldAngle % twoPi) + twoPi) % twoPi;

    // 取消角度限制，允许自由环绕整个星球
    // const maxAngle = 480 / GLOBE_RADIUS;
    // worldAngle = Math.max(-maxAngle, Math.min(maxAngle, worldAngle));

    // 帧动画更新 (待机速度减慢4倍)
    const now = Date.now();
    const currentInterval = player.isMoving ? player.frameInterval : player.frameInterval * 4;
    if (now - player.lastFrameTime > currentInterval) {
        player.frameX++;
        player.lastFrameTime = now;
    }

    // 行走时的像素Q弹震荡和呼吸动画
    if (player.isMoving) {
        player.squashX = 1 + Math.sin(now * 0.02) * 0.05;
        player.squashY = 1 - Math.sin(now * 0.02) * 0.05;
        
        // 运动时生成粒子
        if (Math.random() < 0.4) {
            const peakY = canvas.height - 240;
            const midX = canvas.width / 2;
            const feetY = peakY + 30; // 脚底位置 (向上移动了5个像素)
            spawnParticle(midX, feetY, player.facingRight);
        }
    } else {
        player.squashX = 1;
        player.squashY = 1 + Math.sin(now * 0.003) * 0.03; // 待机呼吸
    }

    updateParticles();

    // 建筑物距离检测 (判断相对于玩家顶点的夹角距离，加入取模以支持环绕)
    nearObject = null;
    interactiveObjects.forEach(obj => {
        if (obj.collected) return; // 已经被吃掉的金币不再处理
        
        let angleDiff = (obj.angle + worldAngle) % (Math.PI * 2);
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        const dist = Math.abs(angleDiff) * GLOBE_RADIUS;
        
        if (dist < 60) {
            if (obj.type === 'coin') {
                obj.collected = true; // 玩家碰到金币，标记为收集
                playEffectSound('coin');
            } else if (obj.id === 'orange-cat' && !obj.soundPlayed) {
                playEffectSound('meow');
                obj.soundPlayed = true;
            } else if (obj.id) {
                nearObject = obj; // 只对有 id 的物体显示交互提示
            }
        }
    });
    // Reset sound flag for the orange cat only when the player is no longer near it.
    const orangeCat = interactiveObjects.find(obj => obj.id === 'orange-cat');
    if (orangeCat && orangeCat.soundPlayed) {
        const angleDiff = (orangeCat.angle + worldAngle) % (Math.PI * 2);
        const dist = Math.abs(angleDiff > Math.PI ? angleDiff - Math.PI * 2 : angleDiff) * GLOBE_RADIUS;
        if (dist >= 60) orangeCat.soundPlayed = false;
    }

    const promptEl = document.getElementById('interaction-prompt');
    if (nearObject) {
        let promptText = '';
        let addBouncingClass = false;

        if (nearObject.id === 'orange-cat') {
            promptText = isMobileViewport() ? 'Tap to Interact' : 'Press [SPACE] to Interact';
            addBouncingClass = true; // Add bouncing effect for orange cat
        } else if (nearObject.id === 'wish') {
            const allCoinsCollected = interactiveObjects.filter(obj => obj.type === 'coin').every(obj => obj.collected);
            promptText = allCoinsCollected ? (isMobileViewport() ? 'Tap to Make a Wish' : 'Make a wish and press [Space] to toss your coins') : 'collect all the coins';
        } else {
            promptText = isMobileViewport() ? 'Tap to Open' : 'Press [SPACE] to Open';
        }
        
        promptEl.textContent = promptText;
        promptEl.style.display = 'block';
        if (addBouncingClass) {
            promptEl.classList.add('bouncing-prompt');
        } else {
            promptEl.classList.remove('bouncing-prompt');
        }
    } else {
        promptEl.style.display = 'none';
        promptEl.classList.remove('bouncing-prompt');
    }
}

// ==========================================
// 5. 游戏画面手工像素级绘制
// ==========================================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const midX = canvas.width / 2;
    const globeCenterY = canvas.height + GLOBE_CENTER_OFFSET;
    const peakY = canvas.height - 240;

    // 1. 绘制天空背景 (带有轻微的视差滚动效果)
    let allBgLoaded = imgBg.length > 0 && imgBg.every(img => img.complete && img.naturalWidth !== 0);

    if (allBgLoaded) {
        const parallaxSpeeds = [0.02, 0.05, 0.1, 0.2];
        const isMobile = window.innerWidth <= 768;
        
        imgBg.forEach((img, index) => {
            const speed = parallaxSpeeds[index];
            const skyOffset = (worldAngle * GLOBE_RADIUS * speed) % canvas.width;
            const drawWidth = isMobile ? canvas.width * 1.6 : canvas.width;
            const drawHeight = canvas.height;
            const sourceX = 0;
            const sourceY = 0;
            const sourceWidth = img.naturalWidth;
            const sourceHeight = img.naturalHeight;

            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, skyOffset, 0, drawWidth, drawHeight);
            if (skyOffset > 0) {
                ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, skyOffset - canvas.width, 0, drawWidth, drawHeight);
            } else {
                ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, skyOffset + canvas.width, 0, drawWidth, drawHeight);
            }
        });
    } else {
        // 没放图片前的复古渐变蓝天空备用底色
        ctx.fillStyle = '#6fa1ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 1.5 绘制常速下雪动画 (背景层之上)
    if (imgSnowAnim.length > 0) {
        const frameIndex = Math.floor(Date.now() / 60) % 50;
        const snowImg = imgSnowAnim[frameIndex];
        if (snowImg && snowImg.complete && snowImg.naturalWidth !== 0) {
            const snowScale = 4.5;
            const sw = snowImg.naturalWidth * snowScale;
            const sh = snowImg.naturalHeight * snowScale;
            for (let sx = 0; sx < canvas.width; sx += sw) {
                for (let sy = 0; sy < canvas.height; sy += sh) {
                    ctx.drawImage(snowImg, sx, sy, sw, sh);
                }
            }
        }
    }

    // 开启旋转变换绘制地表和建筑物
    ctx.save();
    ctx.translate(midX, globeCenterY);
    ctx.rotate(worldAngle);

    // 2. 绘制半圆形浮岛底座 - 使用雪地贴图
    if (imgSnowFill.complete && imgSnowFill.naturalWidth !== 0) {
        ctx.fillStyle = ctx.createPattern(imgSnowFill, 'repeat');
    } else {
        ctx.fillStyle = '#ffffff'; // 备用颜色
    }
    
    ctx.beginPath();
    ctx.arc(0, 0, GLOBE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // 在雪地最表层画一圈纯白色的“积雪边”
    ctx.strokeStyle = '#95b2ca';
    ctx.lineWidth = 6;
    ctx.stroke();

    // 3. 绘制四大标志建筑物
    interactiveObjects.forEach(obj => {
        if (obj.collected) return; // 不绘制被收集的金币
        ctx.save();
        ctx.rotate(obj.angle);
        const isMobile = window.innerWidth <= 768;
        let mobileScale = 1;
        if (isMobile) {
            if (obj.id === 'orange-cat') { // Specific scaling for orange cat on mobile
                mobileScale = 1; // Make it the same size as the player character (1:1 scale)
            } else if (obj.type !== 'coin') { // Existing logic for other non-coin objects
                mobileScale = 0.8;
            }
        }
        const drawW = obj.w * mobileScale;
        const drawH = obj.h * mobileScale;
        const y_offset = (obj.y_offset || 0) + 5;
        let objY = -GLOBE_RADIUS - drawH + 20 + y_offset; // +20 让地基稍微陷进草地中，更贴合
        
        if (obj.type === 'coin') {
            objY -= 6; // Move coins up by 6 pixels
        }
        
        if (obj.img.complete && obj.img.naturalWidth !== 0) {
            if (obj.type === 'coin') {
                const coinFrames = 9;
                const coinFrameW = 16;
                const coinFrameH = 16;
                const frameIndex = Math.floor(Date.now() / 100) % coinFrames;
                ctx.drawImage(
                    obj.img,
                    frameIndex * coinFrameW, 0, coinFrameW, coinFrameH,
                    -obj.w/2, objY, obj.w, obj.h
                );
            } else {
                if (obj.type === 'npc' && (obj.name === '小灰猫' || obj.name === '小橘猫')) {
                    const npcFrameW = 32;
                    const npcFrameH = 32;
                    // 小灰猫用第37行 (索引36)，小橘猫用第38行 (索引37)
                    const npcRow = (obj.name === '小灰猫') ? 36 : 37;
                    const npcFrameCount = 4;
                    const frameIndex = Math.floor(Date.now() / 200) % npcFrameCount; // 200ms一帧
                    ctx.drawImage(obj.img, frameIndex * npcFrameW, npcRow * npcFrameH, npcFrameW, npcFrameH, -drawW/2, objY, drawW, drawH);
                    ctx.restore();
                    return; // 绘制完NPC后跳过下面的通用绘制
                }
                ctx.drawImage(obj.img, -drawW / 2, objY, drawW, drawH);
            }
        }
        ctx.restore();
    });

    ctx.restore(); // 结束旋转变换

    // 绘制粒子
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 20); // max alpha 1.0
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0; // reset

    // 4. 绘制主角
    const playerX = midX;
    const playerY = peakY - player.height + 35;

    ctx.save();
    // 脚底黑影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(playerX - 20, peakY - 4, 40, 8);
    
    // 坐标轴重心移动到小狗中心，应用动画缩放 (不再使用 scale 翻转，因为现在有独立的左右动画行)
    ctx.translate(playerX, playerY + player.height/2);
    ctx.scale(player.squashX, player.squashY);
    
    const currentImg = player.isMoving ? imgHeroWalk : imgHeroIdle;
    
    // Default assumption for sprite sheets: 32x32 frames
    const frameWidth = 32; 
    const frameHeight = 32;
    
    // 规定：第七行 (索引 6) 为向右走，第八行 (索引 7) 为向左走
    const rowIndexWalkRight = 6;
    const rowIndexWalkLeft = 7;
    
    // 闲置状态使用第29行(索引28)和第32行(索引31)
    const rowIndexIdleRight = 28;
    const rowIndexIdleLeft = 31; 

    // 走路8帧，停下3帧
    const maxFrames = player.isMoving ? 8 : 3;
    
    let currentRow;
    if (player.isMoving) {
        currentRow = player.facingRight ? rowIndexWalkRight : rowIndexWalkLeft;
    } else {
        currentRow = player.facingRight ? rowIndexIdleRight : rowIndexIdleLeft;
    }

    if (currentImg.complete && currentImg.naturalWidth !== 0) {
        if (player.frameX >= maxFrames) {
            player.frameX = 0;
        }
        ctx.drawImage(
            currentImg,
            player.frameX * frameWidth, currentRow * frameHeight, frameWidth, frameHeight,
            -player.width/2, -player.height/2, player.width, player.height
        );
    } else {
        // 临时的硬核手绘像素小吉娃娃身体备用块
        ctx.fillStyle = '#421f06';
        ctx.fillRect(-22, -22, 44, 44);
        ctx.fillStyle = '#d3a034'; // 狗身黄
        ctx.fillRect(-18, -18, 36, 36);
        ctx.fillStyle = '#fffdf9'; // 白毛
        ctx.fillRect(-10, 0, 20, 18);
        ctx.fillStyle = '#2b1b10'; // 蓝黑大眼睛
        ctx.fillRect(6, -10, 4, 6);
    }
    ctx.restore();
}

// Make the interaction prompt itself clickable on mobile
document.getElementById('interaction-prompt').addEventListener('click', () => {
    if (nearObject) {
        openNearbyObject();
    }
});

// 驱动循环驱动器
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// ==========================================
// 6. 星露谷羊皮纸弹窗文本注入与显隐
// ==========================================
const projectData = [
    {
        id: 'roi-analysis',
        title: 'North American Social Media Marketing ROI Optimization & Predictive Simulation',
        description: 'This project analyzes a synthetic marketing dataset for a Canadian FMCG brand and evaluates how budget shifts could improve ROI for the 18–25 female audience. It combines Python-based simulation, SQL-style aggregation, and a Power BI dashboard into a compact portfolio project.',
        skills: ['Python: pandas, numpy, matplotlib, pandasql', 'Notebook: Jupyter / ipykernel', 'Visualization: Power BI',"SQL","Data Analysis"],
        highlights: 'The project explores how smarter budget allocation and audience targeting can improve campaign efficiency and expected returns.',
        githubUrl: 'https://github.com/jiajialiang32-ui/roi-project'
    },
    {
        id: 'subscription-testing',
        title: 'FinTech Subscription Optimization via A/B Testing',
        description: 'This project evaluates the behavioral and financial impact of an optimized pricing page interface for a FinTech platform. Using a reproducible data pipeline, the analysis simulates user behavior, validates assumptions, performs statistical testing, and translates results into a revenue projection.',
        skills: ['Python: pandas, numpy, matplotlib, seaborn', 'Statsmodels', 'Jupyter Notebook'],
        highlights: 'The project combines statistical analysis with business impact modeling to assess pricing-page changes and forecast revenue outcomes.',
        githubUrl: 'https://github.com/jiajialiang32-ui/ABtesting'
    },
    {
        id: 'portfolio-site',
        title: 'Interactive Portfolio Website',
        description: 'This portfolio website turns my background and projects into an interactive experience inspired by a cozy pixel-style farm world.',
        skills: ['HTML', 'CSS', 'JavaScript', 'UI Design','Game Development'],
        highlights: 'The goal was to make complex information easy to explore while keeping the experience engaging.'
    },
    {
        id: 'telecom-churn',
        title: 'Telecom Churn Intelligence Dashboard',
        description: 'This repository contains a robust, interactive Business Intelligence Dashboard built with Power BI, leveraging the Kaggle Telco Customer Churn dataset (7,043 records). By bridging mathematical rigor with strategic business administration, this project transforms raw operational data into actionable retention assets. The analysis is structured to provide both Global KPI Oversight for executives and Granular Risk Mitigation for product and marketing teams, aiming to identify systemic revenue leakage and deploy data-driven interventions.',
        skills: ['Power BI', 'Data Analysis', 'Business Strategy'],
        highlights: 'The dashboard focuses on customer retention insights, churn risk visibility, and executive-ready business recommendations.',
        githubUrl: 'https://github.com/jiajialiang32-ui/Telecom_Churn_Intelligence_Dashboard'
    }
];

const photobookData = [
    {
        id: 'photo1',
        img: 'assets/photobook2/3502ee601c393cef19bbf27622cb1a.JPG',
    },
    {
        id: 'photo2',
        img: 'assets/photobook2/42e1a9be81113e662c1487aa5dc328.JPG',
    },
    {
        id: 'photo3',
        img: 'assets/photobook2/7370447fda09d8b737f21eec74c000.JPG',
    },
    {
        id: 'photo4',
        img: 'assets/photobook2/IMG_1959.jpg',
    },
    {
        id: 'photo5',
        img: 'assets/photobook2/IMG_1960.jpg',
    },
    {
        id: 'photo6',
        img: 'assets/photobook2/IMG_1961.jpg',
    },
    {
        id: 'photo7',
        img: 'assets/photobook2/IMG_1962.jpg',
    },
    {
        id: 'photo8',
        img: 'assets/photobook2/f4e92226f4fe69d69b24baa95b2c18.JPG',
    }
];

const animalData = [
    {
        id: 'animal1',
        img: 'assets/photobook/1.jpg',
        name: 'Photo 1'
    },
    {
        id: 'animal2',
        img: 'assets/photobook/2.jpg',
        name: 'Photo 2'
    },
    {
        id: 'animal3',
        img: 'assets/photobook/3.jpg',
        name: 'Photo 3'
    },
    {
        id: 'animal4',
        img: 'assets/photobook/4.jpg',
        name: 'Photo 4'
    },
    {
        id: 'animal5',
        img: 'assets/photobook/8164e69227603b78847808ee7fb1c1.JPG',
        name: 'Photo 5'
    },
    {
        id: 'animal6',
        img: 'assets/photobook/31475ddef9a1cd26b387a37a72b87e.JPG',
        name: 'Photo 6'
    },
    {
        id: 'animal7',
        img: 'assets/photobook/ddcb2c9fc98537d2dcf0f1c1a73767.JPG',
        name: 'Photo 7'
    },
    {
        id: 'animal8',
        img: 'assets/photobook/facfadc7e0777ba23a7071afb3fffe.JPG',
        name: 'Photo 8'
    }
];

const makaylaData = [
    {
        id: 'makayla1',
        img: 'assets/photobook3/918a44cd1c549c7e381aa0cdbb3609.JPG',
        name: 'Makayla 1'
    },
    {
        id: 'makayla2',
        img: 'assets/photobook3/5612d39e5bf676568239f3d335a12c.JPG',
        name: 'Makayla 2'
    },
    {
        id: 'makayla3',
        img: 'assets/photobook3/23762c8f255f4ab285d0fe4ced45cd.JPG',
        name: 'Makayla 3'
    },
    {
        id: 'makayla4',
        img: 'assets/photobook3/IMG_1973.JPG',
        name: 'Makayla 4'
    },
    {
        id: 'makayla5',
        img: 'assets/photobook3/IMG_1975.jpg',
        name: 'Makayla 5'
    },
    {
        id: 'makayla6',
        img: 'assets/photobook3/IMG_1979.jpg',
        name: 'Makayla 6'
    },
    {
        id: 'makayla7',
        img: 'assets/photobook3/a13fc7a4525bd1f5872f6ccee821df.JPG',
        name: 'Makayla 7'
    }
];

const modalData = {
    about: `<h2 class="text-4xl font-bold text-[#9e331f] mb-3">ABOUT ME 📬</h2><p class="text-xl">Dedicated BBA & Mathematics double degree student at Wilfrid Laurier University and University of Waterloo, currently in my second year. I possess a strong foundation in quantitative analysis, Python programming, and strategic business frameworks, developed through systematic study of live case studies, economics, and advanced mathematics. Currently expanding my expertise in accounting, optimization theory, and statistics, while proactively mastering additional business skills independently. I am eager to leverage my interdisciplinary background to contribute to high-impact projects in Data & Analytics, Finance, Consulting, and Product Growth.</p>`,
    skills: `<h2 class="text-4xl font-bold text-[#3a5f25] mb-6">SKILLS TREE 🌲</h2>
<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-xl">
    <div>
        <h3 class="text-2xl font-bold mb-3 text-yellow-700 border-b-2 border-yellow-700 pb-1">Data Analytics & Modeling</h3>
        <ul class="list-disc list-inside ml-2">
            <li>Data Analytics</li>
            <li>Data Modeling & DAX Expressions</li>
            <li>Python (Pandas, NumPy, Matplotlib)</li>
            <li>Python Data Simulation</li>
            <li>SQL</li>
        </ul>
    </div>
    <div>
        <h3 class="text-2xl font-bold mb-3 text-yellow-700 border-b-2 border-yellow-700 pb-1">Business Intelligence & Visualization</h3>
        <ul class="list-disc list-inside ml-2">
            <li>Microsoft Power BI</li>
            <li>Microsoft Excel</li>
            <li>Data Visualization</li>
        </ul>
    </div>
    <div>
        <h3 class="text-2xl font-bold mb-3 text-yellow-700 border-b-2 border-yellow-700 pb-1">Statistics, Experimentation & CRO</h3>
        <ul class="list-disc list-inside ml-2">
            <li>A/B Testing</li>
            <li>Statistical Inference</li>
            <li>Conversion Rate Optimization (CRO)</li>
        </ul>
    </div>
    <div>
        <h3 class="text-2xl font-bold mb-3 text-yellow-700 border-b-2 border-yellow-700 pb-1">Frontend & Game Development</h3>
        <ul class="list-disc list-inside ml-2">
            <li>HTML</li>
            <li>JavaScript</li>
            <li>Cascading Style Sheets (CSS)</li>
            <li>CSS Sprites</li>
            <li>Game Development</li>
        </ul>
    </div>
    <div>
        <h3 class="text-2xl font-bold mb-3 text-yellow-700 border-b-2 border-yellow-700 pb-1">UI/UX Design</h3>
        <ul class="list-disc list-inside ml-2">
            <li>Figma (Software)</li>
            <li>User Interface Design</li>
        </ul>
    </div>
</div>`,
    projects: `<h2 class="text-4xl font-bold text-[#b97235] mb-3">PROJECTS 📦</h2>`, // This will be replaced by renderProjectsModal
    letter: ` <div class="font-handwritten">
    <h2 class="text-4xl font-bold text-[#9e331f] mb-3">✉️ A Handwritten Letter from Makayla</h2>
    <p class="text-xl mb-4">Dear Adventurer,</p>
    <p class="text-xl mb-4">Thank you so much for taking the time to explore my little pixel island alongside my cat companion!</p>
    <p class="text-xl mb-4">In a world where most portfolios feel as sterile and rigid as financial spreadsheets, I wanted to build something entirely different. I chose this retro pixel-art style because of a core philosophy I hold close: data and technical engineering only realize their true potential when they are wrapped in an empathetic, user-first experience.</p>
    <p class="text-xl mb-4">Whether you stumbled upon my space looking for a versatile teammate to tackle complex projects, or you just wanted to take a relaxing stroll with a pixel cat, I am incredibly grateful for your time and curiosity.</p>
    <p class="text-xl mb-4">🌟 Wishing you the absolute best of luck today—may you trigger a perfect "Daily Luck" modifier in everything you do in the real world!</p>
    <p class="text-xl text-right">— Makayla Liang</p>
</div>`,
    contact: `<h2 class="text-4xl font-bold text-[#4d7298] mb-3">CONTACT 🎣</h2><p class="text-xl">📱Phone Number: 437-829-7174</p><p class="text-xl">📮Email: <a href="mailto:jiajialiang32@gmail.com" class="underline">jiajialiang32@gmail.com</a></p><p class="text-xl">💼LinkedIn: <a href="https://www.linkedin.com/in/makayla-liang-26a2393a7/" target="_blank" rel="noopener noreferrer" class="underline">Makayla Liang</a></p>`,
    wish: `<h2 class="text-4xl font-bold text-[#ffb347] mb-3">WISH ✨</h2><p class="text-xl">你的愿望已经收到啦！(Your wish has been received!)</p>`
};

const overlay = document.getElementById('modal-overlay');
const body = document.getElementById('modal-body');

function renderProjectsModal() {
    body.innerHTML = `
        <h2 class="text-4xl font-bold text-[#b97235] mb-2">PROJECTS 📦</h2>
        <p class="text-xl mb-4">Click a project name to open a detail board with the overview and skills.</p>
        <div class="project-list">
            ${projectData.map(project => `
                <button class="project-name-btn" data-project="${project.id}">
                    ${project.title}
                </button>
            `).join('')}
        </div>
        <div id="project-detail" class="project-detail-card"></div>
    `;

    const detailEl = document.getElementById('project-detail');
    const projectButtons = body.querySelectorAll('.project-name-btn');

    function showProject(projectId) {
        const project = projectData.find(item => item.id === projectId);
        if (!project) return;

        projectButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.project === projectId);
        });

        // Create a variable to hold the GitHub link HTML
        let githubLinkHtml = '';
        if (project.githubUrl) {
            githubLinkHtml = `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link-btn">View GitHub Project</a>`;
        } else if (project.id === 'telecom-churn') {
            // Redundant fallback to ensure the link for the telecom project is always shown
            githubLinkHtml = `<a href="https://github.com/jiajialiang32-ui/Telecom_Churn_Intelligence_Dashboard" target="_blank" rel="noopener noreferrer" class="project-link-btn">View GitHub Project</a>`;
        }

        detailEl.innerHTML = `
            <h3 class="text-3xl font-bold text-[#9e331f] mb-2">${project.title}</h3>
            <p class="text-xl mb-3">${project.description}</p>
            <h4 class="text-2xl font-bold mb-2">Skills</h4>
            <div class="flex flex-wrap gap-2 mb-3">
                ${project.skills.map(skill => `<span class="project-skill-tag">${skill}</span>`).join('')}
            </div>
            <p class="text-lg opacity-90">${project.highlights}</p>
            ${githubLinkHtml}
        `;
    }

    projectButtons.forEach(button => {
        button.addEventListener('click', () => {
            showProject(button.dataset.project);
            playEffectSound('projectSelect');
        });
    });

    showProject(projectData[0].id);
}

function renderOrangeCatModal() {
    body.innerHTML = `
        <h2 class="text-4xl font-bold text-[#b97235] mb-2">I Found Makayla's Photobook</h2>
        <p class="text-xl mb-4">A friendly little tabby cat is meowing at you, it seems to have found something it wants to share with you.</p>
        <div class="flex border-b-4 border-[#5c2e0b] mb-4">
            <button class="cat-tab-btn active" data-tab="photos">View</button>
            <button class="cat-tab-btn" data-tab="animals">Animals</button>
            <button class="cat-tab-btn" data-tab="makayla">Makayla</button>
        </div>
        </div>
        </div>
        <div id="cat-tab-content"></div>
        <button id="next-photo-btn" class="project-link-btn">Next Photo</button>
    `;

    const contentEl = document.getElementById('cat-tab-content');
    const nextButton = document.getElementById('next-photo-btn');
    const tabButtons = body.querySelectorAll('.cat-tab-btn');

    function renderPhotosTab() {
        contentEl.innerHTML = `
            <p class="text-xl mb-4">Pleasant sceneries.</p>
            <div class="photobook-stack">
                ${photobookData.map((photo, index) => `
                    <div class="photo-card" data-index="${index}">
                        <img src="${photo.img}" alt="A precious landscape photo taken by Orange Cat" loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;
        
        const photoCards = contentEl.querySelectorAll('.photo-card');
        photoCards.forEach((card, index) => {
            const randomRotate = Math.random() * 30 - 15; // -15 to 15 degrees
            const randomTranslateX = Math.random() * 40 - 20; // -20 to 20 px
            const randomTranslateY = Math.random() * 40 - 20; // -20 to 20 px
            card.style.transform = `translate(${randomTranslateX}px, ${randomTranslateY}px) rotate(${randomRotate}deg)`;
            card.style.zIndex = photobookData.length - 1 - index;
        });
        nextButton.style.display = 'inline-block';
    }

    function renderAnimalsTab() {
        contentEl.innerHTML = `
            <p class="text-xl mb-4">Makayla's furry friend.</p>
            <div class="photobook-stack">
                ${animalData.map((animal, index) => `
                    <div class="photo-card" data-index="${index}">
                        <img src="${animal.img}" alt="${animal.name}" loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;
        
        const photoCards = contentEl.querySelectorAll('.photo-card');
        photoCards.forEach((card, index) => {
            const randomRotate = Math.random() * 30 - 15;
            const randomTranslateX = Math.random() * 40 - 20;
            const randomTranslateY = Math.random() * 40 - 20;
            card.style.transform = `translate(${randomTranslateX}px, ${randomTranslateY}px) rotate(${randomRotate}deg)`;
            card.style.zIndex = animalData.length - 1 - index;
        });
        nextButton.style.display = 'inline-block';
    }

    function renderMakaylaTab() {
        contentEl.innerHTML = `
            <p class="text-xl mb-4">Photos of Makayla.</p>
            <div class="photobook-stack">
                ${makaylaData.map((photo, index) => `
                    <div class="photo-card" data-index="${index}">
                        <img src="${photo.img}" alt="${photo.name}" loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;
        const photoCards = contentEl.querySelectorAll('.photo-card');
        photoCards.forEach((card, index) => {
            const randomRotate = Math.random() * 30 - 15;
            const randomTranslateX = Math.random() * 40 - 20;
            const randomTranslateY = Math.random() * 40 - 20;
            card.style.transform = `translate(${randomTranslateX}px, ${randomTranslateY}px) rotate(${randomRotate}deg)`;
            card.style.zIndex = makaylaData.length - 1 - index;
        });
        nextButton.style.display = 'inline-block';
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            playEffectSound('tabSwitch');

            const tab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            if (tab === 'photos') {
                renderPhotosTab();
            } else if (tab === 'animals') {
                renderAnimalsTab();
            } else if (tab === 'makayla') {
                renderMakaylaTab();
            }
        });
    });

    // Initially render the photos tab
    renderPhotosTab();

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const activeTab = body.querySelector('.cat-tab-btn.active').dataset.tab;
            if (activeTab === 'photos') {
                photobookData.push(photobookData.shift());
                renderPhotosTab();
            } else if (activeTab === 'animals') {
                animalData.push(animalData.shift());
                renderAnimalsTab();
            } else if (activeTab === 'makayla') {
                makaylaData.push(makaylaData.shift());
                renderMakaylaTab();
            }
            playEffectSound('tabSwitch');
        });
    }
}


function openModal(id) {
    if (id === 'projects') {
        renderProjectsModal();
    } else if (id === 'orange-cat') {
        renderOrangeCatModal();
    } else if (modalData[id]) {
        body.innerHTML = modalData[id];
    }
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);

    // 记录当前打开的弹窗ID
    if (overlay) {
        overlay.dataset.currentModal = id;
    }
}
function closeModal() {
    playEffectSound('confirm');
    overlay.classList.remove('active');
}

overlay.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'opacity' && !overlay.classList.contains('active')) {
        if (overlay.dataset.currentModal === 'wish' && !letterShown) {
            letterShown = true;
            setTimeout(() => {
                overlay.style.display = 'flex';
                setTimeout(() => overlay.classList.add('active'), 10);
                overlay.dataset.currentModal = 'letter';
                // 替换为直接设置内容，因为 typeWriter 函数未定义
                body.innerHTML = modalData.letter;
                playEffectSound('letterOpen');
            }, 300);
        } else {
            overlay.style.display = 'none';
        }
    }
});

// 监听空格触发近身弹窗
window.addEventListener('keydown', (e) => {
    // 只有在弹窗未打开时才响应
    if (e.key === ' ' && nearObject && !overlay.classList.contains('active')) {
        // 阻止网页按空格产生默认向下滚动的行为
        e.preventDefault(); 
        openNearbyObject();
    }
});
document.getElementById('modal-close').addEventListener('click', closeModal);

// ==========================================
// 7. 背景音乐交互播放逻辑
// ==========================================
// This section is now handled by the consolidated audio logic
// at the top of the script and the new initAudio function.
window.addEventListener('keydown', initAudio, { once: true });
window.addEventListener('click', initAudio, { once: true });
window.addEventListener('touchstart', initAudio, { once: true });


// ==========================================
// 8. 声音控制菜单逻辑
// ==========================================
const soundBtn = document.getElementById('sound-btn');
const soundMenu = document.getElementById('sound-menu');
const musicToggleBtn = document.getElementById('music-toggle');
const effectToggleBtn = document.getElementById('effect-toggle');
let isEffectEnabled = true;

function updateSoundUI() {
    if (musicToggleBtn) {
        musicToggleBtn.textContent = `Music: ${isMusicEnabled ? 'ON' : 'OFF'}`;
        musicToggleBtn.classList.toggle('active', isMusicEnabled);
    }
    if (effectToggleBtn) {
        effectToggleBtn.textContent = `Effect: ${isEffectEnabled ? 'ON' : 'OFF'}`;
        effectToggleBtn.classList.toggle('active', isEffectEnabled);
    }
}

function setMusicEnabled(enabled) {
    isMusicEnabled = enabled;
    if (enabled) {
        playBgMusic();
    } else {
        if (bgMusicSource) {
            bgMusicSource.stop();
            bgMusicSource = null;
        }
    }
    updateSoundUI();
}

function setEffectEnabled(enabled) {
    isEffectEnabled = enabled;
    updateSoundUI();
}



if (soundBtn && soundMenu) {
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        soundMenu.classList.add('hidden');
    });
}

if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setMusicEnabled(!isMusicEnabled);
    });
}

if (effectToggleBtn) {
    effectToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setEffectEnabled(!isEffectEnabled);
    });
}

updateSoundUI();

// ==========================================
// 9. Lazy Loading & Start Screen Logic
// ==========================================
const loadingScreen = document.getElementById('loading-screen');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

// Listener for the main start button
startBtn.addEventListener('click', () => {
    initAudio(); // Initialize audio context and play music

    // Fade out the start screen
    startScreen.classList.add('fade-out');

    // After the fade-out animation, hide the start screen
    setTimeout(() => {
        startScreen.style.display = 'none';
    }, 1000); // Match animation duration

    // Add the 'game-started' class to the body to trigger the fade-in of the main content
    document.body.classList.add('game-started');

    // Now that the user has interacted and the main experience has begun,
    // load the non-critical assets in the background.
    loadNonCriticalAssets();
}, { once: true });


const criticalImageAssets = [
    ...imgBg, imgIsland, imgHeroIdle, imgHeroWalk, imgAbout, imgWish, imgLightTree, imgLightReindeer
];

const criticalAudioFiles = {
    coin: 'assets/Free pack/Confirm 1.wav',
    meow: 'assets/Free pack/Cat_Meow.wav',
    bubble: 'assets/Free pack/Bubble 1.wav',
    confirm: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_FEEDBACK_Woom.wav',
    wishOpen: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_InGameMenu_Open.wav',
    bgMusic: 'assets/Free pack/Week 26 - Seaside CORAL REEF.ogg', // Move bgMusic to critical assets
};

function loadSpecificAudio(files) {
    const promises = [];
    for (const key in files) {
        const promise = loadAudio(files[key]).then(buffer => {
            audioBuffers[key] = buffer;
        }).catch(error => console.error(`Failed to load audio: ${key}`, error));
        promises.push(promise);
    }
    return promises;
}

function checkCriticalAssetsReady() {
    const imagePromises = criticalImageAssets.map(img => {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = resolve; // Resolve even on error to not block loading
            }
        });
    });

    const audioPromises = loadSpecificAudio(criticalAudioFiles);

    Promise.all([...imagePromises, ...Object.values(audioPromises)]).then(() => {
        // Critical assets are loaded, hide loading screen and show start screen
        loadingScreen.style.display = 'none';
        startScreen.classList.remove('hidden');
        startScreen.style.display = 'flex';
    }).catch(error => {
        console.error("Error loading critical assets:", error);
        // Even if assets fail, hide loading and show start screen to not get stuck
        loadingScreen.style.display = 'none';
        startScreen.classList.remove('hidden');
        startScreen.style.display = 'flex';
    });
}

function loadNonCriticalAssets() {
    // Load non-critical images
    const nonCriticalImageAssets = [
        imgSkills, imgProj, imgContact, imgSideTreeLeft,
        imgSideTreeRight, imgSideTreeFarRight, imgProjTreeLeft, imgProjTreeRight,
        imgContactTreeLeft, imgContactTreeRight, imgSnowFill, imgStreetlight,
        ...imgSnowAnim, imgFruit, imgCoin, imgOrangeCat
    ];
    nonCriticalImageAssets.forEach(img => {
        if (!img.src) return; // Skip if no src is set
        const tempImg = new Image();
        tempImg.src = img.src;
    });

    // Load non-critical audio
    const nonCriticalAudioFiles = {
        orangeCat: 'assets/Free pack/stu9-cute-cat-352656.mp3',
        projectSelect: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_FEEDBACK_Woop.wav',
        tabSwitch: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_MENU_Hover.wav',
        letterOpen: 'assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_InGameMenu_Load.wav'
    };
    
    // No need to call playBgMusic here anymore, it's handled by the start button.
    loadSpecificAudio(nonCriticalAudioFiles);
}

checkCriticalAssetsReady();
 