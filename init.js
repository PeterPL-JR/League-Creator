let teams = []; // [Teams] array
let matches = []; // [Matches] array

let leagueName; // Tournament name
let teamsAmount; // Teams participating in the tournament
let roundsAmount; // Rounds (First match/rematch)
let teamsMode; // National teams/clubs/custom teams

let matchdays; // Matchdays
let matchesPerMatchday; // Amout of matches per matchday

const MIN_TEAMS = 3;
const MAX_TEAMS = 12;

let placesAfterRounds = []; // Teams places in table after each matchday
let colors = {}; // Colors of each row of table

let saveButton = getId("save-amount");
let startButton = getId("start-button");

let initDiv = getId("init-container");
let gameDiv = getId("game-container");

/** Init menu settings page */
function initMenuPage() {
    // Init colors settings divs
    let colorsDivs = document.querySelectorAll("#colors-div div");

    colorsDivs[0].style.backgroundColor = COLOR_GREEN;
    colorsDivs[1].style.backgroundColor = COLOR_YELLOW;

    colorsDivs[2].style.backgroundColor = COLOR_RED;
    colorsDivs[3].style.backgroundColor = COLOR_DEFAULT;
    
    // Button event that initializes the game
    saveButton.onclick = clickMenuButton;

    // Events of colors settings divs
    let colorsInputs = document.querySelectorAll("#colors-div input");
    for(let colorInput of colorsInputs) {
        // Change colors settings when input value is changed
        colorInput.setAttribute("onchange", "editColors();"); 
    }
}

/** Init settings page */
function initSettingsPage() {
    // Init colors div
    let colorsDiv = getId("init-properties-div");
    colorsDiv.style.display = "inline-block";
    getId("default-color").value = teamsAmount;
    
    // Init start button
    startButton.style.display = "inline-block";
    startButton.onclick = clickStartButton;

    saveButton.remove();
    
    // Init teams inputs
    initTeamsInputs();
}

/** Init main page of the game */
function initGamePage() {
    initDiv.style.display = "none"
    gameDiv.style.display = "block";

    init();
}

/** Function that initializes inputs for teams names */
function initTeamsInputs() {
    let inputsDiv = getId("inputs-div");

    for (let i = 0; i < teamsAmount; i++) {
        // Input
        let input = document.createElement("input");
        input.className = "init-team-div";
        input.placeholder = "Drużyna " + (i + 1);

        input.setAttribute("onkeyup", `checkTeamFromInput(${i}, ${teamsMode});`);
        inputsDiv.appendChild(input);

        // Div of team validity
        let div = document.createElement("div");
        div.className = "check-div";
        div.innerHTML = "&#x2714";
        inputsDiv.appendChild(div);

        // New line
        inputsDiv.appendChild(document.createElement("br"));
    }
}

/** Function performed if the button of menu settings page is clicked */
function clickMenuButton() {
    let leagueNameInput = getId("league-name");
    let teamsAmountInput = getId("teams-amount");
    let teamsModeSelect = getId("teams-mode-select");
    
    let leagueNameBuffer = leagueNameInput.value;
    let teamsAmountBuffer = parseInt(teamsAmountInput.value);
    teamsMode = teamsModeSelect.selectedIndex;

    // Set default tournament name if it's empty
    if(isStringEmpty(leagueNameBuffer)) {
        leagueNameBuffer = leagueNameInput.getAttribute("placeholder");
    }
    
    if (teamsAmountBuffer >= MIN_TEAMS && teamsAmountBuffer <= MAX_TEAMS) {
        leagueName = leagueNameBuffer;
        teamsAmount = teamsAmountBuffer;
        
        // Modify League-Name Input
        leagueNameInput.setAttribute("readonly", "true");
        leagueNameInput.value = leagueName;
        
        // Modify Teams-Amount Input
        teamsAmountInput.setAttribute("readonly", "true");

        // Modify Teams-Mode Selection
        teamsModeSelect.setAttribute("readonly", "true");

        initSettingsPage();
    }
}

