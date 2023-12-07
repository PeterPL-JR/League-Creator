const tableDiv = getId("table-div");
const matchesDiv = getId("matches-table-div");
const teamMatchesDiv = getId("team-matches-table-div");
const roundNameDiv = getId("round");
const button = getId("button");

const leftArrow = getId("left-arrow");
const rightArrow = getId("right-arrow");

let MEDALS_AMOUNT = 3;

const COLORS_NAMES = [];
COLORS_NAMES[COLORS_MODE_LEAGUE] = ["green", "yellow", "default", "red"];
COLORS_NAMES[COLORS_MODE_PLACES] = ["gold", "silver", "brown", "default"];

let matchday = 0;
let match = 0;

let displayedMatchday = 0;
let displayedMatchesTeam = null;

let bufferScore1 = null;
let bufferScore2 = null;

let end = false;

/** Init the game */
function init() {
    // Init teams/matches data
    initTeamsData();
    initMatchesData();
    
    initEvents();

    // Create initial HTML tables
    createTeamsTable(teams);
    createMatchesTable(matches);
    
    startMatch(); // Start first match
}

/** Init events */
function initEvents() {
    leftArrow.onclick = function() {
        if(displayedMatchday > 0) {
            displayedMatchday--;
        }
        displayMatchday(displayedMatchday);
        hideMatches();
    }
    rightArrow.onclick = function() {
        if(displayedMatchday < matchdays - 1) {
            displayedMatchday++;
        }
        displayMatchday(displayedMatchday);
        hideMatches();
    }
}

/** Init array of teams objects */
function initTeamsData() {
    for (let t = 0; t < teams.length; t++) {
        // Object of team statistics
        teams[t].stats = {
            points: 0,
            goalsScored: 0, goalsLost: 0,

            goals: 0,
            wins: 0, draws: 0, losses: 0,
        };
    }
}

/** Init array of matches/matchdays */
function initMatchesData() {
    let doubleMatches = (roundsAmount == 2) ? true : false; // First match/rematch?
    let matchdaysArray = createMatches(teams.length, doubleMatches); // Array of matchdays/matches

    matchdays = matchdaysArray.length;
    matchesPerMatchday = matchdaysArray[0].length;

    // Create matches array
    for (let i = 0; i < matchdaysArray.length; i++) {
        for (let match of matchdaysArray[i]) {
            let team1 = teams[match[0] - 1];
            let team2 = teams[match[1] - 1];

            matches.push(new Match(team1, team2));
        }
    }
}

/** Generate table of teams */
function createTeamsTable(teamsTable) {
    // HTML table element
    let table = document.createElement("table");
    table.className = TEAMS_TABLE_CLASS;
    tableDiv.innerHTML = "";
    tableDiv.appendChild(table);

    table.oncontextmenu = function() {
        return false;
    }

    // Table header
    const STATS_NAMES = ["M", "Drużyna", "Pkt", "+", "-", "+/-", "W", "R", "P", "M"];
    let header = document.createElement("tr");
    for(let statName of STATS_NAMES) {
        header.innerHTML += `<th>${statName}</th>`
    }
    table.appendChild(header);

    // Table rows
    for (let t = 0; t < teamsTable.length; t++) {
        createTeamRow(table, teamsTable[t], t);
    }

    // Colors
    let colorsArray = [];
    for(let key in colors) {
        colorsArray.push([COLORS[key], colors[key]]);
    }
    setColors(colorsArray);
}
/** Generate matches table of a matchday */
function createMatchesTable(matchesArray, matchday=0) {
    // First match of a matchday
    let firstMatchIndex = matchday * matchesPerMatchday; 

    // HTML table element
    let table = document.createElement("table");
    table.className = MATCHES_TABLE_CLASS;

    matchesDiv.innerHTML = "";
    matchesDiv.appendChild(table); 

    // Create HTML row elements of matches
    for (let i = firstMatchIndex; i < firstMatchIndex + matchesPerMatchday; i++) {
        createMatchRow(table, matchesArray[i]);
    }
    // Set round name
    setRoundName(matchday + 1);
}

