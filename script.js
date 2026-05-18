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

// ==========================================
// 3. 四大交互点地标建筑配置
// ==========================================
const interactiveObjects = [
    { id: 'about', name: '农场邮箱', angle: 0, w: 350, h: 450, img: imgAbout, emoji: '📬', color: '#b97235' },
    { id: null, name: '圣诞树', angle: 0.35, w: 200, h: 250, img: imgLightTree, emoji: '🎄', color: '#3a5f25' },
    { id: null, name: '驯鹿', angle: 0.5, w: 100, h: 170, img: imgLightReindeer, emoji: '🦌', color: '#b97235' },
    { id: null, name: '左侧树', angle: Math.PI / 2 - 0.25, w: 80, h: 80, img: imgSideTreeLeft, emoji: '🌲', color: '#3a5f25' },
    { id: 'skills', name: '神秘古树', angle: Math.PI / 2, w: 350, h: 450, img: imgSkills, emoji: '🌲', color: '#3a5f25' },
    { id: null, name: '右侧树', angle: Math.PI / 2 + 0.25, w: 100, h: 100, img: imgSideTreeRight, emoji: '🌲', color: '#3a5f25' },
    { id: null, name: '极右侧树', angle: Math.PI / 2 + 0.4, w: 165, h: 100, img: imgSideTreeFarRight, emoji: '🌲', color: '#3a5f25' },
    { id: null, name: 'Project左侧树', angle: Math.PI - 0.25, w: 250, h: 300, img: imgProjTreeLeft, emoji: '🌲', color: '#3a5f25', y_offset: 5 },
    { id: 'projects', name: '储物木箱', angle: Math.PI, w: 350, h: 450, img: imgProj, emoji: '📦', color: '#d3a034' },
    { id: null, name: 'Contact左侧树', angle: (3 * Math.PI) / 2 - 0.2, w: 80, h: 80, img: imgContactTreeLeft, emoji: '🌲', color: '#3a5f25' },
    { id: 'contact', name: '日常公告栏', angle: (3 * Math.PI) / 2, w: 350, h: 450, img: imgContact, emoji: '🎣', color: '#4d7298' },
    { id: null, name: 'Contact右侧树', angle: (3 * Math.PI) / 2 + 0.25, w: 150, h: 70, img: imgContactTreeRight, emoji: '🌲', color: '#3a5f25' }
];

// ==========================================
// 4. 键盘输入监听逻辑
// ==========================================
const keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in keys || e.key in keys) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys || e.key in keys) keys[e.key] = false; });

let nearObject = null;

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
    } else {
        player.squashX = 1;
        player.squashY = 1 + Math.sin(now * 0.003) * 0.03; // 待机呼吸
    }

    // 建筑物距离检测 (判断相对于玩家顶点的夹角距离，加入取模以支持环绕)
    nearObject = null;
    interactiveObjects.forEach(obj => {
        if (!obj.id) return; // 忽略装饰性物件
        let angleDiff = (obj.angle + worldAngle) % (Math.PI * 2);
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        const dist = Math.abs(angleDiff) * GLOBE_RADIUS;
        if (dist < 60) { nearObject = obj; }
    });

    document.getElementById('interaction-prompt').style.display = nearObject ? 'block' : 'none';
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
        ctx.save();
        ctx.rotate(obj.angle);
        const y_offset = (obj.y_offset || 0) + 5;
        const objY = -GLOBE_RADIUS - obj.h + 20 + y_offset; // +20 让地基稍微陷进草地中，更贴合
        
        if (obj.img.complete && obj.img.naturalWidth !== 0) {
            ctx.drawImage(obj.img, -obj.w/2, objY, obj.w, obj.h);
        } else {
            // 备用像素黑框方块
            ctx.fillStyle = '#421f06';
            ctx.fillRect(-obj.w/2 - 4, objY - 4, obj.w + 8, obj.h + 8);
            ctx.fillStyle = obj.color;
            ctx.fillRect(-obj.w/2, objY, obj.w, obj.h);
            ctx.fillStyle = '#fffdf9';
            ctx.font = '30px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(obj.emoji, 0, objY + obj.h/2 + 10);
        }
        ctx.restore();
    });

    ctx.restore(); // 结束旋转变换

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
const modalData = {
    about: `<h2 class="text-4xl font-bold text-[#9e331f] mb-3">ABOUT ME 📬</h2><p class="text-xl">你好，我是 Makayla Liang！一个在商科与数学世界里修炼的产品设计师。我很擅长平衡冰冷的数据指标与温暖的用户交互体验。顺便一说，农场里还养了一只叫 Jujubee 的仓鼠！🐹</p>`,
    skills: `<h2 class="text-4xl font-bold text-[#3a5f25] mb-3">SKILLS TREE 🌲</h2><p class="text-xl">🎨 产品设计：Figma 精密原型、用户体验旅程、视觉规范建模<br>📊 数据策略：Python (Pandas), A/B测试与统计推断, 数字化 ESG 可持续供应链追踪模型</p>`,
    projects: `<h2 class="text-4xl font-bold text-[#b97235] mb-3">PROJECTS 📦</h2><p class="text-xl"><strong>调味品供应链数字化可追溯系统原型</strong><br>深度结合了 ESG 标记标准与严谨的用户界面设计，为传统供应线提供强有力的可持续透明追溯方案。</p>`,
    contact: `<h2 class="text-4xl font-bold text-[#4d7298] mb-3">CONTACT 🎣</h2><p class="text-xl">欢迎点击上方卡片或在下方留言！期待将我的数据与设计技能带入你的全新关卡中！合作愉快！</p>`
};

const overlay = document.getElementById('modal-overlay');
const body = document.getElementById('modal-body');

function openModal(id) {
    body.innerHTML = modalData[id];
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
}
function closeModal() {
    overlay.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 200);
}

// 监听空格触发近身弹窗
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && nearObject) {
        // 阻止网页按空格产生默认向下滚动的行为
        e.preventDefault(); 
        openModal(nearObject.id);
    }
});
document.getElementById('modal-close').addEventListener('click', closeModal);

// ==========================================
// 7. 背景音乐交互播放逻辑
// ==========================================
let bgMusicPlayed = false;
const bgMusic = document.getElementById('bg-music');

function playBgMusic() {
    if (!bgMusicPlayed && bgMusic) {
        bgMusic.play().catch(err => console.log("Audio autoplay prevented:", err));
        bgMusicPlayed = true;
    }
}

// 任意键盘或点击都会触发背景音乐
window.addEventListener('keydown', playBgMusic);
window.addEventListener('click', playBgMusic);
window.addEventListener('touchstart', playBgMusic);