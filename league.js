const tableDiv = getId("table-div");
const matchesDiv = getId("matches-div");
const roundNameDiv = getId("round");
const button = getId("button");

let matchday = 0;
let match = 0;

/** Init the game */
function init() {
    // Init teams/matches data
    initTeamsData();
    initMatchesData();

    // Create initial HTML tables
    createTeamsTable(teams);
    createMatchesTable(matches);
    
    startMatch(); // Start first match
}

/** Init array of teams objects */
function initTeamsData() {
    for (let t = 0; t < teams.length; t++) {
        // Object of team statistics
        teams[t].stats = {
            points: 0,
            goalsScored: 0, goalsLost: 0,

            goals: 0,
            wins: 0, draws: 0, losses: 0
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

    // Table header
    const STATS_NAMES = ["M", "Drużyna", "Pkt", "+", "-", "+/-", "W", "R", "P"];
    let header = document.createElement("tr");
    for(let statName of STATS_NAMES) {
        header.innerHTML += `<th>${statName}</th>`
    }
    table.appendChild(header);

    // Table rows
    for (let t = 0; t < teamsTable.length; t++) {
        createTeamRow(table, teamsTable[t], t + 1);
    }

    // Colors
    setColors([
        [COLOR_GREEN, colors.green],
        [COLOR_YELLOW, colors.yellow],
        [COLOR_DEFAULT, colors.default],
        [COLOR_RED, colors.red],
    ]);
}
/** Generate matches table of a matchday */
function createMatchesTable(matchesArray) {
    // First match of a matchday
    let firstMatchIndex = matchday * matchesPerMatchday; 
    
    // HTML table element
    let table = document.createElement("table");
    table.id = MATCHES_TABLE_ID;

    matchesDiv.innerHTML = "";
    matchesDiv.appendChild(table);

    // Create HTML row elements of matches
    for (let i = firstMatchIndex; i < firstMatchIndex + matchesPerMatchday; i++) {
        createMatchRow(table, matchesArray[i]);
    }
}

/** Function that generates one row of a team (for teams table) */
function createTeamRow(table, teamObj, rowIndex) {
    // Team data
    let teamImage = getImageElement(teamObj.link);
    let teamName = teamObj.name;

    // HTML row element
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${rowIndex}</td><td>${teamImage}<div>${teamName}</div></td>`;
    table.appendChild(tr);

    // Team statistics
    for (let key in teamObj.stats) {
        let stat = teamObj.stats[key];
    
        // HTML table field element 
        let td = document.createElement("td");
        td.innerHTML = stat;
        tr.appendChild(td);
    }
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
    `<td>
        ${image1}
        <span>${team1.name}</span>
    </td>
    <td>
        <input type="number" id="text1" disabled value="">
        <b>-</b>
        <input type="number" id="text2" disabled value="">
    </td>
    <td>
        <span>${team2.name}</span>
        ${image2}
    </td>`;
}

/** Get HTML image element if it's defined */
function getImageElement(src) {
    let imageHTML = `<img src="${FLAGS_SRC}${src}">`;
    if(!src) {
        imageHTML = "";
    }
    return imageHTML;
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
        let teamName = teamsTable[i].name;
        tds[TEAM_COLLUMN_INDEX].innerHTML = `${teamImage}<div>${teamName}</div>`;

        // Statistics of the team
        let stats = [];
        for (let key in teamsTable[i].stats) {
            stats.push(teamsTable[i].stats[key]);
        }
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
    // Match HTML element
    let elem = document.querySelectorAll(`#${MATCHES_TABLE_ID} tr`)[match];
    // Scores inputs
    let input1 = elem.querySelector("#text1");
    let input2 = elem.querySelector("#text2");
    
    // Enable
    input1.removeAttribute("disabled");
    input2.removeAttribute("disabled");
    elem.style.backgroundColor = "var(--select-color-1)"; 

    // Play match button
    button.onclick = function() {
        let score1 = parseInt(input1.value);
        let score2 = parseInt(input2.value);

        if(clickPlayButton(score1, score2)) {
            // Disable
            input1.setAttribute("disabled", "");
            input2.setAttribute("disabled", "");
            elem.style.backgroundColor = COLOR_DEFAULT; 
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
    }
    startMatch(); // Start match (next)

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
    matchday++;
    
    // End the game
    if (matchday >= matchdays) {
        endGame();
        return;
    }
    createMatchesTable(matches); 
    setRoundName(matchday + 1); 
}
/** End the game */
function endGame() {
    roundsTable();
    button.remove();
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
            const place = placeIndex + 1;
            const placeText = (place == 1) ? `<b>${place}</b>` : place;
            tr.innerHTML += `<td style='background-color: ${colorsArray[placeIndex]};'>${placeText}</td>`;
        }
    }
}
/** Get the colors of each place in teams table */
function getColorsArray() {
    const COLORS = [COLOR_GREEN, COLOR_YELLOW, COLOR_DEFAULT, COLOR_RED];
    const COLORS_AMOUNTS = [colors.green, colors.yellow, colors.default, colors.red];

    let colorsArray = [];
    // All colors
    for(let c = 0; c < COLORS_AMOUNTS.length; c++) {
        // Occurrences of a color
        for(let i = 0; i < COLORS_AMOUNTS[c]; i++) {
            colorsArray.push(COLORS[c]);
        }
    }
    return colorsArray;
}