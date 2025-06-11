const cron = require('node-cron');
const { exec } = require('child_process');

cron.schedule('0 */8 * * *', () => {
    console.log('開始自動更新雞蛋價格資料...');
    exec('node fetchEggPrice.js', (err, stdout, stderr) => {
        if (err) {
            console.error('自動更新失敗：', err);
        } else {
            console.log(stdout);
        }
    });
});

console.log('排程自動更新啟動中...');
