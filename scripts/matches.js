const POINTS_FOR_VICTORY = 3;
const POINTS_FOR_DRAW = 1;
const POINTS_FOR_DEFEAT = 0;

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

function sortTeams(teams) {
    let table = [];
    for (let team of teams) {
        table.push(team);
    }

    table.sort(function (x, y) {
        return y.stats.points - x.stats.points;
    });

    let pointGroups = [];
    let maxPoints = totalRounds * POINTS_FOR_VICTORY + 1;

    for (let i = 0; i < maxPoints; i++) {

        let theSame = [];
        for (let team of table) {
            if (team.stats.points == i) {
                theSame.push(team);
            }
        }

        theSame.sort(function (x, y) {
            let xGoals = x.stats.goalsScored - x.stats.goalsLost;
            let yGoals = y.stats.goalsScored - y.stats.goalsLost;

            return yGoals - xGoals;
        });

        if (theSame.length >= 1) {
            theSame.sort(function (x, y) {
                return y.stats.goals - x.stats.goals;
            });
            pointGroups.push(checkGoalsScored(theSame));
        }
    }

    let newTeams = [];
    for (let i = pointGroups.length - 1; i >= 0; i--) {
        for (let team of pointGroups[i]) {
            newTeams.push(team);
        }
    }
    return newTeams;
}

function checkGoalsScored(teamsArray) {
    if (teamsArray.length == 1) return teamsArray;

    let goals = [];
    for (let team of teamsArray) {
        if (goals.indexOf(team.stats.goals) != -1) continue;
        goals.push(team.stats.goals);
    }

    let newTeams = [];
    for (let i = 0; i < goals.length; i++) {

        let theSame = [];
        for (let team of teamsArray) {
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
            for (let theSameTeam of theSame) {
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

        team1.stats.points += POINTS_FOR_VICTORY;
        team1.stats.wins++;
        team2.stats.losses++;

    } else if (score1 < score2) {

        team2.stats.points += POINTS_FOR_VICTORY;
        team2.stats.wins++;
        team1.stats.losses++;

    } else if (score1 == score2) {

        team1.stats.points += POINTS_FOR_DRAW;
        team2.stats.points += POINTS_FOR_DRAW;

        team1.stats.draws++;
        team2.stats.draws++;
    }
}