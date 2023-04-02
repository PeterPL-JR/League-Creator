const POINTS_FOR_VICTORY = 3;
const POINTS_FOR_DRAW = 1;
const POINTS_FOR_DEFEAT = 0;

/** Class that defines a match. */
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

/** Create an array of matches according to round-robin system. */
function createMatches(teamsAmount, doubleMatches) {
    var matchesArray = [];
    var numbers = [];
    for (var i = 1; i <= teamsAmount; i++) numbers.push(i);

    if (teamsAmount % 2 == 1) {
        numbers.push(-1);
        teamsAmount += 1;
    }

    // Create first matches
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

    // Create rematches
    if (doubleMatches) {
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

/** Sorting an array of teams. */
function sortTeams(teams) {
    let table = Array.from(teams);

    // Sorting by points
    table = sortByPoints(table);

    let pointGroups = [];
    const _MAX_POINTS = totalMatchdays * POINTS_FOR_VICTORY + 1;

    for (let i = 0; i < _MAX_POINTS; i++) {

        // Checking if points number of several teams is the same
        let theSame = [];
        for (let team of table) {
            if (team.stats.points == i) {
                theSame.push(team);
            }
        }

        // Sorting by goals difference
        theSame = sortByGoals(theSame);
        if (theSame.length >= 1) {
            pointGroups.push(checkSortByGoalsScored(theSame));
        }
    }

    // Flipping the sorted array (from best to worst)
    let newTable = [];
    for (let i = pointGroups.length - 1; i >= 0; i--) {
        for (let team of pointGroups[i]) {
            newTable.push(team);
        }
    }
    return newTable;
}

/** Sorting by points */
function sortByPoints(table) {
    return sortBy("points", table);
}

/** Sorting by goals difference */
function sortByGoals(table) {
    return sortBy("goals", table);
}

/** Sorting by goals scored */
function sortByGoalsScored(table) {
    if (table.length == 1) return table;

    // Creating groups of teams by the same number of goals scored
    let goals = [];
    for (let team of table) {
        if(goals.indexOf(team.stats.goals) == -1) {
            goals.push(team.stats.goals);
        }
    }
    
    let newTable = [];
    for (let i = 0; i < goals.length; i++) {
        
        // Checking if goals scored number of several teams is the same
        let theSame = [];
        for (let team of table) {
            if (team.stats.goals == goals[i]) {
                theSame.push(team);
            }
        }

        // Create final sorted array
        let sortedTheSame = sortBy("goalsScored", theSame);
        newTable = concatArrays(newTable, sortedTheSame);
    }
    return newTable;
}

/** Check if sorting by goals scored is necessary */
function checkSortByGoalsScored(table) {
    return sortByGoalsScored(table);
}

/** Sorting an array of teams by a key. */
function sortBy(key, table) {
    table.sort(function (t1, t2) {
        return t2.stats[key] - t1.stats[key];
    });
    return table;
}

/** Function that scores points and goals for a match. */
function scoreMatchPoints(score1, score2, team1, team2) {

    // Score goals
    team1.stats.goalsScored += score1;
    team1.stats.goalsLost += score2;

    team2.stats.goalsScored += score2;
    team2.stats.goalsLost += score1;

    // Calculate goals difference
    team1.stats.goals = team1.stats.goalsScored - team1.stats.goalsLost;
    team2.stats.goals = team2.stats.goalsScored - team2.stats.goalsLost;

    // Victory of the first teams
    if (score1 > score2) {

        team1.stats.points += POINTS_FOR_VICTORY;
        team1.stats.wins++;
        team2.stats.losses++;

    // Losses of the first team
    } else if (score1 < score2) {

        team2.stats.points += POINTS_FOR_VICTORY;
        team2.stats.wins++;
        team1.stats.losses++;

    // Draw
    } else if (score1 == score2) {

        team1.stats.points += POINTS_FOR_DRAW;
        team2.stats.points += POINTS_FOR_DRAW;

        team1.stats.draws++;
        team2.stats.draws++;
    }
}