// "use strict"
// /* -------------------------------------------------------
//     | FULLSTACK TEAM | NODEJS / EXPRESS |
// ------------------------------------------------------- */
// // $ npm i morgan
// // app.use(logger):

// const morgan = require('morgan')
// const fs = require('node:fs')

// const now = new Date()
// const today = now.toISOString().split('T')[0]

// module.exports = morgan('combined', {
//     stream: fs.createWriteStream(`./logs/${today}.log`, { flags: 'a+' })
// })

"use strict";

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Günün tarihini al
const now = new Date();
const today = now.toISOString().split('T')[0];

// Logs dizininin yolunu belirleyin
const logDirectory = path.join(__dirname, 'logs');

// Logs dizininin var olup olmadığını kontrol edin, yoksa oluşturun
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Log dosyasının yolunu belirleyin
const logFilePath = path.join(logDirectory, `${today}.log`);

// Morgan'ı yapılandırın
const logger = morgan('combined', {
    stream: fs.createWriteStream(logFilePath, { flags: 'a+' })
});

// Logger'ı export edin
module.exports = logger;
