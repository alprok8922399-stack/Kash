// Функция отрисовки с "Правилом четырех"
function renderTree(data) {
    const treeDiv = document.getElementById('tree');

    // Функция проверки: заполнен ли узел и все его дети на уровне
    const isLevelFull = (node) => {
        return node && node.left && node.right;
    };

    const build = (node, label, level) => {
        // Узел существует
        if (!node) return `<div class="node">---</div>`;

        // ПРОВЕРКА: Рисовать ли детей? 
        // Если это уровень, где должны быть 4 ячейки - проверяем их заполненность
        let childrenHTML = '';
        if (level === 2) { // Уровень User_1...User_4
            if (isLevelFull(node.left) && isLevelFull(node.right)) {
                childrenHTML = `
                    <div class="children">
                        ${build(node.left.left, '...', level + 1)}
                        ${build(node.left.right, '...', level + 1)}
                        ${build(node.right.left, '...', level + 1)}
                        ${build(node.right.right, '...', level + 1)}
                    </div>`;
            }
        } else {
            // Для остальных уровней стандартная отрисовка
            childrenHTML = `
                <div class="children">
                    ${build(node.left, '...', level + 1)}
                    ${build(node.right, '...', level + 1)}
                </div>`;
        }

        return `
            <div class="branch">
                <div class="node level-${level > 3 ? 3 : level}"><b>${node.login}</b></div>
                ${childrenHTML}
            </div>
        `;
    };
    treeDiv.innerHTML = build(data, 'Admin', 1);
}
