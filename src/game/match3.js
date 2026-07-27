/**
 * Игровая логика Match-3
 * Управление сеткой,匹配, перемещением камней
 */

import { CONFIG, LEVELS } from '../../config/gameConfig.js';
import { rand, createGemSVG, createRainbowSVG, haptic } from '../../utils/helpers.js';
import { storage } from '../core/storage.js';
import { audioManager } from '../audio/sound.js';
import { particlesAt, popup, comboBanner, frameShake, klavReact, confetti } from '../effects/particles.js';
import { activateSpecialGem, combineSpecialGems } from './specialGems.js';
import { ObstacleManager, renderObstaclesLayer } from './obstacles.js';

/**
 * Класс камня
 */
export class Gem {
  constructor(type, row, col, element) {
    this.type = type;
    this.special = null; // 'h-bomb' | 'v-bomb' | 'bomb' | 'rainbow' | null
    this.row = row;
    this.col = col;
    this.element = element;
    this.isBoom = false; // временный флаг для взрыва бомбы
    this.comboType = null; // для комбо спец-камней: 'cross', 'mega-line', etc.
  }
}

/**
 * Движок игры Match-3
 */
export class Match3Engine {
  constructor(boardElement, fxElement, onStateChange) {
    this.boardEl = boardElement;
    this.fxEl = fxElement;
    this.onStateChange = onStateChange; // callback при изменении состояния
    
    this.grid = []; // двумерный массив [row][col]
    this.cellSize = 0;
    this.levelColors = 6;
    this.busy = true;
    
    this.score = 0;
    this.moves = 0;
    this.target = 0;
    this.selectedGem = null;
    this.pointerStart = null;
    this.idleTimer = null;
    
    // Менеджер препятствий
    this.obstacleManager = new ObstacleManager();
    
    this.setupResizeObserver();
  }

  /**
   * Наблюдатель изменения размера
   */
  setupResizeObserver() {
    new ResizeObserver(() => this.layout()).observe(this.boardEl);
  }

