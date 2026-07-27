/**
 * Система хранения данных игры
 * Инкапсулирует работу с localStorage и управление состоянием
 */

import { CONFIG } from '../../config/gameConfig.js';

class StorageManager {
  constructor() {
    this.data = null;
    this.storageKey = 'lighthouse_save';
  }

  /**
   * Загрузка сохранённых данных
   */
  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      this.data = saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Storage load error:', e);
      this.data = null;
    }

    // Инициализация данных по умолчанию
    const defaults = {
      unlocked: 1,
      stars: {},
      best: {},
      lives: CONFIG.MAX_LIVES,
      lastLife: Date.now(),
      cards: [],
      total: 0,
      muted: false,
      finale: false,
    };

    this.data = Object.assign(defaults, this.data || {});

    // Регенерация жизней
    if (this.data.lives < CONFIG.MAX_LIVES) {
      const elapsed = Date.now() - this.data.lastLife;
      const add = Math.floor(elapsed / CONFIG.LIFE_REGEN_MS);
      if (add > 0) {
        this.data.lives = Math.min(CONFIG.MAX_LIVES, this.data.lives + add);
        this.data.lastLife = this.data.lives >= CONFIG.MAX_LIVES
          ? Date.now()
          : this.data.lastLife + add * CONFIG.LIFE_REGEN_MS;
      }
    }

    this.save();
    return this.data;
  }

  /**
   * Сохранение данных
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  /**
   * Получение данных
   */
  getData() {
    return this.data;
  }

  /**
   * Обновление отдельного поля
   */
  update(field, value) {
    if (field in this.data) {
      this.data[field] = value;
      this.save();
    }
  }

  /**
   * Потратить жизнь
   * @returns {number} Оставшееся количество жизней
   */
  spendLife() {
    const was = this.data.lives;
    this.data.lives = Math.max(0, this.data.lives - 1);
    if (was === CONFIG.MAX_LIVES) {
      this.data.lastLife = Date.now();
    }
    this.save();
    return this.data.lives;
  }

  /**
   * Добавить жизнь
   */
  addLife(count = 1) {
    this.data.lives = Math.min(CONFIG.MAX_LIVES, this.data.lives + count);
    if (this.data.lives === CONFIG.MAX_LIVES) {
      this.data.lastLife = Date.now();
    }
    this.save();
    return this.data.lives;
  }

  /**
   * Получить время до следующей жизни
   * @returns {string|null} Форматированное время или null если жизни полные
   */
  getRegenTime() {
    if (this.data.lives >= CONFIG.MAX_LIVES) return null;
    const ms = Math.max(0, CONFIG.LIFE_REGEN_MS - (Date.now() - this.data.lastLife));
    const minutes = Math.floor(ms / 60000);
    const seconds = String(Math.floor(ms / 1000 % 60)).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  /**
   * Проверка прохождения главы
   */
  isChapterComplete(chapter) {
    const start = (chapter - 1) * 10 + 1;
    const end = chapter * 10;
    for (let i = start; i <= end; i++) {
      if (!this.data.stars[i]) return false;
    }
    return true;
  }
}

// Singleton экземпляр
export const storage = new StorageManager();
