let nationalTeams = [];
let clubsTeams = [];
let customTeams = [];

let allTeams = [];

let potsTeams = [];
let potsLengths = [];

let potsTables = [];

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

let teamsList = new TeamsList(teamsDiv);

let _teams;
let _groups;
let _pots;

let imagesObjs = {};

function initMenu() {
    buttonSave.onclick = save;
    
    teamsAmountInput.onchange = changeMainInputs;
    groupsAmountInput.onchange = changeMainInputs;

    teamsInput.onkeyup = function(event) {
        changeTeamInput(event.key);
    }
    countryInput.onkeyup = function(event) {
        changeCountryInput(event.key);
    }

    teamsModeSelect.onchange = changeTeamsModeSelect;
    confedSelect.onchange = createTeamsElements;
    
    teamsList.onStopMoving = function() {
        for(let i = 0; i < _pots; i++) {
            mouseOutPot(i);
        }
    }
    buttonAdd.onclick = addTeam;

    potsDiv.oncontextmenu = function() {
        return false;
    }

    changeTeamsModeSelect();
    changeMainInputs();
}

function get() {
    // National teams
    serverPost(QUALIFICATION_PHP_FILE, {script: GET_ALL_NATIONAL_TEAMS}, function(responceText) {
        nationalTeams = parseNationalTeams(responceText);
        imagesObjs = initImgsObject(nationalTeams);

        // Clubs teams
        serverPost(QUALIFICATION_PHP_FILE, {script: GET_ALL_CLUBS_TEAMS}, function(responceText) {
            clubsTeams = parseClubsTeams(responceText);
            initMenu();
        });
    });
}

function init() {
    teamsList.start();

    groupsDiv.style.display = "none";
    teamsModeSelect.style.display = "none";
    buttonSave.style.display = "none";
    
    teamsAmountInput.setAttribute("readonly", "");
    groupsAmountInput.setAttribute("readonly", "");
    
    potsDiv.style.display = "block";
    container.style.display = "block";

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

function changeMainInputs() {
    let teamsAmount = parseInt(teamsAmountInput.value);
    let groupsAmount = parseInt(groupsAmountInput.value);

    const MAX_TEAMS = allTeams.length;
    const DEFAULT_TEAMS = 54;

    if(teamsMode != TEAMS_MODE_CUSTOM && teamsAmount > MAX_TEAMS) {
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

function changeTeamInput(key) {
    if(teamsMode == TEAMS_MODE_CUSTOM && key == "Enter") {
        addTeam();
    }
    if(!isInputChanged(teamsInput, key)) return;
    
    if(teamsMode == TEAMS_MODE_CUSTOM) {
        buttonAdd.style.setProperty("display", findTeamByName(customTeams, teamsInput.value, false) != null ? "none" : "inline-block");
    }
    createTeamsElements();
}
function changeCountryInput(key) {
    if(!isInputChanged(countryInput, key)) return;
    createTeamsElements();
}

function isInputChanged(input, key) {
    let inputText = input.value;
    return !(key == "Enter" || isStringEmpty(inputText) && inputText.length > 0);
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
    div.innerHTML = teamObject.teamName;

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
        allTeams = customTeams;
    }
}

function createNationalTeamsDivs(confed, teamText) {
    getMatchingTeams(GET_NATIONAL_TEAMS, {confed, data: teamText});
}
function createClubsTeamsDivs(confed, teamText, nationalTeamText) {
    getMatchingTeams(GET_CLUBS_TEAMS, {confed, data: teamText, national_team: nationalTeamText});
}
function createCustomTeamsDivs(teamText) {
    let json = [];
    for(let team of allTeams) {
        let index = team.teamName.indexOf(teamText);
        if(index == 0 || index != -1 && team.teamName[index - 1] == " ") {
            json.push(team);
        }
    }
    createTeamsDivs(json);
}

function getMatchingTeams(script, data) {
    serverPost(QUALIFICATION_PHP_FILE, {script, ...data}, function(responceText) {
        createTeamsDivs(getTeamsFromIDs(JSON.parse(responceText), allTeams));
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

    potsTables = [];

    potsTeams = [];
    potsLengths = [];

    for(let i = 0; i < _pots; i++) {
        potsTeams[i] = [];
        potsLengths[i] = _groups;

        const table = createTable("Koszyk " + (i + 1), _groups);

        table.setAttribute("onmousedown", `choosePot(${i})`);
        table.setAttribute("onmouseenter", `mouseInPot(${i})`);
        table.setAttribute("onmouseleave", `mouseOutPot(${i})`);
        
        potsTables.push(table);
        potsDiv.appendChild(table);
    }
    createClearBoth(potsDiv);
}

function createTeamsElements() {
    const inputText = teamsInput.value;
    const confedSelected = confedSelect.value;

    const countryText = countryInput.value;

    if(teamsMode == TEAMS_MODE_NATIONAL) {
        createNationalTeamsDivs(confedSelected, inputText);
    }
    if(teamsMode == TEAMS_MODE_CLUBS) {
        createClubsTeamsDivs(confedSelected, inputText, countryText);
    }
    if(teamsMode == TEAMS_MODE_CUSTOM) {
        createCustomTeamsDivs(inputText);
    }
}

function createTeamsDivs(teamsArray) {
    const usedTeams = concatArray(potsTeams);
    
    let teams = [];
    for(let team of teamsArray) {
        const index = usedTeams.findIndex(function(elem) {
            return elem == team.id;
        });
        if(index == -1) {
            teams.push(team);
        }
    }
    teamsList.createDivs(teams, imagesObjs);
}

function addTeam() {
    const inputText = teamsInput.value;
    if(isStringEmpty(inputText)) return;

    if(findTeamByName(customTeams, inputText, false) == null) {
        let team = new Team(getRandomID(customTeams), inputText);
        team.type = TEAMS_MODE_CUSTOM;
        customTeams.push(team);

        teamsInput.value = "";
        createTeamsElements();
    }
}

function findTeamInArray(id) {
    return findTeam(allTeams, id);
}

function mouseInPot(potIndex) {
    if(teamsList.getSelectedTeam() != null) {
        potsTables[potIndex].querySelector("tr:first-child").className = "pot-selected";
    }
}
function mouseOutPot(potIndex) {
    potsTables[potIndex].querySelector("tr:first-child").className="";
}

function isFlagsMode() {
    return teamsMode != TEAMS_MODE_CUSTOM;
}
function getFlag(teamObject) {
    return getImg(teamObject, imagesObjs);
}

function choosePot(index) {
    if(teamsList.getSelectedTeam() != null && window.event.button == TeamsList.CLICK_BUTTON) {
        const pot = potsTeams[index];
        if(pot.length < potsLengths[index]) {
            potsTeams[index].push(teamsList.getSelectedTeam());
            updatePot(index);

            createTeamsElements();
            teamsList.stopMoving();
        }
        checkDrawAvailable();
    }
}

function updatePot(index) {
    const pot = potsTeams[index];
    const rows = potsTables[index].querySelectorAll("tr:not(:first-child)");

    for(let i = 0; i < rows.length; i++) {
        rows[i].innerHTML="";
    }

    for(let i = 0; i < pot.length; i++) {
        const team = findTeamInArray(pot[i]);
        const row = rows[i];
        
        setTableTeam(potsTables[index], i, team);
        row.setAttribute("onmousedown", `removePotTeam(${index}, ${i})`);
    }
}
function removePotTeam(potIndex, teamIndex) {
    if(teamsList.getSelectedTeam() == null) {
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
            setTableTeam(table, t, findTeamInArray(group[t]));
        }
        groupsContainer.appendChild(table);
    }
}