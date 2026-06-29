// Базовая структура (Admin, A1, A2)
let treeData = {
    login: "Admin", id: "Admin",
    left: { login: "User_Left_1", id: "A1", left: null, right: null },
    right: { login: "User_Right_1", id: "A2", left: null, right: null }
};

// Функция проверки: есть ли узел в дереве?
function findNodeById(root, id) {
    if (!root) return null;
    if (root.id === id) return root;
    return findNodeById(root.left, id) || findNodeById(root.right, id);
}

// Генератор букв для уровней (1=Admin, 2=A, 3=B, 4=C, 5=D, 6=E и т.д. до бесконечности)
function getLetterByLevel(level) {
    if (level === 1) return "Admin";
    return String.fromCharCode(65 + level - 2); // 2 -> A, 3 -> B, 4 -> C...
}

// Отрисовка дерева
function renderTree(data) {
    const treeDiv = document.getElementById('tree');

    const build = (node, currentId, level) => {
        const currentLetter = getLetterByLevel(level);

        // --- ПРАВИЛО ЧЕТЫРЁХ ДЛЯ ЛЮБОЙ ГЛУБИНЫ ---
        let showThisNode = true;
        
        // Начиная с уровня C (level 4) и ниже, проверяем заполненность блоков по 4 ячейки сверху
        if (level > 3) {
            const parentLetter = getLetterByLevel(level - 1);
            const num = parseInt(currentId.replace(/[^\d]/g, ''));
            
            // Вычисляем, какая четверка (участок из 4-х узлов) в родительском ряду отвечает за этот блок
            // Каждые 4 заполненных родителя открывают свои 8 детей снизу
            const triggerParentGroup = Math.ceil(num / 2); // Номер родительского узла
            const targetParentId = `${parentLetter}${Math.ceil(triggerParentGroup / 4) * 4}`;
            
            // Если замыкающий узел четверки (например, B4, B8, C4, C8...) еще не создан — скрываем ветку
            showThisNode = !!findNodeById(treeData, targetParentId);
        }

        if (!showThisNode) return '';

        // Если по триггеру ячейка открыта, но пользователя в ней физически нет — рисуем пустую рамку
        if (!node) {
            return `
                <div class="branch">
                    <div class="node empty">---<br><span class="id-tag">${currentId}</span></div>
                </div>
            `;
        }

        // Автоматически вычисляем ID для левого и правого ребенка (без карт и ограничений)
        let leftId = "", rightId = "";
        if (node.id === "Admin") {
            leftId = "A1"; rightId = "A2";
        } else {
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

// Автоматический бесконечный поиск родителя и вставка в структуру
function autoInsert(root, targetId, loginName) {
    if (!root) return false;

    // Определяем букву целевого ID и его номер
    const targetLetter = targetId.replace(/[\d]/g, '');
    const targetNum = parseInt(targetId.replace(/[^\d]/g, ''));
    
    // Вычисляем, какой ID должен быть у родителя
    let parentId = "";
    if (targetLetter === "A") parentId = "Admin";
    else {
        // Предыдущая буква в алфавите
        const parentLetter = String.fromCharCode(targetLetter.charCodeAt(0) - 1);
        const parentNum = Math.ceil(targetNum / 2);
        parentId = parentLetter === "@" ? "Admin" : `${parentLetter}${parentNum}`;
    }

    // Если текущий узел и есть вычисленный родитель
    if (root.id === parentId) {
        if (targetNum % 2 !== 0) {
            if (!root.left) {
                root.left = { login: loginName, id: targetId, left: null, right: null };
                return true;
            }
        } else {
            if (!root.right) {
                root.right = { login: loginName, id: targetId, left: null, right: null };
                return true;
            }
        }
    }

    // Рекурсивный спуск сквозь все уровни
    return autoInsert(root.left, targetId, loginName) || autoInsert(root.right, targetId, loginName);
}

// Генератор бесконечной очереди ID по рядам
let currentTargetLevel = 3; // Начинаем заполнять с ряда B (level 3)
let currentTargetNum = 1;

function addNextUser(login) {
    const letter = getLetterByLevel(currentTargetLevel);
    const targetId = `${letter}${currentTargetNum}`;
    
    if (autoInsert(treeData, targetId, login)) {
        currentTargetNum++;
        
        // Если заполнили весь текущий ряд (для B это 4, для C — 8, для D — 16 и т.д.)
        // В твоем маркетинге размер ряда шагает как: уровень 3(B)=4 ячейки, уровень 4(C)=8 ячеек и т.д.
        const maxInRow = Math.pow(2, currentTargetLevel - 1); 
        
        if (currentTargetNum > maxInRow) {
            currentTargetLevel++; // Переходим на следующий ряд (на букву ниже)
            currentTargetNum = 1;  // Сбрасываем счетчик для нового ряда
        }
        return true;
    }
    return false;
}

// Таймер симуляции (0.6 секунды на человека, бесконечный полет)
let counter = 1;
setInterval(() => {
    if (addNextUser(`User_${counter}`)) {
        renderTree(treeData);
        counter++;
    }
}, 600);

// Стартовая отрисовка
renderTree(treeData);