/** Function that generates one row of a team (for teams table) */
function createTeamRow(table, teamObj, rowIndex) {
    let place = rowIndex + 1;
    // Team data
    let teamImage = getImageElement(teamObj.link);
    // HTML row element
    let placeText = getPlaceElement(place);

    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${placeText}</td><td>${getTeamText(teamObj, teamImage, rowIndex)}</td>`;
    table.appendChild(tr);

    // Team statistics
    for (let key in teamObj.stats) {
        let stat = teamObj.stats[key];
    
        // HTML table field element
        let td = document.createElement("td");
        td.innerHTML = stat;
        tr.appendChild(td);
    }
    tr.innerHTML += `<td>0</td>`;
}
/** Function that generates one row of a match (for matches table) */
function createMatchRow(table, matchObj) {
    // Find teams objects of the match
    let team1 = findTeam(teams, matchObj.team1);
    let team2 = findTeam(teams, matchObj.team2);

    let image1 = getImageElement(team1.link);
    let image2 = getImageElement(team2.link);

    // HTML row element
    let tr = document.createElement("tr");
    table.appendChild(tr);

    tr.innerHTML =
    `${getMatchTeamText(image1, team1.name, DIRECTION_LEFT, false)}
    <td>
        <input class='score-input' type="number" id="text1" disabled value="" onfocus='hideMatches();'>
        <b>-</b>
        <input class='score-input' type="number" id="text2" disabled value="" onfocus='hideMatches();'>
    </td>
    ${getMatchTeamText(image2, team2.name, DIRECTION_RIGHT, false)}`;
}

/** Get HTML image element if it's defined */
function getImageElement(src) {
    let iconLink = (teamsMode == TEAMS_MODE_CLUBS) ? ((iconsMode == CLUBS_MODE_FLAGS) ? FLAGS_SRC : LOGOS_SRC) : FLAGS_SRC;
    let imageHTML = `<img src="${iconLink}${src}">`;
    return (src) ? imageHTML : "";
}

/** Get HTML of place of row (text or medal image) */
function getPlaceElement(place) {
    let medalText = `<img class='medal' src='images/place_${place}.png'>`;
    return (colorsMode == COLORS_MODE_PLACES && place <= MEDALS_AMOUNT) ? medalText : place;
}

/** Display basic data and statistics of all teams in teams table */
function setTableTeams(teamsTable) {
    // HTML row elements of teams (without the header row)
    let trs = document.querySelectorAll(`.${TEAMS_TABLE_CLASS} tr:not(:first-child)`);
    
    const TEAM_COLLUMN_INDEX = 1;
    const FIRST_STATS_COLLUMN_INDEX = 2;

    // Display data of each team
    for (let i = 0; i < trs.length; i++) {
        // HTML collumn elements of team statistics
        let tds = trs[i].querySelectorAll("td");

        // Basic team data
        let teamImage = getImageElement(teamsTable[i].link);
        let teamId = teamsTable[i].id;

        tds[TEAM_COLLUMN_INDEX].innerHTML = getTeamText(teamsTable[i], teamImage, i); // TODO

        // Statistics of the team
        let stats = [];
        for (let key in teamsTable[i].stats) {
            stats.push(teamsTable[i].stats[key]);
        }
        stats.push(countMatchesPlayed(teamId, matches))

        for (let j = FIRST_STATS_COLLUMN_INDEX; j < FIRST_STATS_COLLUMN_INDEX + stats.length; j++) {
            tds[j].innerHTML = stats[j - FIRST_STATS_COLLUMN_INDEX];
        }
    }
}
/** Set colors of rows in teams table */
function setColors(colors) {
    // HTML row elements of teams (without the header row)
    let trs = document.querySelectorAll(`.${TEAMS_TABLE_CLASS} tr:not(:first-child)`);

    const COLOR_INDEX = 0;
    const NUMBER_OF_ROWS_INDEX = 1;

    // Array of all colored rows
    let allColors = [];
    for (let array of colors) {
        for (let i = 0; i < array[NUMBER_OF_ROWS_INDEX]; i++) {
            allColors.push(array[COLOR_INDEX]);
        }
    }
    // Set bgcolors of rows
    for (let i = 0; i < trs.length; i++) {
        trs[i].style.backgroundColor = allColors[i];
    }
}
/** Set name of round */
function setRoundName(matchday) {
    roundNameDiv.innerHTML = "Runda " + matchday;
}

/** Start a match (next in line) */
function startMatch() {
    changeArrows(matchday);
    // Enable
    enableMatch(getMatchElem(match), true);

    setScoresSaveEvents();

    // Play match button
    button.onclick = function() {
        let matchElem = getMatchElem(match);
        // Scores inputs
        let input1 = getScoreInput(matchElem, 0);
        let input2 = getScoreInput(matchElem, 1);

        // Scores
        let score1 = parseInt(input1.value);
        let score2 = parseInt(input2.value);

        if(clickPlayButton(score1, score2)) {
            // Disable
            enableMatch(matchElem, false);
        }
    }
}
/** End a match and score it (currently played) */
function playMatch(score1, score2) {
    let matchIndex = matchday * matchesPerMatchday + match; // Index of the match
    let matchObject = matches[matchIndex]; // Object of the match

    // Teams
    let team1 = findTeam(teams, matchObject.team1);
    let team2 = findTeam(teams, matchObject.team2);

    // Score the match
    matchObject.playMatch(score1, score2);
    scoreMatchPoints(score1, score2, team1, team2);
    // Sort table of teams
    let sorted = sortTeams(teams);
    setTableTeams(sorted);

    match++;
    // End the matchday
    if (match >= matchesPerMatchday) {
        endMatchday(sorted);
        if(end) {
            return false;
        }
    }
    startMatch(); // Start match (next)

    // Reset saved scores
    bufferScore1 = null;
    bufferScore2 = null;

    return true;
}

/** Function performed if the button of playing match is clicked */
function clickPlayButton(score1, score2) {
    const SCORES_VALID = !isNaN(score1) && !isNaN(score2);
    const SCORES_POSITIVE = score1 >= 0 && score2 >= 0;

    if (SCORES_VALID && SCORES_POSITIVE) {
        playMatch(score1, score2); // Play and score the match
        return true;
    }
    return false;
}

/** End a matchday */
function endMatchday(teamsArray) {
    placesAfterRounds.push(teamsArray);

    match = 0;
    // End the game
    if (matchday >= matchdays - 1) {
        endGame();
        return;
    }
    
    matchday++;
    displayedMatchday++;

    createMatchesTable(matches, matchday); 
}
/** End the game */
function endGame() {
    end = true;
    roundsTable();

    roundNameDiv.classList.remove("active-round");
    button.remove();
}

/** Generate a table that shows list of all matches of a team */
function displayMatches(teamId, rowIndex) {
    if(window.event.button != RIGHT_BUTTON) return;

    teamMatchesDiv.innerHTML = "";

    if(displayedMatchesTeam == teamId) {
        displayedMatchesTeam = null;
        for(let i = 0; i < teamsAmount; i++) {
            setArrowSpanVisible(i, false);
        }
        return;
    }
    
    for(let i = 0; i < teamsAmount; i++) {
        setArrowSpanVisible(i, i == rowIndex);
    }
    displayedMatchesTeam = teamId;
    
    // Choosen team data
    const thisTeam = findTeam(teams, teamId);
    const thisTeamName = thisTeam.name;
    const thisTeamImage = getImageElement(thisTeam.link);

    // Header
    teamMatchesDiv.innerHTML = `<div class='team-header'>${thisTeamImage} ${thisTeamName}</div>`;

    // Generate table
    let table = document.createElement("table");
    table.className = MATCHES_TABLE_CLASS;

    let matchesAmount = matches.length;

    for(let i = 0; i < matchesAmount; i++) {
        let match = matches[i];

        // Create a new table if there's second round
        if(roundsAmount == 2 && i == matchesAmount / 2) {
            teamMatchesDiv.appendChild(table);
            teamMatchesDiv.appendChild(document.createElement("br"));

            table = document.createElement("table");
            table.className = MATCHES_TABLE_CLASS;
        }

        if(match.team1 != teamId && match.team2 != teamId) continue;
        // Teams objects
        let team1 = findTeam(teams, match.team1);
        let team2 = findTeam(teams, match.team2);
        
        // Flags
        let image1 = (team1.id == teamId) ? getImageElement(team1.link) : "";
        let image2 = (team2.id == teamId) ? getImageElement(team2.link) : "";
        
        // Match scores
        let score1 = (match.score1 != -1) ? match.score1 : "";
        let score2 = (match.score2 != -1) ? match.score2 : "";

        let tr = document.createElement("tr");
        table.appendChild(tr);

        tr.innerHTML = 
        `${getMatchTeamText(image1, team1.name, DIRECTION_LEFT, team1.id == teamId)}
        <td>
            <input class='score-input' type="number" disabled value='${score1}'>
            <b>-</b>
            <input class='score-input' type="number" disabled value='${score2}'>
        </td>
        ${getMatchTeamText(image2, team2.name, DIRECTION_RIGHT, team2.id == teamId)}`;
    }
    teamMatchesDiv.appendChild(table);
}
/** Hide list of matches of the team currently displayed */
function hideMatches() {
    displayMatches(displayedMatchesTeam);
}

/** Generate a table that shows the places of each team on after each matchday */
function roundsTable() {
    let finalTeams = placesAfterRounds[placesAfterRounds.length - 1]; // Places after the last matchday
    let colorsArray = getColorsArray(); // Colors

    // HTML table element
    let table = document.createElement("table");
    table.className = "places-table teams-table";
    document.body.appendChild(table);
   
    // Header of the table
    let thr = document.createElement("tr");
    thr.innerHTML = "<th>Drużyna</th>";
    table.appendChild(thr);

    for(let i = 0; i < matchdays; i++) {
        thr.innerHTML += `<th>${i + 1}</th>`;
    }

    // Generate rows of each team 
    for (let t = 0; t < teams.length; t++) {
        // HTML row element of a team and places of it
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${getImageElement(finalTeams[t].link)}<div>${finalTeams[t].name}</div></td>`;
        table.appendChild(tr);
        
        // Generate collumns of each round of the team
        let teamId = finalTeams[t].id; 
        
        for(let p = 0; p < placesAfterRounds.length; p++) {
            // Sort teams by place after the last matchday
            let placeIndex = placesAfterRounds[p].findIndex(function(obj) {
                return obj.id == teamId;
            });

            // Display the place after
            let place = placeIndex + 1;
            let placeText = (p < placesAfterRounds.length - 1) ? place : getPlaceElement(placeIndex + 1);
            if(place == 1) {
                placeText = `<b>${placeText}</b>`;
            }
            tr.innerHTML += `<td style='background-color: ${colorsArray[placeIndex]};'>${placeText}</td>`;
        }
    }
}
/** Get the colors of each place in teams table */
function getColorsArray() {
    const colorsArray = [];
    const colorsAmountsArray = [];

    for(let key in colors) {
        colorsArray.push(COLORS[key]);
        colorsAmountsArray.push(colors[key]);
    }

    let finalArray = [];
    // All colors
    for(let c = 0; c < colorsAmountsArray.length; c++) {
        // Occurrences of a color
        for(let i = 0; i < colorsAmountsArray[c]; i++) {
            finalArray.push(colorsArray[c]);
        }
    }
    return finalArray;
}

