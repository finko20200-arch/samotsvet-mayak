/**
 * Модуль препятствий и объектов уровня
 * Обрабатывает лед, коробки, траву, замки и другие препятствия
 */

import { CONFIG } from '../../config/gameConfig.js';
import { playSound } from '../audio/sound.js';

// Типы препятствий
export const OBSTACLE_TYPES = {
    NONE: 0,
    ICE: 1,        // Разбивается матчем рядом (1-2 удара)
    BOX: 2,        // Разбивается матчем внутри или рядом (2-3 удара)
    GRASS: 3,      // Требует матча НА этой клетке (1 удар)
    CHAIN: 4,      // Замок, требует ключа или спец-камня
    ROCK: 5        // Неразрушимый блок (только для ограничения пространства)
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
            playSound('break');
            return true; // Разрушено
        }
        
        playSound('hit');
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

    /**
     * Отрисовка препятствия
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     * @param {number} size 
     */
    draw(ctx, x, y, size) {
        const config = OBSTACLE_CONFIG[this.type];
        const center = size / 2;
        
        ctx.save();
        
        // Применяем тряску если есть
        const shakeX = this.isAnimating ? this.shakeOffset.x : 0;
        const shakeY = this.isAnimating ? this.shakeOffset.y : 0;
        
        if (this.type === OBSTACLE_TYPES.ICE) {
            // Рисуем лёд как слой поверх
            ctx.fillStyle = config.color;
            ctx.globalAlpha = config.opacity;
            
            // Форма льда (неровная)
            ctx.beginPath();
            ctx.moveTo(x + 5 + shakeX, y + 5 + shakeY);
            ctx.lineTo(x + size - 5 + shakeX, y + 8 + shakeY);
            ctx.lineTo(x + size - 3 + shakeX, y + size - 5 + shakeY);
            ctx.lineTo(x + 8 + shakeX, y + size - 3 + shakeY);
            ctx.closePath();
            ctx.fill();
            
            // Блик на льду
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.ellipse(x + center + shakeX, y + center/2 + shakeY, size * 0.2, size * 0.1, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (this.type === OBSTACLE_TYPES.GRASS) {
            // Трава внизу клетки
            ctx.fillStyle = config.color;
            ctx.globalAlpha = config.opacity;
            
            ctx.beginPath();
            ctx.moveTo(x + 2 + shakeX, y + size - 5 + shakeY);
            ctx.quadraticCurveTo(x + center + shakeX, y + size - 15 + shakeY, x + size - 2 + shakeX, y + size - 5 + shakeY);
            ctx.lineTo(x + size - 2 + shakeX, y + size + shakeY);
            ctx.lineTo(x + 2 + shakeX, y + size + shakeY);
            ctx.closePath();
            ctx.fill();
            
            // Травинки
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const gx = x + 5 + (i * (size - 10) / 4) + shakeX;
                ctx.beginPath();
                ctx.moveTo(gx, y + size - 5 + shakeY);
                ctx.quadraticCurveTo(gx + 2, y + size - 12 + shakeY, gx, y + size - 18 + shakeY);
                ctx.stroke();
            }
            
        } else if (this.type === OBSTACLE_TYPES.BOX) {
            // Деревянный ящик
            ctx.translate(x + center + shakeX, y + center + shakeY);
            
            ctx.fillStyle = config.color;
            ctx.fillRect(-size/2 + 4, -size/2 + 4, size - 8, size - 8);
            
            // Крестовина на ящике
            ctx.strokeStyle = '#c23616';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-size/2 + 4, -size/2 + 4);
            ctx.lineTo(size/2 - 4, size/2 - 4);
            ctx.moveTo(size/2 - 4, -size/2 + 4);
            ctx.lineTo(-size/2 + 4, size/2 - 4);
            ctx.stroke();
            
            // Гвозди
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.arc(-size/2 + 8, -size/2 + 8, 3, 0, Math.PI*2);
            ctx.arc(size/2 - 8, -size/2 + 8, 3, 0, Math.PI*2);
            ctx.arc(-size/2 + 8, size/2 - 8, 3, 0, Math.PI*2);
            ctx.arc(size/2 - 8, size/2 - 8, 3, 0, Math.PI*2);
            ctx.fill();
            
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Сброс трансформации
            
        } else if (this.type === OBSTACLE_TYPES.CHAIN) {
            // Замок/Цепи
            ctx.fillStyle = '#57606f';
            ctx.globalAlpha = 0.9;
            
            // Металлическая пластина
            ctx.beginPath();
            ctx.roundRect(x + 8 + shakeX, y + 8 + shakeY, size - 16, size - 16, 5);
            ctx.fill();
            
            // Цепи по углам
            ctx.strokeStyle = '#a4b0be';
            ctx.lineWidth = 4;
            const corners = [
                {x: x+5, y:y+5}, {x: x+size-5, y:y+5},
                {x: x+5, y:y+size-5}, {x: x+size-5, y:y+size-5}
            ];
            
            corners.forEach(corner => {
                ctx.beginPath();
                ctx.arc(corner.x + shakeX, corner.y + shakeY, 6, 0, Math.PI*2);
                ctx.stroke();
            });
            
            // Замок в центре
            ctx.fillStyle = '#ffa502';
            ctx.beginPath();
            ctx.arc(x + center + shakeX, y + center + shakeY, 8, 0, Math.PI*2);
            ctx.fill();
            
        } else if (this.type === OBSTACLE_TYPES.ROCK) {
            // Скала
            ctx.fillStyle = config.color;
            
            ctx.beginPath();
            ctx.moveTo(x + 10 + shakeX, y + 5 + shakeY);
            ctx.lineTo(x + size - 5 + shakeX, y + 10 + shakeY);
            ctx.lineTo(x + size - 2 + shakeX, y + size - 5 + shakeY);
            ctx.lineTo(x + size/2 + shakeX, y + size + shakeY);
            ctx.lineTo(x + 5 + shakeX, y + size - 8 + shakeY);
            ctx.closePath();
            ctx.fill();
            
            // Текстура камня
            ctx.strokeStyle = '#57606f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 20 + shakeX, y + 20 + shakeY);
            ctx.lineTo(x + 35 + shakeX, y + 30 + shakeY);
            ctx.moveTo(x + size - 20 + shakeX, y + 40 + shakeY);
            ctx.lineTo(x + size - 30 + shakeX, y + 25 + shakeY);
            ctx.stroke();
        }
        
        // Индикатор здоровья для многоразовых препятствий (если не полный HP)
        if (this.hp < this.maxHp && this.type !== OBSTACLE_TYPES.ROCK) {
            const hpPercent = this.hp / this.maxHp;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(x + 5, y + size - 8, size - 10, 4);
            
            ctx.fillStyle = hpPercent > 0.5 ? '#2ed573' : (hpPercent > 0.2 ? '#ffa502' : '#ff4757');
            ctx.fillRect(x + 6, y + size - 7, (size - 12) * hpPercent, 2);
        }
        
        ctx.restore();
    }
}

