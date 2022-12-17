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