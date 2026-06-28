const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Алгоритм с "Правилом четырех"
function addByRuleOfFour(node, login) {
    // Получаем текущие слоты 2-го уровня (LL, LR, RL, RR)
    const level2 = [
        node.left.left, node.left.right,
        node.right.left, node.right.right
    ];

    // Проверяем: заполнена ли вся "четверка"?
    const isFourFull = level2.every(slot => slot !== null);

    if (!isFourFull) {
        // Если не заполнена - "курсор" заполняет дырки в этой четверке
        if (!node.left.left) node.left.left = { login, left: null, right: null };
        else if (!node.left.right) node.left.right = { login, left: null, right: null };
        else if (!node.right.left) node.right.left = { login, left: null, right: null };
        else if (!node.right.right) node.right.right = { login, left: null, right: null };
        return true;
    } else {
        // Если заполнена - переходим глубже (здесь будет логика расширения на 8)
        return false; 
    }
}

app.post('/add-user', (req, res) => {
    const { login } = req.body;
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    if (addByRuleOfFour(data, login)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.send({ success: true });
    } else {
        res.status(400).send('Четверка заполнена, жду команду на расширение!');
    }
});

app.listen(3000, () => console.log('Система работает по строгому ПРАВИЛУ ЧЕТЫРЕХ'));
