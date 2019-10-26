const { remote } = require('electron');


document.getElementById('minimize').addEventListener('click', () => {
    remote.getCurrentWindow().minimize();
});

document.getElementById('resize').addEventListener('click', () => {
    const currentWindow = remote.getCurrentWindow();
    if(currentWindow.isMaximized()) currentWindow.unmaximize();
    else currentWindow.maximize();
});

document.getElementById('exit').addEventListener('click', () => {
    remote.app.quit();
});