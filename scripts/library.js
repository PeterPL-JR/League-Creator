/** Ajax function connecting to a PHP file by GET method */
function serverGet(url, data, doFunction) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        const READY = 4;
        if(this.readyState == READY) {
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

/** Ajax function connecting to a PHP file by POST method */
function serverPost(url, data, doFunction) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        const READY = 4;
        if(this.readyState == READY) {
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

/** Shorter version of document.getElementById() */
function getId(id) {
    return document.getElementById(id);
}

/** Shorter version of document.getElementsByClassName() */
function getClass(className) {
    var array = document.getElementsByClassName(className);
    var newArray = [];

    for(var element of array) {
        newArray.push(element);
    }
    return newArray;
}

/** Create < script > element */
function createScript(src) {
    var script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
}

/** Create < div > element with CSS 'clear: both' value */
function createClearBoth(container) {
    const div = document.createElement("div");
    div.style.setProperty("clear", "both");
    container.appendChild(div);
}

/** Function that returns a random integer number */
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Function checking if a character is a number */
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

/** Function checking if a character is a letter */
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

/** Shuffle an array */
function shuffleArray(array) {
    var newArray = [];
    for(var elem of array) {
        var rand = getRandom(0, 1);
        if(rand == 0) newArray.push(elem);
        else newArray.unshift(elem);
    }
    return newArray;
}

/** Get an array with random numbers */
function getRandomArray(length) {
    var array = [];
    for(var i = 0; i < length; i++) {
        var rand = getRandom(0, 1);
        if(rand == 0) array.push(i);
        else array.unshift(i);
    }
    return array;
}

/* Count an element in an array */
function count(array, element) {
    var counter = 0;
    for(var elem of array) {
        if(elem == element) counter++;
    }
    return counter;
}

/** Function checking if a string is empty */
function isStringEmpty(string) {
    for(let i = 0; i < string.length; i++) {
        const ch = string[i];
        if(ch != " " && ch != "\t" && ch != "\n") {
            return false;
        }
    }
    return true;
}

/** Concat a multidimentional array into an one-dimentional array */
function concatArray(basicArray) {
    let array = [];
    if(basicArray.length == 0) return [];

    for(let elem of basicArray) {
        if(Array.isArray(elem)) {
            array = array.concat(concatArray(elem));
        } else {
            array.push(elem);
        }
    }
    return array;
}

/** Concat several arrays into one array */
function concatArrays(...array) {
    let newArray = [];
    for(let arr of array) {
        for(let elem of arr) {
            newArray.push(elem);
        }
    }
    return newArray;
}

/** Change all elements from the array to lowercase */
function arrayToLower(array) {
    let newArray = [];
}

/** Change all elements from the array to uppercase */
function arrayToUpper(array) {

}