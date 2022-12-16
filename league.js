class Match {
    constructor(teamObj1, teamObj2) {
        var teamName1 = teamObj1.id;
        var teamName2 = teamObj2.id;

        this.team1 = teamName1;
        this.team2 = teamName2;

        this.score1 = -1;
        this.score2 = -1;
    }

    playMatch(score1, score2) {
        this.score1 = score1;
        this.score2 = score2;
    }
}

function createMatches(teamsAmount, double) {
    var matchesArray = [];
    var numbers = [];
    for (var i = 1; i <= teamsAmount; i++) numbers.push(i);

    if (teamsAmount % 2 == 1) {
        numbers.push(-1);
        teamsAmount += 1;
    }
    for (let j = 0; j < teamsAmount - 1; j += 1) {
        matchesArray[j] = [];
        for (let i = 0; i < teamsAmount / 2; i += 1) {
            var second = teamsAmount - 1 - i;
            if (numbers[i] != -1 && numbers[second] != -1) {
                var host = i == 0 && j % 2 == 1;

                var number1 = host ? numbers[second] : numbers[i];
                var number2 = host ? numbers[i] : numbers[second];

                matchesArray[j].push([number1, number2]);
            }
        }
        numbers.splice(1, 0, numbers.pop());
    }
    if (double) {
        var newMatches = [];
        for (var match of matchesArray) {
            var arr = [];
            for (var m of match) arr.push([m[1], m[0]]);
            newMatches.push(arr);
        }
        for (var newMatch of newMatches) matchesArray.push(newMatch);
    }
    return matchesArray;
}

const tableDiv = getId("table-div");
const matchesDiv = getId("matches-div");
const button = getId("button");

function init() {
    var doubleRound = (roundsAmount == 2) ? true : false;
    var rounds = createMatches(teams.length, doubleRound);

    for (var t = 0; t < teams.length; t++) {
        teams[t].stats = {
            points: 0,
            goalsScored: 0, goalsLost: 0,

            goals: 0,
            wins: 0, draws: 0, losses: 0
        };
    }
    initTeamsTable(teams);

    totalRounds = rounds.length;
    matchesPerRound = rounds[0].length;
    for (var i = 0; i < rounds.length; i++) {
        for (var match of rounds[i]) {
            matches.push(new Match(teams[match[0] - 1], teams[match[1] - 1]));
        }
    }
    initMatchesTable();
    startMatch();
}

