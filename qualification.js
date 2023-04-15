let allPots = [];
let allTeams = [];

let potsTeams = [];
let potsLengths = [];

const potsContainer = getId("pots-container");
const groupsContainer = getId("groups-container");

const potsDiv = getId("pots");
const teamsInput = getId("teams-input");
const teamsDiv = getId("teams");
const confedSelect = getId("confed-select");
const teamsAmountDiv = getId("teams-amount");

const teamsAmountInput = getId("teams-amount-input");
const groupsAmountInput = getId("groups-amount-input");

const buttonDrawStart = getId("button-draw-start");

let _teams;

let _groups;
let _pots;

let draggedTeam = null;
let dragBegin = null;
let flyingElem = null;
let scrollBegin = null;

let mouseX = null;
let mouseY = null;

const imagesObjs = {};

function get() {
    serverPost(QUALIFICATION_PHP_FILE, {script: GET_ALL_TEAMS}, function(responceText) {
        allTeams = JSON.parse(responceText);

        for(let team of allTeams) {
            const img = document.createElement("img");
            img.src = FLAGS_SRC + team.link;
            img.setAttribute("draggable", "false");
            imagesObjs[team.id] = img;
        }
        init();
    });
}
get();

function init() {
    teamsInput.onkeyup = createTeamsElements;

    document.body.onmousedown = function(event) {
        if(event.button == RIGHT_BUTTON) {
            stopMoving();
        }
    }
    document.body.onmousemove = function(event) {
        updateMouse(event);
        teamMove();
    };
    document.body.onscroll = function() {
        teamMove();
    }
    potsDiv.oncontextmenu = function() {
        return false;
    }

    confedSelect.onchange = function() {
        teamsInput.value = "";
        createTeamsElements();
    }

    teamsAmountInput.onchange = groupsAmountInput.onchange = function() {
        changeTables();
    }

    buttonDrawStart.onclick = function() {
        potsContainer.style.setProperty("display", "none");
        groupsContainer.style.setProperty("display", "block");
        draw();
    }

    changeTables();
    createTeamsElements();
}

function createTable(title, rowsNumber) {
    const table = document.createElement("table");

    const titleRow = document.createElement("tr");
    titleRow.innerHTML = title;
    table.appendChild(titleRow);

    for(let j = 0; j < rowsNumber; j++) {
        const row = document.createElement("tr");
        table.appendChild(row);
    }
    return table;
}
function setTableTeam(table, rowIndex, teamObject) {
    const div = document.createElement("div");
    div.innerHTML = teamObject.name;

    let row = table.querySelectorAll("tr")[rowIndex + 1];
    row.appendChild(div);
    row.appendChild(imagesObjs[teamObject.id]);
}

function getTeams(confed, teamText, action) {
    serverPost(QUALIFICATION_PHP_FILE, {script: GET_TEAMS_SCRIPT, confed, data: teamText}, function(responceText) {
        action(JSON.parse(responceText));
    });
}

function changeTables() {
    let teamsAmount = parseInt(teamsAmountInput.value);
    let groupsAmount = parseInt(groupsAmountInput.value);

    let potsAmount = Math.ceil(teamsAmount / groupsAmount);

    const MAX_TEAMS = allTeams.length;
    if(teamsAmount > MAX_TEAMS) {
        teamsAmount = teamsAmountInput.value = _teams;
    }

    _teams = teamsAmount;
    _groups = groupsAmount;
    _pots = potsAmount;

    createTables();
}

function createTables() {
    potsDiv.innerHTML = "";

    allPots = [];

    potsTeams = [];
    potsLengths = [];

    for(let i = 0; i < _pots; i++) {
        potsTeams[i] = [];
        potsLengths[i] = _groups;

        const table = createTable("Koszyk " + (i + 1), _groups);
        table.className = "teams-table";

        table.setAttribute("onmousedown", `choosePot(${i})`);
        table.setAttribute("onmouseenter", `mouseInPot(${i})`);
        table.setAttribute("onmouseleave", `mouseOutPot(${i})`);
        
        allPots.push(table);
        potsDiv.appendChild(table);
    }
    createClearBoth(potsDiv);
}

function createTeamsElements() {
    const inputText = teamsInput.value;
    const confedSelected = confedSelect.value;

    const MAX_IN_ROW = 3;

    getTeams(confedSelected, inputText, function(json) {
        const teams = json;

        teamsDiv.innerHTML="";
        teamsAmountDiv.innerHTML = `(${teams.length})`;

        const usedTeams = concatArray(potsTeams);
        let teamsCounter = 0;

        for(let team of teams) {
            const index = usedTeams.findIndex(function(elem) {
                return elem == team.id;
            });
            if(index == -1) {
                createTeamDiv(team);
                teamsCounter++;
            }
            if(teamsCounter % MAX_IN_ROW == 0) {
                createClearBoth(teamsDiv);
            }
        }
    });
}

