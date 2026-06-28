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

const coinSound = new Audio('assets/Free pack/Confirm 1.wav');
const meowSound = new Audio('assets/Free pack/Cat_Meow.wav');
const bubbleSound = new Audio('assets/Free pack/Bubble 1.wav');
const confirmSound = new Audio('assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_FEEDBACK_Woom.wav');
const wishOpenSound = new Audio('assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_InGameMenu_Open.wav');

// ==========================================
// 2. 全局状态与玩家配置
// ==========================================
const player = {
    width: 128,
    height: 128,
    speed: 7,
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

// ==========================================
// 3. 四大交互点地标建筑配置
// ==========================================
const interactiveObjects = [
    { id: 'wish', name: '许愿池', angle: -0.35, w: 530, h: 280, img: imgWish, emoji: '✨', color: '#ffb347' ,y_offset: 35},
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
    { id: null, name: 'Project左侧树', angle: Math.PI - 0.25, w: 250, h: 300, img: imgProjTreeLeft, emoji: '🌲', color: '#3a5f25', y_offset: 28 },
    { id: 'projects', name: '储物木箱', angle: Math.PI, w: 350, h: 450, img: imgProj, emoji: '📦', color: '#d3a034' },
    { id: null, name: 'Project右侧树', angle: Math.PI + 0.35, w: 235, h: 90, img: imgProjTreeRight, emoji: '🌲', color: '#3a5f25', y_offset: 5 },
    { id: null, name: 'Coin 3L', angle: 3.8, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 3', angle: 4.0, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 3R', angle: 4.2, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Contact左侧树', angle: (3 * Math.PI) / 2 - 0.2, w: 80, h: 80, img: imgContactTreeLeft, emoji: '🌲', color: '#3a5f25' },
    { id: 'contact', name: '日常公告栏', angle: (3 * Math.PI) / 2, w: 350, h: 450, img: imgContact, emoji: '🎣', color: '#4d7298' },
    { id: 'fruit', name: '神秘落果', angle: (3 * Math.PI) / 2 + 0.25, w: 132, h: 57, img: imgFruit, emoji: '🍓' },
    { id: null, name: 'Coin 4L', angle: 5.2, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 4', angle: 5.4, w: 50, h: 50, img: imgCoin, type: 'coin' },
    { id: null, name: 'Coin 4R', angle: 5.6, w: 50, h: 50, img: imgCoin, type: 'coin' },
];

// ==========================================
// 4. 键盘输入监听逻辑
// ==========================================
const keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys || e.key in keys) {
        keys[e.key] = true;
        markUserInteracted();
    }
});
window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys || e.key in keys) keys[e.key] = false; });
window.addEventListener('click', markUserInteracted, { once: false });
window.addEventListener('touchstart', markUserInteracted, { once: false });

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
    
    if (keys.a || keys.ArrowLeft) {
        worldAngle += angularSpeed;
        player.isMoving = true;
        player.facingRight = false;
    }
    if (keys.d || keys.ArrowRight) {
        worldAngle -= angularSpeed;
        player.isMoving = true;
        player.facingRight = true;
    }

    // 如果状态改变，重置帧动画
    if (wasMoving !== player.isMoving) {
        player.frameX = 0;
    }

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
                coinSound.cloneNode().play().catch(e => console.log("Audio play prevented:", e));
            } else if (obj.id) {
                nearObject = obj; // 只对有 id 的物体显示交互提示
            }
        }
    });

    const promptEl = document.getElementById('interaction-prompt');
    if (hasUserInteracted && nearObject) {
        if (nearObject.id === 'wish') {
            const allCoinsCollected = interactiveObjects.filter(obj => obj.type === 'coin').every(obj => obj.collected);
            promptEl.textContent = allCoinsCollected ? 'Make a Wish and Press [SPACE] ' : 'collect all the coins';
            promptEl.style.display = 'block';
        } else {
            promptEl.textContent = 'Press [SPACE] to Open';
            promptEl.style.display = 'block';
        }
    } else {
        promptEl.style.display = 'none';
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
        // 4 层云彩，从 1 到 4 视差速度逐渐增加
        const parallaxSpeeds = [0.02, 0.05, 0.1, 0.2];
        
        imgBg.forEach((img, index) => {
            const speed = parallaxSpeeds[index];
            const skyOffset = (worldAngle * GLOBE_RADIUS * speed) % canvas.width;
            
            ctx.drawImage(img, skyOffset, 0, canvas.width, canvas.height);
            if (skyOffset > 0) {
                ctx.drawImage(img, skyOffset - canvas.width, 0, canvas.width, canvas.height);
            } else {
                ctx.drawImage(img, skyOffset + canvas.width, 0, canvas.width, canvas.height);
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
        const y_offset = (obj.y_offset || 0) + 5;
        let objY = -GLOBE_RADIUS - obj.h + 20 + y_offset; // +20 让地基稍微陷进草地中，更贴合
        
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
                ctx.drawImage(obj.img, -obj.w/2, objY, obj.w, obj.h);
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
        skills: ['Python: pandas, numpy, matplotlib, pandasql', 'Notebook: Jupyter / ipykernel', 'Visualization: Power BI'],
        highlights: 'The project explores how smarter budget allocation and audience targeting can improve campaign efficiency and expected returns.'
    },
    {
        id: 'subscription-testing',
        title: 'FinTech Subscription Optimization via A/B Testing',
        description: 'This project evaluates the behavioral and financial impact of an optimized pricing page interface for a FinTech platform. Using a reproducible data pipeline, the analysis simulates user behavior, validates assumptions, performs statistical testing, and translates results into a revenue projection.',
        skills: ['Python 3', 'NumPy', 'Pandas', 'Seaborn', 'Matplotlib', 'Statsmodels', 'Jupyter Notebook'],
        highlights: 'The project combines statistical analysis with business impact modeling to assess pricing-page changes and forecast revenue outcomes.'
    },
    {
        id: 'portfolio-site',
        title: 'Interactive Portfolio Website',
        description: 'This portfolio website turns my background and projects into an interactive experience inspired by a cozy pixel-style farm world.',
        skills: ['HTML', 'CSS', 'JavaScript', 'UI Design'],
        highlights: 'The goal was to make complex information easy to explore while keeping the experience engaging.'
    },
    {
        id: 'telecom-churn',
        title: 'Telecom_Churn_Intelligence_Dashboard',
        description: 'This repository contains a robust, interactive Business Intelligence Dashboard built with Power BI, leveraging the Kaggle Telco Customer Churn dataset (7,043 records). By bridging mathematical rigor with strategic business administration, this project transforms raw operational data into actionable retention assets. The analysis is structured to provide both Global KPI Oversight for executives and Granular Risk Mitigation for product and marketing teams, aiming to identify systemic revenue leakage and deploy data-driven interventions.',
        skills: ['Power BI', 'Data Analysis', 'Business Strategy'],
        highlights: 'The dashboard focuses on customer retention insights, churn risk visibility, and executive-ready business recommendations.'
    }
];

const modalData = {
    about: `<h2 class="text-4xl font-bold text-[#9e331f] mb-3">ABOUT ME 📬</h2><p class="text-xl">Dedicated BBA & Mathematics double degree student at Wilfrid Laurier University and University of Waterloo, currently in my second year. I possess a strong foundation in quantitative analysis, Python programming, and strategic business frameworks, developed through systematic study of live case studies, economics, and advanced mathematics. Currently expanding my expertise in accounting, optimization theory, and statistics, while proactively mastering additional business skills independently. I am eager to leverage my interdisciplinary background to contribute to high-impact projects in Data & Analytics, Finance, Consulting, and Product Growth.</p>`,
    skills: `<h2 class="text-4xl font-bold text-[#3a5f25] mb-3">SKILLS TREE 🌲</h2><p class="text-xl">💻 Data Analytics & Programming: Python (Pandas, NumPy, Matplotlib), SQL</p>
                                                                                    <p class="text-xl">📊 Business Intelligence & Automation: Power BI, Microsoft Excel (VBA)</p>
                                                                                    <p class="text-xl">🧠 Core Competencies: Critical Thinking, Data-Driven Problem Solving, Quantitative Analysis</p>`,
    projects: `<h2 class="text-4xl font-bold text-[#b97235] mb-3">PROJECTS 📦</h2>`,
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

        detailEl.innerHTML = `
            <h3 class="text-3xl font-bold text-[#9e331f] mb-2">${project.title}</h3>
            <p class="text-xl mb-3">${project.description}</p>
            <h4 class="text-2xl font-bold mb-2">Skills</h4>
            <div class="flex flex-wrap gap-2 mb-3">
                ${project.skills.map(skill => `<span class="project-skill-tag">${skill}</span>`).join('')}
            </div>
            <p class="text-lg opacity-90">${project.highlights}</p>
            ${project.id === 'subscription-testing' ? '<a href="https://github.com/jiajialiang32-ui/ABtesting" target="_blank" rel="noopener noreferrer" class="project-link-btn">View GitHub Project</a>' : ''}
            ${project.id === 'roi-analysis' ? '<a href="https://github.com/jiajialiang32-ui/roi-project" target="_blank" rel="noopener noreferrer" class="project-link-btn">View GitHub Project</a>' : ''}
            ${project.id === 'telecom-churn' ? '<a href="https://github.com/jiajialiang32-ui/Telecom_Churn_Intelligence_Dashboard" target="_blank" rel="noopener noreferrer" class="project-link-btn">View GitHub Project</a>' : ''}
        `;
    }

    projectButtons.forEach(button => {
        button.addEventListener('click', () => {
            showProject(button.dataset.project);
            const projectSelectSound = new Audio('assets/Free pack/lolurio Free Cozy Game UI SFX Pack/WAV/UI SFX_FEEDBACK_Woop.wav');
            projectSelectSound.play().catch(() => {});
        });
    });

    showProject(projectData[0].id);
}

function openModal(id) {
    if (id === 'projects') {
        renderProjectsModal();
    } else {
        body.innerHTML = modalData[id];
    }
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
}
function closeModal() {
    confirmSound.currentTime = 0;
    confirmSound.play().catch(e => console.error("Audio play prevented:", e));
    overlay.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 200);
}

