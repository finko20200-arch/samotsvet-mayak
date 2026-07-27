/**
 * Модуль препятствий и объектов уровня
 * Обрабатывает лед, коробки, траву, замки и другие препятствия
 */

import { CONFIG } from '../../config/gameConfig.js';
import { audioManager } from '../audio/sound.js';

// Типы препятствий (строковые для удобства)
export const OBSTACLE_TYPES = {
    ICE: 'ice',        // Разбивается матчем рядом (1-2 удара)
    BOX: 'box',        // Разбивается матчем внутри или рядом (2-3 удара)
    GRASS: 'grass',    // Требует матча НА этой клетке (1 удар)
    CHAIN: 'chain',    // Замок, требует ключа или спец-камня
    ROCK: 'rock'       // Неразрушимый блок (только для ограничения пространства)
};

// Конфигурация препятствий
const OBSTACLE_CONFIG = {
    [OBSTACLE_TYPES.ICE]: { 
        hp: 1, 
        color: '#7efff5', 
        opacity: 0.6, 
        name: 'Лёд',
        icon: null 
    },
    [OBSTACLE_TYPES.BOX]: { 
        hp: 2, 
        color: '#e1b12c', 
        opacity: 1.0, 
        name: 'Ящик',
        icon: '📦'
    },
    [OBSTACLE_TYPES.GRASS]: { 
        hp: 1, 
        color: '#44bd32', 
        opacity: 0.8, 
        name: 'Трава',
        icon: '🌿'
    },
    [OBSTACLE_TYPES.CHAIN]: { 
        hp: 3, 
        color: '#a4b0be', 
        opacity: 1.0, 
        name: 'Замок',
        icon: '🔒'
    },
    [OBSTACLE_TYPES.ROCK]: { 
        hp: 999, 
        color: '#2f3542', 
        opacity: 1.0, 
        name: 'Скала',
        icon: '🪨'
    }
};

/**
 * Класс препятствия
 */
export class Obstacle {
    constructor(type, r, c, maxHp = null) {
        this.type = type;
        this.r = r;
        this.c = c;
        const config = OBSTACLE_CONFIG[type];
        this.maxHp = maxHp !== null ? maxHp : config.hp;
        this.hp = this.maxHp;
        this.isAnimating = false;
        this.shakeOffset = { x: 0, y: 0 };
    }

    /**
     * Получение урона
     * @param {number} damage - количество урона
     * @returns {boolean} - разрушено ли препятствие
     */
    hit(damage = 1) {
        if (this.type === OBSTACLE_TYPES.ROCK) return false; // Скала неразрушима

        this.hp -= damage;
        this.isAnimating = true;
        
        // Эффект тряски
        this.shakeOffset = { 
            x: (Math.random() - 0.5) * 10, 
            y: (Math.random() - 0.5) * 10 
        };
        
        setTimeout(() => {
            this.isAnimating = false;
            this.shakeOffset = { x: 0, y: 0 };
        }, 200);

        if (this.hp <= 0) {
            audioManager.playSFX('break');
            return true; // Разрушено
        }
        
        audioManager.playSFX('hit');
        return false;
    }

    /**
     * Проверка, блокирует ли препятствие клетку
     */
    blocksCell() {
        // Лёд и трава не блокируют, но требуют очистки
        // Ящик, замок и скала блокируют размещение камней
        return [OBSTACLE_TYPES.BOX, OBSTACLE_TYPES.CHAIN, OBSTACLE_TYPES.ROCK].includes(this.type);
    }

    /**
     * Проверка, требует ли препятствие матча на этой клетке
     */
    requiresMatchOnTop() {
        return this.type === OBSTACLE_TYPES.GRASS;
    }
}

/**
 * Менеджер препятствий уровня
 */
export class ObstacleManager {
    constructor() {
        this.obstacles = new Map(); // "r,c" -> Obstacle
    }

    /**
     * Загрузка препятствий для уровня
     * @param {Array} layout - массив конфигурации препятствий
     * @param {number} rows - количество рядов
     * @param {number} cols - количество колонок
     */
    loadLevel(layout, rows, cols) {
        this.obstacles.clear();
        
        if (!layout) return;
        
        layout.forEach(item => {
            const { r, c, type, hp } = item;
            const key = `${r},${c}`;
            this.obstacles.set(key, new Obstacle(type, r, c, hp));
        });
    }

    /**
     * Очистка всех препятствий
     */
    clear() {
        this.obstacles.clear();
    }

    /**
     * Получение препятствия в клетке
     * @param {number} r - ряд
     * @param {number} c - колонка
     * @returns {Obstacle|undefined}
     */
    get(r, c) {
        return this.obstacles.get(`${r},${c}`);
    }

    /**
     * Удаление препятствия
     * @param {number} r - ряд
     * @param {number} c - колонка
     */
    remove(r, c) {
        this.obstacles.delete(`${r},${c}`);
    }

    /**
     * Нанесение урона препятствию
     * @param {number} r - ряд
     * @param {number} c - колонка
     * @param {number} damage - урон
     * @returns {boolean} - разрушено ли
     */
    hit(r, c, damage = 1) {
        const obstacle = this.obstacles.get(`${r},${c}`);
        if (!obstacle) return false;
        return obstacle.hit(damage);
    }

