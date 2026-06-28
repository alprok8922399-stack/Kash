fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        const treeDiv = document.getElementById('tree');
        treeDiv.innerHTML = `
            <div class="branch">
                <div class="node">Admin: ${data.login}</div>
                <div class="children">
                    <div class="node">L: ${data.left ? data.left.login : '—'}</div>
                    <div class="node">R: ${data.right ? data.right.login : '—'}</div>
                </div>
            </div>
        `;
    });
