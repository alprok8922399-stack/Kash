let treeData = {
    login: "Admin",
    left: { login: "L1", left: null, right: null },
    right: { login: "R1", left: null, right: null }
};

// Функция для поиска и заполнения по "Правилу четырех"
function addByRuleOfFour(node, login) {
    let queue = [node];
    while (queue.length > 0) {
        let current = queue.shift();
        
        // Если ячейка свободна - занимаем
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

// Авто-заполнение каждые 2 секунды
let counter = 1;
setInterval(() => {
    if (addByRuleOfFour(treeData, `User_${counter}`)) {
        renderTree(treeData);
        counter++;
    }
}, 2000);

// Отрисовка
function renderTree(data) {
    const treeDiv = document.getElementById('tree');
    const build = (node, level) => {
        if (!node) return `<div class="node">---</div>`;
        return `
            <div class="branch">
                <div class="node level-${level > 3 ? 3 : level}"><b>${node.login}</b></div>
                <div class="children">
                    ${build(node.left, level + 1)}
                    ${build(node.right, level + 1)}
                </div>
            </div>
        `;
    };
    treeDiv.innerHTML = build(data, 1);
}

renderTree(treeData);
