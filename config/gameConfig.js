/**
 * Конфигурация игры "Самоцветный маяк"
 * Все балансные параметры вынесены в один файл
 */

export const CONFIG = {
  // Сетка
  COLS: 8,
  ROWS: 8,
  
  // Жизни
  MAX_LIVES: 5,
  LIFE_REGEN_MS: 10 * 60 * 1000, // 10 минут
  
  // Анимации (мс)
  ANIM: {
    SWAP: 260,
    POP: 250,
    DROP_BASE: 140,
    DROP_PER_ROW: 55,
    SHAKE: 340,
    SPAWN: 480,
    ENTRANCE: 1250,
    IDLE_HINT: 6000,
    HINT_SHOW: 2600,
    TOAST: 2100,
    COMBO_BANNER: 980,
    PARTICLE: 480,
    CONFETTI: 950,
  },
  
  // Звуки
  AUDIO: {
    DEFAULT_GAIN: 0.15,
    FREQUENCIES: {
      swap: 340,
      click: 620,
      bad: [160, 120],
      match_base: 330,
      rainbow: [440, 660, 880, 1100],
      win: [523, 659, 784, 1047],
      lose: [400, 330, 262, 196],
    },
  },
  
  // Формы камней (SVG paths)
  GEM_SHAPES: [
    'M50 4 L96 50 L50 96 L4 50 Z', // ромб
    'M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z', // пятиугольник
    'M50 5 A45 45 0 1 1 49.9 5 Z', // круг
    'M50 7 L93 82 Q50 99 7 82 Z', // капля
    'M50 4 L61.8 35.8 L95.6 37.6 L69 59.4 L78.2 92 L50 73.4 L21.8 92 L31 59.4 L4.4 37.6 L38.2 35.8 Z', // звезда
    'M50 88 C22 67 7 47 13 31 C19 15 41 13 50 29 C59 13 81 15 87 31 C93 47 78 67 50 88 Z', // сердце
  ],
  
  // Цвета камней (градиенты определены в CSS)
  GEM_COLORS: ['#ff5d7d', '#ffa62b', '#8bd448', '#38d1e0', '#5b8cff', '#ff7ad9'],
  
  // Названия глав
  CHAPTER_NAMES: ['Первый свет', 'Туманная галерея', 'Штормовая вахта'],
  
  // Уровни сложности
  HARD_LEVELS: [4, 8, 10, 14, 18, 20, 24, 28, 30],
  EASY_LEVELS: [5, 9, 15, 19, 25, 29],
  
  // Баланс ходов
  MOVES: {
    HARD: 16,
    EASY: 24,
    NORMAL: 20,
  },
  
  // Баланс очков
  SCORE: {
    BASE: 550,
    PER_LEVEL: 95,
    HARD_MULTIPLIER: 1.15,
    EASY_MULTIPLIER: 0.8,
    ROUND_TO: 50,
  },
  
  // Комбо тексты
  COMBO_TEXTS: {
    2: 'КОМБО ×2!',
    3: '×3! ОГОНЬ!',
    4: '×4! ШТОРМ!',
    5: '×5! МАЯК ГОРИТ!',
  },
  
  // Открытки
  CARDS: [
    {
      after: 10,
      title: 'Открытка №1 · Машинное отделение',
      stamp: 3,
      text: 'Внучок! Если читаешь — значит, нижний этаж снова светит и корабли видят берег. Ключ от машинного отделения я спрятал у чаек. Не верь туману — он врёшь.',
    },
    {
      after: 20,
      title: 'Открытка №2 · Туманная галерея',
      stamp: 0,
      text: 'Туман всё гуще, но твой свет режет его насквозь. Ночью прошла шхуна — я слышал её гудок. Ищи меня там, где кончается тёплое течение.',
    },
    {
      after: 30,
      title: 'Открытка №3 · Самый верх',
      stamp: 1,
      text: 'Ты зажёг маяк до самой верхотуры. Гляди на горизонт — видишь лодку? Это я уже гребу домой. Ставь самовар.',
    },
  ],
  
  // Цены в Stars
  PRICES: {
    LIVES_FULL: 50,
    MOVES_BONUS: 25,
  },
};

/**
 * Генерация конфигурации уровней
 */
export function generateLevels() {
  const levels = [];
  for (let i = 1; i <= 30; i++) {
    const chapter = Math.ceil(i / 10);
    const colors = chapter === 1 ? (i <= 4 ? 4 : 5) : chapter === 2 ? 5 : 6;
    
    let moves = CONFIG.MOVES.NORMAL;
    if (CONFIG.HARD_LEVELS.includes(i)) {
      moves = CONFIG.MOVES.HARD;
    } else if (CONFIG.EASY_LEVELS.includes(i)) {
      moves = CONFIG.MOVES.EASY;
    }
    
    let target = CONFIG.SCORE.BASE + i * CONFIG.SCORE.PER_LEVEL;
    if (CONFIG.HARD_LEVELS.includes(i)) {
      target *= CONFIG.SCORE.HARD_MULTIPLIER;
    } else if (CONFIG.EASY_LEVELS.includes(i)) {
      target *= CONFIG.SCORE.EASY_MULTIPLIER;
    }
    target = Math.round(target / CONFIG.SCORE.ROUND_TO) * CONFIG.SCORE.ROUND_TO;
    
    levels.push({
      n: i,
      colors,
      moves,
      target,
      chapter,
    });
  }
  return levels;
}

export const LEVELS = generateLevels();
