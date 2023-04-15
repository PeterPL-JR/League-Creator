const _POTS = 6;
let allPots = [];
let allTeams = [];

let potsTeams = [];
let potsLengths = [];

const potsDiv = getId("pots");
const teamsInput = getId("teams-input");
const teamsDiv = getId("teams");

let draggedTeam = null;
let dragBegin = null;
let flyingElem = null;
let scrollBegin = null;

let mouseX = null;
let mouseY = null;

const imagesObjs = {};

function get() {
    getTeams("UEFA", "", function(json) {
        allTeams = json;

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
    createTables(allTeams.length);
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
    createTeamsElements();
}

function getTeams(confed, teamText, action) {
    serverPost(QUALIFICATION_PHP_FILE, {script: GET_TEAMS_SCRIPT, confed, data: teamText}, function(responceText) {
        action(JSON.parse(responceText));
    });
}

function createTables(teamsAmount) {
    const TEAMS_IN_POT = parseInt(teamsAmount / _POTS);

    for(let i = 0; i < _POTS; i++) {
        potsTeams[i] = [];
        potsLengths[i] = TEAMS_IN_POT;

        const table = document.createElement("table");
        table.className = "teams-table";
        table.setAttribute("onmousedown", `choosePot(${i})`);
        table.setAttribute("onmouseenter", `mouseInPot(${i})`);
        table.setAttribute("onmouseleave", `mouseOutPot(${i})`);

        const titleRow = document.createElement("tr");
        titleRow.innerHTML = "Koszyk " + (i + 1);
        table.appendChild(titleRow);

        for(let j = 0; j < TEAMS_IN_POT; j++) {
            const row = document.createElement("tr");
            table.appendChild(row);
        }
        allPots.push(table);
        potsDiv.appendChild(table);
    }
    createClearBoth(potsDiv);
}

function createTeamsElements() {
    const inputText = teamsInput.value;
    const MAX_IN_ROW = 3;

    getTeams("UEFA", inputText, function(json) {
        const teams = json;
        teamsDiv.innerHTML="";

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

    for(let i = 0; i < _POTS; i++) {
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
    }
}

function updatePot(index) {
    const pot = potsTeams[index];
    const rows = allPots[index].querySelectorAll("tr:not(:first-child)");

    for(let i = 0; i < rows.length; i++) {
        rows[i].innerHTML="";
    }

    for(let i = 0; i < pot.length; i++) {
        const team = findTeam(allTeams, pot[i]);

        const div = document.createElement("div");
        div.innerHTML = team.name;

        rows[i].appendChild(div);
        rows[i].appendChild(imagesObjs[team.id]);
        rows[i].setAttribute("onmousedown", `removePotTeam(${index}, ${i})`);
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
    }
}