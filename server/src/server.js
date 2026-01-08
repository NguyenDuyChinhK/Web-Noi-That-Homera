const express = require('express');
const app = express();
const port = 3000;

const connectDB = require('./config/connectDB');
const routes = require('./routes');
const { askQuestion } = require('./utils/chatbot');

require('dotenv').config();

const cors = require('cors');
const cookiesParser = require('cookie-parser');
const path = require('path');

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookiesParser());

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../src')));

app.post('/api/chatbot', async (req, res) => {
    const { question } = req.body;
    const data = await askQuestion(question);
    return res.status(200).json(data);
});

connectDB();
routes(app);

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
