// Переменные для зума и перетаскивания (Drag & Zoom)
let scale = 0.8;
let posX = window.innerWidth / 4;
let posY = 80;
let isDragging = false;
let startX, startY;

const viewport = document.getElementById('viewport');
const container = document.getElementById('pan-container');

// Применение трансформации к дереву
function updateTransform() {
    container.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Перетаскивание мышкой / пальцем
viewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('.control-panel')) return; // Игнорируем клики по кнопкам
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
});

window.addEventListener('mouseup', () => isDragging = false);

// Зум колесиком мыши
viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    if (e.deltaY < 0) scale = Math.min(scale + zoomFactor, 2);
    else scale = Math.max(scale - zoomFactor, 0.2);
    updateTransform();
}, { passive: false });

// Функции управления зумом с кнопок
function zoomIn() { scale = Math.min(scale + 0.1, 2); updateTransform(); }
function zoomOut() { scale = Math.max(scale - 0.1, 0.2); updateTransform(); }
function resetView() { scale = 0.8; posX = window.innerWidth / 4; posY = 80; updateTransform(); }

// ФУНКЦИЯ ВРЕМЕННОГО СБРОСА СТРУКТУРЫ В НАЧАЛО 🔄
function resetTree() {
    if (confirm("Вы уверены, что хотите полностью обнулить дерево тестов?")) {
        fetch('/api/reset', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            resetView();
        })
        .catch(err => alert("Ошибка при сбросе дерева"));
    }
}

// Отрисовка дерева (Твоя логика блоков по 4 штуки)
function getLetterByLevel(level) {
    if (level === 1) return "Admin";
    return String.fromCharCode(65 + level - 2);
}

function findNodeById(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    return findNodeById(root.left, id) || findNodeById(root.right, id);
}

function renderTree(apiData) {
    const treeDiv = document.getElementById('tree');
    if (!apiData) return;

    const data = apiData.tree;
    const serverLevel = apiData.currentLevel;
    const serverRegistered = apiData.registeredInCurrentLevel;

    const build = (node, currentId, level) => {
        let showThisNode = true;
        
        if (level > 3) {
            const parentLetter = getLetterByLevel(level - 1);
            const num = parseInt(currentId.replace(/[^\d]/g, ''));
            const parentGroup = Math.ceil(num / 2); 
            const triggerCheck = Math.ceil(parentGroup / 4) * 4; 
            const triggerParentId = `${parentLetter}${triggerCheck}`;

            if (serverLevel === level - 1) {
                showThisNode = serverRegistered.includes(triggerParentId) || !!findNodeById(data, triggerParentId);
            } else if (serverLevel < level - 1) {
                showThisNode = false;
            } else {
                showThisNode = true;
            }
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
            const nextLetter = getLetterByLevel(level + 1);
            leftId = `${nextLetter}${num * 2 - 1}`;
            rightId = `${nextLetter}${num * 2}`;
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

// Живой опрос сервера раз в секунду
setInterval(() => {
    fetch('/api/tree')
        .then(res => res.json())
        .then(apiData => renderTree(apiData))
        .catch(err => console.error("Ошибка опроса:", err));
}, 1000);

// Старт
fetch('/api/tree').then(res => res.json()).then(apiData => {
    renderTree(apiData);
    resetView(); // Устанавливаем дерево красиво по центру при загрузке
});
