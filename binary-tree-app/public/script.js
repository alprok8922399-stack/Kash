fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        const treeDiv = document.getElementById('tree');
        const renderNode = (user, label) => `
            <div class="node">${label}<br><b>${user ? user.login : '---'}</b></div>
        `;
        treeDiv.innerHTML = `
            <div class="branch">
                ${renderNode(data, 'Admin')}
                <div class="children">
                    <div class="branch">
                        ${renderNode(data.left, 'L1')}
                        <div class="children">
                            ${renderNode(data.left?.left, 'LL')}
                            ${renderNode(data.left?.right, 'LR')}
                        </div>
                    </div>
                    <div class="branch">
                        ${renderNode(data.right, 'R1')}
                        <div class="children">
                            ${renderNode(data.right?.left, 'RL')}
                            ${renderNode(data.right?.right, 'RR')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
