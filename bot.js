const { Telegraf } = require('telegraf'); // Используем библиотеку telegraf для Node.js
const bot = new Telegraf('7814583439:AAGk0LbYWw-UbIDcjgS74HbKICX15RSG9Ck'); // токен вашего бота

bot.command('game', (ctx) => {
  ctx.telegram.sendGame(ctx.chat.id, 'frogGame');
});

// Запуск бота
bot.launch();
