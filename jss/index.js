// this is just for testing for now, and using index.html page to test
function testAlert() {
    alert("hey");
}

// adds a divider to html document
function testAddDiv() {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = "<p>this is added using js</p>";
    tempDiv.style.cssText = 'width:100%;background:beige;';
    document.body.appendChild(tempDiv);
}

// adds a divider to html document after an element
function testAddDivAfter(ele) {
    // alert(ele + " " + ele.id);
    let btn = document.getElementById(ele.id);
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = "<p>this is added using js</p>";
    //tempDiv.style.cssText = 'width:100%;background:beige;';
    btn.appendChild(tempDiv);
}

// runs other functions
function main() {
    /**
     * Stuff here
     * just testing now
     **/
}
main();