/**
 * Создание препятствий для уровня
 * @param {Array} layout - массив конфигурации препятствий из уровня
 * @returns {Map} - карта препятствий "r,c" -> Obstacle
 */
export function createObstaclesFromLayout(layout) {
    const obstacles = new Map();
    
    if (!layout) return obstacles;
    
    layout.forEach(item => {
        const { r, c, type, hp } = item;
        const key = `${r},${c}`;
        obstacles.set(key, new Obstacle(type, r, c, hp));
    });
    
    return obstacles;
}

/**
 * Проверка попадания по препятствию при матче
 * @param {Array} matches - координаты матча
 * @param {Map} obstacles - карта препятствий
 * @returns {Array} - список разрушенных препятствий
 */
export function checkObstacleHits(matches, obstacles) {
    const destroyed = [];
    
    matches.forEach(match => {
        const key = `${match.r},${match.c}`;
        const obstacle = obstacles.get(key);
        
        if (obstacle) {
            // Если трава - нужен матч именно на этой клетке
            if (obstacle.requiresMatchOnTop()) {
                if (obstacle.hit(1)) {
                    destroyed.push(obstacle);
                    obstacles.delete(key);
                }
            }
        }
        
        // Проверка соседей для льда и ящиков
        const neighbors = [
            { r: match.r - 1, c: match.c },
            { r: match.r + 1, c: match.c },
            { r: match.r, c: match.c - 1 },
            { r: match.r, c: match.c + 1 }
        ];
        
        neighbors.forEach(n => {
            const nKey = `${n.r},${n.c}`;
            const nObstacle = obstacles.get(nKey);
            
            if (nObstacle && !nObstacle.requiresMatchOnTop()) {
                // Лёд и ящики бьются от соседнего матча
                const damage = nObstacle.type === OBSTACLE_TYPES.ICE ? 1 : 1;
                if (nObstacle.hit(damage)) {
                    destroyed.push(nObstacle);
                    obstacles.delete(nKey);
                }
            }
        });
    });
    
    return destroyed;
}
