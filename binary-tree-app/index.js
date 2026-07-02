const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'public', 'data.json');

// Загрузка или инициализация данных
let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

// Функция сохранения
const saveData = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(treeData, null, 2));
};

// Поиск любого узла в дереве по его ID
function findNodeById(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    return findNodeById(root.left, id) || findNodeById(root.right, id);
}

// Перевод уровня в букву
function getLetterByLevel(level) {
    if (level === 1) return "Admin";
    return String.fromCharCode(65 + level - 2);
}

// Безопасная вставка по targetId
function insertByTargetId(root, targetId, loginName) {
    if (!targetId) return false;

    // 1. Если это самый первый уровень под Админом
    if (targetId === "A1" && root.id === "Admin") {
        if (!root.left) { root.left = { login: loginName, id: "A1", left: null, right: null }; return true; }
        return false;
    }
    if (targetId === "A2" && root.id === "Admin") {
        if (!root.right) { root.right = { login: loginName, id: "A2", left: null, right: null }; return true; }
        return false;
    }

    // 2. Для всех остальных уровней (B, C, D, E, F...)
    // Извлекаем букву и номер позиции (например, из "C3" получим letter="C", num=3)
    const letter = targetId.replace(/[^\nA-Z]/g, '');
    const num = parseInt(targetId.replace(/[^\d]/g, ''));
    if (!letter || isNaN(num)) return false;

    // Вычисляем уровень текущего targetId по его букве
    // Буква A - 2 уровень, B - 3 уровень, C - 4 уровень и т.д.
    const currentLevel = letter.charCodeAt(0) - 65 + 2;
    
    // Определяем букву и номер родительского узла
    const parentLetter = getLetterByLevel(currentLevel - 1);
    const parentNum = Math.floor((num + 1) / 2);
    const parentId = parentLetter === "Admin" ? "Admin" : `${parentLetter}${parentNum}`;

    // Находим родителя в дереве
    const parentNode = findNodeById(root, parentId);
    if (!parentNode) return false; // Родителю пока нет места в структуре

    // Определяем, левый это потомок или правый (нечётные — левые, чётные — правые)
    if (num % 2 !== 0) {
        if (!parentNode.left) {
            parentNode.left = { login: loginName, id: targetId, left: null, right: null };
            return true;
        }
    } else {
        if (!parentNode.right) {
            parentNode.right = { login: loginName, id: targetId, left: null, right: null };
            return true;
        }
    }

    return false; // Место уже занято
}

app.get('/api/tree', (req, res) => {
    res.json(treeData);
});

app.post('/api/register', (req, res) => {
    const { login, targetId } = req.body;
    
    if (!login || !targetId) {
        return res.status(400).json({ success: false, message: "Не переданы login или targetId" });
    }
    
    if (insertByTargetId(treeData, targetId, login)) {
        saveData();
        return res.json({ success: true });
    }
    
    res.status(500).json({ success: false, message: "Место занято или родитель не существует" });
});

// Роут для сброса дерева тестов
app.post('/api/reset', (req, res) => {
    treeData = {
        login: "Admin", id: "Admin",
        left: { login: "User_Left_1", id: "A1", left: null, right: null },
        right: { login: "User_Right_1", id: "A2", left: null, right: null }
    };
    saveData();
    res.json({ success: true, message: "Дерево успешно обнулено!" });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
