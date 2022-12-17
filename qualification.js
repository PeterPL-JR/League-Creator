const _POTS = 6;
let allPots = [];
let allTeams = [];

const potsDiv = getId("pots");
const teamsInput = getId("teams-input");
const teamsDiv = getId("teams");

let draggedTeam = null;
let dragBegin = null;
let flyingElem = null;
let scrollBegin = null;

let mouseX = null;
let mouseY = null;

function get() {
    serverPost(LEAGUE_PHP_FILE, {confed: "UEFA"}, function(text) {
        allTeams = JSON.parse(text);
        init();
    });
}
get();

function init() {
    createTables(allTeams.length);
    teamsInput.onkeyup = findTeam;

    document.body.onmousedown = function(event) {
        const RIGHT_BUTTON = 2;

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
    findTeam();
}

function createTables(teamsAmount) {
    const TEAMS_IN_POT = parseInt(teamsAmount / _POTS);

    for(let i = 0; i < _POTS; i++) {
        const table = document.createElement("table");
        table.className = "teams-table";
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
}

function findTeam() {
    const inputText = teamsInput.value;

    serverPost(LEAGUE_PHP_FILE, {find: inputText}, function(text) {
        const teams = JSON.parse(text);
        teamsDiv.innerHTML="";

        for(let team of teams) {
            createTeamDiv(team);
        }
    });
}

function createTeamDiv(team) {
    const div = document.createElement("div");
    const id = team.id;

    div.className = "team-elem";
    div.innerHTML = `<img src='${FLAGS_SRC}${team.link}' draggable="false"><div>${team.name}</div>`;
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