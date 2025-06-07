const cron = require('node-cron');
const { exec } = require('child_process');

// 每天凌晨 5 點自動執行一次爬蟲
cron.schedule('0 5 * * *', () => {
    console.log('開始自動更新雞蛋價格資料...');
    exec('node fetchEggPrice.js', (err, stdout, stderr) => {
        if (err) {
            console.error('自動更新失敗：', err);
        } else {
            console.log(stdout);
        }
    });
});

// 讓這個腳本持續運行
console.log('排程自動更新啟動中（每天凌晨5點）...');
