let score = 0; // Текущий счет
let highScore = parseInt(localStorage.getItem('highScore')) || 0; // Рекорд из localStorage или 0

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
scoreText.anchor.set(1, 0);
scoreText.x = app.screen.width - 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

const highScoreText = new PIXI.Text(`High Score: ${highScore}`, scoreStyle);
highScoreText.anchor.set(1, 0);
highScoreText.x = app.screen.width - 20;
highScoreText.y = 60;
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
const jumpPower = -8;
const gravity = 0.4;
const horizontalSpeed = 3;
const maxJumpHeight = app.screen.height * 0.75;

// Массив кувшинок и переменная для отслеживания текущей кувшинки
const lilyPads = [];
let currentLilyPad = null;
let lilyPadSpeed = 1.5;
const maxLilyPadSpeed = 3;
let isGameOver = false;

// Настройки для расстояний между кувшинками
const minDistance = 200; // Минимальное расстояние между кувшинками
const maxDistance = 400; // Максимальное расстояние между кувшинками

// Функция для создания новой кувшинки с разным расстоянием
function createLilyPad(previousX) {
  const lilyPadTexture = PIXI.Texture.from('img/lilyPad.png');
  const lilyPad = new PIXI.Sprite(lilyPadTexture);

  lilyPad.anchor.set(0.5);
  lilyPad.y = app.screen.height - 50; // Устанавливаем кувшинку у нижнего края экрана

  // Генерируем случайное расстояние для новой кувшинки
  const randomDistance = minDistance + Math.random() * (maxDistance - minDistance);
  lilyPad.x = previousX + randomDistance;

  lilyPad.width = frog.width * 3;
  lilyPad.height = frog.height;

  app.stage.addChild(lilyPad);
  lilyPads.push(lilyPad);
}

// Создаем начальные кувшинки с разным расстоянием
let initialX = app.screen.width / 4;
createLilyPad(initialX);
currentLilyPad = lilyPads[0];
frog.x = currentLilyPad.x;
frog.y = currentLilyPad.y - frog.height / 2.5;

// Создаем оставшиеся начальные кувшинки с случайным расстоянием
for (let i = 1; i < 5; i++) {
  initialX = lilyPads[lilyPads.length - 1].x; // Получаем X координату последней созданной кувшинки
  createLilyPad(initialX); // Создаем новую кувшинку с случайным расстоянием от предыдущей
}

// Обновляем цикл создания кувшинок при движении
app.ticker.add(() => {
  if (!isGameOver) {
    applyGravity();

    // Двигаем кувшинки справа налево
    lilyPads.forEach(lilyPad => {
      lilyPad.x -= lilyPadSpeed;
    });

    // Удаляем кувшинку за пределами экрана и добавляем новую кувшинку справа с случайным расстоянием
    if (lilyPads[0].x < -lilyPads[0].width) {
      const removedLilyPad = lilyPads.shift();
      app.stage.removeChild(removedLilyPad);

      const lastLilyPadX = lilyPads[lilyPads.length - 1].x;
      createLilyPad(lastLilyPadX); // Создаем новую кувшинку с случайным расстоянием
    }
  }
});


// Функция для установки позиции жабки и кувшинок при изменении размера экрана
function setPositionForBottom() {
  lilyPads.forEach((lilyPad) => {
    lilyPad.y = app.screen.height - 50; // Устанавливаем кувшинки у нижнего края экрана
  });

  // Обновляем позицию жабки
  if (currentLilyPad) {
    frog.y = currentLilyPad.y - frog.height / 2.5;
  }
}

// Вызываем функцию установки позиции при загрузке
setPositionForBottom();

// Обработчик изменения размера экрана
window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  setPositionForBottom();
  scoreText.x = app.screen.width - 20;
  highScoreText.x = app.screen.width - 20;
  highScoreText.y = scoreText.height + 20;
});

// Остальной код для прыжков, управления и завершения игры остается без изменений

// Настройки прыжка
let isJumping = false;
let isVoiceJumping = false;

// Добавляем слушатель для нажатия клавиши пробел
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isJumping && !isGameOver) {
    startJump();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'Space' && !isGameOver) {
    endJump();
  }
});

function startJump() {
  isJumping = true;
  frog.vy = jumpPower;
  frog.vx = horizontalSpeed;
}

function endJump() {
  isJumping = false;
  if (!isVoiceJumping) {
    frog.vy += gravity;
  }
}

// Гравитация и движение
function applyGravity() {
  if (isGameOver) return;

  if (isJumping || isVoiceJumping) {
    frog.y += frog.vy;
    frog.x += frog.vx;

    if (frog.y <= app.screen.height - maxJumpHeight) {
      frog.y = app.screen.height - maxJumpHeight;
      frog.vy = 0;
    }
  } else {
    frog.vy += gravity;
    frog.y += frog.vy;
    frog.x += frog.vx;
  }

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

      score++;
      scoreText.text = `Score: ${score}`;

      if (score > highScore) {
        highScore = score;
        highScoreText.text = `High Score: ${highScore}`;
        localStorage.setItem('highScore', highScore);
      }

      lilyPadSpeed = Math.min(lilyPadSpeed * 1, maxLilyPadSpeed);
      break;
    }
  }

  if (!landedOnLilyPad && frog.y > app.screen.height) {
    endGame();
  }
}

function endGame() {
  isGameOver = true;

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

  document.getElementById('restartButton').style.display = 'block';
}

app.ticker.add(() => {
  if (!isGameOver) {
    applyGravity();

    lilyPads.forEach(lilyPad => {
      lilyPad.x -= lilyPadSpeed;
    });

    if (lilyPads[0].x < -lilyPads[0].width) {
      const removedLilyPad = lilyPads.shift();
      app.stage.removeChild(removedLilyPad);
      const lastLilyPadX = lilyPads[lilyPads.length - 1].x;
      createLilyPad(lastLilyPadX + 300);
    }
  }
});

document.getElementById('restartButton').addEventListener('click', restartGame);

function restartGame() {
  score = 0;
  scoreText.text = `Score: ${score}`;
  location.reload();
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
