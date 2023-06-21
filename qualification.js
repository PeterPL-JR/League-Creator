let nationalTeams = [];
let clubsTeams = [];

let allPots = [];
let allTeams = [];

let potsTeams = [];
let potsLengths = [];

const container = getId("container");
const potsContainer = getId("pots-container");
const groupsContainer = getId("groups-container");

const potsDiv = getId("pots");
const groupsDiv = getId("groups");

const teamsInput = getId("teams-input");
const confedSelect = getId("confed-select");
const teamsDiv = getId("teams");
const countryInput = getId("country-input");
const buttonAdd = getId("button-add");

const teamsAmountInput = getId("teams-amount-input");
const groupsAmountInput = getId("groups-amount-input");
const teamsModeSelect = getId("teams-mode-select");

const buttonSave = getId("button-save");
const buttonDrawStart = getId("button-draw-start");

let _teams;

let _groups;
let _pots;

let draggedTeam = null;
let dragBegin = null;
let flyingElem = null;
let scrollBegin = null;
let started = false;

let mouseX = null;
let mouseY = null;

const imagesObjs = {};

function initMenu() {
    buttonSave.onclick = save;
    
    teamsAmountInput.onchange = changeInput;
    groupsAmountInput.onchange = changeInput;
    changeTeamsModeSelect();

    teamsInput.onkeyup = createTeamsElements;
    countryInput.onkeyup = createTeamsElements;

    teamsModeSelect.onchange = changeTeamsModeSelect;
    confedSelect.onchange = createTeamsElements;

    potsDiv.oncontextmenu = function() {
        return false;
    }

    createTeamsElements();
    changeInput();
}

function get() {
    // National teams
    serverPost(QUALIFICATION_PHP_FILE, {script: GET_ALL_NATIONAL_TEAMS}, function(responceText) {
        nationalTeams = JSON.parse(responceText);

        for(let team of nationalTeams) {
            const img = document.createElement("img");
            img.src = FLAGS_SRC + team.link;
            img.setAttribute("draggable", "false");
            imagesObjs[team.id] = img;
        }

        // Clubs teams
        serverPost(QUALIFICATION_PHP_FILE, {script: GET_ALL_CLUBS_TEAMS}, function(responceText) {
            clubsTeams = JSON.parse(responceText);
            initMenu();
        });
    });
}
get();

function init() {
    started = true;

    groupsDiv.style.display = "none";
    teamsModeSelect.style.display = "none";
    buttonSave.style.display = "none";
    
    teamsAmountInput.setAttribute("readonly", "");
    groupsAmountInput.setAttribute("readonly", "");
    
    potsDiv.style.display = "block";
    container.style.display = "block";

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

    buttonDrawStart.onclick = function() {
        potsContainer.style.setProperty("display", "none");
        groupsContainer.style.setProperty("display", "block");
        draw();
    }

    createPotsTables();
    createTeamsElements();
}

function save() {
    let teamsAmount = parseInt(teamsAmountInput.value);
    let groupsAmount = parseInt(groupsAmountInput.value);

    let potsAmount = Math.ceil(teamsAmount / groupsAmount);

    const MAX_TEAMS = allTeams.length;
    if(teamsAmount > MAX_TEAMS) {
        return;
    }

    _teams = teamsAmount;
    _groups = groupsAmount;
    _pots = potsAmount;

    teamsInput.value="";
    countryInput.value="";

    init();
}
function changeInput() {
    let teamsAmount = parseInt(teamsAmountInput.value);
    let groupsAmount = parseInt(groupsAmountInput.value);

    const MAX_TEAMS = allTeams.length;
    const DEFAULT_TEAMS = 54;

    if(teamsAmount > MAX_TEAMS) {
        teamsAmountInput.value = DEFAULT_TEAMS;
        return;
    }

    _teams = teamsAmount;
    _groups = groupsAmount;

    createGroupsTables();
}
function changeTeamsModeSelect() {
    teamsMode = teamsModeSelect.selectedIndex;

    teamsInput.value="";
    countryInput.value="";
    confedSelect.selectedIndex = 0;

    setTeamsArray();
    
    // Custom mode
    if(teamsMode == TEAMS_MODE_CUSTOM) {
        confedSelect.style.display = "none";
        buttonAdd.style.display = "inline-block";
    } else {
        confedSelect.style.display = "inline-block";
        buttonAdd.style.display = "none";
    }

    // Clubs mode
    getId("clubs-div").style.display = (teamsMode == TEAMS_MODE_CLUBS) ? "block" : "none";

    createTeamsElements();
}

