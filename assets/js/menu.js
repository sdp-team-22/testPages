const menuItems = {
    'Upload Files':'assets/images/upload.png',
    'View Data':'assets/images/graph.png',
    'Statistics':'assets/images/statistics.png',
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
    document.body.appendChild(controller);
}