function createTeamDiv(team) {
    const div = document.createElement("div");
    const id = team.id;

    div.className = "team-elem";
    div.innerHTML = `<div>${team.name}</div>`;
    div.prepend(imagesObjs[team.id]);
    div.id = `team-div-${id}`;

    div.setAttribute("onmousedown", `updateTeam('${id}')`);
    teamsDiv.appendChild(div);
}

function updateMouse(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function updateTeam(id) {
    if(draggedTeam == null) startMoving(id);
    else stopMoving();
}

function startMoving(id) {
    document.body.style.cursor = "pointer";
    draggedTeam = id;
    
    const elem = getTeam(id);
    elem.className = "team-elem team-selected";
    elem.style.visibility = "hidden";
    
    flyingElem = elem.cloneNode(elem);
    flyingElem.className = "team-elem team-selected flying-elem";
    flyingElem.mouseItem = null;
    document.body.appendChild(flyingElem);
    
    const beginX = mouseX - elem.offsetLeft;
    const beginY = mouseY - elem.offsetTop;
    
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    dragBegin = {x:beginX, y:beginY};
    scrollBegin = {x:scrollX, y:scrollY};
    
    document.body.oncontextmenu = function() {
        return false;
    }
    teamMove();
}
function stopMoving() {
    document.body.style.cursor = "default";
    const elem = getTeam(draggedTeam);
    if(elem != null) {
        elem.className = "team-elem";
        elem.style.visibility = "visible";
        flyingElem.remove();
    }
    draggedTeam = null;
    dragBegin = null;
    scrollBegin = null
    flyingElem = null;

    for(let i = 0; i < _pots; i++) {
        mouseOutPot(i);
    }
}

function teamMove() {
    if(draggedTeam != null) {
        const x = mouseX - dragBegin.x - scrollBegin.x + window.scrollX;
        const y = mouseY - dragBegin.y - scrollBegin.y + window.scrollY;

        flyingElem.style.left = x + "px";
        flyingElem.style.top = y + "px";
    }
}
function getTeam(id) {
    return getId(`team-div-${id}`);
}
function findTeamObj(id) {
    return findTeam(allTeams, id);
}

function mouseInPot(potIndex) {
    if(draggedTeam != null) {
        allPots[potIndex].querySelector("tr:first-child").className = "pot-selected";
    }
}
function mouseOutPot(potIndex) {
    allPots[potIndex].querySelector("tr:first-child").className="";
}

function choosePot(index) {
    if(draggedTeam != null && window.event.button == LEFT_BUTTON) {   
        const pot = potsTeams[index]; 
        if(pot.length < potsLengths[index]) {

            potsTeams[index].push(draggedTeam);
            updatePot(index);
            
            createTeamsElements();
            stopMoving();
        }
        checkDrawAvailable();
    }
}

function updatePot(index) {
    const pot = potsTeams[index];
    const rows = allPots[index].querySelectorAll("tr:not(:first-child)");

    for(let i = 0; i < rows.length; i++) {
        rows[i].innerHTML="";
    }

    for(let i = 0; i < pot.length; i++) {
        const team = findTeamObj(pot[i]);
        const row = rows[i];
        
        setTableTeam(allPots[index], i, team);
        row.setAttribute("onmousedown", `removePotTeam(${index}, ${i})`);
    }
}
function removePotTeam(potIndex, teamIndex) {
    if(draggedTeam == null && window.event.button == RIGHT_BUTTON) {
        const pot = potsTeams[potIndex];
        const index = pot.findIndex(function(elem) {
            return elem == pot[teamIndex];
        });
        pot.splice(index, 1);
        updatePot(potIndex);
        createTeamsElements();

        checkDrawAvailable();
    }
}

// Drawing
function checkDrawAvailable() {
    let teamsPushed = 0;

    for(let pot of potsTeams) {
        teamsPushed += pot.length;
    }
    buttonDrawStart.style.setProperty("display", (teamsPushed == _teams) ? "inline-block" : "none");
}

function draw() {
    let groups = [];
    for(let i = 0; i < _groups; i++) {
        groups[i] = [];
    }

    for(let p = 0; p < _pots; p++) {
        const pot = potsTeams[p];
        
        let groupIndex = 0;
        while(pot.length > 0) {
            let randomIndex = getRandom(0, pot.length - 1);
            let randomTeam = pot[randomIndex];

            pot.splice(randomIndex, 1);
            groups[groupIndex].push(randomTeam);

            groupIndex++;
        }
    }

    for(let g = 0; g < groups.length; g++) {
        const group = groups[g];

        const table = createTable("Grupa " + toLetter(g), group.length);
        table.className = "teams-table";

        for(let t = 0; t < group.length; t++) {
            setTableTeam(table, t, findTeamObj(group[t]));
        }
        groupsContainer.appendChild(table);
    }
}