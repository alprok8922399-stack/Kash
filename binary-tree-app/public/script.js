fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        const treeDiv = document.getElementById('tree');
        
        // Функция с добавлением классов уровней
        const renderNode = (user, label, levelClass) => `
            <div class="node ${levelClass}">${label}<br><b>${user ? user.login : '---'}</b></div>
        `;

        treeDiv.innerHTML = `
            <div class="branch">
                ${renderNode(data, 'Admin', 'level-1')}
                <div class="children">
                    <div class="branch">
                        ${renderNode(data.left, 'L1', 'level-2')}
                        <div class="children">
                            ${renderNode(data.left?.left, 'LL', 'level-3')}
                            ${renderNode(data.left?.right, 'LR', 'level-3')}
                        </div>
                    </div>
                    <div class="branch">
                        ${renderNode(data.right, 'R1', 'level-2')}
                        <div class="children">
                            ${renderNode(data.right?.left, 'RL', 'level-3')}
                            ${renderNode(data.right?.right, 'RR', 'level-3')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
