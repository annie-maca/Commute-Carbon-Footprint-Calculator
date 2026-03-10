const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 5;
const POMODORO_SECONDS = POMODORO_MINUTES * 60;
const BREAK_SECONDS = BREAK_MINUTES * 60;

let remainingSeconds = POMODORO_SECONDS;
let intervalId = null;
let audioContext = null;
let mode = 'pomodoro'; // 'pomodoro' | 'break'

const minutesEl = document.querySelector('.minutes');
const secondsEl = document.querySelector('.seconds');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const phaseTitleEl = document.getElementById('phaseTitle');

function getDurationForMode(m) {
  return m === 'break' ? BREAK_SECONDS : POMODORO_SECONDS;
}

function setPhaseUI(m) {
  mode = m;
  phaseTitleEl.textContent = mode === 'break' ? 'Break' : 'Pomodoro';
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return {
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0')
  };
}

function updateDisplay() {
  const { minutes, seconds } = formatTime(remainingSeconds);
  minutesEl.textContent = minutes;
  secondsEl.textContent = seconds;
}

function tick() {
  remainingSeconds--;
  updateDisplay();

  if (remainingSeconds <= 0) {
    if (mode === 'pomodoro') {
      stopTimer();
      playAlarmSound();
      fireConfetti();
      setPhaseUI('break');
      remainingSeconds = BREAK_SECONDS;
      updateDisplay();
      startBtn.classList.add('running');
      startBtn.textContent = 'Running';
      intervalId = setInterval(tick, 1000);
    } else {
      stopTimer();
      playAlarmSound();
      setPhaseUI('pomodoro');
      remainingSeconds = POMODORO_SECONDS;
      updateDisplay();
    }
  }
}

function fireConfetti() {
  if (typeof confetti !== 'function') return;
  const count = 200;
  const defaults = { origin: { y: 0.6 }, colors: ['#e85d4c', '#f4f4f5', '#a1a1aa', '#f07a6b'] };
  confetti({ ...defaults, particleCount: count, spread: 70 });
  confetti({ ...defaults, particleCount: count * 0.25, angle: 60, spread: 55 });
  confetti({ ...defaults, particleCount: count * 0.25, angle: 120, spread: 55 });
}

function playAlarmSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.warn('Could not play alarm sound:', e);
  }
}

function startTimer() {
  if (intervalId) return;
  if (remainingSeconds <= 0) {
    remainingSeconds = getDurationForMode(mode);
    updateDisplay();
  }

  startBtn.classList.add('running');
  startBtn.textContent = 'Running';

  intervalId = setInterval(tick, 1000);
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  startBtn.classList.remove('running');
  startBtn.textContent = 'Start';
}

function resetTimer() {
  stopTimer();
  setPhaseUI('pomodoro');
  remainingSeconds = POMODORO_SECONDS;
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// Initial display
updateDisplay();
