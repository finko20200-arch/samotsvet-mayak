/**
 * Расширенные CSS стили для визуальных эффектов
 * Параллакс, частицы, анимации UI
 */

export const EFFECTS_CSS = `
/* ================= ПАРАЛЛАКС ЗВЁЗДЫ ================= */
.star-layer-0, .star-layer-1, .star-layer-2 {
  position: absolute;
  background: #cfe8fa;
  transition: transform 0.1s ease-out;
}

.shooting-star {
  animation: shoot 2s linear infinite;
}

@keyframes shoot {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translate(-150px, 150px);
    opacity: 0;
  }
}

/* ================= ОБЛАКА ================= */
.cloud {
  transition: transform 0.1s ease-out;
}

@keyframes cloudFloat {
  from {
    left: -100px;
  }
  to {
    left: calc(100% + 100px);
  }
}

/* ================= ВОЛНЫ ================= */
@keyframes waveScroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.wave-foam {
  animation: foamBubble 4s ease-in-out infinite;
}

@keyframes foamBubble {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-8px) scale(1.1);
    opacity: 0.9;
  }
}

/* ================= СВЕТЛЯЧКИ ================= */
@keyframes fireflyFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  25% {
    transform: translate(var(--move-x), var(--move-y)) scale(1.1);
    opacity: 1;
  }
  50% {
    transform: translate(calc(var(--move-x) * 0.5), calc(var(--move-y) * 0.8)) scale(0.9);
    opacity: 0.7;
  }
  75% {
    transform: translate(calc(var(--move-x) * 0.8), calc(var(--move-y) * 0.6)) scale(1.05);
    opacity: 0.9;
  }
}

/* ================= МАЯК ================= */
@keyframes corePulse {
  0%, 100% {
    box-shadow: 0 0 26px #ffd166, 0 0 70px rgba(255,209,102,0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 35px #ffd166, 0 0 90px rgba(255,209,102,0.9);
    transform: scale(1.05);
  }
}

/* ================= ЧАСТИЦЫ ================= */
.particle {
  will-change: transform, opacity;
}

.particle-spark {
  box-shadow: 0 0 6px currentColor;
}

.particle-smoke {
  filter: blur(3px);
}

.particle-magic {
  filter: blur(1px);
}

/* ================= НОВЫЕ ЭФФЕКТЫ КНОПОК ================= */
.btn {
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.btn:active::before {
  width: 200%;
  height: 200%;
}

.btn.sec::before {
  background: rgba(255,255,255,0.15);
}

/* ================= АНИМАЦИЯ ПОБЕДЫ ================= */
@keyframes victoryPulse {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
}

.finale .tower {
  animation: victoryPulse 2s ease-in-out infinite;
}

/* ================= УЛУЧШЕННЫЕ ЗВЁЗДЫ РЕЙТИНГА ================= */
.stars span {
  display: inline-block;
  position: relative;
}

.stars span:not(.off)::after {
  content: '';
  position: absolute;
  inset: -3px;
  background: radial-gradient(circle, rgba(255,209,102,0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: starGlow 1.5s ease-in-out infinite;
}

@keyframes starGlow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* ================= ПРОГРЕСС-БАР С ГРАДИЕНТОМ ================= */
#gfill {
  background: linear-gradient(90deg, 
    #ff6b57 0%, 
    #ffa62b 25%, 
    #ffd166 50%, 
    #8bd448 75%, 
    #38d1e0 100%);
  background-size: 200% 100%;
}

#gfill:not([style*="width: 0%"]) {
  animation: gradientShift 2s linear infinite;
}

@keyframes gradientShift {
  from {
    background-position: 0% 50%;
  }
  to {
    background-position: 200% 50%;
  }
}

/* ================= КАМНИ С БЛИКАМИ ================= */
.gem-inner::after {
  content: '';
  position: absolute;
  top: 10%;
  left: 15%;
  width: 35%;
  height: 25%;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='40' ry='30' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
  filter: blur(1px);
  opacity: 0.7;
}

/* ================= ТРЯСКА ПРИ КОМБО ================= */
@keyframes comboShake {
  0%, 100% {
    transform: translate(0, 0) rotate(0);
  }
  20% {
    transform: translate(-8px, 4px) rotate(-1deg);
  }
  40% {
    transform: translate(6px, -5px) rotate(1deg);
  }
  60% {
    transform: translate(-5px, -3px) rotate(-0.5deg);
  }
  80% {
    transform: translate(4px, 3px) rotate(0.5deg);
  }
}

.board-frame.combo-shake {
  animation: comboShake 0.5s cubic-bezier(.36,.07,.19,.97);
}

/* ================= ВСПЛЫВАЮЩИЙ ТЕКСТ ОЧКОВ ================= */
.score-popup {
  animation: scoreFloat 0.9s cubic-bezier(.2,.7,.4,1) forwards;
}

@keyframes scoreFloat {
  0% {
    transform: translate(-50%, -20px) scale(0.5);
    opacity: 0;
  }
  30% {
    transform: translate(-50%, -60px) scale(1.3);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -140px) scale(1);
    opacity: 0;
  }
}

.score-popup.big {
  animation-duration: 1.2s;
  text-shadow: 0 3px 0 rgba(0,0,0,0.3), 0 0 20px rgba(255,209,102,0.6);
}

/* ================= БАННЕР КОМБО ================= */
.combo-banner {
  animation: comboEnter 0.95s cubic-bezier(.2,.9,.3,1.2) forwards;
}

@keyframes comboEnter {
  0% {
    transform: translate(-50%, -50%) scale(0.1) rotate(-15deg);
    opacity: 0;
  }
  40% {
    transform: translate(-50%, -50%) scale(1.3) rotate(5deg);
    opacity: 1;
  }
  60% {
    transform: translate(-50%, -50%) scale(0.95) rotate(-2deg);
  }
  100% {
    transform: translate(-50%, -80%) scale(1) rotate(0);
    opacity: 0;
  }
}

/* ================= МОДАЛЬНЫЕ ОКНА ================= */
.card {
  backdrop-filter: blur(10px);
}

@keyframes cardInBounce {
  0% {
    transform: scale(0.5) translateY(50px);
    opacity: 0;
  }
  60% {
    transform: scale(1.05) translateY(-5px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

.card.bounce {
  animation: cardInBounce 0.5s cubic-bezier(.34,1.56,.64,1);
}

/* ================= ОТКРЫТКИ ================= */
.postcard {
  position: relative;
  overflow: hidden;
}

.postcard::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(255,255,255,0.1) 45%,
    rgba(255,255,255,0.2) 50%,
    rgba(255,255,255,0.1) 55%,
    transparent 60%
  );
  transform: rotate(45deg) translateY(-100%);
  animation: postcardShine 3s ease-in-out infinite 2s;
}

@keyframes postcardShine {
  0%, 100% {
    transform: rotate(45deg) translateY(-100%);
  }
  50% {
    transform: rotate(45deg) translateY(100%);
  }
}

/* ================= TOAST УВЕДОМЛЕНИЯ ================= */
#toast.show {
  animation: toastBounce 0.3s cubic-bezier(.34,1.56,.64,1);
}

@keyframes toastBounce {
  0% {
    transform: translate(-50%, 30px);
    opacity: 0;
  }
  60% {
    transform: translate(-50%, -5px);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 0);
  }
}

/* ================= АНИМАЦИЯ ПЕРСОНАЖА ================= */
.klav {
  transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
}

.klav.happy {
  animation: klavHappy 0.6s ease-in-out;
}

@keyframes klavHappy {
  0%, 100% {
    transform: translateY(0) rotate(0);
  }
  25% {
    transform: translateY(-8px) rotate(-5deg);
  }
  75% {
    transform: translateY(-8px) rotate(5deg);
  }
}

.klav.win {
  animation: klavWinBounce 0.8s ease-in-out infinite;
}

@keyframes klavWinBounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.05);
  }
}

/* ================= ЗАГРУЗКА ================= */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.1);
  border-top-color: #ffd166;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================= PULSE ДЛЯ ТЕКУЩЕГО УРОВНЯ ================= */
.lvl.current {
  animation: curPulseGlow 2s ease-in-out infinite;
}

@keyframes curPulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255,209,102,0.6), 0 4px 12px rgba(0,0,0,0.5);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(255,209,102,0), 0 4px 12px rgba(0,0,0,0.5);
  }
}

/* ================= СКРЫТИЕ СКРОЛЛБАРА ================= */
.map-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.map-scroll::-webkit-scrollbar {
  display: none;
}

/* ================= АДАПТИВНОСТЬ ================= */
@media (max-width: 380px) {
  .combo-banner {
    font-size: clamp(18px, 6vw, 26px);
  }
  
  .score-popup {
    font-size: 13px;
  }
  
  .score-popup.big {
    font-size: 16px;
  }
}

/* ================= ПРЕФЕРЕНЦИИ ПО ДВИЖЕНИЮ ================= */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

/**
 * Внедрение CSS в документ
 */
export function injectEffectsCSS() {
  if (document.getElementById('effects-css')) return;
  
  const style = document.createElement('style');
  style.id = 'effects-css';
  style.textContent = EFFECTS_CSS;
  document.head.appendChild(style);
}
