/**
 * Система параллакс-фона и атмосферных эффектов
 * Многослойная анимация, звёзды, облака, волны
 */

import { CONFIG } from '../../config/gameConfig.js';
import { rand } from '../../utils/helpers.js';

/**
 * Создание звёздного неба с параллаксом
 * @param {HTMLElement} container - контейнер для звёзд
 */
export function createStarrySky(container) {
  if (!container) return;
  
  container.innerHTML = '';
  
  // Три слоя звёзд для параллакса
  const layers = [
    { count: 25, sizeMin: 1, sizeMax: 2, speedMin: 15, speedMax: 25, opacity: 0.3 },
    { count: 35, sizeMin: 1.5, sizeMax: 3, speedMin: 25, speedMax: 40, opacity: 0.6 },
    { count: 20, sizeMin: 2, sizeMax: 4, speedMin: 40, speedMax: 60, opacity: 0.9 },
  ];
  
  layers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i++) {
      const star = document.createElement('div');
      star.className = 'star-layer-' + layerIndex;
      
      const size = layer.sizeMin + rand(layer.sizeMax - layer.sizeMin);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = rand(100) + '%';
      star.style.top = rand(100) + '%';
      star.style.opacity = layer.opacity + rand(0.2);
      star.style.borderRadius = rand(2) === 0 ? '50%' : '2px';
      
      // Анимация мерцания с разной скоростью
      const twinkleDuration = 2 + rand(3);
      const twinkleDelay = rand(4);
      star.style.animation = `twinkle ${twinkleDuration}s ease-in-out infinite ${twinkleDelay}s`;
      
      container.appendChild(star);
    }
  });
  
  // Добавляем несколько "падающих" звёзд
  createShootingStars(container);
}

/**
 * Падающие звёзды
 */