/** Display matchday */
function displayMatchday(index) {
    createMatchesTable(matches, index);
    changeArrows(index);

    setScoresSaveEvents();

    // Set match scores if it's played
    for(let i = 0; i < matchesPerMatchday; i++) {
        let matchIndex = index * matchesPerMatchday + i;
        let match = matches[matchIndex];
        
        if(match.score1 != -1 && match.score2 != -1) {
            let matchElem = getMatchElem(i);
            getScoreInput(matchElem, 0).value = match.score1;
            getScoreInput(matchElem, 1).value = match.score2;
        }
    }
    
    // Enable match that's being played now
    if(!end && index == matchday) {
        let matchElem = getMatchElem(match);
        enableMatch(matchElem, true);

        if(bufferScore1 != null) getScoreInput(matchElem, 0).value = bufferScore1;
        if(bufferScore2 != null) getScoreInput(matchElem, 1).value = bufferScore2;

        button.style.setProperty("display", "inline-block");
        roundNameDiv.classList.add("active-round");
    } else {
        button.style.setProperty("display", "none");
        roundNameDiv.classList.remove("active-round");
    }
}

/** Create events for scores inputs that save scores after switching matchday */
function setScoresSaveEvents() {
    let matchElem = getMatchElem(match);
    let input1 = getScoreInput(matchElem, 0);
    let input2 = getScoreInput(matchElem, 1);

    input1.onkeyup = function() {
        bufferScore1 = input1.value;
        if(isStringEmpty(bufferScore1)) {
            bufferScore1 = null;
        }
    }
    input2.onkeyup = function() {
        bufferScore2 = input2.value;
        if(isStringEmpty(bufferScore2)) {
            bufferScore2 = null;
        }
    }
}

