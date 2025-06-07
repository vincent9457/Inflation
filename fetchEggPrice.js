const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./egg_prices.db');

const url = 'https://data.moa.gov.tw/api/v1/PoultryTransType_BoiledChicken_Eggs/?Start_time=2018/01/01&End_time=2025/12/31';

axios.get(url).then(res => {
    const arr = res.data.Data;
    arr.forEach(row => {
        const date = row.TransDate.replace(/\//g, '-');
        const region = "全台";
        [
            { type: "白肉雞2.0Kg以上", price: row["TaijinPrice_2.0kgup"] },
            { type: "白肉雞1.75-1.95Kg", price: row["TaijinPrice_1.75kg_1.95kg"] },
            { type: "白肉雞門市價高屏", price: row["Store_KP_TaijinPrice"] },
            { type: "雞蛋產地價", price: row["egg_TaijinPrice"] }
        ].forEach(item => {
            if (item.price && !isNaN(Number(item.price))) {
                db.run(
                    'INSERT OR IGNORE INTO prices (date, region, type, price) VALUES (?, ?, ?, ?)',
                    [date, region, item.type, parseFloat(item.price)]
                );
            }
        });
    });

    const now = new Date().toISOString();
    db.run(
        'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
        ['last_update', now],
        (err) => {
            if (err) console.error('更新 last_update 失敗：', err);
            else console.log('雞蛋價格自動匯入完成！最後更新時間：' + now);
            db.close();
        }
    );
}).catch(e => {
    console.error('匯入失敗：', e);
});
