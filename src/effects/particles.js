/**
 * Система эффектов для игры "Самоцветный маяк"
 * Частицы, всплывающий текст, анимации экрана
 */

import { CONFIG } from '../../config/gameConfig.js';
import { rand } from '../../utils/helpers.js';

/**
 * Создание системы частиц для камня
 * @param {number} row - ряд камня
 * @param {number} col - колонка камня
 * @param {number} type - тип камня (цвет)
 * @param {HTMLElement} fxContainer - контейнер эффектов
 * @param {number} cellSize - размер клетки
 */
export function particlesAt(row, col, type, fxContainer, cellSize) {
  const particleCount = 8 + rand(6);
  const colors = CONFIG.GEM_COLORS;
  const baseColor = colors[type] || '#ffffff';
  
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    
    // Случайный размер и форма
    const size = 6 + rand(6);
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.borderRadius = rand(2) === 0 ? '50%' : (rand(2) === 0 ? '3px' : '0');
    
    // Цвет с вариацией
    if (rand(3) === 0) {
      p.style.background = '#ffd166'; // искры
    } else if (rand(4) === 0) {
      p.style.background = '#ffffff'; // блики
    } else {
      p.style.background = baseColor;
    }
    
    // Позиция старта (центр клетки)
    const startX = col * cellSize + cellSize / 2;
    const startY = row * cellSize + cellSize / 2;
    p.style.left = startX + 'px';
    p.style.top = startY + 'px';
    
    // Случайное направление разлёта
    const angle = (Math.PI * 2 * i) / particleCount + rand(10) * 0.1;
    const speed = 40 + rand(80);
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed + 60; // гравитация вниз
    
    fxContainer.appendChild(p);
    
    // Анимация через Web Animations API
    const animation = p.animate([
      { 
        transform: `translate(0, 0) scale(1) rotate(0deg)`,
        opacity: 1 
      },
      { 
        transform: `translate(${dx}px, ${dy}px) scale(0.3) rotate(${rand(720)}deg)`,
        opacity: 0 
      }
    ], {
      duration: CONFIG.ANIM.PARTICLE + rand(200),
      easing: 'cubic-bezier(.2,.7,.4,1)'
    });
    
    animation.onfinish = () => p.remove();
  }
}

/**
 * Всплывающий текст очков
 * @param {string} text - текст для отображения
 * @param {number} row - ряд
 * @param {number} col - колонка
 * @param {number} combo - множитель комбо
 * @param {HTMLElement} fxContainer - контейнер эффектов
 * @param {number} cellSize - размер клетки
 */
export function popup(text, row, col, combo, fxContainer, cellSize) {
  const el = document.createElement('div');
  el.className = 'score-popup' + (combo >= 2 ? ' big' : '');
  el.textContent = text;
  
  // Позиция над клеткой
  const x = col * cellSize + cellSize / 2;
  const y = row * cellSize;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  
  fxContainer.appendChild(el);
  
  // Анимация
  const animation = el.animate([
    { 
      transform: 'translate(-50%, -20px) scale(0.8)',
      opacity: 0 
    },
    { 
      transform: 'translate(-50%, -60px) scale(1.2)',
      opacity: 1,
      offset: 0.3
    },
    { 
      transform: 'translate(-50%, -120px) scale(1)',
      opacity: 0 
    }
  ], {
    duration: 900,
    easing: 'cubic-bezier(.2,.7,.4,1)'
  });
  
  animation.onfinish = () => el.remove();
}

/**
 * Баннер комбо
 * @param {number} combo - множитель комбо
 * @param {HTMLElement} boardEl - элемент доски
 */
export function comboBanner(combo, boardEl) {
  const texts = CONFIG.COMBO_TEXTS;
  const text = texts[combo] || `×${combo}!`;
  
  const el = document.createElement('div');
  el.className = 'combo-banner';
  el.textContent = text;
  
  boardEl.appendChild(el);
  
  // Автоудаление после анимации
  setTimeout(() => el.remove(), CONFIG.ANIM.COMBO_BANNER);
}

/**
 * Тряска экрана/рамки
 * @param {HTMLElement} frameEl - элемент рамки доски
 */
export function frameShake(frameEl) {
  frameEl.classList.add('shaking');
  setTimeout(() => frameEl.classList.remove('shaking'), CONFIG.ANIM.SHAKE);
}

/**
 * Реакция персонажа Клюв
 * @param {'happy'|'sad'|'win'|'idle'} mood - настроение
 * @param {HTMLElement} klavEl - элемент персонажа
 */
export function klavReact(mood, klavEl) {
  if (!klavEl) return;
  
  klavEl.className = `klav ${mood}`;
  
  if (mood !== 'sad') {
    clearTimeout(klavEl._t);
    klavEl._t = setTimeout(() => {
      klavEl.className = 'klav idle';
    }, 1500);
  }
}

/**
 * Конфетти при победе
 * @param {HTMLElement} fxContainer - контейнер эффектов
 * @param {number} width - ширина области
 * @param {number} height - высота области
 */
export function confetti(fxContainer, width, height) {
  const colors = CONFIG.GEM_COLORS;
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('i');
    p.className = 'particle';
    
    // Случайный цвет и размер
    p.style.background = colors[rand(colors.length)];
    p.style.width = (8 + rand(8)) + 'px';
    p.style.height = (8 + rand(8)) + 'px';
    p.style.borderRadius = rand(2) === 0 ? '50%' : (rand(2) === 0 ? '4px' : '0');
    
    // Старт сверху
    p.style.left = rand(width) + 'px';
    p.style.top = '-12px';
    
    fxContainer.appendChild(p);
    
    // Параметры падения
    const dx = (rand(140) - 70);
    const dy = height * (0.55 + rand(45) / 100);
    const rotation = rand(720);
    const duration = 950 + rand(650);
    
    const animation = p.animate([
      { 
        transform: `translate(0, 0) rotate(0deg)`,
        opacity: 1 
      },
      { 
        transform: `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`,
        opacity: 0 
      }
    ], {
      duration,
      easing: 'cubic-bezier(.2,.6,.4,1)'
    });
    
    animation.onfinish = () => p.remove();
  }
}

/**
 * Уведомление (toast)
 * @param {string} message - сообщение
 * @param {HTMLElement} toastEl - элемент toast
 * @param {number} duration - длительность показа (мс)
 */
export function showToast(message, toastEl, duration = CONFIG.ANIM.TOAST) {
  if (!toastEl) return;
  
  toastEl.textContent = message;
  toastEl.classList.add('show');
  
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

/**
 * Эффект свечения маяка
 * @param {HTMLElement} coreEl - элемент ядра лампы
 * @param {HTMLElement} beamEl - элемент луча
 */
export function lighthouseGlow(coreEl, beamEl) {
  if (!coreEl || !beamEl) return;
  
  // Пульсация ядра
  coreEl.style.transition = 'all 0.6s ease-in-out';
  coreEl.style.background = 'radial-gradient(#fff8e0, #ffd166)';
  coreEl.style.boxShadow = '0 0 26px #ffd166, 0 0 70px rgba(255,209,102,.7)';
  
  // Луч
  beamEl.style.opacity = '1';
  beamEl.style.animation = 'sweep 7s ease-in-out infinite alternate';
}
