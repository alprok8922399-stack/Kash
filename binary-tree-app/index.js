const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Путь к базе данных
const DATA_FILE = path.join(__dirname, 'data.json');

// Метод для записи нового пользователя в первую свободную ячейку
app.post('/add-user', (req, res) => {
    const { login } = req.body;
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Простейшая логика: ищем, кто пустой (null)
    if (!data.left) {
        data.left = { login: login, left: null, right: null };
    } else if (!data.right) {
        data.right = { login: login, left: null, right: null };
    } else {
        return res.status(400).send('Структура заполнена!');
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.send({ success: true });
});

app.listen(3000, () => console.log('Сервер запущен на порту 3000'));
