fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        const treeDiv = document.getElementById('tree');
        treeDiv.innerHTML = `
            <div class="branch">
                <div class="node"><b>${data.login}</b></div>
                <div class="children">
                    <div class="node">Left:<br>${data.left ? data.left.login : 'Empty'}</div>
                    <div class="node">Right:<br>${data.right ? data.right.login : 'Empty'}</div>
                </div>
            </div>
        `;
    });
