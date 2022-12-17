function findTeam(teamsArray, id) {
    for (let team of teamsArray) {
        if (team.id == id) {
            return team;
        }
    }
}