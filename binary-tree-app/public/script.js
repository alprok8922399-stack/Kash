// Базовая структура (Admin, A1, A2)
let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

// Функция быстрого поиска: заполнена ли ячейка?
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

        // Проверяем триггеры отображения нижних рядов (Твое "Правило четырех")
        let showThisNode = true;

        if (currentLetter === "C") {
            const num = parseInt(currentId.replace("C", ""));
            if (num <= 8) {
                // C1-C8 открываются, как только заполнена B4!
                showThisNode = hasNode(treeData, "B4");
            } else {
                // C9-C16 открываются, как только заполнена B8!
                showThisNode = hasNode(treeData, "B8");
            }
        } else if (currentLetter === "D") {
            const num = parseInt(currentId.replace("D", ""));
            if (num <= 8) showThisNode = hasNode(treeData, "C4");
            else if (num <= 16) showThisNode = hasNode(treeData, "C8");
            else if (num <= 24) showThisNode = hasNode(treeData, "C12");
            else showThisNode = hasNode(treeData, "C16");
        }

        // Если по правилу четырех этот блок еще скрыт — возвращаем пустоту
        if (!showThisNode) return '';

        // Если узел по логике открыт, но в нем еще нет юзера — рисуем пустую рамку
        if (!node) {
            return `
                <div class="branch">
                    <div class="node empty">---<br><span class="id-tag">${currentId}</span></div>
                </div>
            `;
        }

        // Вычисляем ID для левого и правого ребенка на будущее
        let leftId = "", rightId = "";
        if (currentLetter === "Admin") { leftId = "A1"; rightId = "A2"; }
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

// Функция добавления строго по цепочке ID
function addByStrictSequence(node, login) {
    // Очередь заполнения: сначала весь ряд B, затем весь ряд C
    let targets = [];
    for (let i = 1; i <= 8; i++) targets.push(`B${i}`);
    for (let i = 1; i <= 16; i++) targets.push(`C${i}`);

    const insert = (root, targetId, loginName) => {
        if (!root) return false;
        
        // Вычисляем, какой ID должен быть у детей текущего узла
        const letters = ["", "Admin", "A", "B", "C", "D"];
        const level = root.id === "Admin" ? 1 : (root.id.startsWith("A") ? 2 : (root.id.startsWith("B") ? 3 : 4));
        const num = root.id === "Admin" ? 0 : parseInt(root.id.replace(/[^\d]/g, ''));
        
        let leftId = "", rightId = "";
        if (root.id === "Admin") { leftId = "A1"; rightId = "A2"; }
        else {
            leftId = `${letters[level + 1]}${num * 2 - 1}`;
            rightId = `${letters[level + 1]}${num * 2}`;
        }

        if (leftId === targetId && !root.left) {
            root.left = { login: loginName, id: targetId, left: null, right: null };
            return true;
        }
        if (rightId === targetId && !root.right) {
            root.right = { login: loginName, id: targetId, left: null, right: null };
            return true;
        }

        return insert(root.left, targetId, loginName) || insert(root.right, targetId, loginName);
    };

    // Ищем первый незанятый ID из списка
    for (let tId of targets) {
        if (!hasNode(node, tId)) {
            return insert(node, tId, login);
        }
    }
    return false;
}

// Авто-заполнение каждые 2.5 секунды
let counter = 1;
const interval = setInterval(() => {
    if (addByStrictSequence(treeData, `User_${counter}`)) {
        renderTree(treeData);
        counter++;
    }
    if (counter > 16) clearInterval(interval);
}, 2500);

// Старт
renderTree(treeData);
