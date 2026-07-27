/**
 * Утилиты для игры "Самоцветный маяк"
 */

/**
 * Генератор случайных чисел
 * @param {number} max - Максимальное значение (не включительно)
 * @returns {number} Случайное целое число от 0 до max-1
 */
export const rand = (max) => Math.floor(Math.random() * max);

/**
 * Задержка выполнения
 * @param {number} ms - Время задержки в миллисекундах
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Форматирование числа с разделителями тысяч
 * @param {number} n - Число для форматирования
 * @returns {string} Отформатированная строка
 */
export const fmt = (n) => n.toLocaleString('ru-RU');

/**
 * Получение элемента по ID
 * @param {string} id - ID элемента
 * @returns {HTMLElement|null} Элемент или null
 */
export const $ = (id) => document.getElementById(id);

/**
 * Проверка активности Telegram WebApp
 * @returns {boolean} true если запущено в Telegram
 */
export const isTelegram = () => !!window.Telegram?.WebApp?.initData;

/**
 * Инициализация Telegram WebApp
 */
export function initTelegram() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#07131f');
      tg.setBackgroundColor('#07131f');
    } catch (e) {
      console.warn('Telegram WebApp init error:', e);
    }
  }
}

/**
 * Тактильная отдача
 * @param {'light'|'medium'|'heavy'} pattern - Тип вибрации
 */
export function haptic(pattern = 'light') {
  // Telegram HapticFeedback
  if (window.Telegram?.WebApp?.HapticFeedback) {
    try {
      Telegram.WebApp.HapticFeedback.impactOccurred(pattern);
      return;
    } catch (e) {}
  }
  // Native Vibration API
  if (navigator.vibrate) {
    navigator.vibrate(pattern === 'medium' ? 22 : pattern === 'heavy' ? 40 : 12);
  }
}

/**
 * Создание SVG для камня
 * @param {number} type - Тип камня (0-5)
 * @returns {string} SVG строка
 */
export function createGemSVG(type) {
  const shapes = [
    'M50 4 L96 50 L50 96 L4 50 Z',
    'M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z',
    'M50 5 A45 45 0 1 1 49.9 5 Z',
    'M50 7 L93 82 Q50 99 7 82 Z',
    'M50 4 L61.8 35.8 L95.6 37.6 L69 59.4 L78.2 92 L50 73.4 L21.8 92 L31 59.4 L4.4 37.6 L38.2 35.8 Z',
    'M50 88 C22 67 7 47 13 31 C19 15 41 13 50 29 C59 13 81 15 87 31 C93 47 78 67 50 88 Z',
  ];
  return `<svg viewBox="0 0 100 100"><path d="${shapes[type]}" fill="url(#gg${type})" stroke="rgba(0,0,0,.28)" stroke-width="3"/><ellipse cx="38" cy="28" rx="22" ry="13" fill="url(#shine)" transform="rotate(-18 38 28)"/></svg>`;
}

/**
 * Создание SVG для радужной бомбы
 * @returns {string} SVG строка
 */
export function createRainbowSVG() {
  const colors = ['#ff5d7d', '#ffa62b', '#8bd448', '#38d1e0', '#5b8cff', '#ff7ad9'];
  const segments = colors.map((cl, i) => 
    `<path d="M50 50 L50 7 A43 43 0 0 1 87.2 28.5 Z" fill="${cl}" transform="rotate(${i * 60} 50 50)"/>`
  ).join('');
  return `<svg viewBox="0 0 100 100"><g class="rb-spin">${segments}</g><circle cx="50" cy="50" r="15" fill="#fff"/><circle cx="50" cy="50" r="15" fill="url(#shine)"/><circle cx="50" cy="50" r="7" fill="#ffd166"/></svg>`;
}

/**
 * SVG персонажа Клюв
 * @returns {string} SVG строка
 */
export function getKlavSVG() {
  return `<svg viewBox="0 0 100 100"><g class="k-body">
  <path d="M26 60 L6 52 L14 64 L4 70 L24 72 Z" fill="#c9d6e2"/>
  <ellipse cx="46" cy="64" rx="26" ry="19" fill="#f7fafc" stroke="#c9d6e2" stroke-width="2.5"/>
  <path d="M38 58 Q18 62 26 77 Q44 79 51 67 Z" fill="#b9c9d8"/>
  <circle cx="60" cy="38" r="16" fill="#f7fafc" stroke="#c9d6e2" stroke-width="2.5"/>
  <path d="M74 35 L89 39 L74 44 Z" fill="#ffa62b"/>
  <path class="k-beak2" d="M74 41 L86 48 L74 50 Z" fill="#e08a1e"/>
  <circle class="k-eye" cx="64" cy="34" r="2.8" fill="#16324a"/>
  <path class="k-eye-h" d="M60 35 Q64 30 68 35" stroke="#16324a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path class="k-eye-s" d="M60 33 Q64 36 68 34" stroke="#16324a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path class="k-brow" d="M58 27 L70 30" stroke="#16324a" stroke-width="2.4" stroke-linecap="round"/>
  <circle class="k-tear" cx="67" cy="41" r="2.2" fill="#7fd4ff"/>
  <path d="M42 82 L42 92 M54 82 L54 92" stroke="#ffa62b" stroke-width="3.5" stroke-linecap="round"/></g></svg>`;
}

/**
 * Делится ли число нацело
 */
export const isDivisible = (n, divisor) => n % divisor === 0;
