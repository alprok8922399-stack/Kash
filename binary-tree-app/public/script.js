// 1. Пытаемся получить данные
fetch('./data.json')
    .then(response => {
        if (!response.ok) throw new Error('Файл data.json не найден!');
        return response.json();
    })
    .then(data => {
        console.log("Данные успешно загружены");
        renderTree(data);
    })
    .catch(err => {
        document.getElementById('tree').innerHTML = "ОШИБКА: " + err.message;
    });

// 2. Функция отрисовки
function renderTree(data) {
    const treeDiv = document.getElementById('tree');
    
    // Вспомогательная функция для сборки дерева
    const build = (node, level) => {
        if (!node) return `<div class="node">---</div>`;
        
        // Рисуем текущий блок
        let html = `
            <div class="branch">
                <div class="node"><b>${node.login || 'Пусто'}</b></div>
                <div class="children">
                    ${build(node.left, level + 1)}
                    ${build(node.right, level + 1)}
                </div>
            </div>
        `;
        return html;
    };
    
    treeDiv.innerHTML = build(data, 1);
}
