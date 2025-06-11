const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./egg_prices.db');

const url = 'https://data.moa.gov.tw/api/v1/PoultryTransType_BoiledChicken_Eggs/?Start_time=2018/01/01&End_time=2025/12/31';

// 你可以根據API說明/實際欄位建立友善中文對照表，沒對應到就顯示原始key
const typeNameMap = {
    "TaijinPrice_2.0kgup": "白肉雞2.0Kg以上",
    "TaijinPrice_1.75kg_1.95kg": "白肉雞1.75-1.95Kg",
    "Store_KP_TaijinPrice": "白肉雞門市價高屏",
    "egg_TaijinPrice": "雞蛋產地價"
    // 你可以依照API未來新增欄位繼續加
};

axios.get(url).then(res => {
    const arr = res.data.Data;
    arr.forEach(row => {
        const date = row.TransDate.replace(/\//g, '-');
        const region = "全台";
        Object.entries(row).forEach(([key, value]) => {
            // 過濾掉非價格、非數值的欄位
            if (
                key !== 'TransDate' &&
                key !== 'LunarCalendar' &&
                value && !isNaN(Number(value))
            ) {
                // 如果有中文對應用中文，沒有就用原始key
                const friendlyType = typeNameMap[key] || key;
                db.run(
                    'INSERT OR IGNORE INTO prices (date, region, type, price) VALUES (?, ?, ?, ?)',
                    [date, region, friendlyType, parseFloat(value)]
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
