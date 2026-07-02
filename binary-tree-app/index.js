const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'public', 'data.json');

let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

const saveData = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(treeData, null, 2));
};

// Железобетонный поиск узла через стек (без рекурсивных просадок)
function findNodeById(root, id) {
    if (!root) return null;
    const stack = [root];
    
    while (stack.length > 0) {
        const node = stack.pop();
        if (node.id === id) return node;
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    return null;
}

function getParentIdForTarget(targetId) {
    const letter = targetId.replace(/[^\nA-Z]/g, '');
    const num = parseInt(targetId.replace(/[^\d]/g, ''));
    
    if (targetId === "A1" || targetId === "A2") return "Admin";
    
    if (letter === "C") {
        return num <= 2 ? "A1" : "A2";
    }
    
    const currentLevelCode = letter.charCodeAt(0);
    const parentLetter = String.fromCharCode(currentLevelCode - 1);
    const parentNum = Math.floor((num + 1) / 2);
    
    return `${parentLetter}${parentNum}`;
}

function insertByTargetId(root, targetId, loginName) {
    if (!targetId) return false;

    const parentId = getParentIdForTarget(targetId);
    const parentNode = findNodeById(root, parentId);
    
    if (!parentNode) {
        console.log(`[ОШИБКА] Родоначальник ${parentId} не найден в дереве для цели ${targetId}`);
        return false;
    }

    const num = parseInt(targetId.replace(/[^\d]/g, ''));

    // Проверяем, не занято ли уже это место во избежание дублей
    const alreadyExists = findNodeById(root, targetId);
    if (alreadyExists) return true; // Если уже зарегистрирован — отдаем true, чтобы автомат шел дальше

    if (targetId.startsWith("C")) {
        if (num === 1 || num === 3) {
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
        return false;
    }

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

    return false;
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