function createTable(title, rowsNumber) {
    const table = document.createElement("table");

    const titleRow = document.createElement("tr");
    titleRow.innerHTML = title;
    table.className = "teams-table";
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

    if(isFlagsMode()) {
        row.appendChild(getFlag(teamObject));
        row.classList.add("pre-team-row");
    }
}

function setTeamsArray() {
    if(teamsMode == TEAMS_MODE_NATIONAL) {
        allTeams = nationalTeams;
    }
    if(teamsMode == TEAMS_MODE_CLUBS) {
        allTeams = clubsTeams;
    }
    if(teamsMode == TEAMS_MODE_CUSTOM) {
    }
}

function getNationalTeams(confed, teamText, action) {
    serverPost(QUALIFICATION_PHP_FILE, {script: GET_NATIONAL_TEAMS, confed, data: teamText}, function(responceText) {
        action(JSON.parse(responceText));
    });
}
function getClubsTeams(confed, teamText, nationalTeamText, action) {
    serverPost(QUALIFICATION_PHP_FILE, {script: GET_CLUBS_TEAMS, confed, data: teamText, national_team: nationalTeamText}, function(responceText) {
        action(JSON.parse(responceText));
    });
}

function createGroupsTables() {
    groupsDiv.innerHTML = "";

    let minGroupTeams = Math.floor(_teams / _groups);
    let teamsLeft = _teams % _groups;

    for(let i = 0; i < _groups; i++) {
        let groupTeams = minGroupTeams;
        if(i < teamsLeft) {
            groupTeams++;
        }
        let table = createTable("Grupa " + toLetter(i), groupTeams);
        table.classList.add("group-table");
        groupsDiv.appendChild(table);
    }
}
function createPotsTables() {
    potsDiv.innerHTML = "";

    allPots = [];

    potsTeams = [];
    potsLengths = [];

    for(let i = 0; i < _pots; i++) {
        potsTeams[i] = [];
        potsLengths[i] = _groups;

        const table = createTable("Koszyk " + (i + 1), _groups);

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

    const countryText = countryInput.value;

    if(teamsMode == TEAMS_MODE_NATIONAL) {
        getNationalTeams(confedSelected, inputText, function(json) {
            createTeamsDivs(json);
        });
    }
    if(teamsMode == TEAMS_MODE_CLUBS) {
        getClubsTeams(confedSelected, inputText, countryText, function(json) {
            createTeamsDivs(json);
        });
    }
}
function createTeamsDivs(teamsArray) {
    const MAX_IN_ROW = 3;

    teamsDiv.innerHTML="";

    const usedTeams = concatArray(potsTeams);
    let teamsCounter = 0;

    for(let team of teamsArray) {
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
}

function createTeamDiv(team) {
    const div = document.createElement("div");
    const id = team.id;

    div.id = `team-div-${id}`;
    div.innerHTML = `<div>${team.name}</div>`;
    div.className = "team-elem";
    div.setAttribute("title", team.name);

    if(isFlagsMode()) {
        div.prepend(getFlag(team));
        div.classList.add("pre-team-elem");
    }

    div.setAttribute("onmousedown", `updateTeam('${id}')`);
    teamsDiv.appendChild(div);
}

function updateMouse(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function updateTeam(id) {
    if(started) {
        if(draggedTeam == null) startMoving(id);
        else stopMoving();
    }
}

function startMoving(id) {
    document.body.style.cursor = "pointer";
    draggedTeam = id;
    
    const elem = getTeam(id);
    elem.classList.add("team-selected");
    elem.style.visibility = "hidden";
    
    flyingElem = elem.cloneNode(elem);
    flyingElem.classList.add("flying-elem");
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
        elem.classList.remove("team-selected");
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

function isFlagsMode() {
    return teamsMode != TEAMS_MODE_CUSTOM;
}
function getFlag(teamObject) {
    let nTeamId = (teamsMode == TEAMS_MODE_NATIONAL) ? "id" : "national_team_id";
    let img = imagesObjs[teamObject[nTeamId]];
    return img.cloneNode(true);
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
    if(draggedTeam == null) {
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
        for(let t = 0; t < group.length; t++) {
            setTableTeam(table, t, findTeamObj(group[t]));
        }
        groupsContainer.appendChild(table);
    }
}