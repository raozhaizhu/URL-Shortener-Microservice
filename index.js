// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const shortid = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 x-www-form-urlencoded 数据
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// 存储URL映射关系
let urlDatabase = {};

// 创建短链 API
app.post('/api/shorturl', function (req, res) {
    const { url } = req.body;
    // 1. 验证 URL 格式
    if (!validUrl.isWebUri(url)) {
        return res.json({ error: 'invalid url' });
    }

    // 2. 如果 URL 格式正确，生成短链
    const shortUrl = shortid.generate();

    // 3. 将短链和 URL 映射关系存储到数据库中
    urlDatabase[shortUrl] = url;

    // 4. 返回短链
    res.json({ original_url: url, short_url: shortUrl });
});

// 通过短链重定向到原始 URL
app.get('/api/shorturl/:shortUrl', function (req, res) {
    const { shortUrl } = req.params;
    const originalUrl = urlDatabase[shortUrl];

    if (!originalUrl) {
        return res.json({ error: 'no such short url' });
    }

    res.redirect(originalUrl);
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});

