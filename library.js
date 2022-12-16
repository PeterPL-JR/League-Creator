function serverGet(url, data, doFunction) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(this.readyState == 4) {
            doFunction(this.responseText);
        }
    }
    
    var dataString = "";
    for(var key in data) {
        dataString += key + "=" + data[key] + "&";
    }
    request.open("GET", url + "?" + dataString);
    request.send();
}

function serverPost(url, data, doFunction) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(this.readyState == 4) {
            doFunction(this.responseText);
        }
    }

    var dataString = "";
    for(var key in data) {
        dataString += key + "=" + data[key] + "&";
    }

    request.open("POST", url);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(dataString);
}

function getId(id) {
    return document.getElementById(id);
}

function getClass(className) {
    var array = document.getElementsByClassName(className);
    var newArray = [];

    for(var element of array) {
        newArray.push(element);
    }
    return newArray;
}

function createScript(src) {
    var script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isNumber(char) {
    const numbers = [];
    for(var i = 0; i <= 9; i++) {
        numbers.push(`${i}`);
    }
    if(numbers.indexOf(char) != -1) {
        return true;
    }
    return false;
}

function isLetter(char) {
    const letters = [];
    for(var i = 0; i < 26; i++) {
        var lower = String.fromCharCode(i + 97);
        var upper = lower.toUpperCase();

        letters.push(lower);
        letters.push(upper);
    }
    if(letters.indexOf(char) != -1) {
        return true;
    }
    return false;
}

function shuffleArray(array) {
    var newArray = [];
    for(var elem of array) {
        var rand = getRandom(0, 1);
        if(rand == 0) newArray.push(elem);
        else newArray.unshift(elem);
    }
    return newArray;
}

function getRandomArray(length) {
    var array = [];
    for(var i = 0; i < length; i++) {
        var rand = getRandom(0, 1);
        if(rand == 0) array.push(i);
        else array.unshift(i);
    }
    return array;
}

function count(array, element) {
    var counter = 0;
    for(var elem of array) {
        if(elem == element) counter++;
    }
    return counter;
}