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

// Вспомогательная функция поиска места
function autoInsert(root, targetId, loginName) {
    if (!root) return false;
    
    // Если мы нашли родителя
    if (root.id === targetId.replace(/[0-9]/g, '').slice(0, -1) || (targetId.startsWith('A') && root.id === 'Admin')) {
        // Упрощенная логика для примера вставки
        if (!root.left) { root.left = { login: loginName, id: targetId, left: null, right: null }; return true; }
        if (!root.right) { root.right = { login: loginName, id: targetId, left: null, right: null }; return true; }
    }
    
    return autoInsert(root.left, targetId, loginName) || autoInsert(root.right, targetId, loginName);
}

app.get('/api/tree', (req, res) => {
    res.json(treeData);
});

app.post('/api/register', (req, res) => {
    const { login, targetId } = req.body; // Теперь мы принимаем ID куда регистрировать
    
    if (autoInsert(treeData, targetId, login)) {
        saveData();
        return res.json({ success: true });
    }
    
    res.status(500).json({ success: false, message: "Место занято или ошибка" });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
