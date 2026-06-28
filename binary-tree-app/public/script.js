let mockData = {
    login: "Admin",
    left: null,
    right: null
};

function renderTree(data) {
    const treeDiv = document.getElementById('tree');
    
    // Рекурсивная функция для отрисовки
    const build = (node, label, level) => {
        if (!node) return `<div class="node">---</div>`;
        return `
            <div class="branch">
                <div class="node level-${level > 3 ? 3 : level}">${label}<br><b>${node.login}</b></div>
                <div class="children">
                    ${build(node.left, 'L', level + 1)}
                    ${build(node.right, 'R', level + 1)}
                </div>
            </div>
        `;
    };
    treeDiv.innerHTML = build(data, 'Admin', 1);
}

// Функция поиска пустого места
function addMockUser(node, login) {
    if (!node.left) {
        node.left = { login: login, left: null, right: null };
        return true;
    }
    if (addMockUser(node.left, login)) return true;
    if (!node.right) {
        node.right = { login: login, left: null, right: null };
        return true;
    }
    return addMockUser(node.right, login);
}

// Авто-заполнение каждые 3 секунды
let counter = 1;
setInterval(() => {
    if (addMockUser(mockData, `User_${counter}`)) {
        renderTree(mockData);
        counter++;
    }
}, 3000);

// Первый запуск
renderTree(mockData);
