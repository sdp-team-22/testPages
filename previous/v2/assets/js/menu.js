createMenuIcon();
createMenuLabel();
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
    menuIcon.onmouseenter = toggleMenu;
    menuIcon.onmousedown = toggleMenu;
}

function createMenuLabel() {
    const outerDiv = document.createElement('div');
    const innerDiv = document.createElement('div');
    innerDiv.innerText = 'Statistics';
    outerDiv.id = 'menu-label';
    outerDiv.appendChild(innerDiv);
    document.body.appendChild(outerDiv);
}

function createMenu() {
    // Define variables
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

function toggleMenu() {
    const menu = document.getElementById('menu');
    const menuLabel = document.getElementById('menu-label');
    if (menu.style.visibility == 'visible') {
        menu.style.visibility = 'hidden';
        menuLabel.style.visibility = 'hidden';
    } else {
        menu.style.visibility = 'visible';
        menuLabel.style.visibility = 'visible';
    }
}