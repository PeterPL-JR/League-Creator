let teams = [];
let matches = [];

let leagueName; // Name of tournament
let teamsAmount; // Teams Amount
let roundsAmount; // Rounds Amount (1|2)

let totalRounds; // Rounds Amount
let matchesPerRound;

const MIN_TEAMS = 4;
const MAX_TEAMS = 10;

let placesAfterRounds = [];
let colors = {};

let saveButton = getId("save-amount");
let initDiv = getId("init-div");
let gameDiv = getId("game-div");

function findTeamByName(teamsArray, name) {
    for (let team of teamsArray) {
        if (team.name == name) {
            return team;
        }
    }
    return null;
}

function initMenuPage() {
    let colorsDivs = document.querySelectorAll("#colors-div div");

    colorsDivs[0].style.backgroundColor = COLOR_GREEN;
    colorsDivs[1].style.backgroundColor = COLOR_YELLOW;

    colorsDivs[2].style.backgroundColor = COLOR_RED;
    colorsDivs[3].style.backgroundColor = COLOR_WHITE;
    
    saveButton.onclick = clickMenuButton;

    let colorsInputs = document.querySelectorAll("#colors-div input");
    for(let colorInput of colorsInputs) {
        colorInput.setAttribute("onchange", "editColors();");
    }
}
function initPreferencesPage() {
    // Init colors div
    let colorsDiv = getId("init-properties-div");
    colorsDiv.style.display = "inline-block";
    getId("whitea").value = teamsAmount;
    
    // Init Start Button
    let button = document.createElement("button");
    button.innerHTML = "Zacznij";
    button.id = "start-button";
    
    button.onclick = clickStartButton;
    initDiv.appendChild(button);
    saveButton.remove();
    
    // Init teams inputs
    initTeamsInputs();
}
function initGamePage() {
    initDiv.remove();
    gameDiv.style.display = "block";

    init();
}

function checkTeam(index) {
    let value = document.getElementsByClassName("init-team-div")[index].value;
    let checkDiv = document.getElementsByClassName("check-div")[index];

    serverPost(LEAGUE_PHP_FILE, {check: value}, function(text) {
        const TEAM_EXISTS = 1;
        let foundTeams = parseInt(text);
        checkDiv.style.visibility = (foundTeams == TEAM_EXISTS) ? "visible" : "hidden";
    });
}

function initTeamsInputs() {
    let inputsDiv = getId("inputs-div");

    for (let i = 0; i < teamsAmount; i++) {
        let input = document.createElement("input");
        input.className = "init-team-div";
        input.placeholder = "Drużyna " + (i + 1);

        input.setAttribute("onkeyup", `checkTeam(${i});`);
        inputsDiv.appendChild(input);
        
        let div = document.createElement("div");
        div.className = "check-div";
        div.innerHTML = "&#x2714";
        inputsDiv.appendChild(div);
        inputsDiv.appendChild(document.createElement("br"));
    }
}

function clickMenuButton() {
    let nameInput = getId("league-name");
    let amountInput = getId("teams-amount");

    let leagueNameBuffer = nameInput.value;
    let teamsAmountBuffer = parseInt(amountInput.value);

    if(isStringEmpty(leagueNameBuffer)) {
        leagueNameBuffer = nameInput.getAttribute("placeholder");
    }

    if (teamsAmountBuffer >= MIN_TEAMS && teamsAmountBuffer <= MAX_TEAMS) {

        leagueName = leagueNameBuffer;
        teamsAmount = teamsAmountBuffer;

        // Modify League-Name Input
        nameInput.setAttribute("readonly", "true");
        nameInput.style.backgroundColor = "#f9f9f9";
        nameInput.value = leagueName;
        
        // Modify Teams-Amount Input
        amountInput.setAttribute("readonly", "true");
        amountInput.style.backgroundColor = "#f9f9f9";

        initPreferencesPage();
    }
}

function clickStartButton() {
    const MIN_ID = 1_000_000;
    const MAX_ID = 9_999_999;

    let inputs = document.querySelectorAll(".init-team-div");
    let array = [];

    let roundsAmountInput = getId("rounds-amount");
    let roundsAmountBuffer = parseInt(roundsAmountInput.value);

    for (let i = 0; i < teamsAmount; i++) {
        array.push(inputs[i].value);
    }

    const arrayString = JSON.stringify(array);
    serverPost(LEAGUE_PHP_FILE, { get: arrayString }, function (text) {
        let serverTeams = JSON.parse(text);

        const bufferTeams = [];
        for (let elem of array) {
            let teamObj = findTeamByName(serverTeams, elem);
            if(teamObj == null) {
                teamObj = {name: elem, id: getRandom(MIN_ID, MAX_ID)};
            }
            if(!isStringEmpty(teamObj.name)) {
                bufferTeams.push(teamObj);
            }
        }

        const colorsBuffer = {
            green: getId("green").value,
            yellow: getId("yellow").value,
            white: getId("whitea").value,
            red: getId("red").value
        };

        const VALID_TEAMS_AMOUNT = bufferTeams.length == teamsAmount;
        const VALID_ROUNDS_AMOUNT = roundsAmountBuffer == 1 || roundsAmountBuffer == 2;
        const COLORS_DEFINED = colorsBuffer.green && colorsBuffer.yellow && colorsBuffer.red && colorsBuffer.white;

        if (VALID_TEAMS_AMOUNT && VALID_ROUNDS_AMOUNT && COLORS_DEFINED) {
            roundsAmount = roundsAmountBuffer;
            teams = bufferTeams;
            colors = colorsBuffer;
            
            initGamePage();
        }
    });
}

function editColors() {
    let colorsInputs = document.querySelectorAll("#colors-div input:not([id='whitea'])");
    let sum = 0;

    for(let input of colorsInputs) {
        let value = parseInt(input.value);
        if(isNaN(value)) {
            value = 0;
            input.value = value;
        }
        sum += value;
    }
    let emptyRows = teamsAmount - sum;
    if(emptyRows < 0) emptyRows = 0;
    document.querySelector(`#colors-div input#whitea`).value = emptyRows;
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}