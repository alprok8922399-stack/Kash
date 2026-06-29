// Базовая структура (Admin, A1, A2)
let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

// Четкая карта родителей: КТО ПОД КЕМ СТОИТ (Железное правило)
const parentMap = {
    // Ряд B строится под рядом A
    "B1": "A1", "B2": "A1", "B3": "A1", "B4": "A1", // Первая четверка
    "B5": "A2", "B6": "A2", "B7": "A2", "B8": "A2", // Вторая четверка
    
    // Ряд C строится строго под соответствующими B
    "C1": "B1", "C2": "B1",
    "C3": "B2", "C4": "B2",
    "C5": "B3", "C6": "B3",
    "C7": "B4", "C8": "B4", // Эти откроются после B4
    
    "C9": "B5", "C10": "B5",
    "C11": "B6", "C12": "B6",
    "C13": "B7", "C14": "B7",
    "C15": "B8", "C16": "B8"  // Эти откроются после B8
};

// Функция проверки: есть ли узел в памяти?
function hasNode(root, id) {
    if (!root) return false;
    if (root.id === id) return true;
    return hasNode(root.left, id) || hasNode(root.right, id);
}

// Отрисовка дерева
function renderTree(data) {
    const treeDiv = document.getElementById('tree');

    const build = (node, currentId, level) => {
        const letters = ["", "Admin", "A", "B", "C", "D"];
        const currentLetter = letters[level] || "X";

        // Проверяем твои триггеры "Правила четырех" для показа рамок
        let showThisNode = true;

        if (currentLetter === "C") {
            const num = parseInt(currentId.replace("C", ""));
            if (num <= 8) {
                showThisNode = hasNode(treeData, "B4"); // Левые 8 рамок
            } else {
                showThisNode = hasNode(treeData, "B8"); // Правые 8 рамок
            }
        }

        if (!showThisNode) return '';

        // Если рамка должна быть, но юзера еще нет
        if (!node) {
            return `
                <div class="branch">
                    <div class="node empty">---<br><span class="id-tag">${currentId}</span></div>
                </div>
            `;
        }

        // Вычисляем ID будущих детей для отрисовки структуры
        let leftId = "", rightId = "";
        if (node.id === "Admin") { leftId = "A1"; rightId = "A2"; }
        else if (node.id === "A1") { leftId = "B1"; rightId = "B2"; } // Пример ручного распределения веток
        else {
            const num = parseInt(currentId.replace(/[^\d]/g, ''));
            leftId = `${letters[level + 1] || 'X'}${num * 2 - 1}`;
            rightId = `${letters[level + 1] || 'X'}${num * 2}`;
        }

        return `
            <div class="branch">
                <div class="node level-${level > 3 ? 3 : level}">
                    <b>${node.login}</b><br>
                    <span class="id-tag">${node.id}</span>
                </div>
                <div class="children">
                    ${build(node.left, leftId, level + 1)}
                    ${build(node.right, rightId, level + 1)}
                </div>
            </div>
        `;
    };

    treeDiv.innerHTML = build(data, "Admin", 1);
}

// Прямая вставка по карте родителей
function forceInsertByMap(root, targetId, loginName) {
    if (!root) return false;

    const parentId = parentMap[targetId];

    // Если текущий узел — это родитель для targetId
    if (root.id === parentId) {
        // Проверяем левую и правую ногу. Если это нечетный номер — в левую, четный — в правую
        const targetNum = parseInt(targetId.replace(/[^\d]/g, ''));
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

    // Рекурсивно копаем глубже во все ветки
    return forceInsertByMap(root.left, targetId, loginName) || forceInsertByMap(root.right, targetId, loginName);
}

// Диспетчер очереди
function addByStrictSequence(node, login) {
    let targets = [];
    for (let i = 1; i <= 8; i++) targets.push(`B${i}`);
    for (let i = 1; i <= 16; i++) targets.push(`C${i}`);

    for (let tId of targets) {
        if (!hasNode(node, tId)) {
            return forceInsertByMap(node, tId, login);
        }
    }
    return false;
}

// Скорость: 0.8 секунды на шаг
let counter = 1;
const interval = setInterval(() => {
    if (addByStrictSequence(treeData, `User_${counter}`)) {
        renderTree(treeData);
        counter++;
    }
    if (counter > 24) clearInterval(interval);
}, 800);

// Старт
renderTree(treeData);
