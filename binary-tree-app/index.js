const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Стартовая структура бинара в оперативной памяти сервера
let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

// Переменные для поиска свободных мест по рядам
let currentTargetLevel = 3; 
let currentTargetNum = 1;

function getLetterByLevel(level) {
    if (level === 1) return "Admin";
    return String.fromCharCode(65 + level - 2);
}

function findNodeById(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    return findNodeById(root.left, id) || findNodeById(root.right, id);
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

// Отдача структуры дерева на фронтенд
app.get('/api/tree', (req, res) => {
    res.json(treeData);
});

// Регистрация нового логина с гостевой страницы
app.post('/api/register', (req, res) => {
    const { login } = req.body;
    if (!login) return res.status(400).json({ success: false, message: "Логин пустой" });

    const letter = getLetterByLevel(currentTargetLevel);
    const assignedId = `${letter}${currentTargetNum}`;

    if (autoInsert(treeData, assignedId, login)) {
        currentTargetNum++;
        const maxInRow = Math.pow(2, currentTargetLevel - 1); 
        if (currentTargetNum > maxInRow) {
            currentTargetLevel++;
            currentTargetNum = 1;
        }
        return res.json({ success: true, id: assignedId });
    }

    res.status(500).json({ success: false, message: "Не удалось найти место в структуре" });
});

// Железобетонная отдача страницы регистрации, где бы файл ни лежал
app.get('/join.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'join.html'), (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, 'join.html'));
        }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на порту ${PORT}`);
});
