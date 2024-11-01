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
  const maxDistance = frogWidth * 4;
  const randomFactor = Math.random() * 0.2 + 0.5; // Множитель от 0.75 до 1.25 для изменения расстояния
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

// Гравитация и параболическая траектория прыжка
function applyGravity() {
  if (isJumping) {
    // Увеличиваем время, чтобы рассчитать следующую позицию
    frog.time += 0.05; // Задаем небольшое приращение для плавного движения

    // Рассчитываем x-позицию (линейное движение к целевой точке)
    const progress = Math.min(frog.time / 1, 1); // Ограничиваем прогресс до 1
    frog.x = frog.startX + (frog.targetX - frog.startX) * progress;

    // Рассчитываем y-позицию (параболическая траектория)
    const a = frog.startY; // Начальная позиция
    const b = frog.peakY;  // Пиковая точка (высота)
    const c = frog.startY; // Конечная позиция
    frog.y = (1 - progress) * ((1 - progress) * a + progress * b) + progress * ((1 - progress) * b + progress * c);

    // Проверка приземления на кувшинку
    let landedOnLilyPad = false;
    for (let i = 0; i < lilyPads.length; i++) {
      const lilyPad = lilyPads[i];
      if (
        Math.abs(frog.x - lilyPad.x) < lilyPad.width / 2 &&
        frog.y >= lilyPad.y - frogHeight / 2
      ) {
        isJumping = false;
        frog.vy = 0;
        frog.y = lilyPad.y - frogHeight / 2.5; // Позиционируем жабку на кувшинке
        frog.x = lilyPad.x;
        currentLilyPad = lilyPad; // Привязываем жабку к кувшинке
        landedOnLilyPad = true;
        break;
      }
    }

   // Если прыжок завершен, но жабка не приземлилась на кувшинку, заканчиваем игру
   if (!landedOnLilyPad && progress === 1) {
    frog.isFalling = true; // Устанавливаем флаг падения
  }

  // Если жабка в режиме падения, увеличиваем вертикальную скорость
  if (frog.isFalling) {
    frog.vy += 10; // Ускоряем падение
    frog.y += frog.vy;
  }

  // Проверка на падение за пределы экрана
  if (frog.y > app.screen.height) {
    endGame(); // Завершаем игру, когда жабка выходит за пределы экрана
    }
  }
}

// Функция для завершения игры
function endGame() {
  document.getElementById('restartButton').style.display = 'block'; // Показываем кнопку перезапуска
}

// Начинаем прыжок с параболической траекторией
function jumpFrog(distance, height) {
  if (!isJumping) {
    isJumping = true;
    frog.startX = frog.x;
    frog.startY = frog.y;
    frog.targetX = frog.startX + distance;
    frog.peakY = frog.startY - height; // Пик высоты прыжка
    frog.time = 0; // Обнуление времени прыжка
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


// Добавляем слушатель к кнопке перезапуска
document.getElementById('restartButton').addEventListener('click', restartGame);

function restartGame() {
  location.reload(); // Перезагружает страницу, чтобы перезапустить игру
}