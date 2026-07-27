/**
 * Модуль специальных камней и бустеров
 * Обрабатывает создание, активацию и комбинирование спец-камней
 */

import { CONFIG } from '../../config/gameConfig.js';
import { audioManager } from '../audio/sound.js';

// Типы специальных камней (строковые для удобства)
export const SPECIAL_TYPES = {
    H_BOMB: 'h-bomb',      // Взрывает ряд
    V_BOMB: 'v-bomb',      // Взрывает колонку  
    BOMB: 'bomb',          // Взрывает 3x3
    RAINBOW: 'rainbow'     // Убирает цвет
};

/**
 * Активация специального камня
 * @param {string} type - тип спец-камня
 * @param {number} r - ряд
 * @param {number} c - колонка
 * @param {number} rows - количество рядов
 * @param {number} cols - количество колонок
 * @returns {Array<string>} - массив координат "r,c" для удаления
 */
export function activateSpecialGem(type, r, c, rows, cols) {
    const affected = [];
    
    if (!type || type === 'none') return affected;

    switch (type) {
        case SPECIAL_TYPES.H_BOMB:
            // Взрываем весь ряд
            for (let col = 0; col < cols; col++) {
                affected.push(`${r},${col}`);
            }
            break;

        case SPECIAL_TYPES.V_BOMB:
            // Взрываем всю колонку
            for (let row = 0; row < rows; row++) {
                affected.push(`${row},${c}`);
            }
            break;

        case SPECIAL_TYPES.BOMB:
            // Взрыв 3x3
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        affected.push(`${nr},${nc}`);
                    }
                }
            }
            break;

        case SPECIAL_TYPES.RAINBOW:
            // Радужный камень обрабатывается отдельно в trySwap
            // Здесь возвращаем только сам камень
            affected.push(`${r},${c}`);
            break;
    }

    return affected;
}

/**
 * Комбинация двух спец-камней
 * @param {string} type1 - тип первого камня
 * @param {number} r1 - ряд первого
 * @param {number} c1 - колонка первого
 * @param {string} type2 - тип второго камня
 * @param {number} r2 - ряд второго
 * @param {number} c2 - колонка второго
 * @param {number} rows - количество рядов
 * @param {number} cols - количество колонок
 * @returns {Array<string>} - массив координат для удаления
 */
export function combineSpecialGems(type1, r1, c1, type2, r2, c2, rows, cols) {
    const affected = new Set();
    
    // Нормализуем типы (убираем comboType, берём базовый special)
    const t1 = type1;
    const t2 = type2;
    
    // Линейный + Линейный = КРЕСТ (горизонталь + вертикаль)
    if ((t1 === 'h-bomb' || t1 === 'v-bomb') && (t2 === 'h-bomb' || t2 === 'v-bomb')) {
        // Весь ряд + вся колонка
        for (let col = 0; col < cols; col++) {
            affected.add(`${r1},${col}`);
        }
        for (let row = 0; row < rows; row++) {
            affected.add(`${row},${c1}`);
        }
        return Array.from(affected);
    }
    
    // Бомба + Линейный = МЕГА-ЛИНИЯ (3 ряда или 3 колонки)
    if ((t1 === 'bomb' && (t2 === 'h-bomb' || t2 === 'v-bomb')) ||
        ((t1 === 'h-bomb' || t1 === 'v-bomb') && t2 === 'bomb')) {
        
        const lineType = t1 === 'bomb' ? t2 : t1;
        const centerR = t1 === 'bomb' ? r2 : r1;
        const centerC = t1 === 'bomb' ? c2 : c1;
        
        if (lineType === 'h-bomb') {
            // 3 горизонтальных ряда
            for (let dr = -1; dr <= 1; dr++) {
                const row = centerR + dr;
                if (row >= 0 && row < rows) {
                    for (let col = 0; col < cols; col++) {
                        affected.add(`${row},${col}`);
                    }
                }
            }
        } else {
            // 3 вертикальных колонки
            for (let dc = -1; dc <= 1; dc++) {
                const col = centerC + dc;
                if (col >= 0 && col < cols) {
                    for (let row = 0; row < rows; row++) {
                        affected.add(`${row},${col}`);
                    }
                }
            }
        }
        return Array.from(affected);
    }
    
    // Бомба + Бомба = МЕГА-ВЗРЫВ (весь экран)
    if (t1 === 'bomb' && t2 === 'bomb') {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                affected.add(`${row},${col}`);
            }
        }
        return Array.from(affected);
    }
    
    // Радужный + любой = обработка в trySwap (здесь не комбинируется)
    if (t1 === 'rainbow' || t2 === 'rainbow') {
        return [];
    }
    
    // По умолчанию - просто сумма эффектов
    const effect1 = activateSpecialGem(t1, r1, c1, rows, cols);
    const effect2 = activateSpecialGem(t2, r2, c2, rows, cols);
    return [...effect1, ...effect2];
}