/** Function performed if the button of settings page is clicked */
function clickStartButton() {
    // Number of rounds
    let roundsInput = getId("rounds-amount");
    let roundsAmountBuffer = parseInt(roundsInput.value);
    
    // Teams
    let teamsInputs = getClass("init-team-div");
    let teamsBuffer1 = [];
    for (let i = 0; i < teamsAmount; i++) {
        teamsBuffer1.push(teamsInputs[i].value);
    }

    // Colors of rows
    let colorsBuffer = {
        green: getColor("green"),
        yellow: getColor("yellow"),
        default: getColor("default"),
        red: getColor("red")
    };

    // Check teams in DB
    const teamsArrayString = JSON.stringify(teamsBuffer1);
    serverPost(LEAGUE_PHP_FILE, { script: GET_TEAMS_SCRIPT, data: teamsArrayString, mode: teamsMode }, function (responceText) {
        let teamsBuffer2 = checkTeams(JSON.parse(responceText), teamsBuffer1, teamsMode);

        // Check all data
        if(teamsBuffer2) {
            checkUserData(teamsBuffer2, roundsAmountBuffer, colorsBuffer);
        }
    });
}

/** Check validify of teams entered by user in settings page */
function checkTeams(serverTeams, teamsNamesArray, teamsMode) {
    const MIN_ID = 1_000_000;
    const MAX_ID = 9_999_999;

    const teamsBuffer = [];

    for (let teamName of teamsNamesArray) {
        let teamObj = findTeamByName(serverTeams, teamName.toLowerCase(), false);
        if(teamObj == null && teamsMode != TEAMS_MODE_CUSTOM) {
            return null;
        }

        // Create custom team object
        if(teamObj == null || teamsMode == TEAMS_MODE_CUSTOM) {
            let id = getRandom(MIN_ID, MAX_ID);
            let name = teamName;
            teamObj = {name, id};
        }
        // Approve a team
        if(!isStringEmpty(teamObj.name)) {
            teamsBuffer.push(teamObj);
        }
    }
    return teamsBuffer;
}

/** Check validity of all tournament data entered by user in settings page */
function checkUserData(teamsBuffer, roundsAmountBuffer, colorsBuffer) {

    const TEAMS_AMOUNT_VALID = teamsBuffer.length == teamsAmount;
    const ROUNDS_AMOUNT_VALID = roundsAmountBuffer == 1 || roundsAmountBuffer == 2;
    const COLORS_VALID = colorsBuffer.green && colorsBuffer.yellow && colorsBuffer.red && colorsBuffer.default; 

    if (TEAMS_AMOUNT_VALID && ROUNDS_AMOUNT_VALID && COLORS_VALID) {
        roundsAmount = roundsAmountBuffer;
        teams = teamsBuffer;
        colors = colorsBuffer;
        
        initGamePage();
    }
}

/** Function performed if value of any color input is changed */
function editColors() {
    let colorsInputs = document.querySelectorAll("#colors-div input:not([id='default-color'])");
    let sum = 0;

    // Sum of colored table rows
    for(let input of colorsInputs) {
        let value = parseInt(input.value);
        if(isNaN(value)) {
            value = 0;
            input.value = value;
        }
        sum += value;
    }
    // Calculate and set number of default-colored rows
    let emptyRows = teamsAmount - sum;
    if(emptyRows < 0) emptyRows = 0;

    document.querySelector(`#colors-div input#default-color`).value = emptyRows;
}

/** Get number of rows colored by given color */
function getColor(colorName) {
    return getId(colorName + "-color").value;
}

/** Connect with DB and check if a team exists */
function checkTeamFromInput(index, teamsMode) {
    if(teamsMode == TEAMS_MODE_CUSTOM) return;

    let input = getClass("init-team-div")[index];
    let checkDiv = getClass("check-div")[index];
    
    let value = input.value;

    serverPost(LEAGUE_PHP_FILE, { script: CHECK_TEAM_SCRIPT, data: value, mode: teamsMode }, function(responceText) {
        let teamExists = JSON.parse(responceText);
        checkDiv.style.visibility = (teamExists) ? "visible" : "hidden";
    });
}