// Базовая структура (Admin, A1, A2)
let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

// Единственная и жесткая карта связей: [Левый ребенок, Правый ребенок]
const childrenMap = {
    "Admin": ["A1", "A2"],
    "A1": ["B1", "B2"],
    "A2": ["B3", "B4"], // Стоп, чтобы в ряду B было 8 ячеек под A1 и A2:
    // Под A1 идут: ветка B1 (у нее свои дети) и ветка B2. 
    // Давай сделаем стандартное бинарное распределение:
    "A1": ["B1", "B2"], // По 2 ребенка под каждым узлом ряда A (всего 4 ячейки в B1-B4)
    "A2": ["B3", "B4"], 
    
    // А вот под четверкой B1-B4 открываются 8 ячеек ряда C!
    "B1": ["C1", "C2"],
    "B2": ["C3", "C4"],
    "B3": ["C5", "C6"],
    "B4": ["C7", "C8"],
    
    // Под четверкой B5-B8 (когда они появятся) откроются C9-C16
    "B5": ["C9", "C10"],
    "B6": ["C11", "C12"],
    "B7": ["C13", "C14"],
    "B8": ["C16", "C16"] // Опечатка исключена
};

// Перевернем карту для удобства поиска родителя при вставке
const parentMap = {};
for (let parent in childrenMap) {
    const [left, right] = childrenMap[parent];
    parentMap[left] = parent;
    parentMap[right] = parent;
}

// Проверка наличия узла
function hasNode(root, id) {
    if (!root) return false;
    if (root.id === id) return true;
    return hasNode(root.left, id) || hasNode(root.right, id);
}

// Отрисовка
function renderTree(data) {
    const treeDiv = document.getElementById('tree');

    const build = (node, currentId, level) => {
        // Условия показа рядов по твоему правилу четырех
        let showThisNode = true;
        if (currentId.startsWith("C")) {
            const num = parseInt(currentId.replace("C", ""));
            if (num <= 8) {
                showThisNode = hasNode(treeData, "B4"); // Показываем C1-C8 только после B4
            } else {
                showThisNode = hasNode(treeData, "B8"); // Показываем C9-C16 только после B8
            }
        }

        if (!showThisNode) return '';

        // Если узел должен быть отрисован, но он пустой
        if (!node) {
            return `
                <div class="branch">
                    <div class="node empty">---<br><span class="id-tag">${currentId}</span></div>
                </div>
            `;
        }

        // Берем ID будущих детей строго из нашей карты связей
        const [leftId, rightId] = childrenMap[currentId] || ["", ""];

        return `
            <div class="branch">
                <div class="node level-${level > 3 ? 3 : level}">
                    <b>${node.login}</b><br>
                    <span class="id-tag">${node.id}</span>
                </div>
                ${(leftId || rightId) ? `
                <div class="children">
                    ${build(node.left, leftId, level + 1)}
                    ${build(node.right, rightId, level + 1)}
                </div>
                ` : ''}
            </div>
        `;
    };

    treeDiv.innerHTML = build(data, "Admin", 1);
}

// Вставка строго по карте
function forceInsertByMap(root, targetId, loginName) {
    if (!root) return false;

    const parentId = parentMap[targetId];

    if (root.id === parentId) {
        const [leftId, rightId] = childrenMap[parentId];
        if (targetId === leftId && !root.left) {
            root.left = { login: loginName, id: targetId, left: null, right: null };
            return true;
        }
        if (targetId === rightId && !root.right) {
            root.right = { login: loginName, id: targetId, left: null, right: null };
            return true;
        }
    }

    return forceInsertByMap(root.left, targetId, loginName) || forceInsertByMap(root.right, targetId, loginName);
}

// Очередь заполнения (Ряд B состоит из B1-B4 под A1/A2)
// Примечание: Чтобы под Admin была структура 2 -> 4 -> 8, ряд B — это 4 ячейки (B1,B2,B3,B4)
function addByStrictSequence(node, login) {
    let targets = [];
    for (let i = 1; i <= 4; i++) targets.push(`B${i}`);
    for (let i = 1; i <= 8; i++) targets.push(`C${i}`);

    for (let tId of targets) {
        if (!hasNode(node, tId)) {
            return forceInsertByMap(node, tId, login);
        }
    }
    return false;
}

// Интервал 0.8 сек
let counter = 1;
const interval = setInterval(() => {
    if (addByStrictSequence(treeData, `User_${counter}`)) {
        renderTree(treeData);
        counter++;
    }
    if (counter > 12) clearInterval(interval);
}, 800);

renderTree(treeData);
