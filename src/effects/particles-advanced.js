/**
 * Улучшенная система частиц с новыми эффектами
 * Добавлены: искры, дым, взрывы, магические следы
 */

import { CONFIG } from '../../config/gameConfig.js';
import { rand } from '../../utils/helpers.js';

/**
 * Типы частиц
 */
export const PARTICLE_TYPES = {
  SPARK: 'spark',      // Искры
  SMOKE: 'smoke',      // Дым
  GEM_SHARD: 'shard',  // Осколки камней
  MAGIC: 'magic',      // Магические частицы
  CONFETTI: 'confetti',// Конфетти
  HEART: 'heart',      // Сердечки
  STAR: 'star',        // Звёзды
};

/**
 * Создание частицы с расширенными параметрами
 */
function createParticle(options) {
  const {
    type,
    x,
    y,
    color,
    size,
    vx,
    vy,
    rotation,
    rotationSpeed,
    duration,
    easing,
    fadeOut,
    container,
  } = options;
  
  const p = document.createElement('div');
  p.className = `particle particle-${type}`;
  
  // Базовые стили
  p.style.position = 'absolute';
  p.style.left = x + 'px';
  p.style.top = y + 'px';
  p.style.width = (size || 8) + 'px';
  p.style.height = (size || 8) + 'px';
  p.style.pointerEvents = 'none';
  p.style.zIndex = '30';
  
  // Стилизация по типу
  switch (type) {
    case PARTICLE_TYPES.SPARK:
      p.style.background = color || '#ffd166';
      p.style.borderRadius = '50%';
      p.style.boxShadow = `0 0 ${size}px ${color || '#ffd166'}`;
      break;
      
    case PARTICLE_TYPES.SMOKE:
      p.style.background = `rgba(200, 200, 200, 0.4)`;
      p.style.borderRadius = '50%';
      p.style.filter = 'blur(2px)';
      break;
      
    case PARTICLE_TYPES.GEM_SHARD:
      p.style.background = color || '#fff';
      p.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      break;
      
    case PARTICLE_TYPES.MAGIC:
      p.style.background = `radial-gradient(circle, ${color || '#fff'} 0%, transparent 70%)`;
      p.style.borderRadius = '50%';
      break;
      
    case PARTICLE_TYPES.CONFETTI:
      p.style.background = color || '#ff6b9d';
      p.style.transform = `rotate(${rotation || 0}deg)`;
      break;
      
    case PARTICLE_TYPES.HEART:
      p.innerHTML = '❤️';
      p.style.fontSize = (size || 12) + 'px';
      p.style.display = 'flex';
      p.style.alignItems = 'center';
      p.style.justifyContent = 'center';
      p.style.background = 'transparent';
      break;
      
    case PARTICLE_TYPES.STAR:
      p.innerHTML = '⭐';
      p.style.fontSize = (size || 12) + 'px';
      p.style.display = 'flex';
      p.style.alignItems = 'center';
      p.style.justifyContent = 'center';
      p.style.background = 'transparent';
      break;
  }
  
  container.appendChild(p);
  
  // Анимация
  const endX = x + (vx || 0);
  const endY = y + (vy || 0);
  const endRotation = (rotation || 0) + (rotationSpeed || 0);
  
  const keyframes = [
    {
      transform: `translate(0, 0) rotate(${rotation || 0}deg) scale(1)`,
      opacity: 1,
    },
    {
      transform: `translate(${endX - x}px, ${endY - y}px) rotate(${endRotation}deg) scale(${fadeOut ? 0.3 : 1})`,
      opacity: fadeOut ? 0 : 1,
    },
  ];
  
  const animation = p.animate(keyframes, {
    duration: duration || 500,
    easing: easing || 'cubic-bezier(.2,.7,.4,1)',
  });
  
  animation.onfinish = () => p.remove();
  
  return p;
}

/**
 * Взрыв частиц вокруг точки
 */
export function explode(options) {
  const {
    x,
    y,
    count = 12,
    type = PARTICLE_TYPES.GEM_SHARD,
    colors = ['#fff'],
    spread = 100,
    container,
  } = options;
  
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + rand(0.3);
    const speed = 30 + rand(spread);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed + 40; // гравитация
    
    const color = colors[rand(colors.length)];
    const size = 4 + rand(8);
    const duration = 400 + rand(300);
    
    const p = createParticle({
      type,
      x,
      y,
      color,
      size,
      vx,
      vy,
      rotation: rand(360),
      rotationSpeed: rand(720) - 360,
      duration,
      fadeOut: true,
      container,
    });
    
    particles.push(p);
  }
  
  return particles;
}