function createShootingStars(container) {
  const count = 2;
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const shooter = document.createElement('div');
      shooter.className = 'shooting-star';
      
      const top = 10 + rand(40);
      const left = 50 + rand(40);
      const duration = 1.5 + rand(1);
      
      shooter.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: 3px;
        height: 3px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 8px 2px rgba(255,255,255,0.6), 
                    -20px 0 12px 1px rgba(255,255,255,0.3),
                    -40px 0 8px 0.5px rgba(255,255,255,0.2);
        animation: shoot ${duration}s linear infinite ${rand(10)}s;
        z-index: 1;
      `;
      
      container.appendChild(shooter);
    }, i * 5000);
  }
}

/**
 * Создание облаков с параллаксом
 * @param {HTMLElement} container - контейнер для облаков
 */
export function createClouds(container) {
  if (!container) return;
  
  container.innerHTML = '';
  
  const cloudCount = 4 + rand(3);
  
  for (let i = 0; i < cloudCount; i++) {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    
    const size = 60 + rand(80);
    const top = 5 + rand(30);
    const duration = 40 + rand(40);
    const delay = -rand(40);
    
    cloud.style.cssText = `
      position: absolute;
      top: ${top}%;
      left: ${-size}px;
      width: ${size}px;
      height: ${size * 0.6}px;
      background: radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%);
      border-radius: 50%;
      filter: blur(8px);
      animation: cloudFloat ${duration}s linear infinite ${delay}s;
      pointer-events: none;
      z-index: 2;
    `;
    
    container.appendChild(cloud);
  }
}

/**
 * Анимированные волны моря с пеной
 * @param {HTMLElement} container - контейнер для волн
 */
export function createAnimatedWaves(container) {
  if (!container) return;
  
  // Удаляем старые волны если есть
  container.querySelectorAll('.wave-layer').forEach(w => w.remove());
  
  const waveLayers = 4;
  
  for (let i = 0; i < waveLayers; i++) {
    const wave = document.createElement('div');
    wave.className = 'wave-layer';
    
    const depth = i / waveLayers;
    const speed = 8 + i * 3;
    const opacity = 0.3 + depth * 0.4;
    const size = 30 + i * 15;
    
    wave.style.cssText = `
      position: absolute;
      bottom: ${i * 8}px;
      left: 0;
      width: 200%;
      height: ${size}px;
      background: repeating-radial-gradient(
        circle at 15px 0,
        rgba(56, 209, 224, ${opacity}) 0px,
        rgba(56, 209, 224, ${opacity}) 14px,
        transparent 15px,
        transparent ${size}px
      );
      background-size: ${size * 2}px ${size}px;
      animation: waveScroll ${speed}s linear infinite ${i % 2 === 0 ? '' : 'reverse'};
      pointer-events: none;
      z-index: ${10 + i};
    `;
    
    container.appendChild(wave);
  }
  
  // Добавляем пену на гребнях волн
  createWaveFoam(container);
}

/**
 * Пена на волнах
 */
function createWaveFoam(container) {
  const foamCount = 15;
  
  for (let i = 0; i < foamCount; i++) {
    const foam = document.createElement('div');
    foam.className = 'wave-foam';
    
    const left = rand(100);
    const bottom = 20 + rand(40);
    const size = 4 + rand(8);
    const duration = 3 + rand(4);
    
    foam.style.cssText = `
      position: absolute;
      left: ${left}%;
      bottom: ${bottom}%;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      filter: blur(1px);
      animation: foamBubble ${duration}s ease-in-out infinite ${rand(3)}s;
      pointer-events: none;
      z-index: 15;
    `;
    
    container.appendChild(foam);
  }
}

/**
 * Светлячки вокруг маяка
 * @param {HTMLElement} container - контейнер
 */
export function createFireflies(container) {
  if (!container) return;
  
  const fireflyCount = 12;
  
  for (let i = 0; i < fireflyCount; i++) {
    const firefly = document.createElement('div');
    firefly.className = 'firefly';
    
    const size = 2 + rand(3);
    const duration = 4 + rand(4);
    const delay = rand(4);
    
    // Случайная траектория
    const startX = rand(100);
    const startY = rand(100);
    const moveX = rand(60) - 30;
    const moveY = rand(60) - 30;
    
    firefly.style.cssText = `
      position: absolute;
      left: ${startX}%;
      top: ${startY}%;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #ffd166 0%, transparent 70%);
      border-radius: 50%;
      box-shadow: 0 0 8px 2px rgba(255, 209, 102, 0.6);
      animation: fireflyFloat ${duration}s ease-in-out infinite ${delay}s;
      --move-x: ${moveX}px;
      --move-y: ${moveY}px;
      pointer-events: none;
      z-index: 20;
    `;
    
    container.appendChild(firefly);
  }
}

/**
 * Луч маяка с динамическим освещением
 * @param {HTMLElement} beamEl - элемент луча
 * @param {HTMLElement} coreEl - элемент ядра
 */
export function animateLighthouseBeam(beamEl, coreEl) {
  if (!beamEl || !coreEl) return;
  
  // Пульсация ядра
  coreEl.style.animation = 'corePulse 3s ease-in-out infinite';
  
  // Вращение луча
  let angle = -30;
  let direction = 1;
  
  function rotate() {
    angle += direction * 0.3;
    if (angle > 30 || angle < -30) direction *= -1;
    
    beamEl.style.transform = `rotate(${angle}deg)`;
    
    // Динамическая прозрачность в зависимости от угла
    const intensity = Math.cos((angle + 30) * Math.PI / 60);
    beamEl.style.opacity = 0.3 + intensity * 0.4;
    
    requestAnimationFrame(rotate);
  }
  
  rotate();
}

/**
 * Инициализация всех фоновых эффектов
 * @param {Object} selectors - объект с селекторами элементов
 */
export function initBackgroundEffects(selectors) {
  const { skyContainer, seaContainer, lighthouseBeam, lighthouseCore } = selectors;
  
  createStarrySky(skyContainer);
  createClouds(skyContainer);
  createAnimatedWaves(seaContainer);
  createFireflies(skyContainer);
  
  if (lighthouseBeam && lighthouseCore) {
    animateLighthouseBeam(lighthouseBeam, lighthouseCore);
  }
}

/**
 * Параллакс-эффект при движении мыши/гироскопе
 * @param {HTMLElement} container - контейнер сцены
 */
export function enableParallax(container) {
  if (!container) return;
  
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  
  // Обработка движения мыши
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    targetX = x * 20;
    targetY = y * 10;
  });
  
  // Обработка гироскопа (для мобильных)
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma && e.beta) {
        targetX = Math.max(-20, Math.min(20, e.gamma));
        targetY = Math.max(-15, Math.min(15, e.beta - 45));
      }
    });
  }
  
  // Плавная анимация
  function animate() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    
    container.style.transform = `translate(${currentX * 0.5}px, ${currentY * 0.5}px)`;
    
    // Слои с разным параллаксом
    container.querySelectorAll('.star-layer-0').forEach(el => {
      el.style.transform = `translate(${-currentX * 0.3}px, ${-currentY * 0.3}px)`;
    });
    container.querySelectorAll('.star-layer-1').forEach(el => {
      el.style.transform = `translate(${-currentX * 0.6}px, ${-currentY * 0.6}px)`;
    });
    container.querySelectorAll('.star-layer-2').forEach(el => {
      el.style.transform = `translate(${-currentX * 0.9}px, ${-currentY * 0.9}px)`;
    });
    container.querySelectorAll('.cloud').forEach(el => {
      el.style.transform = `translate(${-currentX * 1.2}px, ${-currentY * 0.8}px)`;
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}
