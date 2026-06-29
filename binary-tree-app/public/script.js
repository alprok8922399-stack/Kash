// Функция отрисовки (осталась без изменений, твоя бесконечная магия)
function getLetterByLevel(level) {
    if (level === 1) return "Admin";
    return String.fromCharCode(65 + level - 2);
}

function findNodeById(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    return findNodeById(root.left, id) || findNodeById(root.right, id);
}

function renderTree(data) {
    const treeDiv = document.getElementById('tree');
    if (!data) return;

    const build = (node, currentId, level) => {
        const currentLetter = getLetterByLevel(level);
        let showThisNode = true;
        
        if (level > 3) {
            const parentLetter = getLetterByLevel(level - 1);
            const num = parseInt(currentId.replace(/[^\d]/g, ''));
            const triggerParentGroup = Math.ceil(num / 2);
            const targetParentId = `${parentLetter}${Math.ceil(triggerParentGroup / 4) * 4}`;
            showThisNode = !!findNodeById(data, targetParentId);
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

// Запрос актуального дерева с сервера каждые 2 секунды
setInterval(() => {
    fetch('/api/tree')
        .then(res => res.json())
        .then(data => {
            renderTree(data);
        })
        .catch(err => console.error("Ошибка обновления:", err));
}, 2000);

// Первый запуск при загрузке страницы
fetch('/api/tree').then(res => res.json()).then(data => renderTree(data));
