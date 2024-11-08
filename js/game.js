let score = 0; // Текущий счет
let highScore = parseInt(localStorage.getItem('highScore')) || 0; // Рекорд из localStorage или 0

// Подключаем PixiJS
import * as PIXI from 'pixi.js';

// Создаем приложение PixiJS
const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x87CEEB, // Цвет фона
});

// Определяем стиль текста для счета и рекорда
const scoreStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 32,
  fill: '#ffffff',
  fontWeight: 'bold',
});

const scoreText = new PIXI.Text(`Score: ${score}`, scoreStyle);
scoreText.anchor.set(1, 0); // Устанавливаем якорь справа сверху
scoreText.x = app.screen.width - 20; // Отступ от правого края
scoreText.y = 20; // Отступ от верхнего края
app.stage.addChild(scoreText);

// Рекорд
const highScoreText = new PIXI.Text(`High Score: ${highScore}`, scoreStyle);
highScoreText.anchor.set(1, 0); // Устанавливаем якорь справа сверху
highScoreText.x = app.screen.width - 20; // Отступ от правого края
highScoreText.y = 60; // Отступ под текущим счетом
app.stage.addChild(highScoreText);


// Добавляем Canvas в DOM
document.body.appendChild(app.view);

// Создаем спрайт жабки
const frogTexture = PIXI.Texture.from('img/frog.png');
const frog = new PIXI.Sprite(frogTexture);
frog.anchor.set(0.5, 1);
frog.width = 50;
frog.height = 50;
frog.vy = 0;
frog.vx = 0;
app.stage.addChild(frog);

// Настройки прыжка
const jumpPower = -15; // Начальная вертикальная скорость при прыжке
const gravity = 0.8;   // Гравитация, притягивающая жабку вниз
const horizontalSpeed = 5; // Скорость горизонтального движения
const maxJumpHeight = app.screen.height * 0.75; // Максимальная высота прыжка (75% высоты экрана)

// Массив кувшинок и переменная для отслеживания текущей кувшинки
const lilyPads = [];
let currentLilyPad = null;

// Устанавливаем начальную скорость движения кувшинок
let lilyPadSpeed = 1;
const maxLilyPadSpeed = 3; // Ограничение максимальной скорости кувшинок
let isGameOver = false; // Флаг для остановки игры

// Создаем первую кувшинку прямо под жабкой
createLilyPad(app.screen.width / 4);
currentLilyPad = lilyPads[0];
frog.x = currentLilyPad.x;
frog.y = currentLilyPad.y - frog.height / 2.5;

// Создаем остальные кувшинки
let initialX = frog.x + 300;
for (let i = 1; i < 5; i++) {
  createLilyPad(initialX);
  initialX += 300;
}

// Функция для создания новой кувшинки
function createLilyPad(xPosition) {
  const lilyPadTexture = PIXI.Texture.from('img/lilyPad.png');
  const lilyPad = new PIXI.Sprite(lilyPadTexture);

  lilyPad.anchor.set(0.5);
  lilyPad.y = app.screen.height - 150;
  lilyPad.width = frog.width * 3;
  lilyPad.height = frog.height;

  lilyPad.x = xPosition;
  app.stage.addChild(lilyPad);
  lilyPads.push(lilyPad);
}

// Настройки прыжка
let isJumping = false;
let isVoiceJumping = false; // Флаг для отслеживания прыжка от громкости звука

// Добавляем слушатель для нажатия клавиши пробел
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isJumping && !isGameOver) {
    startJump(); // Начинаем прыжок при нажатии пробела
  }
});

// Добавляем слушатель для отпускания клавиши пробел
window.addEventListener('keyup', (event) => {
  if (event.code === 'Space' && !isGameOver) {
    endJump(); // Завершаем прыжок при отпускании пробела
  }
});

// Функция для начала прыжка
function startJump() {
  isJumping = true;
  frog.vy = jumpPower; // Задаем начальную вертикальную скорость вверх
  frog.vx = horizontalSpeed; // Устанавливаем начальную горизонтальную скорость вправо
}

// Функция для завершения прыжка
function endJump() {
  isJumping = false; // После отпускания пробела гравитация начинает тянуть жабку вниз
  if (!isVoiceJumping) {
    frog.vy += gravity;
  }
}

