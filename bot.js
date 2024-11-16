require('dotenv').config();
const { Telegraf } = require('telegraf'); // Используем библиотеку telegraf для Node.js
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN); // токен вашего бота

bot.command('game', (ctx) => {
  ctx.telegram.sendGame(ctx.chat.id, 'frogGame');
});

// Запуск бота
bot.launch();
