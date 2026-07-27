/**
 * Система достижений и ежедневных наград
 * Для удержания игроков и мотивации
 */

import { CONFIG } from '../../config/gameConfig.js';
import { storage } from '../core/storage.js';

/**
 * Список достижений
 */
export const ACHIEVEMENTS = [
  {
    id: 'first_win',
    title: 'Первый свет',
    description: 'Пройти первый уровень',
    icon: '🔦',
    condition: (data) => data.stars[1] > 0,
    reward: { type: 'stars', amount: 10 },
  },
  {
    id: 'combo_master',
    title: 'Комбо-мастер',
    description: 'Сделать комбо x5',
    icon: '🔥',
    condition: (data) => data.maxCombo >= 5,
    reward: { type: 'stars', amount: 25 },
  },
  {
    id: 'chapter_1_complete',
    title: 'Первые шаги',
    description: 'Пройти главу 1 полностью',
    icon: '📖',
    condition: (data) => data.unlocked > 10,
    reward: { type: 'stars', amount: 50 },
  },
  {
    id: 'chapter_2_complete',
    title: 'Опытный хранитель',
    description: 'Пройти главу 2 полностью',
    icon: '🌊',
    condition: (data) => data.unlocked > 20,
    reward: { type: 'stars', amount: 75 },
  },
  {
    id: 'game_complete',
    title: 'Маяк зажжён',
    description: 'Пройти всю игру',
    icon: '🏆',
    condition: (data) => data.finale === true,
    reward: { type: 'stars', amount: 200 },
  },
  {
    id: 'daily_streak_3',
    title: 'Три дня подряд',
    description: 'Заходить в игру 3 дня подряд',
    icon: '📅',
    condition: (data) => data.dailyStreak >= 3,
    reward: { type: 'stars', amount: 30 },
  },
  {
    id: 'daily_streak_7',
    title: 'Недельная серия',
    description: 'Заходить в игру 7 дней подряд',
    icon: '⭐',
    condition: (data) => data.dailyStreak >= 7,
    reward: { type: 'stars', amount: 100 },
  },
  {
    id: 'score_1000',
    title: 'Тысячник',
    description: 'Набрать 1000 очков за уровень',
    icon: '💎',
    condition: (data) => data.maxScore >= 1000,
    reward: { type: 'stars', amount: 40 },
  },
  {
    id: 'perfect_level',
    title: 'Идеальная игра',
    description: 'Пройти уровень с 3 звёздами и запасом 10+ ходов',
    icon: '✨',
    condition: (data) => data.perfectLevels >= 1,
    reward: { type: 'stars', amount: 50 },
  },
];

/**
 * Ежедневные награды
 */
export const DAILY_REWARDS = [
  { day: 1, reward: { type: 'lives', amount: 1 }, icon: '❤️' },
  { day: 2, reward: { type: 'stars', amount: 10 }, icon: '⭐' },
  { day: 3, reward: { type: 'lives', amount: 2 }, icon: '❤️❤️' },
  { day: 4, reward: { type: 'stars', amount: 20 }, icon: '⭐⭐' },
  { day: 5, reward: { type: 'moves', amount: 5 }, icon: '⚡' },
  { day: 6, reward: { type: 'stars', amount: 30 }, icon: '⭐⭐⭐' },
  { day: 7, reward: { type: 'lives', amount: 5 }, icon: '💖' },
];

/**
 * Проверка и выдача достижений
 * @returns {Array} новые полученные достижения
 */
export function checkAchievements() {
  const data = storage.getData();
  const newAchievements = [];
  
  if (!data.achievements) {
    data.achievements = [];
  }
  
  ACHIEVEMENTS.forEach(ach => {
    if (!data.achievements.includes(ach.id) && ach.condition(data)) {
      data.achievements.push(ach.id);
      newAchievements.push(ach);
      
      // Выдача награды
      grantReward(ach.reward);
    }
  });
  
  if (newAchievements.length > 0) {
    storage.save();
  }
  
  return newAchievements;
}

/**
 * Выдача награды
 * @param {Object} reward - объект награды
 */
function grantReward(reward) {
  const data = storage.getData();
  
  switch (reward.type) {
    case 'stars':
      // Stars добавляются в общий счёт
      data.total += reward.amount;
      break;
    case 'lives':
      data.lives = Math.min(CONFIG.MAX_LIVES, data.lives + reward.amount);
      break;
    case 'moves':
      // Бонусные ходы для следующего уровня
      data.bonusMoves = (data.bonusMoves || 0) + reward.amount;
      break;
  }
  
  storage.save();
}

/**
 * Проверка ежедневной награды
 * @returns {Object|null} доступная награда или null
 */
export function checkDailyReward() {
  const data = storage.getData();
  const today = new Date().toDateString();
  
  // Проверка streak (серии)
  if (data.lastDailyVisit !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (data.lastDailyVisit !== yesterday) {
      // Серия прервалась
      data.dailyStreak = 1;
    } else {
      // Продолжение серии
      data.dailyStreak = (data.dailyStreak || 0) + 1;
    }
    
    data.lastDailyVisit = today;
    storage.save();
  }
  
  // Проверка, получена ли награда сегодня
  if (data.dailyRewardClaimed !== today) {
    const dayIndex = Math.min((data.dailyStreak || 1) - 1, DAILY_REWARDS.length - 1);
    return {
      day: data.dailyStreak,
      ...DAILY_REWARDS[dayIndex],
    };
  }
  
  return null;
}

/**
 * Получение ежедневной награды
 * @returns {Object} полученная награда
 */
export function claimDailyReward() {
  const reward = checkDailyReward();
  
  if (!reward) {
    return null;
  }
  
  const data = storage.getData();
  data.dailyRewardClaimed = new Date().toDateString();
  
  // Выдача награды
  grantReward(reward.reward);
  storage.save();
  
  // Проверка достижений за серию
  checkAchievements();
  
  return reward;
}

/**
 * Обновление статистики игрока
 * @param {string} statType - тип статистики
 * @param {any} value - значение
 */
export function updatePlayerStat(statType, value) {
  const data = storage.getData();
  
  switch (statType) {
    case 'maxCombo':
      data.maxCombo = Math.max(data.maxCombo || 0, value);
      break;
    case 'maxScore':
      data.maxScore = Math.max(data.maxScore || 0, value);
      break;
    case 'perfectLevels':
      data.perfectLevels = (data.perfectLevels || 0) + 1;
      break;
    case 'totalMatches':
      data.totalMatches = (data.totalMatches || 0) + value;
      break;
    case 'totalMoves':
      data.totalMoves = (data.totalMoves || 0) + value;
      break;
  }
  
  storage.save();
  checkAchievements();
}

/**
 * Получение списка всех достижений с прогрессом
 * @returns {Array} массив достижений
 */
export function getAchievementsList() {
  const data = storage.getData();
  const achieved = data.achievements || [];
  
  return ACHIEVEMENTS.map(ach => ({
    ...ach,
    unlocked: achieved.includes(ach.id),
  }));
}

/**
 * Сброс прогресса достижений (для тестирования)
 */
export function resetAchievements() {
  const data = storage.getData();
  data.achievements = [];
  data.maxCombo = 0;
  data.maxScore = 0;
  data.perfectLevels = 0;
  data.dailyStreak = 0;
  data.dailyRewardClaimed = null;
  storage.save();
}