// Гравитация и движение
function applyGravity() {
  if (isGameOver) return; // Прекращаем движение, если игра окончена

  if (isJumping || isVoiceJumping) {
    frog.y += frog.vy; // Продолжаем подъем
    frog.x += frog.vx; // Продолжаем движение вправо

    if (frog.y <= app.screen.height - maxJumpHeight) {
      frog.y = app.screen.height - maxJumpHeight; // Ограничиваем высоту
      frog.vy = 0;
    }
  } else {
    frog.vy += gravity;
    frog.y += frog.vy;
    frog.x += frog.vx;
  }

  // Проверка приземления на кувшинку
  let landedOnLilyPad = false;
  for (let i = 0; i < lilyPads.length; i++) {
    const lilyPad = lilyPads[i];
    if (
      Math.abs(frog.x - lilyPad.x) < lilyPad.width / 2 &&
      frog.y >= lilyPad.y - frog.height / 2
    ) {
      isJumping = false;
      isVoiceJumping = false;
      frog.vy = 0;
      frog.vx = 0;
      frog.y = lilyPad.y - frog.height / 2.5;
      frog.x = lilyPad.x;
      currentLilyPad = lilyPad;
      landedOnLilyPad = true;

       // Увеличиваем счет и обновляем текст
  score++;
  scoreText.text = `Score: ${score}`;

  // Обновляем рекорд, если счет превысил его
  if (score > highScore) {
    highScore = score;
    highScoreText.text = `High Score: ${highScore}`;
    localStorage.setItem('highScore', highScore); // Сохраняем рекорд в localStorage
  }

      // Увеличиваем скорость кувшинок на 5%, с ограничением максимальной скорости
      lilyPadSpeed = Math.min(lilyPadSpeed * 1.05, maxLilyPadSpeed);
      console.log("Успешный прыжок! Новая скорость кувшинок:", lilyPadSpeed);
      break;
    }
  }

  // Если жабка не приземлилась на кувшинку и вышла за экран, заканчиваем игру
  if (!landedOnLilyPad && frog.y > app.screen.height) {
    endGame();
  }
}

// Функция для завершения игры
function endGame() {
  isGameOver = true;

  // Отображение текста "Game Over"
  const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 64,
    fill: 'red',
    align: 'center',
    fontWeight: 'bold'
  });
  const gameOverText = new PIXI.Text('Game Over', style);
  gameOverText.anchor.set(0.5);
  gameOverText.x = app.screen.width / 2;
  gameOverText.y = app.screen.height / 2;
  app.stage.addChild(gameOverText);

  // Показываем кнопку перезапуска
  document.getElementById('restartButton').style.display = 'block';
}

// Главный игровой цикл
app.ticker.add(() => {
  if (!isGameOver) {
    applyGravity();

    // Двигаем кувшинки справа налево
    lilyPads.forEach(lilyPad => {
      lilyPad.x -= lilyPadSpeed;
    });

    // Удаляем кувшинку за пределами экрана и добавляем новую кувшинку справа
    if (lilyPads[0].x < -lilyPads[0].width) {
      const removedLilyPad = lilyPads.shift();
      app.stage.removeChild(removedLilyPad);
      const lastLilyPadX = lilyPads[lilyPads.length - 1].x;
      createLilyPad(lastLilyPadX + 300);
    }
  }
});

// Добавляем слушатель к кнопке перезапуска
document.getElementById('restartButton').addEventListener('click', restartGame);

function restartGame() {
  score = 0; // Сбрасываем текущий счет
  scoreText.text = `Score: ${score}`; // Обновляем текст счета
  location.reload(); // Перезагружает страницу, чтобы перезапустить игру
}

// Управление голосом с помощью Web Audio API
async function setupAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function checkVolume() {
      analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      // Порог чувствительности
      const volumeThreshold = 20;

      if (volume > volumeThreshold && !isVoiceJumping && !isGameOver) {
        isVoiceJumping = true;
        startJump();
      } else if (volume <= volumeThreshold && isVoiceJumping) {
        isVoiceJumping = false;
        endJump();
      }

      requestAnimationFrame(checkVolume);
    }

    checkVolume();
  } catch (err) {
    console.error("Error accessing audio stream:", err);
  }
}

setupAudio();
