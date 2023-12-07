/** Find a team by ID */
function findTeam(teamsArray, id) {
    return findTeamBy(teamsArray, "id", id);
}

/** Find a team by name */
function findTeamByName(teamsArray, name, capitalLetters=true) {
    for (let team of teamsArray) {

        // Capital/small letters
        let constName = team["teamName"];
        let checkedName = name;

        if(!capitalLetters) {
            constName = constName.toLowerCase();
            checkedName = checkedName.toLowerCase();
        }
        // Comparision
        if (constName == checkedName) {
            return team;
        }
    }
    return null;
}

/** Find a team by value defined by a key */
function findTeamBy(teamsArray, key, value) {
    for (let team of teamsArray) {
        // Comparision
        if (team[key] == value) {
            return team;
        }
    }
    return null;
}

/** Count matches played of a team */
function countMatchesPlayed(teamId, matchesArray) {
    let matchesPlayed = 0;

    for(let match of matchesArray) {
        if((match.team1.id == teamId || match.team2.id == teamId) && match.score1 != -1 && match.score2 != -1) {
            matchesPlayed++;
        }
    }
    return matchesPlayed;
}

/** Get unique random ID for a custom team */
function getRandomID(teamsArray=[]) {
    const MIN_ID = 1_000_000;
    const MAX_ID = 9_999_999;

    let randomId = getRandom(MIN_ID, MAX_ID);
    let teamIndex = teamsArray.findIndex(function(team) {
        return team.id == randomId;
    });
    if(teamIndex != -1) {
        return getRandomID(teamsArray);
    }
    return randomId;
}