// This script copies emailTemplate.html to the dist folder after build
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../emailTemplate.html');
const dest = path.join(__dirname, './dist/emailTemplate.html');

fs.copyFileSync(src, dest);
console.log('Copied emailTemplate.html to dist folder.');
