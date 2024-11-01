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
frog.vx = 0; // Добавляем горизонтальную скорость
frog.isFalling = false;
app.stage.addChild(frog);

// Теперь можем использовать заданное значение ширины
const frogWidth = frog.width;
const frogHeight = frog.height;

// Настройки прыжка
const minJumpHeight = frogHeight * 0.1; // Минимальная высота прыжка
const maxJumpHeight = app.screen.height * 3; // Максимальная высота прыжка, ограничена до 30% высоты экрана
const minJumpDistance = frogWidth * 3; // Увеличена минимальная длина прыжка для большей дальности
const maxJumpDistance = frogWidth * 10; // Увеличенная максимальная длина прыжка для достижения следующей кувшинки
const maxHoldTime = 0.5; // Максимальное время удержания пробела (в секундах)
const maxVy = -15; // Максимальное значение для вертикальной скорости, чтобы не улетать за экран

// Массив кувшинок и переменная для отслеживания текущей кувшинки
const lilyPads = [];
let currentLilyPad = null; // Переменная для отслеживания кувшинки, на которой стоит жабка

// Устанавливаем скорость движения кувшинок
const lilyPadSpeed = 1; // Скорость движения кувшинок

// Создаем первую кувшинку прямо под жабкой
createLilyPad(app.screen.width / 4);
currentLilyPad = lilyPads[0]; // Привязываем жабку к первой кувшинке
frog.x = currentLilyPad.x;
frog.y = currentLilyPad.y - frogHeight / 2.5;

// Создаем остальные кувшинки
let initialX = frog.x + maxJumpDistance;
for (let i = 1; i < 5; i++) {
  createLilyPad(initialX);
  initialX += maxJumpDistance;
}

// Функция для создания новой кувшинки
function createLilyPad(xPosition) {
  const lilyPadTexture = PIXI.Texture.from('img/lilyPad.png');
  const lilyPad = new PIXI.Sprite(lilyPadTexture);

  lilyPad.anchor.set(0.5);
  lilyPad.y = app.screen.height - 150;
  lilyPad.width = frogWidth * 3;
  lilyPad.height = frogHeight;

  const minDistance = frogWidth * 0.001;
  const maxDistance = frogWidth * 2;
  const randomFactor = Math.random() * 0.5 + 0.5; // Множитель от 0.75 до 1.25 для изменения расстояния
  const randomDistance = (minDistance + Math.random() * (maxDistance - minDistance)) * randomFactor;

  lilyPad.x = xPosition + randomDistance;
  app.stage.addChild(lilyPad);
  lilyPads.push(lilyPad);
}

// Настройки прыжка
let isJumping = false;
let jumpStartTime = 0;
let isSpaceHeld = false; // Флаг для отслеживания удержания пробела

// Добавляем слушатель для нажатия клавиши пробел
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isJumping && !isSpaceHeld) {
    jumpStartTime = Date.now(); // Запоминаем время начала прыжка
    isSpaceHeld = true; // Устанавливаем флаг удержания пробела
  }
});

// Добавляем слушатель для отпускания клавиши пробел
window.addEventListener('keyup', (event) => {
  if (event.code === 'Space' && !isJumping) {
    const holdTime = Math.min((Date.now() - jumpStartTime) / 1000, maxHoldTime); // Ограничиваем holdTime до maxHoldTime
    console.log("Hold Time:", holdTime); // Выводим время удержания в консоль

    // Вычисляем коэффициент на основе времени удержания (от 0 до 1)
    const holdRatio = holdTime / maxHoldTime;

    // Рассчитываем высоту и длину прыжка в зависимости от коэффициента удержания
    const jumpHeight = minJumpHeight + holdRatio * (maxJumpHeight - minJumpHeight);
    const jumpDistance = minJumpDistance + holdRatio * (maxJumpDistance - minJumpDistance);

    console.log("Calculated Jump Distance:", jumpDistance); // Выводим рассчитанную длину прыжка
    jumpFrog(jumpDistance, jumpHeight);

    isSpaceHeld = false; // Сбрасываем флаг после завершения прыжка
  }
});

// Функция прыжка
function jumpFrog(distance, height) {
  if (!isJumping) {
    isJumping = true;
    frog.vy = Math.max(-height, maxVy); // Устанавливаем вертикальную скорость для прыжка, ограниченную maxVy
    frog.vx = distance / 15; // Устанавливаем горизонтальную скорость на основе рассчитанного расстояния
    frog.targetX = frog.x + distance; // Устанавливаем целевое положение по x
    frog.isFalling = false;
    currentLilyPad = null; // Отключаем привязку к кувшинке при начале прыжка
  }
}

// Гравитация и проверка приземления
function applyGravity() {
  if (isJumping) {
    frog.vy += 0.3; // Гравитация для плавного прыжка
    frog.y += frog.vy;
    frog.x += frog.vx; // Применяем горизонтальную скорость

    // Проверка достижения целевой позиции по X
    if ((frog.vx > 0 && frog.x >= frog.targetX) || (frog.vx < 0 && frog.x <= frog.targetX)) {
      frog.x = frog.targetX;
      frog.vx = 0; // Останавливаем жабку по горизонтали
    }

    // Проверка приземления на кувшинку
    for (let i = 0; i < lilyPads.length; i++) {
      const lilyPad = lilyPads[i];
      if (
        Math.abs(frog.x - lilyPad.x) < lilyPad.width / 2 &&
        frog.y >= lilyPad.y - frogHeight / 2 &&
        frog.isFalling
      ) {
        isJumping = false;
        frog.vy = 0;
        frog.y = lilyPad.y - frogHeight / 2.5; // Позиционируем жабку на кувшинке

        // Устанавливаем жабку по центру кувшинки
        frog.x = lilyPad.x;

        frog.isFalling = false;
        currentLilyPad = lilyPad; // Привязываем жабку к кувшинке
        return;
      }
    }


    // Если жабка начинает падать после достижения максимальной высоты
    if (frog.vy > 0) {
      frog.isFalling = true;
    }

    // Проверка на падение за пределы экрана
    if (frog.y > app.screen.height) {
      endGame();
    }
  }
}

// Главный игровой цикл
app.ticker.add(() => {
  applyGravity();

  // Двигаем кувшинки справа налево
  lilyPads.forEach(lilyPad => {
    lilyPad.x -= lilyPadSpeed;
  });

  // Если жабка стоит на кувшинке, обновляем её позицию вместе с кувшинкой
  if (!isJumping && currentLilyPad) {
    frog.x = currentLilyPad.x;
  }

  // Удаляем кувшинку за пределами экрана и добавляем новую кувшинку справа
  if (lilyPads[0].x < -lilyPads[0].width) {
    const removedLilyPad = lilyPads.shift();
    app.stage.removeChild(removedLilyPad);
    const lastLilyPadX = lilyPads[lilyPads.length - 1].x;
    createLilyPad(lastLilyPadX + maxJumpDistance);
  }
});

// Функция окончания игры
function endGame() {
  document.getElementById('restartButton').style.display = 'block'; // Показываем кнопку перезапуска
}

// Добавляем слушатель к кнопке перезапуска
document.getElementById('restartButton').addEventListener('click', restartGame);

function restartGame() {
  location.reload(); // Перезагружает страницу, чтобы перезапустить игру
}