/** Function that enables/disables a match */
function enableMatch(matchElem, enabled) {
    let input1 = getScoreInput(matchElem, 0);
    let input2 = getScoreInput(matchElem, 1);
    
    if(enabled) {
        input1.removeAttribute("disabled");
        input2.removeAttribute("disabled");
        matchElem.style.backgroundColor = ACTIVE_MATCH_COLOR;
    } else {
        input1.setAttribute("disabled", "");
        input2.setAttribute("disabled", "");
        matchElem.style.backgroundColor = DEFAULT_MATCH_COLOR;
    }
}
/** Function that gets an HTML object of a match */
function getMatchElem(matchIndex) {
    return matchesDiv.querySelectorAll(`.${MATCHES_TABLE_CLASS} tr`)[matchIndex];
}
/** Function that gets one of two score inputs of a match */
function getScoreInput(matchElem, inputIndex) {
    return matchElem.querySelector(`#text${inputIndex + 1}`);
}
/** Function that gets arrow <span> of a team, which list of matches is being displayed */
function setArrowSpanVisible(rowIndex, visible) {
    let teamsNamesDivs = tableDiv.querySelectorAll(".teams-table .team-name");
    teamsNamesDivs[rowIndex].querySelector("span").style.visibility = (visible) ? "visible" : "hidden";
}

/** Function that gets text of table row of team information (teams table/matches table) */
function getTeamText(teamObj, teamImage, rowIndex) {
    return `${teamImage}<div class='team-name' onmousedown='displayMatches("${teamObj.id}", ${rowIndex});'>${teamObj.name}<span>V</span></div>`;
}
function getMatchTeamText(teamImage, teamName, direction, bold) {
    let imageText = teamImage;
    let nameText = (bold) ? `<span style='font-weight: bold;'>${teamName}</span>` : `<span>${teamName}</span>`;
    let innerText = (direction == DIRECTION_LEFT) ? (imageText + nameText) : (nameText + imageText);

    return `<td>${innerText}</td>`;
}

/** Function that changes arrow buttons during switching matchdays */
function changeArrows(matchday) {
    showArrow(leftArrow, true);
    showArrow(rightArrow, true);
    
    if(matchday == 0) {
        showArrow(leftArrow, false);
    }
    if(matchday >= matchdays - 1) {
        showArrow(rightArrow, false);
    }
}
/** Show/hide an arrow button */
function showArrow(arrow, shown) {
    arrow.style.setProperty("visibility", shown ? "visible" : "hidden");
}