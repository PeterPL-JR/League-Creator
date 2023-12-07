const POINTS_FOR_VICTORY = 3;
const POINTS_FOR_DRAW = 1;

class Match {
    constructor(team1, team2) {
        this.team1 = team1;
        this.team2 = team2;

        this.score1 = -1;
        this.score2 = -1;

        this.overtime = false;
        this.penalty1 = -1;
        this.penalty2 = -1;
    }
    playMatch(score1, score2) {
        this.score1 = score1;
        this.score2 = score2;

        this.team1.scoreMatch(score1, score2);
        this.team2.scoreMatch(score2, score1);
    }

    playPenalty(penalty1, penalty2) {
        this.penalty1 = penalty1;
        this.penalty2 = penalty2;
    }
    setOvertime() {
        this.overtime = true;
    }
}

class Team {
    constructor(id, teamName, imgLink=null) {
        this.id = id;
        this.teamName = teamName;
        this.imgLink = imgLink;

        this.stats = {
            goalsScored: 0,
            goalsLost: 0,

            wins: 0,
            draws: 0,
            losses: 0
        }
    }
    matches() {
        return this.wins() + this.draws() + this.losses();
    }
    points() {
        return this.wins() * POINTS_FOR_VICTORY + this.draws() * POINTS_FOR_DRAW;
    }

    goalsScored() {
        return this.stats.goalsScored;
    }
    goalsLost() {
        return this.stats.goalsLost;
    }
    goals() {
        return this.goalsScored() - this.goalsLost();
    }

    wins() {
        return this.stats.wins;
    }
    draws() {
        return this.stats.draws;
    }
    losses() {
        return this.stats.losses;
    }

    scoreMatch(thisGoals, opponentGoals) {
        this.stats.goalsScored += thisGoals;
        this.stats.goalsLost += opponentGoals;

        if (thisGoals > opponentGoals) {
            this.stats.wins++;
        }
        else if (thisGoals == opponentGoals) {
            this.stats.draws++;
        }
        else {
            this.stats.losses++;
        }
    }
}

function createMatches(teamsArray, doubleMatches) {
    let matchesArray = [];
    let numbers = [];

    let teamsAmount = teamsArray.length;
    for(let i = 0; i < teamsAmount; i++) numbers.push(i);
    
    if (teamsAmount % 2 == 1) {
        numbers.push(-1);
        teamsAmount++;
    }

    const HOST = 0;
    const AWAY = 1;

    function lastPlaceRow(teamIndex, lastRound) {
        let type = getPlace(teamIndex, lastRound);

        let n = 1;
        for(let i = lastRound - 1; i >= 0; i--) {
            if(getPlace(teamIndex, i) != type) {
                return n;
            }
            n++;
        }
        return n;
    }
    
    function countTotalPlace(teamIndex, lastRound, type) {
        let n = 0;
        for(let i = lastRound; i >= 0; i--) {
            if(findMatch(i, teamIndex) && getPlace(teamIndex, i) == type) {
                n++;
            }
        }
        return n;
    }

    function getPlace(teamIndex, round) {
        let match = findMatch(round, teamIndex);
        if(match) {
            return match.indexOf(teamIndex);
        }
        return -1;
    }

    function findMatch(round, teamIndex) {
        return matchesArray[round].find((m) => m[0] == teamIndex || m[1] == teamIndex)
    }

    let rounds = teamsAmount - 1;
    for (let j = 0; j < rounds; j++) {
        matchesArray[j] = [];
        if(doubleMatches) {
            matchesArray[j + rounds] = [];
        }

        for (let i = 0; i < teamsAmount / 2; i++) {
            let second = rounds - i;
            if (numbers[i] != -1 && numbers[second] != -1) {
                let t1 = numbers[i];
                let t2 = numbers[second];

                let n1 = t1;
                let n2 = t2;

                if(j > 0) {
                    let l1 = getPlace(t1, j - 1);
                    let l2 = getPlace(t2, j - 1);
                    
                    let row1 = lastPlaceRow(t1, j - 1);
                    let row2 = lastPlaceRow(t2, j - 1);

                    let total1 = countTotalPlace(t1, j - 1, l1);
                    let total2 = countTotalPlace(t2, j - 1, l2);

                    function changeTeams() {
                        n1 = t2;
                        n2 = t1;
                    }

                    if(l1 == HOST && row1 >= 2 || l2 == AWAY && row2 >= 2) {
                        changeTeams();
                    } else if(l1 == HOST && l2 == AWAY) {
                        changeTeams();
                    } else if(l1 == l2 && (l1 == HOST && total1 > total2) || (l1 == AWAY && total1 < total2)) {
                        changeTeams();
                    }
                }

                matchesArray[j].push([n1, n2]);
                if(doubleMatches) {
                    matchesArray[j + rounds].push([n2, n1]);
                }
            }
        }
        numbers.splice(1, 0, numbers.pop());
    }

    let matches = [];
    for(let i = 0; i < matchesArray.length; i++) {
        matches[i] = [];
        for(let m of matchesArray[i]) {
            matches[i].push(new Match(teamsArray[m[0]], teamsArray[m[1]]));
        }
    }
    return matches;
}

