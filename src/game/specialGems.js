/**
 * Модуль специальных камней и бустеров
 * Обрабатывает создание, активацию и комбинирование спец-камней
 */

import { CONFIG } from '../../config/gameConfig.js';
import { playSound } from '../audio/sound.js';
import { createExplosionParticles, createSpecialEffect } from '../effects/particles.js';

// Типы специальных камней
export const SPECIAL_TYPES = {
    NONE: 0,
    HORIZONTAL: 1, // Взрывает ряд
    VERTICAL: 2,   // Взрывает колонку
    BOMB: 3,       // Взрывает 3x3
    RAINBOW: 4     // Убирает цвет
};

// Конфигурация эффектов
const BOOSTER_CONFIG = {
    [SPECIAL_TYPES.HORIZONTAL]: { color: '#ff4757', icon: '↔️', radius: 0, shape: 'line-h' },
    [SPECIAL_TYPES.VERTICAL]: { color: '#2ed573', icon: '↕️', radius: 0, shape: 'line-v' },
    [SPECIAL_TYPES.BOMB]: { color: '#ffa502', icon: '💣', radius: 1, shape: 'circle' },
    [SPECIAL_TYPES.RAINBOW]: { color: '#a55eea', icon: '🌈', radius: 0, shape: 'rainbow' }
};

/**
 * Проверка на создание специального камня при матче
 * @param {Array} matches - массив совпавших координат
 * @returns {Object|null} - тип спец-камня и координата создания, или null
 */
export function checkSpecialGemCreation(matches) {
    if (!matches || matches.length < 4) return null;

    const count = matches.length;
    
    // 5 в ряд -> Радужный камень (создаем в позиции последнего swapped камня, передадим извне)
    if (count >= 5) {
        return { type: SPECIAL_TYPES.RAINBOW, isRainbow: true };
    }

    // 4 в ряд -> Линейный (горизонтальный или вертикальный)
    if (count === 4) {
        const cols = new Set(matches.map(m => m.c));
        const rows = new Set(matches.map(m => m.r));

        if (cols.size === 4) {
            return { type: SPECIAL_TYPES.HORIZONTAL };
        } else if (rows.size === 4) {
            return { type: SPECIAL_TYPES.VERTICAL };
        }
        // Если форма "Г" или "Т" из 4 камней - рандомно горизонтальный или вертикальный
        return { type: Math.random() > 0.5 ? SPECIAL_TYPES.HORIZONTAL : SPECIAL_TYPES.VERTICAL };
    }

    // 5 в форме (не линия) -> Бомба (обычно обрабатывается логикой свопа, но здесь заглушка)
    // В базовой реализации 5 в линию уже ушло в Rainbow. 
    // Бомбу часто делают за "Г" или "Т" из 5, но для простоты пока оставим так.
    
    return null;
}

/**
 * Активация специального камня
 * @param {number} r - ряд
 * @param {number} c - колонка
 * @param {number} type - тип спец-камня
 * @param {number} gemColor - цвет камня (для радужного - это цель)
 * @param {Function} boardCallback - функция для манипуляции доской (getGem, removeGem, addGem)
 * @param {Function} effectCallback - функция для запуска эффектов
 */
export function activateSpecialGem(r, c, type, gemColor, boardCallback, effectCallback) {
    if (type === SPECIAL_TYPES.NONE) return [];

    let affectedCells = [];
    const boardSize = CONFIG.boardSize;

    playSound('boost');

    switch (type) {
        case SPECIAL_TYPES.HORIZONTAL:
            // Взрываем весь ряд
            for (let i = 0; i < boardSize; i++) {
                affectedCells.push({ r, c: i });
            }
            effectCallback('line', { r, c, direction: 'h' });
            break;

        case SPECIAL_TYPES.VERTICAL:
            // Взрываем всю колонку
            for (let i = 0; i < boardSize; i++) {
                affectedCells.push({ r: i, c });
            }
            effectCallback('line', { r, c, direction: 'v' });
            break;

        case SPECIAL_TYPES.BOMB:
            // Взрыв 3x3
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
                        affectedCells.push({ r: nr, c: nc });
                    }
                }
            }
            effectCallback('bomb', { r, c });
            break;

        case SPECIAL_TYPES.RAINBOW:
            // Уничтожение всех камней определенного цвета на доске
            // Цвет определяется камнем, с которым обменялись (передадим как аргумент targetColor если есть)
            // Если вызван сам по себе (редко), уничтожаем случайный цвет или самый частый
            let targetColor = gemColor; 
            
            // Логика радужного: если он свапнулся с обычным камнем, этот обычный исчезает везде
            // Эта логика должна вызываться в момент свапа. Здесь мы просто помечаем эффект.
            effectCallback('rainbow', { r, c, color: targetColor });
            
            // Реальное удаление произойдет в основном цикле, так как нужно знать целевой цвет
            // Возвращаем пустой массив, так как радужный камень работает глобально
            return []; 
    }

    return affectedCells;
}