// 监听空格触发近身弹窗
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && nearObject) {
        // 阻止网页按空格产生默认向下滚动的行为
        e.preventDefault(); 
        if (nearObject.id === 'wish') {
            const allCoinsCollected = interactiveObjects.filter(obj => obj.type === 'coin').every(obj => obj.collected);
            if (allCoinsCollected) {
                meowSound.currentTime = 0;
                meowSound.play().catch(e => console.error("Audio play prevented:", e));
                
                wishOpenSound.currentTime = 0;
                wishOpenSound.play().catch(e => console.error("Audio play prevented:", e));
                
                if (!nearObject.hasWished) {
                    const wishMessages = [
                        "The wishing well has sensed your coin. It wants to whisper to you: You've been doing so well lately. Make sure to treat yourself to a delicious drink today.",
                        "The ripples fading across the water will wash away all your anxiety. Try going to bed half an hour early tonight, and sweet dreams!",
                        "No matter how today went, the wishing well will always be here waiting for you. Tomorrow is a brand new day!",
                        "Coin tossed successfully! I have a feeling that every traffic light you hit today will turn green just for you.",
                        "The coin has found its coziest spot at the bottom, sharing its luck with you: there's a good chance you won't have to wait in line for coffee today!",
                        "Your luck index is off the charts today! If there's something you've been hesitating about, why not just go for it today?"
                    ];
                    const randomMsg = wishMessages[Math.floor(Math.random() * wishMessages.length)];
                    modalData['wish'] = `<h2 class="text-4xl font-bold text-[#ffb347] mb-3">WISH ✨</h2><p class="text-xl">${randomMsg}</p>`;
                    nearObject.hasWished = true;
                }
                
                openModal(nearObject.id);
            }
        } else {
            bubbleSound.currentTime = 0;
            bubbleSound.play().catch(e => console.error("Audio play prevented:", e));
            openModal(nearObject.id);
        }
    }
});
document.getElementById('modal-close').addEventListener('click', closeModal);

