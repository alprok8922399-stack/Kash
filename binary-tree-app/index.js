const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Функция поиска места по уровням (как курсор)
function findPlace(node, login) {
    let queue = [node];
    
    while (queue.length > 0) {
        let current = queue.shift();

        // Проверяем левого ребенка
        if (!current.left) {
            current.left = { login: login, left: null, right: null };
            return true;
        } else {
            queue.push(current.left);
        }

        // Проверяем правого ребенка
        if (!current.right) {
            current.right = { login: login, left: null, right: null };
            return true;
        } else {
            queue.push(current.right);
        }
    }
    return false;
}

app.post('/add-user', (req, res) => {
    const { login } = req.body;
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    if (findPlace(data, login)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.send({ success: true });
    } else {
        res.status(400).send('Мест нет!');
    }
});

app.listen(3000, () => console.log('Сервер работает по правилу «Курсора»'));
