// 1. Инициализация
let currentData = null;

fetch('./data.json')
    .then(r => r.json())
    .then(data => {
        currentData = data;
        renderTree(currentData);
        // Запускаем процесс заполнения СРАЗУ после загрузки
        startAutoFill(); 
    })
    .catch(err => {
        document.getElementById('tree').innerHTML = "ОШИБКА: " + err;
    });

// 2. "Курсор" (правило заполнения)
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

// 3. Авто-заполнение каждые 2 секунды
function startAutoFill() {
    let counter = 1;
    setInterval(() => {
        if (addCursor(currentData, `User_${counter}`)) {
            renderTree(currentData);
            counter++;
        }
    }, 2000);
}

// 4. Отрисовка
function renderTree(data) {
    const treeDiv = document.getElementById('tree');
    const build = (node, level) => {
        if (!node) return `<div class="node">---</div>`;
        return `
            <div class="branch">
                <div class="node"><b>${node.login}</b></div>
                <div class="children">
                    ${build(node.left, level + 1)}
                    ${build(node.right, level + 1)}
                </div>
            </div>
        `;
    };
    treeDiv.innerHTML = build(data, 1);
}