function initTeamsTable(teamsTable) {
    var table = document.createElement("table");
    table.id = "teams-table";

    var thr = document.createElement("tr");
    thr.innerHTML = `<th>M</th><th>Drużyna</th><th>Pkt</th><th>+</th><th>-</th><th>+/-</th><th>W</th><th>R</th><th>P</th>`;
    table.appendChild(thr);

    for (var t = 0; t < teamsTable.length; t++) {
        var tr = document.createElement("tr");
        tr.innerHTML = `<td>${t + 1}</td><td><img src="../create-mundial/flags/${teamsTable[t].link}"><div>${teamsTable[t].name}</div></td>`;

        for (var key in teamsTable[t].stats) {
            var stat = teamsTable[t].stats[key];

            var td = document.createElement("td");
            td.innerHTML = stat;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    tableDiv.innerHTML = "";
    tableDiv.appendChild(table);

    setColors([
        [COLOR_GREEN, green],
        [COLOR_YELLOW, yellow],
        [COLOR_WHITE, white],
        [COLOR_RED, red],
    ]);
}

function initMatchesTable() {
    var firstIndex = round * matchesPerRound;
    var table = document.createElement("table");
    table.id = "matches-table";

    for (var i = firstIndex; i < firstIndex + matchesPerRound; i++) {
        createMatch(table, matches[i]);
    }
    matchesDiv.innerHTML = "";
    matchesDiv.appendChild(table);
}

function createMatch(table, matchObj) {
    var tr = document.createElement("tr");

    var team1 = findTeam(matchObj.team1);
    var team2 = findTeam(matchObj.team2);

    // var preScore1 = getRandom(0, 3);
    // var preScore2 = getRandom(0, 3);
    
    var preScore1 = "";
    var preScore2 = "";

    tr.innerHTML =
    `<td>
        <img src='../create-mundial/flags/${team1.link}'>
        <span>${team1.name}</span>
    </td>
    <td>
        <input type="number" id="text1" disabled value="${preScore1}"><b>-</b><input type="number" id="text2" disabled value="${preScore2}">
    </td>
    <td>
        <span>${team2.name}</span>
        <img src='../create-mundial/flags/${team2.link}'>
    </td>`;

    table.appendChild(tr);
}

function findTeam(id) {
    for (var team of teams) {
        if (team.id == id) {
            return team;
        }
    }
}

function setColors(colors) {
    var trs = document.querySelectorAll("#teams-table tr:not(:first-child)");

    var allColors = [];
    for (var array of colors) {
        for (var i = 0; i < array[1]; i++) {
            allColors.push(array[0]);
        }
    }
    for (var i = 0; i < trs.length; i++) {
        trs[i].style.backgroundColor = allColors[i];
    }
}

function startMatch() {
    var elem = document.querySelectorAll("#matches-table tr")[match];
    elem.style.backgroundColor = "#ebebeb";

    var input1 = elem.querySelector("#text1");
    var input2 = elem.querySelector("#text2");

    input1.removeAttribute("disabled");
    input2.removeAttribute("disabled");

    button.onclick = function () {
        var score1 = input1.value;
        var score2 = input2.value;

        if (score1 != "" && score2 != "") {
            playMatch(input1, input2);
            elem.style.backgroundColor = "white";
        }
    }
}

function playMatch(input1, input2) {
    var score1 = input1.value;
    var score2 = input2.value;

    input1.setAttribute("disabled", "");
    input2.setAttribute("disabled", "");

    score1 = parseInt(score1);
    score2 = parseInt(score2);

    var matchObject = matches[round * matchesPerRound + match];
    matchObject.playMatch(score1, score2);
    scoreMatchTeam(score1, score2, findTeam(matchObject.team1), findTeam(matchObject.team2));

    var sorted = sortTeams(teams);
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
}

function sortTeams(teams) {
    var table = [];
    for (var team of teams) {
        table.push(team);
    }

    table.sort(function (x, y) {
        return y.stats.points - x.stats.points;
    });

    var pointGroups = [];
    var maxPoints = totalRounds * 3 + 1;

    for (var i = 0; i < maxPoints; i++) {

        var theSame = [];
        for (var team of table) {
            if (team.stats.points == i) {
                theSame.push(team);
            }
        }

        theSame.sort(function (x, y) {
            var xGoals = x.stats.goalsScored - x.stats.goalsLost;
            var yGoals = y.stats.goalsScored - y.stats.goalsLost;

            return yGoals - xGoals;
        });

        if (theSame.length >= 1) {
            theSame.sort(function (x, y) {
                return y.stats.goals - x.stats.goals;
            });
            pointGroups.push(checkGoalsScored(theSame));
        }
    }

    var newTeams = [];
    for (var i = pointGroups.length - 1; i >= 0; i--) {
        for (var team of pointGroups[i]) {
            newTeams.push(team);
        }
    }
    return newTeams;
}

function checkGoalsScored(teamsArray) {
    if (teamsArray.length == 1) return teamsArray;

    var goals = [];
    for (var team of teamsArray) {
        if (goals.indexOf(team.stats.goals) != -1) continue;
        goals.push(team.stats.goals);
    }

    var newTeams = [];
    for (var i = 0; i < goals.length; i++) {

        var theSame = [];
        for (var team of teamsArray) {
            if (team.stats.goals == goals[i]) {
                theSame.push(team);
            }
        }
        if (theSame.length == 1) {
            newTeams.push(theSame[0]);
        } else {
            theSame.sort(function (x, y) {
                return y.stats.goalsScored - x.stats.goalsScored;
            });
            for (var theSameTeam of theSame) {
                newTeams.push(theSameTeam);
            }
        }
    }
    return newTeams;
}

function scoreMatchTeam(score1, score2, team1, team2) {

    team1.stats.goalsScored += score1;
    team1.stats.goalsLost += score2;

    team2.stats.goalsScored += score2;
    team2.stats.goalsLost += score1;

    team1.stats.goals = team1.stats.goalsScored - team1.stats.goalsLost;
    team2.stats.goals = team2.stats.goalsScored - team2.stats.goalsLost;

    if (score1 > score2) {

        team1.stats.points += 3;
        team1.stats.wins += 1;
        team2.stats.losses += 1;

    } else if (score1 < score2) {

        team2.stats.points += 3;
        team2.stats.wins += 1;
        team1.stats.losses += 1;

    } else if (score1 == score2) {

        team1.stats.points += 1;
        team2.stats.points += 1;

        team1.stats.draws += 1;
        team2.stats.draws += 1;
    }
}

function setTableTeams(teamsTable) {
    var trs = document.querySelectorAll("#teams-table tr:not(:first-child)");

    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].querySelectorAll("td");
        tds[1].innerHTML = `<img src="../create-mundial/flags/${teamsTable[i].link}"><div>${teamsTable[i].name}</div>`;

        var stats = [];
        for (var key in teamsTable[i].stats) {
            stats.push(teamsTable[i].stats[key]);
        }

        for (var j = 2; j < 2 + stats.length; j++) {
            tds[j].innerHTML = stats[j - 2];
        }
    }
}

function endGame() {
    roundsTable();

    var obj = {};
    obj["teams"] = teams;
    obj["matches"] = matches;
    obj["colors"] = [
        green, yellow, white, red
    ];
    console.log(obj);
    serverPost("league.php", { obj: JSON.stringify(obj) }, function (text) {

    });
}

function roundsTable() {
    var finalTeams = placesAfterRounds[placesAfterRounds.length - 1];
    var colorsArray = getColorsArray();

    var table = document.createElement("table");
    table.id = "teams-table";
    table.className = "places-table";

    var thr = document.createElement("tr");
    thr.innerHTML = "<th>Drużyna</th>";

    for(var i = 0; i < totalRounds; i++) thr.innerHTML += `<th>${i + 1}</th>`;
    table.appendChild(thr);

    for (var t = 0; t < teams.length; t++) {
        var tr = document.createElement("tr");
        tr.innerHTML = `<td><img src="../create-mundial/flags/${finalTeams[t].link}"><div>${finalTeams[t].name}</div></td>`;

        var teamId = finalTeams[t].id;
        for(var r = 0; r < placesAfterRounds.length; r++) {
            var place = placesAfterRounds[r].findIndex(function(obj) {
                return obj.id == teamId;
            });
            tr.innerHTML += `<td style='background-color: ${colorsArray[place]};'>${place + 1}</td>`;
        }
        table.appendChild(tr);
    }
    document.body.appendChild(table);
}

function getColorsArray() {
    var variables = [
        COLOR_GREEN, COLOR_YELLOW, COLOR_WHITE, COLOR_RED
    ];
    var amounts = [
        green, yellow, white, red
    ];

    var colors = [];
    for(var c = 0; c < amounts.length; c++) {
        for(var i = 0; i < amounts[c]; i++) {
            colors.push(variables[c]);
        }
    }
    return colors;
}