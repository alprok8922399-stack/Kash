// Базовая структура (Admin, A1, A2)
let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

// Функция быстрой проверки: есть ли узел в памяти?
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

        // Проверяем триггеры отображения нижних рядов ("Правило четырех")
        let showThisNode = true;

        if (currentLetter === "C") {
            const num = parseInt(currentId.replace("C", ""));
            if (num <= 8) {
                showThisNode = hasNode(treeData, "B4");
            } else {
                showThisNode = hasNode(treeData, "B8");
            }
        } else if (currentLetter === "D") {
            const num = parseInt(currentId.replace("D", ""));
            if (num <= 8) showThisNode = hasNode(treeData, "C4");
            else if (num <= 16) showThisNode = hasNode(treeData, "C8");
            else if (num <= 24) showThisNode = hasNode(treeData, "C12");
            else showThisNode = hasNode(treeData, "C16");
        }

        if (!showThisNode) return '';

        if (!node) {
            return `
                <div class="branch">
                    <div class="node empty">---<br><span class="id-tag">${currentId}</span></div>
                </div>
            `;
        }

        let leftId = "", rightId = "";
        if (node.id === "Admin") { leftId = "A1"; rightId = "A2"; }
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

// Глобальный поиск и жесткая вставка узла по его ID
function forceInsert(root, targetId, loginName) {
    if (!root) return false;

    const letters = ["", "Admin", "A", "B", "C", "D"];
    
    // Вычисляем, какие ID должны быть у левого и правого сына текущего узла
    let level = 1;
    if (root.id.startsWith("A")) level = 2;
    if (root.id.startsWith("B")) level = 3;
    if (root.id.startsWith("C")) level = 4;
    
    let num = root.id === "Admin" ? 0 : parseInt(root.id.replace(/[^\d]/g, ''));
    
    let leftId = "", rightId = "";
    if (root.id === "Admin") { leftId = "A1"; rightId = "A2"; }
    else {
        leftId = `${letters[level + 1] || 'X'}${num * 2 - 1}`;
        rightId = `${letters[level + 1] || 'X'}${num * 2}`;
    }

    // Если нашли родителя для нашего целевого ID
    if (leftId === targetId) {
        root.left = { login: loginName, id: targetId, left: null, right: null };
        return true;
    }
    if (rightId === targetId) {
        root.right = { login: loginName, id: targetId, left: null, right: null };
        return true;
    }

    // Ищем дальше в глубину
    return forceInsert(root.left, targetId, loginName) || forceInsert(root.right, targetId, loginName);
}

// Главный диспетчер очереди заполнения
function addByStrictSequence(node, login) {
    // Генерируем железную очередь: сначала B1..B8, затем C1..C16
    let targets = [];
    for (let i = 1; i <= 8; i++) targets.push(`B${i}`);
    for (let i = 1; i <= 16; i++) targets.push(`C${i}`);

    for (let tId of targets) {
        if (!hasNode(node, tId)) {
            return forceInsert(node, tId, login);
        }
    }
    return false;
}

// Авто-заполнение на максимальной скорости (0.8 секунды)
let counter = 1;
const interval = setInterval(() => {
    if (addByStrictSequence(treeData, `User_${counter}`)) {
        renderTree(treeData);
        counter++;
    }
    if (counter > 24) clearInterval(interval); // Заполняем 24 позиции для полной демонстрации
}, 800);

// Старт
renderTree(treeData);
