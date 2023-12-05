createMenuIcon();
createMenu();

function createMenuIcon() {
    // Define variables
    const image_path = 'assets/images/menu_icon';
    // Instantiate elements
    const outerDiv = document.createElement('div');
    const innerDiv = document.createElement('div');
    const menuIcon = document.createElement('img');
    // Connect elements
    outerDiv.appendChild(innerDiv);
    innerDiv.appendChild(menuIcon);
    document.body.appendChild(outerDiv);
    // Style elements
    outerDiv.id = 'menu-icon';
    // Link image to element
    menuIcon.src = image_path;
    menuIcon.onmouseenter = openMenu;
    menuIcon.onmousedown = toggleMenu();
}

function createMenu() {
    // Define variables
    const menuTitle = 'Statistics';
    const menuSections = ['Database Utilization', 'Total Uploads/Downloads', 'Test', 'Test', 'Test', 'Test'];
    // Instantiate elements
    const menu = document.createElement('div');
    const innerMenu = document.createElement('div');
    for (let i = 0; i < menuSections.length; i++) {
        const section = document.createElement('div');
        const label = document.createElement('h3');
        const dataDiv = document.createElement('div');
        label.innerText = menuSections[i];
        dataDiv.innerText = 'Example statistic: 50%';
        section.appendChild(label);
        section.appendChild(dataDiv);
        innerMenu.appendChild(section);
    }
    // Connect elements
    menu.appendChild(innerMenu);
    // Style elements
    menu.id = 'menu';
    document.body.appendChild(menu);
}

function openMenu() {
    const menu = document.getElementById('menu');
    if (menu.style.visibility == 'visible') {
        menu.style.visibility = 'hidden';
    } else {
        menu.style.visibility = 'visible';   
    }
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    // if (menu.style.visibility == 'visible') {
    //     menu.style.visibility = 'hidden';
    // } else {
    //     menu.style.visibility = 'visible';
    // }
}