    /**
     * Проверка наличия препятствия в клетке
     * @param {number} r - ряд
     * @param {number} c - колонка
     * @returns {boolean}
     */
    has(r, c) {
        return this.obstacles.has(`${r},${c}`);
    }

    /**
     * Проверка, блокирует ли клетка
     * @param {number} r - ряд
     * @param {number} c - колонка
     * @returns {boolean}
     */
    blocksCell(r, c) {
        const obstacle = this.obstacles.get(`${r},${c}`);
        return obstacle ? obstacle.blocksCell() : false;
    }

    /**
     * Обработка матча для разрушения препятствий
     * @param {Set<string>} matchCells - множество координат матча "r,c"
     * @returns {Array} - список разрушенных препятствий
     */
    processMatch(matchCells) {
        const destroyed = [];
        
        matchCells.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const obstacle = this.obstacles.get(key);
            
            if (obstacle) {
                // Если трава - нужен матч именно на этой клетке
                if (obstacle.requiresMatchOnTop()) {
                    if (obstacle.hit(1)) {
                        destroyed.push({ type: obstacle.type, r, c });
                        this.obstacles.delete(key);
                    }
                }
            }
            
            // Проверка соседей для льда и ящиков
            const neighbors = [
                { r: r - 1, c }, { r: r + 1, c },
                { r, c: c - 1 }, { r, c: c + 1 }
            ];
            
            neighbors.forEach(n => {
                const nKey = `${n.r},${n.c}`;
                const nObstacle = this.obstacles.get(nKey);
                
                if (nObstacle && !nObstacle.requiresMatchOnTop()) {
                    // Лёд и ящики бьются от соседнего матча
                    const damage = nObstacle.type === OBSTACLE_TYPES.ICE ? 1 : 1;
                    if (nObstacle.hit(damage)) {
                        destroyed.push({ type: nObstacle.type, r: n.r, c: n.c });
                        this.obstacles.delete(nKey);
                    }
                }
            });
        });
        
        return destroyed;
    }

    /**
     * Получение всех препятствий
     * @returns {Map}
     */
    getAll() {
        return this.obstacles;
    }

    /**
     * Проверка, остались ли препятствия
     * @returns {boolean}
     */
    hasObstacles() {
        return this.obstacles.size > 0;
    }
}

/**
 * Рендеринг слоя препятствий для DOM
 * @param {ObstacleManager} manager - менеджер препятствий
 * @param {number} cellSize - размер клетки
 * @returns {string} - HTML строка
 */
export function renderObstaclesLayer(manager, cellSize) {
    let html = '';
    
    for (const [key, obstacle] of manager.getAll()) {
        const [r, c] = key.split(',').map(Number);
        const x = c * cellSize;
        const y = r * cellSize;
        
        const shakeX = obstacle.isAnimating ? obstacle.shakeOffset.x : 0;
        const shakeY = obstacle.isAnimating ? obstacle.shakeOffset.y : 0;
        
        let content = '';
        let style = `position: absolute; left: ${x}px; top: ${y}px; width: ${cellSize}px; height: ${cellSize}px; transform: translate(${shakeX}px, ${shakeY}px); pointer-events: none;`;
        
        switch (obstacle.type) {
            case 'ice':
                content = `<div style="position: absolute; left: 5px; top: 5px; right: 5px; bottom: 5px; background: ${OBSTACLE_CONFIG.ice.color}; opacity: ${OBSTACLE_CONFIG.ice.opacity}; border-radius: 8px;"></div>`;
                break;
            case 'box':
                content = `<div style="position: absolute; left: 4px; top: 4px; width: ${cellSize - 8}px; height: ${cellSize - 8}px; background: ${OBSTACLE_CONFIG.box.color}; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: ${cellSize * 0.5}px;">📦</div>`;
                break;
            case 'grass':
                content = `<div style="position: absolute; left: 0; bottom: 0; width: 100%; height: 30%; background: ${OBSTACLE_CONFIG.grass.color}; opacity: ${OBSTACLE_CONFIG.grass.opacity}; border-radius: 0 0 8px 8px;"></div>`;
                break;
            case 'chain':
                content = `<div style="position: absolute; left: 8px; top: 8px; right: 8px; bottom: 8px; background: ${OBSTACLE_CONFIG.chain.color}; opacity: ${OBSTACLE_CONFIG.chain.opacity}; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: ${cellSize * 0.4}px;">🔒</div>`;
                break;
            case 'rock':
                content = `<div style="position: absolute; left: 2px; top: 2px; right: 2px; bottom: 2px; background: ${OBSTACLE_CONFIG.rock.color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: ${cellSize * 0.5}px;">🪨</div>`;
                break;
        }
        
        // Индикатор здоровья
        if (obstacle.hp < obstacle.maxHp && obstacle.type !== 'rock') {
            const hpPercent = obstacle.hp / obstacle.maxHp;
            content += `<div style="position: absolute; left: 5px; bottom: 3px; right: 5px; height: 4px; background: rgba(0,0,0,0.5); border-radius: 2px;"><div style="width: ${hpPercent * 100}%; height: 100%; background: ${hpPercent > 0.5 ? '#2ed573' : (hpPercent > 0.2 ? '#ffa502' : '#ff4757')}; border-radius: 2px;"></div></div>`;
        }
        
        html += `<div class="obstacle obstacle-${obstacle.type}" style="${style}">${content}</div>`;
    }
    
    return html;
}
