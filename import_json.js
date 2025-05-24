const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./egg_prices.db');
const data = JSON.parse(fs.readFileSync('eggprice.json', 'utf8'));

data.forEach(row => {
    db.run(
        'INSERT OR IGNORE INTO prices (date, region, type, price) VALUES (?, ?, ?, ?)',
        [row.date, row.region, row.type, row.price]
    );
});

console.log('匯入完成！');
db.close();
