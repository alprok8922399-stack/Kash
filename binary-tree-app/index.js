const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Базовая структура
const getInitialTree = () => ({
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
});

let treeData = getInitialTree();
let currentLevel = 3; // Начинаем тесты с уровня C (level 3)
let registeredInCurrentLevel = []; 

// СТРОГАЯ ЛОГИКА ЧЕТВЁРОК 👑
function getChessSequenceForLevel(level) {
    const maxNodes = Math.pow(2, level - 1);
    const sequence = [];
    const totalQuads = maxNodes / 4; // Сколько всего четвёрок на уровне

    // Шагаем по позициям внутри четвёрок: сначала все 1-ые, потом все 2-ые, 3-ии, 4-ые
    for (let position = 0; position < 4; position++) {
        for (let quadIndex = 0; quadIndex < totalQuads; quadIndex++) {
            // Номер ячейки = (номер четвёрки * 4) + (позиция внутри четвёрки + 1)
            const nodeNumber = (quadIndex * 4) + position + 1;
            sequence.push(nodeNumber);
        }
    }
    return sequence;
}

function getLetterByLevel(level) {
    if (level === 1) return "Admin";
    return String.fromCharCode(65 + level - 2);
}

function autoInsert(root, targetId, loginName) {
    if (!root) return false;
    const targetLetter = targetId.replace(/[\d]/g, '');
    const targetNum = parseInt(targetId.replace(/[^\d]/g, ''));
    
    let parentId = "";
    if (targetLetter === "A") parentId = "Admin";
    else {
        const parentLetter = String.fromCharCode(targetLetter.charCodeAt(0) - 1);
        const parentNum = Math.ceil(targetNum / 2);
        parentId = parentLetter === "@" ? "Admin" : `${parentLetter}${parentNum}`;
    }

    if (root.id === parentId) {
        if (targetNum % 2 !== 0) {
            if (!root.left) {
                root.left = { login: loginName, id: targetId, left: null, right: null };
                return true;
            }
        } else {
            if (!root.right) {
                root.right = { login: loginName, id: targetId, left: null, right: null };
                return true;
            }
        }
    }
    return autoInsert(root.left, targetId, loginName) || autoInsert(root.right, targetId, loginName);
}

app.get('/api/tree', (req, res) => {
    res.json({
        tree: treeData,
        currentLevel: currentLevel,
        registeredInCurrentLevel: registeredInCurrentLevel
    });
});

app.post('/api/register', (req, res) => {
    const { login } = req.body;
    if (!login) return res.status(400).json({ success: false, message: "Логин пустой" });

    const letter = getLetterByLevel(currentLevel);
    const maxNodes = Math.pow(2, currentLevel - 1);
    const sequence = getChessSequenceForLevel(currentLevel);

    const nextIndexInSeq = registeredInCurrentLevel.length;
    if (nextIndexInSeq >= maxNodes) {
        return res.status(500).json({ success: false, message: "Уровень переполнен" });
    }

    const nodeNumber = sequence[nextIndexInSeq];
    const assignedId = `${letter}${nodeNumber}`;

    if (autoInsert(treeData, assignedId, login)) {
        registeredInCurrentLevel.push(assignedId);
        if (registeredInCurrentLevel.length === maxNodes) {
            currentLevel++;
            registeredInCurrentLevel = [];
        }
        return res.json({ success: true, id: assignedId });
    }
    res.status(500).json({ success: false, message: "Ошибка вставки" });
});

app.post('/api/reset', (req, res) => {
    treeData = getInitialTree();
    currentLevel = 3;
    registeredInCurrentLevel = [];
    res.json({ success: true, message: "Структура успешно сброшена в начало!" });
});

app.get('/join.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'join.html'), (err) => {
        if (err) res.sendFile(path.join(__dirname, 'join.html'));
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
