const express = require('express');
const cors = require('cors');
const db = require('./db');
const crawlAndSave = require('./crawler');

const app = express();
app.use(cors());
app.use(express.json());

// 查詢 API（可用 /api/prices?region=全台&type=產地價&date=2024-05-23）
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

// 手動新增一筆價格（非必要，主要給你測試用）
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

// 自動執行爬蟲 API（僅限本地端開發用）
app.post('/api/crawl', async (req, res) => {
    try {
        await crawlAndSave();
        res.json({ status: 'ok' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