/**
 * Обработка комбинации двух специальных камней при свапе
 * @param {Object} gem1 - первый камень
 * @param {Object} gem2 - второй камень
 * @returns {Object} - результат комбинации (тип взрыва и параметры)
 */
export function combineSpecialGems(gem1, gem2) {
    const t1 = gem1.specialType;
    const t2 = gem2.specialType;

    // Комбинация: Линейный + Линейный = Крест (два больших луча)
    if ((t1 === SPECIAL_TYPES.HORIZONTAL || t1 === SPECIAL_TYPES.VERTICAL) &&
        (t2 === SPECIAL_TYPES.HORIZONTAL || t2 === SPECIAL_TYPES.VERTICAL)) {
        return { type: 'CROSS', r1: gem1.r, c1: gem1.c, r2: gem2.r, c2: gem2.c };
    }

    // Комбинация: Линейный + Бомба = Огромная линия (3 ряда/колонки)
    if ((t1 === SPECIAL_TYPES.BOMB && (t2 === SPECIAL_TYPES.HORIZONTAL || t2 === SPECIAL_TYPES.VERTICAL)) ||
        ((t1 === SPECIAL_TYPES.HORIZONTAL || t1 === SPECIAL_TYPES.VERTICAL) && t2 === SPECIAL_TYPES.BOMB)) {
        
        const lineGem = t1 === SPECIAL_TYPES.BOMB ? gem2 : gem1;
        const bombPos = t1 === SPECIAL_TYPES.BOMB ? gem1 : gem2;
        
        return { type: 'MEGA_LINE', direction: lineGem.specialType === SPECIAL_TYPES.HORIZONTAL ? 'h' : 'v', pos: bombPos };
    }

    // Комбинация: Бомба + Бомба = Огромный взрыв (весь экран или 5x5)
    if (t1 === SPECIAL_TYPES.BOMB && t2 === SPECIAL_TYPES.BOMB) {
        return { type: 'MEGA_BOMB', r: gem1.r, c: gem1.c }; // Центр взрыва
    }

    // Комбинация: Радужный + Любой цвет = Уничтожение ВСЕХ камней этого цвета + они становятся бомбами
    if (t1 === SPECIAL_TYPES.RAINBOW || t2 === SPECIAL_TYPES.RAINBOW) {
        const rainbowGem = t1 === SPECIAL_TYPES.RAINBOW ? gem1 : gem2;
        const otherGem = t1 === SPECIAL_TYPES.RAINBOW ? gem2 : gem1;
        
        if (otherGem.specialType === SPECIAL_TYPES.NONE) {
            return { type: 'COLOR_BLAST', color: otherGem.color, makeBombs: true };
        }
        // Если радужный + спец, то уничтожаем все камни этого цвета без превращения (упрощенно)
        return { type: 'COLOR_BLAST', color: otherGem.color, makeBombs: false };
    }

    return null;
}

/**
 * Отрисовка специального камня на канвасе
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 * @param {number} y 
 * @param {number} size 
 * @param {number} type 
 * @param {number} color 
 */
export function drawSpecialGem(ctx, x, y, size, type, color) {
    const center = size / 2;
    const glow = 15;
    
    ctx.save();
    
    // Свечение
    ctx.shadowBlur = glow;
    ctx.shadowColor = BOOSTER_CONFIG[type].color;
    
    if (type === SPECIAL_TYPES.HORIZONTAL || type === SPECIAL_TYPES.VERTICAL) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (type === SPECIAL_TYPES.HORIZONTAL) {
            ctx.roundRect(x + 5, y + center - 8, size - 10, 16, 8);
        } else {
            ctx.roundRect(x + center - 8, y + 5, 16, size - 10, 8);
        }
        ctx.fill();
        
        // Стрелочки
        ctx.fillStyle = BOOSTER_CONFIG[type].color;
        ctx.font = `${size * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(BOOSTER_CONFIG[type].icon, x + center, y + center);
        
    } else if (type === SPECIAL_TYPES.BOMB) {
        // Рисуем бомбу
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + center, y + center, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // Фитиль
        ctx.strokeStyle = '#ffa502';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + center + 5, y + center - 10);
        ctx.quadraticCurveTo(x + center + 15, y + center - 20, x + center + 20, y + center - 15);
        ctx.stroke();
        
        // Искра
        if (Math.random() > 0.5) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + center + 20, y + center - 15, 3, 0, Math.PI * 2);
            ctx.fill();
        }

    } else if (type === SPECIAL_TYPES.RAINBOW) {
        // Радужный круг
        const gradient = ctx.createRadialGradient(x + center, y + center, 2, x + center, y + center, size/2);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.2, '#ff4757');
        gradient.addColorStop(0.4, '#ffa502');
        gradient.addColorStop(0.6, '#2ed573');
        gradient.addColorStop(0.8, '#1e90ff');
        gradient.addColorStop(1, '#a55eea');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + center, y + center, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Блик
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(x + center - 5, y + center - 5, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
