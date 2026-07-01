let scale = 0.5; 
let posX = 0; // Строго 0, так как CSS уже ставит её по центру
let posY = 0; // Строго 0, так как отступ от шапки уже прописан в CSS
let isDragging = false;
let startX, startY;

const viewport = document.getElementById('viewport');
const container = document.getElementById('pan-container');

function updateTransform() {
    container.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Управление МЫШКОЙ (для компьютера)
viewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('.header-panel') || e.target.closest('.control-buttons')) return;
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

// Управление ПАЛЬЦЕМ (для телефона)
viewport.addEventListener('touchstart', (e) => {
    if (e.target.closest('.header-panel') || e.target.closest('.control-buttons')) return;
    isDragging = true;
    startX = e.touches[0].clientX - posX;
    startY = e.touches[0].clientY - posY;
}, {passive: false});

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    posX = e.touches[0].clientX - startX;
    posY = e.touches[0].clientY - startY;
    updateTransform();
}, {passive: false});

window.addEventListener('touchend', () => isDragging = false);

// Зум колесиком мыши (на компе)
viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    if (e.deltaY < 0) scale = Math.min(scale + zoomFactor, 2);
    else scale = Math.max(scale - zoomFactor, 0.15);
    updateTransform();
}, { passive: false });

function zoomIn() { scale = Math.min(scale + 0.1, 2); updateTransform(); }
function zoomOut() { scale = Math.max(scale - 0.1, 0.15); updateTransform(); }

// Идеальный сброс в центр
function resetView() {
    scale = 0.5;
    posX = 0; // Возвращаем в начальное нулевое положение (по центру)
    posY = 0; 
    updateTransform();
}

function resetTree() {
    if (confirm("Обнулить дерево тестов?")) {
        fetch('/api/reset', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            resetView();
        })
        .catch(err => alert("Ошибка сброса"));
    }
}

function getLetterByLevel(level) {
    if (level === 1) return "Admin";
    return String.fromCharCode(65 + level - 2);
}

function findNodeById(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    return findNodeById(root.left, id) || findNodeById(root.right, id);
}

function isQuadFull(data, serverLevel, serverRegistered, level, quadIndex) {
    const letter = getLetterByLevel(level);
    for (let p = 0; p < 4; p++) {
        const cellNum = (quadIndex * 4) + p + 1;
        const cellId = `${letter}${cellNum}`;
        if (serverLevel === level) {
            if (!serverRegistered.includes(cellId) && !findNodeById(data, cellId)) {
                return false;
            }
        } else if (serverLevel < level) {
            return false;
        } else {
            return true;
        }
    }
    return true;
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
            const parentIdNum = Math.ceil(num / 2);
            const parentQuadIndex = Math.floor((parentIdNum - 1) / 4);
            showThisNode = isQuadFull(data, serverLevel, serverRegistered, level - 1, parentQuadIndex);
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

// Интервал изменен на 2 секунды (2000 миллисекунд)
setInterval(() => {
    fetch('/api/tree')
        .then(res => res.json())
        .then(apiData => renderTree(apiData))
        .catch(err => console.error(err));
}, 2000);

fetch('/api/tree').then(res => res.json()).then(apiData => {
    renderTree(apiData);
    resetView();
});