  /**
   * Пересчёт размеров
   */
  layout() {
    this.cellSize = this.boardEl.clientWidth / CONFIG.COLS;
    this.boardEl.style.setProperty('--cell', this.cellSize + 'px');
    
    // Быстрое перемещение без анимации
    this.boardEl.classList.add('no-trans');
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const gem = this.grid[r]?.[c];
        if (gem) {
          gem.element.style.transform = `translate(${c * this.cellSize}px, ${r * this.cellSize}px)`;
        }
      }
    }
    this.boardEl.getBoundingClientRect();
    this.boardEl.classList.remove('no-trans');
  }

  /**
   * Создание DOM-элемента камня
   */
  createGemElement(type, row, col) {
    const el = document.createElement('div');
    el.className = `gem t${type}`;
    el.innerHTML = `<div class="gem-inner">${createGemSVG(type)}</div>`;
    el.style.setProperty('--d', (((row + col) % 6) * 0.35) + 's');
    el.style.transform = `translate(${col * this.cellSize}px, ${row * this.cellSize}px)`;
    
    const gem = new Gem(type, row, col, el);
    
    el.addEventListener('pointerdown', (e) => this.handlePointerDown(e, gem));
    this.boardEl.appendChild(el);
    
    return gem;
  }

  /**
   * Обновление внешнего вида камня
   */
  updateGemAppearance(gem) {
    gem.element.className = `gem t${Math.max(0, gem.type)}${gem.special ? ' ' + gem.special : ''}`;
    if (gem.comboType) {
      gem.element.classList.add(gem.comboType);
    }
    gem.element.querySelector('.gem-inner').innerHTML = 
      gem.special === 'rainbow' ? createRainbowSVG() : createGemSVG(gem.type);
    
    // Добавляем индикатор для комбо-спец-камней
    const inner = gem.element.querySelector('.gem-inner');
    if (gem.comboType === 'cross') {
      inner.innerHTML += '<div class="special-icon cross">✚</div>';
    } else if (gem.comboType === 'mega-line') {
      inner.innerHTML += '<div class="special-icon mega">★</div>';
    } else if (gem.comboType === 'mega-bomb') {
      inner.innerHTML += '<div class="special-icon mega-bomb">☢</div>';
    }
  }

  /**
   * Инициализация доски
   */
  initBoard(levelConfig) {
    this.boardEl.innerHTML = '';
    this.grid = [];
    this.levelColors = levelConfig.colors;
    this.moves = levelConfig.moves;
    this.target = levelConfig.target;
    this.score = 0;
    
    // Инициализация препятствий если есть
    if (levelConfig.obstacles) {
      this.obstacleManager.loadLevel(levelConfig.obstacles, CONFIG.ROWS, CONFIG.COLS);
    } else {
      this.obstacleManager.clear();
    }
    
    this.layout();

    // Заполнение без начальных матчей
    for (let r = 0; r < CONFIG.ROWS; r++) {
      this.grid[r] = [];
      for (let c = 0; c < CONFIG.COLS; c++) {
        let type;
        do {
          type = rand(this.levelColors);
        } while (
          (c >= 2 && this.grid[r][c - 1]?.type === type && this.grid[r][c - 2]?.type === type) ||
          (r >= 2 && this.grid[r - 1]?.[c]?.type === type && this.grid[r - 2]?.[c]?.type === type)
        );
        this.grid[r][c] = this.createGemElement(type, r, c);
      }
    }

    // Проверка на наличие ходов и матчей
    let guard = 0;
    while (guard++ < 80 && (!this.findPossibleMove() || this.findMatches().cells.size > 0)) {
      this.reshuffleTypes(true);
    }

    this.entranceAnimation();
    
    // Рендеринг слоя препятствий
    this.renderObstacles();
  }

  /**
   * Рендеринг препятствий
   */
  renderObstacles() {
    const obstaclesLayer = document.getElementById('obstaclesLayer');
    if (obstaclesLayer) {
      obstaclesLayer.innerHTML = renderObstaclesLayer(this.obstacleManager, this.cellSize);
    }
  }

  /**
   * Анимация появления
   */
  entranceAnimation() {
    this.boardEl.classList.add('no-trans');
    
    // Спрятать камни за пределами
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const gem = this.grid[r][c];
        gem.element.style.transform = `translate(${c * this.cellSize}px, ${(r - CONFIG.ROWS - 1.5) * this.cellSize}px)`;
      }
    }
    
    this.boardEl.getBoundingClientRect();
    this.boardEl.classList.remove('no-trans');

    // Падение камней
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const gem = this.grid[r][c];
        gem.element.style.transitionDuration = '620ms';
        gem.element.style.transitionDelay = (c * 30 + r * 22) + 'ms';
        gem.element.style.transform = `translate(${c * this.cellSize}px, ${r * this.cellSize}px)`;
      }
    }

    setTimeout(() => {
      for (let r = 0; r < CONFIG.ROWS; r++) {
        for (let c = 0; c < CONFIG.COLS; c++) {
          const gem = this.grid[r][c];
          gem.element.style.transitionDuration = '';
          gem.element.style.transitionDelay = '';
        }
      }
      this.busy = false;
      this.resetIdle();
    }, CONFIG.ANIM.ENTRANCE);
  }

  /**
   * Перемешивание типов камней
   */
  reshuffleTypes(silent = false) {
    const gems = [];
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const gem = this.grid[r][c];
        if (gem && !gem.special) {
          gems.push(gem);
        }
      }
    }

    const types = gems.map(g => g.type);
    // Перемешивание Фишера-Йетса
    for (let i = types.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [types[i], types[j]] = [types[j], types[i]];
    }

    gems.forEach((gem, i) => {
      gem.type = types[i];
      this.updateGemAppearance(gem);
    });

    if (!silent) {
      gems.forEach(gem => {
        gem.element.classList.add('spawned');
        setTimeout(() => gem.element.classList.remove('spawned'), CONFIG.ANIM.SPAWN);
      });
    }
  }

  /**
   * Поиск всех совпадений
   */
  findMatches() {
    const cells = new Set();
    const spawns = [];

    // Горизонтальные
    for (let r = 0; r < CONFIG.ROWS; r++) {
      let c = 0;
      while (c < CONFIG.COLS) {
        const gem = this.grid[r][c];
        if (!gem || gem.type < 0) {
          c++;
          continue;
        }
        let len = 1;
        while (c + len < CONFIG.COLS && this.grid[r][c + len]?.type === gem.type) {
          len++;
        }
        if (len >= 3) {
          for (let k = 0; k < len; k++) {
            cells.add(`${r},${c + k}`);
          }
          if (len >= 5) {
            spawns.push({ r, c: c + Math.floor(len / 2), kind: 'rainbow' });
          } else if (len === 4) {
            // Определение типа бомбы по направлению
            spawns.push({ r, c: c + 1, kind: 'h-bomb' });
          }
        }
        c += len;
      }
    }

    // Вертикальные
    for (let c = 0; c < CONFIG.COLS; c++) {
      let r = 0;
      while (r < CONFIG.ROWS) {
        const gem = this.grid[r][c];
        if (!gem || gem.type < 0) {
          r++;
          continue;
        }
        let len = 1;
        while (r + len < CONFIG.ROWS && this.grid[r + len]?.[c]?.type === gem.type) {
          len++;
        }
        if (len >= 3) {
          for (let k = 0; k < len; k++) {
            cells.add(`${r + k},${c}`);
          }
          if (len >= 5) {
            spawns.push({ r: r + Math.floor(len / 2), c, kind: 'rainbow' });
          } else if (len === 4) {
            // Определение типа бомбы по направлению
            spawns.push({ r: r + 1, c, kind: 'v-bomb' });
          }
        }
        r += len;
      }
    }

    return { cells, spawns };
  }

  /**
   * Расширение очистки с учётом бомб и спец-камней
   */
  expandClears(baseSet) {
    const result = new Set(baseSet);
    const stack = [...baseSet];
    const specialActivations = [];

    while (stack.length) {
      const key = stack.pop();
      const [r, c] = key.split(',').map(Number);
      const gem = this.grid[r]?.[c];
      
      if (!gem) continue;
      
      // Активация спец-камней
      if (gem.special && !gem.isBoom) {
        specialActivations.push({ gem, row: r, col: c });
        gem.isBoom = true;
        
        // Добавляем эффекты в зависимости от типа
        const effects = activateSpecialGem(gem.special, r, c, CONFIG.ROWS, CONFIG.COLS);
        effects.forEach(effectKey => {
          if (!result.has(effectKey)) {
            result.add(effectKey);
            stack.push(effectKey);
          }
        });
      }
    }

    // Обработка комбо спец-камней
    if (specialActivations.length >= 2) {
      // Проверяем соседние спец-камни для комбо
      for (let i = 0; i < specialActivations.length - 1; i++) {
        for (let j = i + 1; j < specialActivations.length; j++) {
          const a = specialActivations[i];
          const b = specialActivations[j];
          const dist = Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
          
          if (dist <= 1) {
            // Комбо двух спец-камней
            const comboEffects = combineSpecialGems(
              a.gem.special, a.row, a.col,
              b.gem.special, b.row, b.col,
              CONFIG.ROWS, CONFIG.COLS
            );
            comboEffects.forEach(effectKey => {
              if (!result.has(effectKey)) {
                result.add(effectKey);
              }
            });
          }
        }
      }
    }

    // Сброс флагов
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        if (this.grid[r][c]) {
          this.grid[r][c].isBoom = false;
        }
      }
    }

    return result;
  }

  /**
   * Поиск возможного хода
   */
  findPossibleMove() {
    // Проверка радужных бомб
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const gem = this.grid[r][c];
        if (gem?.special === 'rainbow') {
          const c2 = c + 1 < CONFIG.COLS ? c + 1 : c - 1;
          return [[r, c], [r, c2]];
        }
      }
    }

    // Проверка обычных свопов
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        for (const [dr, dc] of [[0, 1], [1, 0]]) {
          const r2 = r + dr, c2 = c + dc;
          if (r2 >= CONFIG.ROWS || c2 >= CONFIG.COLS) continue;
          
          const a = this.grid[r][c], b = this.grid[r2][c2];
          this.swapGems(a, b);
          const hasMatch = this.findMatches().cells.size > 0;
          this.swapGems(a, b);
          
          if (hasMatch) return [[r, c], [r2, c2]];
        }
      }
    }

    return null;
  }

  /**
   * Обмен двух камней в сетке
   */
  swapGems(a, b) {
    this.grid[a.row][a.col] = b;
    this.grid[b.row][b.col] = a;
    
    const tempRow = a.row, tempCol = a.col;
    a.row = b.row;
    a.col = b.col;
    b.row = tempRow;
    b.col = tempCol;
  }

  /**
   * Анимация позиции камня
   */
  animateGemPosition(gem) {
    gem.element.style.transitionDuration = '';
    gem.element.style.transform = `translate(${gem.col * this.cellSize}px, ${gem.row * this.cellSize}px)`;
  }

  /**
   * Обработка нажатия
   */
  handlePointerDown(e, gem) {
    if (this.busy || this.pointerStart) return;
    e.preventDefault();
    this.resetIdle();
    
    this.pointerStart = { x: e.clientX, y: e.clientY, gem };
    
    window.addEventListener('pointermove', (ev) => this.handlePointerMove(ev));
    window.addEventListener('pointerup', () => this.handlePointerUp(), { once: true });
    window.addEventListener('pointercancel', () => this.cleanupPointer(), { once: true });
  }

  /**
   * Обработка движения
   */
  handlePointerMove(e) {
    if (!this.pointerStart) return;
    
    const dx = e.clientX - this.pointerStart.x;
    const dy = e.clientY - this.pointerStart.y;
    
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
    
    let dr = 0, dc = 0;
    if (Math.abs(dx) > Math.abs(dy)) {
      dc = dx > 0 ? 1 : -1;
    } else {
      dr = dy > 0 ? 1 : -1;
    }
    
    const gem = this.pointerStart.gem;
    const r = gem.row + dr, c = gem.col + dc;
    
    this.pointerStart = null;
    this.cleanupPointer();
    this.clearSelection();
    
    if (r >= 0 && r < CONFIG.ROWS && c >= 0 && c < CONFIG.COLS) {
      this.trySwap(gem, this.grid[r][c]);
    }
  }

  /**
   * Обработка отпускания
   */
  handlePointerUp() {
    const start = this.pointerStart;
    this.cleanupPointer();
    
    if (!start) return;
    
    const gem = start.gem;
    
    if (this.selectedGem && this.selectedGem !== gem &&
        Math.abs(this.selectedGem.row - gem.row) + Math.abs(this.selectedGem.col - gem.col) === 1) {
      const a = this.selectedGem;
      this.clearSelection();
      this.trySwap(a, gem);
    } else {
      this.clearSelection();
      this.selectedGem = gem;
      gem.element.classList.add('sel');
      audioManager.playSFX('click');
    }
  }

  /**
   * Очистка обработчиков
   */
  cleanupPointer() {
    window.removeEventListener('pointermove', (e) => this.handlePointerMove(e));
  }

  /**
   * Снятие выделения
   */
  clearSelection() {
    if (this.selectedGem) {
      this.selectedGem.element.classList.remove('sel');
      this.selectedGem = null;
    }
  }

  /**
   * Попытка обмена
   */
  async trySwap(a, b) {
    if (this.busy || !a || !b) return;
    
    this.busy = true;
    this.resetIdle();
    this.clearSelection();

    // Обработка радужной бомбы
    if (a.special === 'rainbow' || b.special === 'rainbow') {
      this.moves--;
      this.swapGems(a, b);
      this.animateGemPosition(a);
      this.animateGemPosition(b);
      audioManager.playSFX('rainbow');
      haptic('medium');
      
      await this.delay(CONFIG.ANIM.SWAP);
      
      const rainbow = a.special === 'rainbow' ? a : b;
      const other = rainbow === a ? b : a;
      const targetType = other.type >= 0 ? other.type : rand(this.levelColors);
      
      const cells = new Set([`${rainbow.row},${rainbow.col}`]);
      for (let r = 0; r < CONFIG.ROWS; r++) {
        for (let c = 0; c < CONFIG.COLS; c++) {
          const gem = this.grid[r][c];
          if (gem && gem.type === targetType) {
            cells.add(`${r},${c}`);
          }
        }
      }
      
      await this.clearCells(cells, 1);
      await this.dropAndRefill();
      await this.resolveBoard();
      
      this.onStateChange?.('score', this.score);
      this.onStateChange?.('moves', this.moves);
      
      this.busy = false;
      this.afterTurn();
      return;
    }

    // Обычный своп
    this.swapGems(a, b);
    this.animateGemPosition(a);
    this.animateGemPosition(b);
    audioManager.playSFX('swap');
    
    await this.delay(CONFIG.ANIM.SWAP);
    
    if (this.findMatches().cells.size === 0) {
      audioManager.playSFX('bad');
      a.element.classList.add('shake');
      b.element.classList.add('shake');
      
      this.swapGems(a, b);
      this.animateGemPosition(a);
      this.animateGemPosition(b);
      
      await this.delay(CONFIG.ANIM.SHAKE);
      
      a.element.classList.remove('shake');
      b.element.classList.remove('shake');
      this.busy = false;
      return;
    }

    this.moves--;
    this.onStateChange?.('moves', this.moves);
    
    await this.resolveBoard();
    this.busy = false;
    this.afterTurn();
  }

  /**
   * Очистка совпадений
   */
  async clearCells(cells, combo) {
    const points = cells.size * 20 * combo;
    this.score += points;
    audioManager.playSFX('match', combo);
    haptic(combo > 1 ? 'medium' : 'light');

    let sumRow = 0, sumCol = 0;
    const elements = [];

    cells.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const gem = this.grid[r][c];
      if (!gem) return;
      
      this.grid[r][c] = null;
      elements.push(gem.element);
      particlesAt(r, c, Math.max(0, gem.type), this.fxEl, this.cellSize);
      popup(`+${points / cells.size}`, r, c, combo, this.fxEl, this.cellSize);
      gem.element.classList.add('pop');
      sumRow += r;
      sumCol += c;
    });

    this.onStateChange?.('score', this.score);

    await this.delay(CONFIG.ANIM.POP);
    elements.forEach(el => el.remove());
  }

  /**
   * Разрешение доски (каскад)
   */
  async resolveBoard() {
    let combo = 0;

    while (true) {
      const { cells: raw, spawns } = this.findMatches();
      if (!raw.size) break;
      
      combo++;
      const cells = this.expandClears(raw);
      const spawnMap = new Map(spawns.map(s => [`${s.r},${s.c}`, s.kind]));
      
      const points = cells.size * 20 * combo;
      this.score += points;
      audioManager.playSFX('match', combo);
      haptic(combo > 1 ? 'medium' : 'light');

      let sumRow = 0, sumCol = 0;
      const elements = [];

      cells.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        const gem = this.grid[r][c];
        if (!gem) return;
        
        sumRow += r;
        sumCol += c;
        
        const special = spawnMap.get(key);
        if (special && raw.has(key)) {
          // Проверка на комбо спец-камней (если уже есть специальный камень)
          if (gem.special && gem.special !== special) {
            // Комбо двух спец-камней - создаём улучшенный
            gem.comboType = this.getComboType(gem.special, special);
            gem.special = 'bomb'; // Базовый тип для комбо
          } else {
            gem.special = special;
            if (special === 'rainbow') gem.type = -1;
          }
          this.updateGemAppearance(gem);
          gem.element.classList.add('spawned');
          setTimeout(() => gem.element.classList.remove('spawned'), CONFIG.ANIM.SPAWN);
        } else {
          this.grid[r][c] = null;
          elements.push(gem.element);
          particlesAt(r, c, Math.max(0, gem.type), this.fxEl, this.cellSize);
          gem.element.classList.add('pop');
        }
      });

      this.onStateChange?.('score', this.score);

      // Эффекты для комбо спец-камней
      if (combo >= 2) {
        comboBanner(combo, this.boardEl);
        klavReact('happy', document.getElementById('klavGame'));
      }
      if (combo >= 3) {
        frameShake(document.getElementById('boardFrame'));
      }

      await this.delay(CONFIG.ANIM.POP);
      elements.forEach(el => el.remove());
      
      // Обновление препятствий после каждого каскада
      this.updateObstacles();
      
      await this.dropAndRefill();
      this.onStateChange?.('score', this.score);
    }
  }

  /**
   * Определение типа комбо спец-камней
   */
  getComboType(type1, type2) {
    const types = [type1, type2].sort();
    
    // Линейная + Линейная = КРЕСТ
    if ((types[0] === 'h-bomb' && types[1] === 'v-bomb') ||
        (types[0] === 'h-bomb' && types[1] === 'h-bomb') ||
        (types[0] === 'v-bomb' && types[1] === 'v-bomb')) {
      return 'cross';
    }
    
    // Бомба + Линейная = МЕГА-ЛИНИЯ
    if ((types[0] === 'bomb' && types[1] === 'h-bomb') ||
        (types[0] === 'bomb' && types[1] === 'v-bomb')) {
      return 'mega-line';
    }
    
    // Бомба + Бомба = МЕГА-ВЗРЫВ
    if (types[0] === 'bomb' && types[1] === 'bomb') {
      return 'mega-bomb';
    }
    
    // Радужный + любой = цветовой взрыв (обрабатывается отдельно)
    if (types.includes('rainbow')) {
      return null;
    }
    
    return 'cross'; // по умолчанию
  }

  /**
   * Обновление состояния препятствий
   */
  updateObstacles() {
    // Проверка разрушения препятствий
    let changed = false;
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const obstacle = this.obstacleManager.get(r, c);
        if (obstacle && obstacle.hp <= 0) {
          this.obstacleManager.remove(r, c);
          changed = true;
          audioManager.playSFX('break');
          haptic('medium');
          particlesAt(r, c, 7, this.fxEl, this.cellSize); // серые частицы
        }
      }
    }
    
    if (changed) {
      this.renderObstacles();
    }
  }

  /**
   * Падение и заполнение
   */
  async dropAndRefill() {
    let maxDuration = 0;

    for (let c = 0; c < CONFIG.COLS; c++) {
      let write = CONFIG.ROWS - 1;
      
      // Сдвиг вниз существующих
      for (let r = CONFIG.ROWS - 1; r >= 0; r--) {
        const gem = this.grid[r][c];
        if (gem) {
          if (write !== r) {
            this.grid[write][c] = gem;
            this.grid[r][c] = null;
            
            const duration = CONFIG.ANIM.DROP_BASE + (write - r) * CONFIG.ANIM.DROP_PER_ROW;
            maxDuration = Math.max(maxDuration, duration);
            
            gem.row = write;
            gem.element.style.transitionDuration = duration + 'ms';
            gem.element.style.transform = `translate(${c * this.cellSize}px, ${write * this.cellSize}px)`;
          }
          write--;
        }
      }

      // Заполнение сверху
      const empties = write + 1;
      for (let i = write; i >= 0; i--) {
        const gem = this.createGemElement(rand(this.levelColors), i, c);
        this.grid[i][c] = gem;
        
        const startRow = i - empties - 1;
        gem.element.style.transition = 'none';
        gem.element.style.transform = `translate(${c * this.cellSize}px, ${startRow * this.cellSize}px)`;
        gem.element.getBoundingClientRect();
        gem.element.style.transition = '';
        
        const duration = CONFIG.ANIM.DROP_BASE + (i - startRow) * CONFIG.ANIM.DROP_PER_ROW;
        maxDuration = Math.max(maxDuration, duration);
        
        gem.element.style.transitionDuration = duration + 'ms';
        gem.element.style.transform = `translate(${c * this.cellSize}px, ${i * this.cellSize}px)`;
      }
    }

    await this.delay(maxDuration + 70);
    
    // Сброс transition
    this.boardEl.querySelectorAll('.gem').forEach(el => {
      el.style.transitionDuration = '';
    });
  }

  /**
   * Действие после хода
   */
  afterTurn() {
    if (this.score >= this.target) {
      this.onStateChange?.('win', { score: this.score, moves: this.moves });
      return;
    }
    if (this.moves <= 0) {
      this.onStateChange?.('lose', { score: this.score, target: this.target });
      return;
    }
    if (!this.findPossibleMove()) {
      this.shuffleBoard();
      return;
    }
    this.resetIdle();
  }

  /**
   * Перемешивание при отсутствии ходов
   */
  async shuffleBoard() {
    // showToast('Ходов нет — перемешиваем!'); // TODO
    audioManager.playSFX('swap');
    
    let guard = 0;
    do {
      this.reshuffleTypes(true);
    } while (guard++ < 80 && (!this.findPossibleMove() || this.findMatches().cells.size > 0));

    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const gem = this.grid[r][c];
        gem.element.classList.add('spawned');
        setTimeout(() => gem.element.classList.remove('spawned'), CONFIG.ANIM.SPAWN);
      }
    }

    await this.delay(500);
    this.busy = false;
    this.resetIdle();
  }

  /**
   * Сброс таймера бездействия
   */
  resetIdle() {
    clearTimeout(this.idleTimer);
    this.hideHint();
    this.idleTimer = setTimeout(() => this.showHint(), CONFIG.ANIM.IDLE_HINT);
  }

  /**
   * Показать подсказку
   */
  showHint() {
    if (this.busy) return;
    const move = this.findPossibleMove();
    if (!move) return;
    
    this.hideHint();
    move.forEach(([r, c]) => {
      this.grid[r][c].element.classList.add('hint');
    });
    
    setTimeout(() => this.hideHint(), CONFIG.ANIM.HINT_SHOW);
  }

  /**
   * Скрыть подсказку
   */
  hideHint() {
    this.boardEl.querySelectorAll('.hint').forEach(el => {
      el.classList.remove('hint');
    });
  }

  /**
   * Утилита задержки
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Получение текущего состояния
   */
  getState() {
    return {
      score: this.score,
      moves: this.moves,
      target: this.target,
      isBusy: this.busy,
    };
  }
}
