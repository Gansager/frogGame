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
frog.isFalling = false;
app.stage.addChild(frog);

// Теперь можем использовать заданное значение ширины
const frogWidth = frog.width;
const frogHeight = frog.height;

// Настройки прыжка
const minJumpHeight = frogHeight * 5; // Минимальная высота прыжка
const maxJumpHeight = frogHeight * 0.5; // Максимальная высота прыжка
const minJumpDistance = frogWidth * 2; // Минимальная длина прыжка
const maxJumpDistance = frogWidth * 5; // Максимальная длина прыжка

// Массив кувшинок
const lilyPads = [];

// Создаем первую кувшинку прямо под жабкой
createLilyPad(app.screen.width / 4);
frog.x = lilyPads[0].x;
frog.y = lilyPads[0].y - frogHeight / 2;

// Создаем остальные кувшинки
let initialX = frog.x + maxJumpDistance;
for (let i = 1; i < 5; i++) {
  createLilyPad(initialX);
  initialX += maxJumpDistance + 50;
}

// Функция для создания новой кувшинки
function createLilyPad(xPosition) {
  const lilyPadTexture = PIXI.Texture.from('img/lilyPad.png');
  const lilyPad = new PIXI.Sprite(lilyPadTexture);

  lilyPad.anchor.set(0.5);
  lilyPad.y = app.screen.height - 150;
  lilyPad.width = frogWidth * 3;
  lilyPad.height = frogHeight;

  const minDistance = frogWidth * 3;
  const maxDistance = frogWidth * 5;
  const randomDistance = minDistance + Math.random() * (maxDistance - minDistance);

  lilyPad.x = xPosition + randomDistance;
  app.stage.addChild(lilyPad);
  lilyPads.push(lilyPad);
}

// Настройки прыжка
let isJumping = false;
let jumpStartTime = 0;

// Добавляем слушатель для нажатия и удержания клавиши пробел
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isJumping) {
    jumpStartTime = Date.now(); // Запоминаем время начала прыжка
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'Space' && !isJumping) {
    const holdTime = (Date.now() - jumpStartTime) / 1000;

    // Рассчитываем высоту и длину прыжка в зависимости от времени удержания
    const jumpHeight = Math.min(minJumpHeight + holdTime * (maxJumpHeight - minJumpHeight), maxJumpHeight);
    const jumpDistance = Math.min(minJumpDistance + holdTime * (maxJumpDistance - minJumpDistance), maxJumpDistance);

    jumpFrog(jumpDistance, jumpHeight);
  }
});

// Функция прыжка
function jumpFrog(distance, height) {
  if (!isJumping) {
    isJumping = true;
    frog.vy = -height; // Устанавливаем вертикальную скорость для прыжка
    frog.targetX = frog.x + distance; // Устанавливаем целевое положение по x
    frog.isFalling = false;
  }
}

// Гравитация и проверка приземления
function applyGravity() {
  if (isJumping) {
    frog.vy += 0.5; // Применяем гравитацию
    frog.y += frog.vy;

    // Проверка, достигла ли жабка целевой позиции по горизонтали
    if (frog.x < frog.targetX) {
      frog.x += 5;
    } else {
      frog.x = frog.targetX;
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
        frog.y = lilyPad.y - frogHeight / 2;
        frog.isFalling = false;
        shiftLilyPads();
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

// Функция для сдвига кувшинок влево
function shiftLilyPads() {
  lilyPads.forEach(lilyPad => {
    lilyPad.x -= maxJumpDistance;
  });

  // Удаляем кувшинку за пределами экрана и добавляем новую кувшинку справа
  if (lilyPads[0].x < -lilyPads[0].width) {
    const removedLilyPad = lilyPads.shift();
    app.stage.removeChild(removedLilyPad);
    const lastLilyPadX = lilyPads[lilyPads.length - 1].x;
    createLilyPad(lastLilyPadX + maxJumpDistance + 50);
  }
}

// Функция окончания игры
function endGame() {
  alert('Game Over! Try again.');
  location.reload();
}

// Главный игровой цикл
app.ticker.add(() => {
  applyGravity();
});
