// Базовая структура (Admin, L1, R1 всегда есть)
let treeData = {
    login: "Admin",
    left: { login: "L1", left: null, right: null },
    right: { login: "R1", left: null, right: null }
};

// Функция отрисовки
function renderTree(data) {
    const treeDiv = document.getElementById('tree');
    const build = (node, label, level) => {
        if (!node) return `<div class="node">Свободно</div>`;
        return `
            <div class="branch">
                <div class="node level-${level > 3 ? 3 : level}">${label}<br><b>${node.login}</b></div>
                <div class="children">
                    ${build(node.left, '...', level + 1)}
                    ${build(node.right, '...', level + 1)}
                </div>
            </div>
        `;
    };
    treeDiv.innerHTML = build(data, 'Admin', 1);
}

// "Курсор": ищет первое свободное место по уровням
function addCursor(node, login) {
    let queue = [node];
    while (queue.length > 0) {
        let current = queue.shift();
        if (!current.left) {
            current.left = { login: login, left: null, right: null };
            return true;
        }
        queue.push(current.left);
        if (!current.right) {
            current.right = { login: login, left: null, right: null };
            return true;
        }
        queue.push(current.right);
    }
    return false;
}

// Автозаполнение каждые 2 секунды
let counter = 1;
setInterval(() => {
    if (addCursor(treeData, `User_${counter}`)) {
        renderTree(treeData);
        counter++;
    }
}, 2000);

// Первый запуск
renderTree(treeData);
