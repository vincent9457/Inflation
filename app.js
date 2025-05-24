const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 查詢 API
app.get('/api/prices', (req, res) => {
    let sql = 'SELECT * FROM prices WHERE 1=1';
    let params = [];
    if (req.query.region) {
        sql += ' AND region = ?';
        params.push(req.query.region);
    }
    if (req.query.type) {
        sql += ' AND type = ?';
        params.push(req.query.type);
    }
    if (req.query.date) {
        sql += ' AND date = ?';
        params.push(req.query.date);
    }
    sql += ' ORDER BY date DESC';
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 新增一筆價格
app.post('/api/prices', (req, res) => {
    const { date, region, type, price } = req.body;
    if (!date || !region || !type || !price) {
        return res.status(400).json({ error: '缺少欄位' });
    }
    db.run(
        `INSERT INTO prices (date, region, type, price) VALUES (?, ?, ?, ?)`,
        [date, region, type, price],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// 匯出 app 讓 bin/www 可以載入
module.exports = app;
