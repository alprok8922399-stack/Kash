const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Алгоритм поиска пустого места "как курсор"
function findNextEmptySlot(node, login) {
    let queue = [node];
    
    while (queue.length > 0) {
        let current = queue.shift();

        // Проверяем левую позицию
        if (!current.left) {
            current.left = { login: login, left: null, right: null };
            return true;
        } else {
            queue.push(current.left);
        }

        // Проверяем правую позицию
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

    if (findNextEmptySlot(data, login)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.send({ success: true });
    } else {
        res.status(400).send('Структура переполнена');
    }
});

app.listen(3000, () => console.log('Система работает по правилу «Курсора»'));
