const ipcRenderer = require('electron').ipcRenderer;

function setRole(role) {
    const showed_page = document.querySelector('.show');
    switch(role) {
        case 'guider':
            showed_page.classList.remove('show');
            input_token.classList.add('show');
            token_input.focus();
            break;
        case 'trainee':
            showed_page.classList.remove('show');
            show_token.classList.add('show');
            makePairing((err, args) => {
                console.log(args.body);
                token.innerText = args.body;
            });
    }
}

function makePairing(callback) {
    ipcRenderer.on('pairing_token', (event, args) => {
        callback(null, args);
    });

    ipcRenderer.send('make_pairing_token', {body: new Date()});
}

function connectRoom(e) {
    console.log(token_input.value);
    ipcRenderer.send('input_pairing_token', {body: token_input.value});
}
