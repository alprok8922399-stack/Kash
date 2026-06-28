fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        const treeDiv = document.getElementById('tree');
        
        // Вспомогательная функция для отрисовки узла или пустой рамки
        const renderNode = (user, label, levelClass) => `
            <div class="node ${levelClass}">
                ${label}<br>
                <b>${user ? user.login : 'Свободно'}</b>
            </div>
        `;

        treeDiv.innerHTML = `
            <div class="branch">
                ${renderNode(data, 'Admin', 'level-1')}
                <div class="children">
                    <div class="branch">
                        ${renderNode(data.left, 'Left 1', 'level-2')}
                        <div class="children">
                            ${renderNode(data.left?.left, 'L-L', 'level-3')}
                            ${renderNode(data.left?.right, 'L-R', 'level-3')}
                        </div>
                    </div>
                    <div class="branch">
                        ${renderNode(data.right, 'Right 1', 'level-2')}
                        <div class="children">
                            ${renderNode(data.right?.left, 'R-L', 'level-3')}
                            ${renderNode(data.right?.right, 'R-R', 'level-3')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
