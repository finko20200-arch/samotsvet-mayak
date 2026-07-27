/**
 * Аудио-система игры
 * Управление звуковыми эффектами через Web Audio API
 */

import { CONFIG } from '../../config/gameConfig.js';
import { storage } from '../core/storage.js';

class AudioManager {
  constructor() {
    this.audioContext = null;
  }

  /**
   * Получение или создание AudioContext
   */
  getContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * Воспроизведение тона
   * @param {number} freq - Частота в Гц
   * @param {number} duration - Длительность в секундах
   * @param {string} type - Тип волны (sine, triangle, sawtooth, square)
   * @param {number} gain - Громкость
   * @param {number} when - Задержка перед началом (сек)
   */
  playTone(freq, duration, type = 'sine', gain = CONFIG.AUDIO.DEFAULT_GAIN, when = 0) {
    if (storage.getData()?.muted) return;
    
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const time = ctx.currentTime + when;

      oscillator.type = type;
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(gain, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

      oscillator.connect(gainNode).connect(ctx.destination);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.02);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Звуковой эффект
   * @param {string} type - Тип эффекта (swap, click, bad, match, rainbow, win, lose)
   * @param {number} combo - Множитель для комбо
   */
  playSFX(type, combo = 1) {
    const { FREQUENCIES } = CONFIG.AUDIO;
    
    switch (type) {
      case 'swap':
        this.playTone(FREQUENCIES.swap, 0.08, 'triangle', 0.12);
        break;
      case 'click':
        this.playTone(FREQUENCIES.click, 0.05, 'sine', 0.08);
        break;
      case 'bad':
        this.playTone(FREQUENCIES.bad[0], 0.18, 'sawtooth', 0.11);
        this.playTone(FREQUENCIES.bad[1], 0.22, 'sawtooth', 0.09, 0.08);
        break;
      case 'match':
        const baseFreq = FREQUENCIES.match_base * Math.pow(1.18, Math.min(combo, 8));
        this.playTone(baseFreq, 0.12, 'triangle', 0.18);
        this.playTone(baseFreq * 1.5, 0.14, 'sine', 0.13, 0.06);
        break;
      case 'rainbow':
        FREQUENCIES.rainbow.forEach((freq, i) => {
          this.playTone(freq, 0.14, 'triangle', 0.14, i * 0.05);
        });
        break;
      case 'win':
        FREQUENCIES.win.forEach((freq, i) => {
          this.playTone(freq, 0.24, 'triangle', 0.16, i * 0.09);
        });
        break;
      case 'lose':
        FREQUENCIES.lose.forEach((freq, i) => {
          this.playTone(freq, 0.26, 'sine', 0.14, i * 0.13);
        });
        break;
    }
  }

  /**
   * Переключение звука
   */
  toggleMute() {
    const data = storage.getData();
    if (data) {
      data.muted = !data.muted;
      storage.save();
      return data.muted;
    }
    return false;
  }

  /**
   * Проверка состояния звука
   */
  isMuted() {
    return storage.getData()?.muted ?? false;
  }
}

// Singleton экземпляр
export const audioManager = new AudioManager();