/**
 * След из частиц (для движения)
 */
export function trail(options) {
  const {
    startX,
    startY,
    endX,
    endY,
    count = 8,
    type = PARTICLE_TYPES.MAGIC,
    color = '#fff',
    container,
  } = options;
  
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t;
    
    setTimeout(() => {
      createParticle({
        type,
        x: x + rand(20) - 10,
        y: y + rand(20) - 10,
        color,
        size: 4 + rand(6),
        vx: rand(40) - 20,
        vy: rand(40) - 20,
        duration: 300 + rand(200),
        fadeOut: true,
        container,
      });
    }, i * 30);
  }
  
  return particles;
}

/**
 * Всплывающие сердечки (для бонусов)
 */
export function floatingHearts(x, y, container, count = 5) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createParticle({
        type: PARTICLE_TYPES.HEART,
        x: x + rand(40) - 20,
        y: y,
        size: 10 + rand(8),
        vx: rand(30) - 15,
        vy: -60 - rand(40),
        duration: 800 + rand(400),
        fadeOut: true,
        container,
      });
    }, i * 100);
  }
}

/**
 * Всплывающие звёзды (для достижений)
 */
export function floatingStars(x, y, container, count = 3) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createParticle({
        type: PARTICLE_TYPES.STAR,
        x: x + rand(30) - 15,
        y: y,
        size: 12 + rand(6),
        vx: rand(20) - 10,
        vy: -50 - rand(30),
        rotation: rand(360),
        rotationSpeed: rand(360) - 180,
        duration: 1000 + rand(500),
        fadeOut: true,
        container,
      });
    }, i * 150);
  }
}

/**
 * Искры от удара
 */
export function sparks(x, y, container, count = 15) {
  const colors = ['#ffd166', '#ffaa00', '#ffffff', '#ff6b57'];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.PI + rand(Math.PI); // вверх
    const speed = 50 + rand(100);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    createParticle({
      type: PARTICLE_TYPES.SPARK,
      x,
      y,
      color: colors[rand(colors.length)],
      size: 3 + rand(4),
      vx,
      vy,
      duration: 300 + rand(200),
      fadeOut: true,
      container,
    });
  }
}

/**
 * Дымный эффект
 */
export function smoke(x, y, container, count = 6) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createParticle({
        type: PARTICLE_TYPES.SMOKE,
        x: x + rand(20) - 10,
        y: y,
        size: 15 + rand(20),
        vx: rand(20) - 10,
        vy: -30 - rand(20),
        duration: 800 + rand(400),
        fadeOut: true,
        container,
      });
    }, i * 80);
  }
}

/**
 * Магический круг (для специальных камней)
 */
export function magicCircle(x, y, container, color = '#a855f7') {
  const ring = document.createElement('div');
  ring.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 10px;
    height: 10px;
    border: 3px solid ${color};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 10px ${color};
    pointer-events: none;
    z-index: 29;
  `;
  
  container.appendChild(ring);
  
  const animation = ring.animate([
    {
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 1,
    },
    {
      transform: 'translate(-50%, -50%) scale(4)',
      opacity: 0,
    },
  ], {
    duration: 600,
    easing: 'cubic-bezier(.2,.7,.4,1)',
  });
  
  animation.onfinish = () => ring.remove();
  
  // Добавляем частицы по кругу
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const px = x + Math.cos(angle) * 5;
    const py = y + Math.sin(angle) * 5;
    
    createParticle({
      type: PARTICLE_TYPES.MAGIC,
      x: px,
      y: py,
      color,
      size: 4,
      vx: Math.cos(angle) * 60,
      vy: Math.sin(angle) * 60,
      duration: 400,
      fadeOut: true,
      container,
    });
  }
  
  return ring;
}

/**
 * Эффект радужной бомбы
 */
export function rainbowExplosion(x, y, container) {
  const colors = CONFIG.GEM_COLORS;
  
  // Несколько волн частиц
  for (let wave = 0; wave < 3; wave++) {
    setTimeout(() => {
      const waveColors = colors.slice(wave % 2 === 0 ? 0 : 1);
      explode({
        x,
        y,
        count: 8,
        type: PARTICLE_TYPES.MAGIC,
        colors: waveColors,
        spread: 80 + wave * 30,
        container,
      });
    }, wave * 150);
  }
  
  // Центральная вспышка
  magicCircle(x, y, container, '#fff');
}
