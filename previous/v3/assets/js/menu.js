const menuItems = {
    'Statistics':'assets/images/statistics.png',
    'Upload Files':'assets/images/upload.png',
    'View Data':'assets/images/graph.png',
}

createMenu();
createController();

function createMenu() {
    const menu = document.createElement('div');
    for (let i = 0; i < Object.keys(menuItems).length; i++) {
        const menuItem = document.createElement('div')
        const menuImage = document.createElement('img');
        const itemLabel = document.createElement('div');
        itemLabel.innerText = Object.keys(menuItems)[i];
        console.log('added' + itemLabel.innerText);
        menuImage.setAttribute('src', menuItems[Object.keys(menuItems)[i]]);
        menuItem.appendChild(menuImage);
        menuItem.appendChild(itemLabel);
        menu.appendChild(menuItem);
    }

    menu.id = 'menu';

    document.body.appendChild(menu);
}

function createController() {
    const controller = document.createElement('div');
    controller.id = 'menu-control';
    controller.onmousedown = toggleMenu;
    controller.onmouseenter = toggleMenu;
    document.body.appendChild(controller);
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    const controller = document.getElementById('menu-control');
    if (menu.style.visibility != 'visible') {
        menu.style.visibility = 'visible';
        controller.style.marginLeft = 'calc(200px + 10px)';
    } else {
        menu.style.visibility = 'hidden';
        controller.style.marginLeft = '10px';
    }
}