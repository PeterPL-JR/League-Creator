let teams = []; // [Teams] array
let matches = []; // [Matches] array

let leagueName; // Tournament name
let teamsAmount; // Teams participating in the tournament
let roundsAmount; // Rounds (First match/rematch)
let teamsMode; // National teams/clubs/custom teams
let iconsMode; // Flags/logos mode for clubs

let colorsMode = 0; // Mode of colors displayed on the table

let matchdays; // Matchdays
let matchesPerMatchday; // Amout of matches per matchday

const MIN_TEAMS = 3;
const MAX_TEAMS = 18;

let placesAfterRounds = []; // Teams places in table after each matchday
let colors = {}; // Colors of each row of table

let saveButton = getId("save-amount");
let startButton = getId("start-button");

let logo = getId("logo");
let initDiv = getId("init-container");
let gameDiv = getId("game-container");

const COLORS_MODES = 2;
let leftColorsArrow = getId("colors-arrow-left");
let rightColorsArrow = getId("colors-arrow-right");

let teamsModeSelect = getId("teams-mode-select");
let iconsModeDiv = getId("icons-mode");

/** Init menu settings page */
function initMenuPage() {
    // Init colors settings divs

    initColors();
    
    // Button event that initializes the game
    saveButton.onclick = clickMenuButton;

    teamsModeSelect.onchange = function() {
        iconsModeDiv.style.display = (teamsModeSelect.selectedIndex == TEAMS_MODE_CLUBS) ? "block" : "none";
    }
}

/** Init settings page */
function initSettingsPage() {
    // Init colors div
    let colorsDiv = getId("init-properties-div");
    colorsDiv.style.display = "inline-block";

    let defaultColorDiv1 = document.querySelector("#colors-div-1 #default-color");
    defaultColorDiv1.value = teamsAmount;
    
    let defaultColorDiv2 = document.querySelector("#colors-div-2 #default-color");
    defaultColorDiv2.value = teamsAmount - MEDALS_AMOUNT;

    // Init start button
    startButton.style.display = "inline-block";
    startButton.onclick = clickStartButton;

    saveButton.remove();
    
    // Init teams inputs
    initTeamsInputs();
}

