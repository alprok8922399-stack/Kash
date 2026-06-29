// Инициализируем дерево с базовым фундаментом
let treeData = {
    login: "Admin",
    id: "Admin",
    left: { login: "L1", id: "A1", left: null, right: null },
    right: { login: "R1", id: "A2", left: null, right: null }
};

// Функция отрисовки, которая знает про литеры и условия показа
function renderTree(data) {
    const treeDiv = document.getElementById('tree');
    
    // Вспомогательная функция для проверки: заполнена ли конкретная ячейка в дереве
    const findNodeById = (root, id) => {
        if (!root) return null;
        if (root.id === id) return root;
        return findNodeById(root.left, id) || findNodeById(root.right, id);
    };

    const build = (node, id, label, level) => {
        // Определяем букву ряда по уровню
        // level 1 = Admin, level 2 = A, level 3 = B, level 4 = C, level 5 = D
        const letters = ["", "Admin", "A", "B", "C", "D", "E"];
        const currentLetter = letters[level] || "X";
        
        // Если узла еще нет в памяти, рисуем пустую рамку с литерой
        if (!node) {
            return `<div class="node empty">---<br><small>${label}</small></div>`;
        }

        let childrenHTML = '';
        
        // УСЛОВИЕ ОТОБРАЖЕНИЯ СЛЕДУЮЩИХ РЯДОВ (Твое "Правило четырех")
        let shouldShowChildren = true;

        if (level === 2) { // Под рядом A (A1, A2) всегда показываем B1-B8
            shouldShowChildren = true;
        } else if (level === 3) { // Мы на уровне B. Проверяем, когда показывать C
            if (label.startsWith("C1") || label.startsWith("C2") || label.startsWith("C3") || label.startsWith("C4") ||
                label.startsWith("C5") || label.startsWith("C6") || label.startsWith("C7") || label.startsWith("C8")) {
                // Левая половина C (C1-C8) появляется, только когда заполнена B4!
                shouldShowChildren = !!findNodeById(treeData, "B4");
            } else {
                // Правая половина C (C9-C16) появляется, только когда заполнена B8!
                shouldShowChildren = !!findNodeById(treeData, "B8");
            }
        } else if (level === 4) { // Мы на уровне C. Проверяем, когда показывать D
            if (parseInt(node.id.replace("C", "")) <= 4) {
                shouldShowChildren = !!findNodeById(treeData, "C4");
            } else if (parseInt(node.id.replace("C", "")) <= 8) {
                shouldShowChildren = !!findNodeById(treeData, "C8");
            } else if (parseInt(node.id.replace("C", "")) <= 12) {
                shouldShowChildren = !!findNodeById(treeData, "C12");
            } else {
                shouldShowChildren = !!findNodeById(treeData, "C16");
            }
        }

        if (shouldShowChildren) {
            // Вычисляем подписи для будущих детей (генерация номеров слева направо)
            let nextLetter = letters[level + 1] || "X";
            let leftLabel = "";
            let rightLabel = "";

            if (currentLetter === "A") {
                // Под A1 будут B1,B2. Под A2 будут B3,B4... Стоп, в ряду B у нас 8 ячеек:
                // Давай пронумеруем их по порядку для бинара
                let num = parseInt(node.id.replace("A", ""));
                leftLabel = `B${num * 2 - 1}`;
                rightLabel = `B${num * 2}`;
            } else if (currentLetter === "B") {
                let num = parseInt(node.id.replace("B", ""));
                leftLabel = `C${num * 2 - 1}`;
                rightLabel = `C${num * 2}`;
            } else if (currentLetter === "C") {
                let num = parseInt(node.id.replace("C", ""));
                leftLabel = `D${num * 2 - 1}`;
                rightLabel = `D${num * 2}`;
            }

            childrenHTML = `
                <div class="children">
                    ${build(node.left, leftLabel, leftLabel, level + 1)}
                    ${build(node.right, rightLabel, rightLabel, level + 1)}
                </div>`;
        }

        return `
            <div class="branch">
                <div class="node level-${level > 3 ? 3 : level}">
                    <b>${node.login}</b><br>
                    <span class="id-tag">${node.id}</span>
                </div>
                ${childrenHTML}
            </div>
        `;
    };

    treeDiv.innerHTML = build(data, "Admin", "Admin", 1);
}

// Поиск места строго по цепочке литер (B1->B8, затем C1->C16)
function addByStrictSequence(node, login) {
    // 1. Сначала заполняем ряд B (B1 - B8)
    const bOrders = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"];
    
    // Вспомогательная функция вставки в родителя для нужной литеры
    const insertChild = (root, targetId, newId, newLogin) => {
        if (!root) return false;
        if (root.id === targetId) {
            if (!root.left && (parseInt(newId.replace(/[^\d]/g, '')) % 2 !== 0)) {
                root.left = { login: newLogin, id: newId, left: null, right: null };
                return true;
            }
            if (!root.right && (parseInt(newId.replace(/[^\d]/g, '')) % 2 === 0)) {
                root.right = { login: newLogin, id: newId, left: null, right: null };
                return true;
            }
        }
        return insertChild(root.left, targetId, newId, newLogin) || insertChild(root.right, targetId, newId, newLogin);
    };

    // Проверяем ряд B
    for (let i = 0; i < bOrders.length; i++) {
        let bId = bOrders[i];
        if (!findNodeByIdInTree(node, bId)) {
            // Определяем родителя из ряда A
            let parentA = "A" + Math.ceil((i + 1) / 2);
            insertChild(node, parentA, bId, login);
            return true;
        }
    }

    // 2. Если ряд B полон, заполняем ряд C (C1 - C16)
    for (let i = 1; i <= 16; i++) {
        let cId = "C" + i;
        if (!findNodeByIdInTree(node, cId)) {
            let parentB = "B" + Math.ceil(i / 2);
            insertChild(node, parentB, cId, login);
            return true;
        }
    }
    return false;
}

function findNodeByIdInTree(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    return findNodeByIdInTree(root.left, id) || findNodeByIdInTree(root.right, id);
}

// 4. Авто-заполнение каждые 3 секунды, чтобы успеть рассмотреть
let counter = 1;
const interval = setInterval(() => {
    // Формируем красивое имя пользователя с его будущим ID
    if (addByStrictSequence(treeData, `User_${counter}`)) {
        renderTree(treeData);
        counter++;
    }
    if (counter > 24) clearInterval(interval); // Остановим через 24 шага
}, 3000);

// Первый запуск
renderTree(treeData);
