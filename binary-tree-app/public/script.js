fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        const treeDiv = document.getElementById('tree');
        
        // Вспомогательная функция для отрисовки узла или пустой рамки
        const renderNode = (user, label) => `
            <div class="node">
                ${label}<br>
                <b>${user ? user.login : 'Свободно'}</b>
            </div>
        `;

        treeDiv.innerHTML = `
            <div class="branch">
                ${renderNode(data, 'Admin')}
                <div class="children">
                    <div class="branch">
                        ${renderNode(data.left, 'Left 1')}
                        <div class="children">
                            ${renderNode(data.left?.left, 'L-L')}
                            ${renderNode(data.left?.right, 'L-R')}
                        </div>
                    </div>
                    <div class="branch">
                        ${renderNode(data.right, 'Right 1')}
                        <div class="children">
                            ${renderNode(data.right?.left, 'R-L')}
                            ${renderNode(data.right?.right, 'R-R')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