/** Init main page of the game */
function initGamePage() {
    logo.style.display = "none";
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

/** Function that initializes panels for editing color */
function initColors() {
    initColorsPanel(0, COLORS_NAMES[COLORS_MODE_LEAGUE]);
    initColorsPanel(1, COLORS_NAMES[COLORS_MODE_PLACES]);

    leftColorsArrow.onclick = function() {
        switchColorsPanel(-1);
    }
    rightColorsArrow.onclick = function() {
        switchColorsPanel(1);
    }

    getId("gold-color").value = 1;
    getId("silver-color").value = 1;
    getId("brown-color").value = 1;

    getId("gold-color").setAttribute("readonly", "");
    getId("silver-color").setAttribute("readonly", "");
    getId("brown-color").setAttribute("readonly", "");
}

/** Function performed if the button of menu settings page is clicked */
function clickMenuButton() {
    let leagueNameInput = getId("league-name");
    let teamsAmountInput = getId("teams-amount");
    let iconsModeSelect = getId("icons-mode-select");

    let leagueNameBuffer = leagueNameInput.value;
    let teamsAmountBuffer = parseInt(teamsAmountInput.value);
    teamsMode = teamsModeSelect.selectedIndex;
    iconsMode = (teamsMode == TEAMS_MODE_CLUBS) ? iconsModeSelect.selectedIndex : CLUBS_MODE_FLAGS;

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
        iconsModeSelect.setAttribute("readonly", "true");

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
    let colorsBuffer = getColorsFromInputs(colorsMode);

    // Check teams in DB
    const teamsArrayString = JSON.stringify(teamsBuffer1);
    serverPost(LEAGUE_PHP_FILE, { script: GET_TEAMS_SCRIPT, data: teamsArrayString, mode: teamsMode, icons_mode: iconsMode }, function (responceText) {
        let serverTeams = [];
        for(let team of JSON.parse(responceText)) {
            serverTeams.push(new Team(team.id, team.name, team.link));
        }
        
        let teamsBuffer2 = checkTeams(serverTeams, teamsBuffer1, teamsMode);

        // Check all data
        if(teamsBuffer2) {
            checkUserData(teamsBuffer2, roundsAmountBuffer, colorsBuffer);
        }
    });
}

/** Check validify of teams entered by user in settings page */
function checkTeams(serverTeams, teamsNamesArray, teamsMode) {
    const teamsBuffer = [];

    for (let teamName of teamsNamesArray) {
        let teamObj = findTeamByName(serverTeams, teamName.toLowerCase(), false);
        if(teamObj == null && teamsMode != TEAMS_MODE_CUSTOM) {
            return null;
        }

        // Create custom team object
        if(teamObj == null || teamsMode == TEAMS_MODE_CUSTOM) {
            let id = getRandomID(teamsBuffer);
            teamObj = new Team(id, teamName);
        }
        // Approve a team
        if(!isStringEmpty(teamObj.teamName)) {
            teamsBuffer.push(teamObj);
        }
    }
    return teamsBuffer;
}

/** Check validity of all tournament data entered by user in settings page */
function checkUserData(teamsBuffer, roundsAmountBuffer, colorsBuffer) {

    const TEAMS_AMOUNT_VALID = teamsBuffer.length == teamsAmount;
    const ROUNDS_AMOUNT_VALID = roundsAmountBuffer == 1 || roundsAmountBuffer == 2;

    if (TEAMS_AMOUNT_VALID && ROUNDS_AMOUNT_VALID) {
        roundsAmount = roundsAmountBuffer;
        teams = teamsBuffer;
        colors = colorsBuffer;
        
        initGamePage();
    }
}

/** Init panels for editing colors */
function initColorsPanel(index, colorsArray) {
    let container = document.getElementById("colors-div-" + (index + 1));
    if(index == colorsMode) {
        container.style.display = "block";
    }
    let defaultColorHTML = "";

    for(let i = 0; i < colorsArray.length; i++) {
        let colorName = colorsArray[i];
        let color = COLORS[colorName];
        let disabledText = (colorName == "default") ? "readonly" : "";

        let colorHTML = `<div style='background-color: ${color};'></div><input ${disabledText} class='color-input' type='number' value='0' id='${colorName}-color' onchange='editColors(${index});'><br>`;

        if(colorName == "default") {
            defaultColorHTML = colorHTML;
            continue;
        }
        container.innerHTML += colorHTML;
    }
    container.innerHTML += defaultColorHTML;
}

/** Switch colors panel */
function switchColorsPanel(direction) {
    colorsMode += direction;

    leftColorsArrow.style.visibility = "visible";
    rightColorsArrow.style.visibility = "visible";

    if(colorsMode <= 0) {
        colorsMode = 0;
        leftColorsArrow.style.visibility = "hidden";
    }

    if(colorsMode >= COLORS_MODES - 1) {
        colorsMode = COLORS_MODES - 1;
        rightColorsArrow.style.visibility = "hidden";
    }

    let colorsDivs = document.getElementsByClassName("colors-div");
    for(let i = 0; i < COLORS_MODES; i++) {
        colorsDivs[i].style.display = (i == colorsMode) ? "block" : "none";
    }
}

/** Function performed if value of any color input is changed */
function editColors(index) {
    let colorsInputs = document.querySelectorAll(`#colors-div-${index + 1} input:not([id='default-color'])`);
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

    document.querySelector(`#colors-div-${index + 1} input#default-color`).value = emptyRows;
}

/** Get number of rows colored by a color */
function getColor(panelIndex, colorName) {
    return document.querySelector(`#colors-div-${panelIndex + 1} #${colorName}-color`).value;
}
function getColorsFromInputs(colorsMode) {
    let colorsNames = COLORS_NAMES[colorsMode];
    let array = [];

    for(let colorName of colorsNames) {
        array[colorName] = getColor(colorsMode, colorName);
    }
    return array;
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