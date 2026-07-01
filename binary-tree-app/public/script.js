let scale = 0.8;
let posX = window.innerWidth / 4;
let posY = 80;
let isDragging = false;
let startX, startY;

const viewport = document.getElementById('viewport');
const container = document.getElementById('pan-container');

function updateTransform() {
    container.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

viewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('.control-panel')) return;
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

viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    if (e.deltaY < 0) scale = Math.min(scale + zoomFactor, 2);
    else scale = Math.max(scale - zoomFactor, 0.2);
    updateTransform();
}, { passive: false });

function zoomIn() { scale = Math.min(scale + 0.1, 2); updateTransform(); }
function zoomOut() { scale = Math.max(scale - 0.1, 0.2); updateTransform(); }
function resetView() { scale = 0.8; posX = window.innerWidth / 4; posY = 80; updateTransform(); }

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

// Проверяет, заполнена ли вся четвёрка целиком
function isQuadFull(data, serverLevel, serverRegistered, level, quadIndex) {
    const letter = getLetterByLevel(level);
    
    // Проверяем каждую из 4-х ячеек в этой четвёрке
    for (let p = 0; p < 4; p++) {
        const cellNum = (quadIndex * 4) + p + 1;
        const cellId = `${letter}${cellNum}`;
        
        if (serverLevel === level) {
            // Если мы на текущем уровне, смотрим и в дерево, и в массив регистрации прямо сейчас
            if (!serverRegistered.includes(cellId) && !findNodeById(data, cellId)) {
                return false;
            }
        } else if (serverLevel < level) {
            // Если сервер еще даже не дошел до этого уровня
            return false;
        } else {
            // Если сервер уже прошел этот уровень, значит он гарантированно заполнен
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
        
        // ТРИГГЕР ОТКРЫТИЯ РАМОК ПО ЧЕТВЁРКАМ РОДИТЕЛЕЙ 👑
        if (level > 3) {
            const parentLetter = getLetterByLevel(level - 1);
            const num = parseInt(currentId.replace(/[^\d]/g, ''));
            const parentIdNum = Math.ceil(num / 2); // Номер родительской ячейки
            
            // Находим индекс четвёрки, в которой сидит наш родитель
            const parentQuadIndex = Math.floor((parentIdNum - 1) / 4);

            // Показываем рамку текущего уровня, только если на предыдущем уровне (level - 1) 
            // четвёрка нашего родителя ПОЛНОСТЬЮ закрыта!
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

setInterval(() => {
    fetch('/api/tree')
        .then(res => res.json())
        .then(apiData => renderTree(apiData))
        .catch(err => console.error(err));
}, 1000);

fetch('/api/tree').then(res => res.json()).then(apiData => {
    renderTree(apiData);
    resetView();
});