// ==========================================
// 7. 背景音乐交互播放逻辑
// ==========================================
let bgMusicPlayed = false;
const bgMusic = document.getElementById('bg-music');
let isMusicEnabled = true;
let isEffectEnabled = true;

function playBgMusic() {
    if (!bgMusicPlayed && isMusicEnabled && bgMusic) {
        bgMusic.play().catch(err => console.log("Audio autoplay prevented:", err));
        bgMusicPlayed = true;
    }
}

// 任意键盘或点击都会触发背景音乐
window.addEventListener('keydown', playBgMusic);
window.addEventListener('click', playBgMusic);
window.addEventListener('touchstart', playBgMusic);

// ==========================================
// 8. 声音控制菜单逻辑
// ==========================================
const soundBtn = document.getElementById('sound-btn');
const soundMenu = document.getElementById('sound-menu');
const musicToggleBtn = document.getElementById('music-toggle');
const effectToggleBtn = document.getElementById('effect-toggle');
const effectSounds = [coinSound, meowSound, bubbleSound, confirmSound, wishOpenSound];

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
    if (bgMusic) {
        if (enabled) {
            if (bgMusicPlayed) {
                bgMusic.play().catch(err => console.log("Audio play prevented:", err));
            }
        } else {
            bgMusic.pause();
        }
    }
    updateSoundUI();
}

function setEffectEnabled(enabled) {
    isEffectEnabled = enabled;
    effectSounds.forEach(audio => {
        if (audio) {
            audio.muted = !enabled;
        }
    });
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