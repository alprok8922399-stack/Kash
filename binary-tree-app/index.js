const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Рекурсивная функция для поиска первой пустой ячейки
function findAndFill(node, login) {
    if (!node.left) {
        node.left = { login: login, left: null, right: null };
        return true;
    }
    if (findAndFill(node.left, login)) return true;
    
    if (!node.right) {
        node.right = { login: login, left: null, right: null };
        return true;
    }
    return findAndFill(node.right, login);
}

app.post('/add-user', (req, res) => {
    const { login } = req.body;
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Запускаем поиск места, начиная с Admin
    if (findAndFill(data, login)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.send({ success: true });
    } else {
        res.status(400).send('Мест нет!');
    }
});

app.listen(3000, () => console.log('Сервер запущен. Дерево растет бесконечно!'));
