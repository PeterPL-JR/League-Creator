const tableDiv = getId("table-div");
const matchesDiv = getId("matches-div");
const button = getId("button");

let round = 0;
let match = 0;

function init() {
    let doubleRound = (roundsAmount == 2) ? true : false;
    let rounds = createMatches(teams.length, doubleRound);

    // Creating teams objects
    for (let t = 0; t < teams.length; t++) {
        teams[t].stats = {
            points: 0,
            goalsScored: 0, goalsLost: 0,

            goals: 0,
            wins: 0, draws: 0, losses: 0
        };
    }
    initTeamsTable(teams);

    // Creating matches array
    totalRounds = rounds.length;
    matchesPerRound = rounds[0].length;
    for (let i = 0; i < rounds.length; i++) {
        for (let match of rounds[i]) {
            matches.push(new Match(teams[match[0] - 1], teams[match[1] - 1]));
        }
    }
    initMatchesTable();
    startMatch();
}

function initTeamsTable(teamsTable) {
    let table = document.createElement("table");
    table.className = "teams-table";

    let thr = document.createElement("tr");
    thr.innerHTML = `<th>M</th><th>Drużyna</th><th>Pkt</th><th>+</th><th>-</th><th>+/-</th><th>W</th><th>R</th><th>P</th>`;
    table.appendChild(thr);

    for (let t = 0; t < teamsTable.length; t++) {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${t + 1}</td><td>${getImageElement(teamsTable[t].link)}<div>${teamsTable[t].name}</div></td>`;

        for (let key in teamsTable[t].stats) {
            let stat = teamsTable[t].stats[key];

            let td = document.createElement("td");
            td.innerHTML = stat;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    tableDiv.innerHTML = "";
    tableDiv.appendChild(table);

    setColors([
        [COLOR_GREEN, colors.green],
        [COLOR_YELLOW, colors.yellow],
        [COLOR_WHITE, colors.white],
        [COLOR_RED, colors.red],
    ]);
}

function initMatchesTable() {
    let firstIndex = round * matchesPerRound;
    let table = document.createElement("table");
    table.id = "matches-table";

    for (let i = firstIndex; i < firstIndex + matchesPerRound; i++) {
        createMatch(table, matches[i]);
    }
    matchesDiv.innerHTML = "";
    matchesDiv.appendChild(table);
}

function createMatch(table, matchObj) {
    let tr = document.createElement("tr");

    let team1 = findTeam(teams, matchObj.team1);
    let team2 = findTeam(teams, matchObj.team2);

    tr.innerHTML =
    `<td>
        ${getImageElement(team1.link)}
        <span>${team1.name}</span>
    </td>
    <td>
        <input type="number" id="text1" disabled value=""><b>-</b><input type="number" id="text2" disabled value="">
    </td>
    <td>
        <span>${team2.name}</span>
        ${getImageElement(team2.link)}
    </td>`;

    table.appendChild(tr);
}

function getImageElement(src) {
    let imageHTML = `<img src="${FLAGS_SRC}${src}">`;
    if(!src) {
        imageHTML = "";
    }
    return imageHTML;
}

function setColors(colors) {
    let trs = document.querySelectorAll(".teams-table tr:not(:first-child)");

    let allColors = [];
    for (let array of colors) {
        for (let i = 0; i < array[1]; i++) {
            allColors.push(array[0]);
        }
    }
    for (let i = 0; i < trs.length; i++) {
        trs[i].style.backgroundColor = allColors[i];
    }
}

function startMatch() {
    let elem = document.querySelectorAll("#matches-table tr")[match];
    elem.style.backgroundColor = "var(--select-color-1)";

    let input1 = elem.querySelector("#text1");
    let input2 = elem.querySelector("#text2");

    input1.removeAttribute("disabled");
    input2.removeAttribute("disabled");

    button.onclick = function () {
        let score1 = parseInt(input1.value);
        let score2 = parseInt(input2.value);

        if (!isNaN(score1) && !isNaN(score2) && score1 >= 0 && score2 >= 0) {
            playMatch(input1, input2);
            elem.style.backgroundColor = "var(--back-color)";
        }
    }
}

function playMatch(input1, input2) {
    let score1 = parseInt(input1.value);
    let score2 = parseInt(input2.value);

    input1.setAttribute("disabled", "");
    input2.setAttribute("disabled", "");

    let matchObject = matches[round * matchesPerRound + match];
    matchObject.playMatch(score1, score2);
    scoreMatchTeam(score1, score2, findTeam(teams, matchObject.team1), findTeam(teams, matchObject.team2));

    let sorted = sortTeams(teams);
    setTableTeams(sorted);

    match++;
    if (match >= matchesPerRound) {
        placesAfterRounds.push(sorted);

        match = 0;
        round++;

        if (round >= totalRounds) {
            endGame();
            button.remove();
            return;
        }

        initMatchesTable();
        getId("round").innerHTML = "Runda " + (round + 1);
    }
    startMatch();
    return true;
}

function setTableTeams(teamsTable) {
    let trs = document.querySelectorAll(".teams-table tr:not(:first-child)");
    
    const TEAM_COLLUMN = 1;
    const FIRST_STATS_COLLUMN = 2;

    for (let i = 0; i < trs.length; i++) {
        let tds = trs[i].querySelectorAll("td");
        tds[TEAM_COLLUMN].innerHTML = `${getImageElement(teamsTable[i].link)}<div>${teamsTable[i].name}</div>`;

        let stats = [];
        for (let key in teamsTable[i].stats) {
            stats.push(teamsTable[i].stats[key]);
        }

        for (let j = FIRST_STATS_COLLUMN; j < FIRST_STATS_COLLUMN + stats.length; j++) {
            tds[j].innerHTML = stats[j - FIRST_STATS_COLLUMN];
        }
    }
}

function endGame() {
    roundsTable();
}

function roundsTable() {
    let finalTeams = placesAfterRounds[placesAfterRounds.length - 1];
    let colorsArray = getColorsArray();

    let table = document.createElement("table");
    table.className = "places-table teams-table";

    let thr = document.createElement("tr");
    thr.innerHTML = "<th>Drużyna</th>";

    for(let i = 0; i < totalRounds; i++) thr.innerHTML += `<th>${i + 1}</th>`;
    table.appendChild(thr);

    for (let t = 0; t < teams.length; t++) {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${getImageElement(finalTeams[t].link)}<div>${finalTeams[t].name}</div></td>`;

        let teamId = finalTeams[t].id;
        for(let r = 0; r < placesAfterRounds.length; r++) {
            let place = placesAfterRounds[r].findIndex(function(obj) {
                return obj.id == teamId;
            });

            const truePlace = place + 1;
            const placeText = (truePlace == 1) ? `<b>${truePlace}</b>` : truePlace;
            tr.innerHTML += `<td style='background-color: ${colorsArray[place]};'>${placeText}</td>`;
        }
        table.appendChild(tr);
    }
    document.body.appendChild(table);
}

function getColorsArray() {
    let variables = [
        COLOR_GREEN, COLOR_YELLOW, COLOR_WHITE, COLOR_RED
    ];
    let amounts = [
        colors.green, colors.yellow, colors.white, colors.red
    ];

    let colorsArray = [];
    for(let c = 0; c < amounts.length; c++) {
        for(let i = 0; i < amounts[c]; i++) {
            colorsArray.push(variables[c]);
        }
    }
    return colorsArray;
}