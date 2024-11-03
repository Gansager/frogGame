// Подключаем PixiJS
import * as PIXI from 'pixi.js';

// Создаем приложение PixiJS
const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x87CEEB, // Цвет фона
});

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

// Устанавливаем скорость движения кувшинок
const lilyPadSpeed = 1;

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
let isVoiceJumping = false; // Флаг для отслеживания прыжка от голоса

// Добавляем слушатель для нажатия клавиши пробел
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isJumping) {
    startJump(); // Начинаем прыжок при нажатии пробела
  }
});

// Добавляем слушатель для отпускания клавиши пробел
window.addEventListener('keyup', (event) => {
  if (event.code === 'Space') {
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
    // Если голосовой прыжок также не активен, жабка начинает падать
    frog.vy += gravity;
  }
}

// Гравитация и движение
function applyGravity() {
  if (isJumping || isVoiceJumping) {
    frog.y += frog.vy; // Продолжаем подъем
    frog.x += frog.vx; // Продолжаем движение вправо

    // Ограничение высоты прыжка
    if (frog.y <= app.screen.height - maxJumpHeight) {
      frog.y = app.screen.height - maxJumpHeight; // Ограничиваем высоту
      frog.vy = 0; // Останавливаем вертикальное движение вверх
    }
  } else {
    frog.vy += gravity; // Гравитация начинает тянуть жабку вниз
    frog.y += frog.vy;
    frog.x += frog.vx; // Продолжаем горизонтальное движение даже после отпускания пробела
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
      isVoiceJumping = false; // Останавливаем голосовой прыжок при приземлении
      frog.vy = 0;
      frog.vx = 0; // Останавливаем горизонтальное движение после приземления
      frog.y = lilyPad.y - frog.height / 2.5;
      frog.x = lilyPad.x;
      currentLilyPad = lilyPad;
      landedOnLilyPad = true;
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
  document.getElementById('restartButton').style.display = 'block';
}

// Главный игровой цикл
app.ticker.add(() => {
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
});

// Добавляем слушатель к кнопке перезапуска
document.getElementById('restartButton').addEventListener('click', restartGame);

function restartGame() {
  location.reload();
}

// Управление голосом с помощью Web Speech API
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let isSpeaking = false;

    // Проверяем, есть ли промежуточные результаты (interimResults)
    for (let i = 0; i < event.results.length; i++) {
      if (!event.results[i].isFinal && event.results[i][0].transcript.trim() !== "") {
        isSpeaking = true;
        break;
      }
    }

    if (isSpeaking && !isVoiceJumping) {
      isVoiceJumping = true;
      startJump(); // Начинаем прыжок от голоса
    } else if (!isSpeaking && isVoiceJumping) {
      isVoiceJumping = false;
      endJump(); // Завершаем прыжок, если голос прекратился
    }
  };

  recognition.onend = () => {
    isVoiceJumping = false;
    endJump(); // Завершаем прыжок, если распознавание завершено
    recognition.start(); // Перезапускаем распознавание для непрерывного прослушивания
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error", event);
  };

  // Начинаем прослушивание
  recognition.start();
} else {
  alert("Ваш браузер не поддерживает распознавание голоса.");
}
