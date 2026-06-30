const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Базовая структура бинара
let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

// Храним плоский список созданных id на текущем уровне для шахматного порядка
let currentLevel = 3; // Начинаем с уровня 3 (буква C)
let registeredInCurrentLevel = []; 

// Функция генерации шахматного порядка для любого уровня (начиная с C)
function getChessSequenceForLevel(level) {
    const maxNodes = Math.pow(2, level - 1);
    const sequence = [];
    
    // Делим уровень на 4 равных блока
    const blockSize = maxNodes / 4;
    
    // Заполняем сначала первые элементы блоков, потом вторые, потом третьи, потом четвертые
    for (let step = 0; step < blockSize; step++) {
        for (let block = 0; block < 4; block++) {
            const indexInLevel = block * blockSize + step + 1;
            sequence.push(indexInLevel);
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

// Отдача дерева + метаданные о текущем заполнении для правильной отрисовки рамок
app.get('/api/tree', (req, res) => {
    res.json({
        tree: treeData,
        currentLevel: currentLevel,
        registeredInCurrentLevel: registeredInCurrentLevel
    });
});

// Роут регистрации
app.post('/api/register', (req, res) => {
    const { login } = req.body;
    if (!login) return res.status(400).json({ success: false, message: "Логин пустой" });

    const letter = getLetterByLevel(currentLevel);
    const maxNodes = Math.pow(2, currentLevel - 1);
    const sequence = getChessSequenceForLevel(currentLevel);

    // Определяем, какой по счету узел должен заполниться следующим
    const nextIndexInSeq = registeredInCurrentLevel.length;
    if (nextIndexInSeq >= maxNodes) {
        return res.status(500).json({ success: false, message: "Уровень переполнен" });
    }

    const nodeNumber = sequence[nextIndexInSeq];
    const assignedId = `${letter}${nodeNumber}`;

    if (autoInsert(treeData, assignedId, login)) {
        registeredInCurrentLevel.push(assignedId);

        // Если уровень полностью заполнен, переходим на следующий
        if (registeredInCurrentLevel.length === maxNodes) {
            currentLevel++;
            registeredInCurrentLevel = [];
        }

        return res.json({ success: true, id: assignedId });
    }

    res.status(500).json({ success: false, message: "Не удалось вставить в структуру" });
});

// Отдача страницы регистрации
app.get('/join.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'join.html'), (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, 'join.html'));
        }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