function sortTeams(teamsArray, keys, matchesArray) {
    let table = Array.from(teamsArray);
    return keySort(table, keys, 0, matchesArray);
}

function keySort(teamsArray, keys, keyIndex, matchesArray=null) {
    if(keyIndex >= keys.length) return teamsArray;
    sortBy(teamsArray, keys[keyIndex]);

    if(keyIndex == keys.length - 1) return teamsArray;

    let newArray = [];
    for(let array of sortDivide(teamsArray, keys[keyIndex])) {
        if(array.length == 1) {
            newArray.push(array[0]);
        } else {
            if(keys[keyIndex + 1] == "headToHead") {
                newArray = newArray.concat(sortByHeadToHead(array, matchesArray, keys.slice(keyIndex + 2)));
            } else {
                newArray = newArray.concat(keySort(array, keys, keyIndex + 1, matchesArray));
            }
        }
    }
    return newArray;
}

function sortDivide(teamsArray, key) {
    let divided = [];

    let buffer = [teamsArray[0]];
    for(let i = 1; i < teamsArray.length; i++) {
        let team = teamsArray[i];
        
        if(team[key]() == buffer[0][key]()) {
            buffer.push(team);
        } else {
            divided.push(buffer);
            buffer = [team];
        }
    }
    divided.push(buffer);
    return divided;
}

function sortBy(teamsArray, key) {
    teamsArray.sort(function(t1, t2) {
        return t2[key]() - t1[key]();
    });
    return teamsArray;
}

function sortByHeadToHead(teamsArray, matchesArray, nextKeys) {
    let table = [];

    for(let t of teamsArray) {
        table.push(new Team(t.id));
    }
    for(let round of matchesArray) {
        for(let m of round) {
            let team1 = table.find((t) => m.team1.id == t.id);
            let team2 = table.find((t) => m.team2.id == t.id);
            
            if(team1 && team2) {
                new Match(team1, team2).playMatch(m.score1, m.score2);
            }
        }
    }

    function keySort(teamsArray, keys, keyIndex, originalTeams) {
        sortBy(teamsArray, keys[keyIndex]);

        let newArray = [];
        for(let array of sortDivide(teamsArray, keys[keyIndex])) {
            if(array.length == 1) {
                newArray.push(array[0]);
            } else {
                if(keyIndex == keys.length - 1) {
                    let originalToSort = [];
                    for(let team of originalTeams) {
                        if(array.find((t) => t.id == team.id)) {
                            originalToSort.push(team);
                        }
                    }
                    newArray = newArray.concat(sortTeams(originalToSort, nextKeys, matchesArray));
                } else {
                    newArray = newArray.concat(keySort(array, keys, keyIndex + 1, originalTeams));
                }
            }
        }
        return newArray;
    }

    table = keySort(table, ["points", "goals", "goalsScored"], 0, teamsArray);
    
    let finalTable = [];
    for(let team of table) {
        finalTable.push(teamsArray.find((t) => t.id == team.id));
    }
    return finalTable;
}