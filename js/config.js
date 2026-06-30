import { imgWish, imgAbout, imgLightTree, imgLightReindeer, imgCoin, imgSideTreeLeft, imgSkills, imgSideTreeRight, imgSideTreeFarRight, imgOrangeCat, imgProjTreeLeft, imgProj, imgProjTreeRight, imgContactTreeLeft, imgContact, imgFruit } from './assets.js';

export const playerConfig = {
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

export const worldConfig = {
    GLOBE_RADIUS: 840,
    GLOBE_CENTER_OFFSET: 600,
};

export const interactiveObjectsConfig = [
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