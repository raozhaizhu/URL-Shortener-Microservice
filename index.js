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
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// 存储URL映射关系
let urlDatabase = {};

// 创建短链API
app.post('/api/shorturl', function (req, res) {
    const { url } = req.body;

    // 1.验证URL格式
    if (!validUrl.isWebUri(url)) {
        // 使用新的 URL 构造器验证格式
        try {
            new URL(url);
        } catch (_) {
            return res.json({ error: 'invalid url' });
        }
    }

    // 1.2 如果URL格式正确，生成短链
    const shortUrl = shortid.generate();

    // 2.将短链和URL映射关系存储到数据库中
    urlDatabase[shortUrl] = url;

    // 3.返回短链
    res.json({ original_url: url, short_url: shortUrl });
});

// 通过短链重定向到原始URL
app.get('/api/shorturl/:shortUrl', function (req, res) {
    const { shortUrl } = req.params;

    // 1.从数据库中获取原始URL
    const originalUrl = urlDatabase[shortUrl];

    // 2.如果原始URL不存在，返回错误信息
    if (!originalUrl) {
        return res.json({ error: 'No short URL found' });
    }

    // 3.重定向到原始URL
    res.redirect(originalUrl);
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});

