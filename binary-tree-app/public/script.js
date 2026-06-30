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
        
        // Логика динамического отображения пустых рамок по группам из 4 элементов
        if (level > 3) {
            const parentLetter = getLetterByLevel(level - 1);
            const num = parseInt(currentId.replace(/[^\d]/g, ''));
            
            // Определяем, к какой четверке относится родительский элемент
            const parentGroup = Math.ceil(num / 2); // Номер родительской ячейки
            const triggerCheck = Math.ceil(parentGroup / 4) * 4; // Контрольная точка родителя (4, 8, 12, 16...)
            const triggerParentId = `${parentLetter}${triggerCheck}`;

            // Проверяем, заполнена ли контрольная точка на сервере
            if (serverLevel === level - 1) {
                // Если мы прямо сейчас заполняем уровень родителя, смотрим, дошли ли мы до триггера
                showThisNode = serverRegistered.includes(triggerParentId) || !!findNodeById(data, triggerParentId);
            } else if (serverLevel < level - 1) {
                // Если сервер еще выше этого уровня, рамки точно скрыты
                showThisNode = false;
            } else {
                // Если сервер ушел глубже, то все рамки этого уровня уже открыты
                showThisNode = true;
            }
        }

        if (!showThisNode) return '';

        // Отрисовка пустой ячейки-рамки
        if (!node) {
            return `
                <div class="branch">
                    <div class="node empty">---<br><span class="id-tag">${currentId}</span></div>
                </div>
            `;
        }

        // Определение ID дочерних элементов
        let leftId = "", rightId = "";
        if (node.id === "Admin") { leftId = "A1"; rightId = "A2"; }
        else {
            const num = parseInt(currentId.replace(/[^\d]/g, ''));
            const nextLetter = getLetterByLevel(level + 1);
            leftId = `${nextLetter}${num * 2 - 1}`;
            rightId = `${nextLetter}${num * 2}`;
        }

        // Отрисовка заполненного узла
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

// Посекундный опрос сервера для плавной живой анимации
setInterval(() => {
    fetch('/api/tree')
        .then(res => res.json())
        .then(apiData => renderTree(apiData))
        .catch(err => console.error("Ошибка обновления дерева:", err));
}, 1000);

// Первичный запрос
fetch('/api/tree')
    .then(res => res.json())
    .then(apiData => renderTree(apiData))
    .catch(err => console.error("Ошибка первой загрузки:", err));
