/**
 * Конфигурация уровней с препятствиями и целями
 * Формат препятствий:
 * - 'ice': лёд (разбивается соседним матчем)
 * - 'box': ящик (требует 2 попаданий)
 * - 'grass': трава (требует матча на клетке)
 * - 'chain': замок (требует 3 попаданий)
 * - 'rock': скала (неразрушима)
 */

export const LEVELS = [
  // Уровни 1-5: Обучение
  {
    id: 1,
    moves: 15,
    targetScore: 1000,
    targetGems: null,
    obstacles: [], // Нет препятствий
    goal: "Набери 1000 очков"
  },
  {
    id: 2,
    moves: 18,
    targetScore: 1500,
    targetGems: null,
    obstacles: [],
    goal: "Набери 1500 очков"
  },
  {
    id: 3,
    moves: 20,
    targetScore: 2000,
    targetGems: { red: 10, blue: 10 },
    obstacles: [],
    goal: "Собери 10 красных и 10 синих"
  },
  {
    id: 4,
    moves: 22,
    targetScore: 2500,
    targetGems: null,
    obstacles: [
      { row: 2, col: 2, type: 'ice' },
      { row: 2, col: 3, type: 'ice' },
      { row: 3, col: 2, type: 'ice' }
    ],
    goal: "Разбей лёд!"
  },
  {
    id: 5,
    moves: 25,
    targetScore: 3000,
    targetGems: { green: 15 },
    obstacles: [
      { row: 1, col: 1, type: 'grass' },
      { row: 1, col: 5, type: 'grass' },
      { row: 5, col: 1, type: 'grass' },
      { row: 5, col: 5, type: 'grass' }
    ],
    goal: "Собери 15 зелёных и убери траву"
  },

  // Уровни 6-10: Ящики и комбинации
  {
    id: 6,
    moves: 20,
    targetScore: 3500,
    targetGems: null,
    obstacles: [
      { row: 2, col: 2, type: 'box' },
      { row: 2, col: 4, type: 'box' },
      { row: 4, col: 2, type: 'box' },
      { row: 4, col: 4, type: 'box' }
    ],
    goal: "Разбей ящики!"
  },
  {
    id: 7,
    moves: 25,
    targetScore: 4000,
    targetGems: { yellow: 20, purple: 15 },
    obstacles: [
      { row: 3, col: 0, type: 'ice' },
      { row: 3, col: 1, type: 'ice' },
      { row: 3, col: 2, type: 'box' },
      { row: 3, col: 3, type: 'ice' },
      { row: 3, col: 4, type: 'ice' }
    ],
    goal: "Собери камни и разбей препятствия"
  },
  {
    id: 8,
    moves: 22,
    targetScore: 4500,
    targetGems: null,
    obstacles: [
      { row: 1, col: 2, type: 'chain' },
      { row: 1, col: 3, type: 'chain' },
      { row: 2, col: 2, type: 'chain' },
      { row: 2, col: 3, type: 'chain' }
    ],
    goal: "Сломай замки!"
  },
  {
    id: 9,
    moves: 28,
    targetScore: 5000,
    targetGems: { red: 25, blue: 25 },
    obstacles: [
      { row: 0, col: 0, type: 'box' },
      { row: 0, col: 6, type: 'box' },
      { row: 6, col: 0, type: 'box' },
      { row: 6, col: 6, type: 'box' },
      { row: 3, col: 3, type: 'chain' }
    ],
    goal: "Собери камни и убери все препятствия"
  },
  {
    id: 10,
    moves: 30,
    targetScore: 6000,
    targetGems: null,
    obstacles: [
      { row: 2, col: 1, type: 'ice' },
      { row: 2, col: 2, type: 'box' },
      { row: 2, col: 3, type: 'ice' },
      { row: 3, col: 1, type: 'box' },
      { row: 3, col: 2, type: 'chain' },
      { row: 3, col: 3, type: 'box' },
      { row: 4, col: 1, type: 'ice' },
      { row: 4, col: 2, type: 'box' },
      { row: 4, col: 3, type: 'ice' }
    ],
    goal: "Босс-уровень: Очисти центр!"
  },

  // Уровни 11-15: Скалы и сложные комбинации
  {
    id: 11,
    moves: 25,
    targetScore: 6500,
    targetGems: { green: 30 },
    obstacles: [
      { row: 0, col: 2, type: 'rock' },
      { row: 0, col: 3, type: 'rock' },
      { row: 0, col: 4, type: 'rock' },
      { row: 1, col: 2, type: 'ice' },
      { row: 1, col: 3, type: 'box' },
      { row: 1, col: 4, type: 'ice' }
    ],
    goal: "Собери 30 зелёных вокруг скал"
  },
  {
    id: 12,
    moves: 30,
    targetScore: 7000,
    targetGems: null,
    obstacles: [
      { row: 1, col: 0, type: 'grass' },
      { row: 1, col: 1, type: 'grass' },
      { row: 1, col: 5, type: 'grass' },
      { row: 1, col: 6, type: 'grass' },
      { row: 5, col: 0, type: 'grass' },
      { row: 5, col: 1, type: 'grass' },
      { row: 5, col: 5, type: 'grass' },
      { row: 5, col: 6, type: 'grass' },
      { row: 3, col: 3, type: 'chain' }
    ],
    goal: "Очисти углы и центр"
  },
  {
    id: 13,
    moves: 28,
    targetScore: 7500,
    targetGems: { yellow: 35, purple: 30 },
    obstacles: [
      { row: 2, col: 2, type: 'box' },
      { row: 2, col: 3, type: 'box' },
      { row: 2, col: 4, type: 'box' },
      { row: 3, col: 2, type: 'box' },
      { row: 3, col: 3, type: 'chain' },
      { row: 3, col: 4, type: 'box' },
      { row: 4, col: 2, type: 'box' },
      { row: 4, col: 3, type: 'box' },
      { row: 4, col: 4, type: 'box' }
    ],
    goal: "Разбей коробку с замком внутри"
  },
  {
    id: 14,
    moves: 32,
    targetScore: 8000,
    targetGems: null,
    obstacles: [
      { row: 0, col: 1, type: 'rock' },
      { row: 0, col: 5, type: 'rock' },
      { row: 1, col: 0, type: 'ice' },
      { row: 1, col: 2, type: 'ice' },
      { row: 1, col: 4, type: 'ice' },
      { row: 1, col: 6, type: 'ice' },
      { row: 2, col: 1, type: 'box' },
      { row: 2, col: 3, type: 'chain' },
      { row: 2, col: 5, type: 'box' }
    ],
    goal: "Сложная головоломка"
  },
  {
    id: 15,
    moves: 35,
    targetScore: 9000,
    targetGems: { red: 40, blue: 40, green: 40 },
    obstacles: [
      { row: 0, col: 3, type: 'rock' },
      { row: 1, col: 2, type: 'chain' },
      { row: 1, col: 3, type: 'chain' },
      { row: 1, col: 4, type: 'chain' },
      { row: 2, col: 1, type: 'box' },
      { row: 2, col: 2, type: 'box' },
      { row: 2, col: 3, type: 'box' },
      { row: 2, col: 4, type: 'box' },
      { row: 2, col: 5, type: 'box' },
      { row: 3, col: 0, type: 'grass' },
      { row: 3, col: 6, type: 'grass' }
    ],
    goal: "Полу-финал: Собери всё!"
  },

  // Уровни 16-20: Мастерство
  {
    id: 16,
    moves: 30,
    targetScore: 9500,
    targetGems: null,
    obstacles: [
      { row: 1, col: 1, type: 'rock' },
      { row: 1, col: 5, type: 'rock' },
      { row: 2, col: 0, type: 'chain' },
      { row: 2, col: 2, type: 'chain' },
      { row: 2, col: 4, type: 'chain' },
      { row: 2, col: 6, type: 'chain' },
      { row: 3, col: 1, type: 'box' },
      { row: 3, col: 3, type: 'box' },
      { row: 3, col: 5, type: 'box' },
      { row: 4, col: 2, type: 'ice' },
      { row: 4, col: 4, type: 'ice' }
    ],
    goal: "Лабиринт из препятствий"
  },
  {
    id: 17,
    moves: 33,
    targetScore: 10000,
    targetGems: { yellow: 45, purple: 45 },
    obstacles: [
      { row: 0, col: 2, type: 'rock' },
      { row: 0, col: 4, type: 'rock' },
      { row: 1, col: 1, type: 'chain' },
      { row: 1, col: 3, type: 'chain' },
      { row: 1, col: 5, type: 'chain' },
      { row: 2, col: 0, type: 'box' },
      { row: 2, col: 2, type: 'box' },
      { row: 2, col: 4, type: 'box' },
      { row: 2, col: 6, type: 'box' },
      { row: 3, col: 1, type: 'grass' },
      { row: 3, col: 3, type: 'grass' },
      { row: 3, col: 5, type: 'grass' }
    ],
    goal: "Шахматный порядок"
  },
  {
    id: 18,
    moves: 35,
    targetScore: 11000,
    targetGems: null,
    obstacles: [
      { row: 0, col: 0, type: 'rock' },
      { row: 0, col: 6, type: 'rock' },
      { row: 1, col: 1, type: 'rock' },
      { row: 1, col: 5, type: 'rock' },
      { row: 2, col: 2, type: 'rock' },
      { row: 2, col: 4, type: 'rock' },
      { row: 3, col: 3, type: 'chain' },
      { row: 4, col: 2, type: 'box' },
      { row: 4, col: 4, type: 'box' },
      { row: 5, col: 1, type: 'ice' },
      { row: 5, col: 5, type: 'ice' }
    ],
    goal: "Пирамида препятствий"
  },
  {
    id: 19,
    moves: 38,
    targetScore: 12000,
    targetGems: { red: 50, blue: 50, green: 50 },
    obstacles: [
      { row: 1, col: 2, type: 'chain' },
      { row: 1, col: 3, type: 'chain' },
      { row: 1, col: 4, type: 'chain' },
      { row: 2, col: 1, type: 'box' },
      { row: 2, col: 2, type: 'box' },
      { row: 2, col: 3, type: 'box' },
      { row: 2, col: 4, type: 'box' },
      { row: 2, col: 5, type: 'box' },
      { row: 3, col: 0, type: 'grass' },
      { row: 3, col: 1, type: 'grass' },
      { row: 3, col: 5, type: 'grass' },
      { row: 3, col: 6, type: 'grass' },
      { row: 4, col: 2, type: 'ice' },
      { row: 4, col: 3, type: 'ice' },
      { row: 4, col: 4, type: 'ice' }
    ],
    goal: "Стена препятствий"
  },
  {
    id: 20,
    moves: 40,
    targetScore: 13000,
    targetGems: null,
    obstacles: [
      { row: 0, col: 3, type: 'rock' },
      { row: 1, col: 2, type: 'rock' },
      { row: 1, col: 4, type: 'rock' },
      { row: 2, col: 1, type: 'rock' },
      { row: 2, col: 5, type: 'rock' },
      { row: 3, col: 0, type: 'chain' },
      { row: 3, col: 1, type: 'chain' },
      { row: 3, col: 2, type: 'chain' },
      { row: 3, col: 3, type: 'chain' },
      { row: 3, col: 4, type: 'chain' },
      { row: 3, col: 5, type: 'chain' },
      { row: 3, col: 6, type: 'chain' },
      { row: 4, col: 1, type: 'box' },
      { row: 4, col: 2, type: 'box' },
      { row: 4, col: 3, type: 'box' },
      { row: 4, col: 4, type: 'box' },
      { row: 4, col: 5, type: 'box' },
      { row: 5, col: 2, type: 'grass' },
      { row: 5, col: 3, type: 'grass' },
      { row: 5, col: 4, type: 'grass' }
    ],
    goal: "Финальный босс: Прорвись через всё!"
  }
];

// Уровни 21-30 можно добавить по аналогии с усложнением
export const TOTAL_LEVELS = 20;

/**
 * Получить конфигурацию уровня по ID
 */
export function getLevelConfig(levelId) {
  if (levelId < 1 || levelId > TOTAL_LEVELS) {
    return LEVELS[0]; // Возвращаем первый уровень как запасной
  }
  return LEVELS[levelId - 1];
}

/**
 * Получить следующую цель уровня
 */
export function getNextLevelGoal(levelId) {
  if (levelId >= TOTAL_LEVELS) {
    return "Вы прошли все уровни! 🏆";
  }
  const nextLevel = LEVELS[levelId];
  return nextLevel ? nextLevel.goal : "Следующий уровень";
}
