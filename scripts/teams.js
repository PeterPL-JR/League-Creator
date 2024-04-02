class TeamsList {
    static CLICK_BUTTON = LEFT_BUTTON;
    static STOP_BUTTON = RIGHT_BUTTON;

    constructor(container) {
        this.container = container;
        this.teamsArray = [];

        this.draggedTeam = null;
        this.flyingElem = null;

        this.dragBegin = null;
        this.scrollBegin = null;
        this.started = false;
        
        this.mouseX = null;
        this.mouseY = null;

        this.onStartMoving = null;
        this.onStopMoving = null;

        this.initEvents();
    }

    start() {
        this.started = true;
    }
    initEvents() {
        let stopMoving = this.stopMoving.bind(this);
        let updateMouse = this.updateMouse.bind(this);
        let teamMove = this.teamMove.bind(this);

        document.body.onmousedown = function(event) {
            if(event.button == TeamsList.STOP_BUTTON) {
                stopMoving();
            }
        }
        document.body.onmousemove = function(event) {
            updateMouse(event);
            teamMove();
        };
        document.body.onscroll = function() {
            teamMove();
        }
    }

    createDivs(teamsArray, imgs, rowSize = 3) {
        this.container.innerHTML="";
        
        let teamsCounter = 0;
        for(let team of teamsArray) {
            this.teamsArray.push(new TeamDiv(team, this, imgs));
            teamsCounter++;

            if(teamsCounter % rowSize == 0) {
                createClearBoth(this.container);
            }
        }
    }
    getTeamDiv(id) {
        return getId(TeamDiv.ID_NAME + id);
    }

    startMoving(id) {
        document.body.style.cursor = "pointer";
        this.draggedTeam = id;
        
        const elem = this.getTeamDiv(id);
        elem.classList.add("team-selected");
        elem.style.visibility = "hidden";
        
        this.flyingElem = elem.cloneNode(elem);
        this.flyingElem.classList.add("flying-elem");
        this.flyingElem.mouseItem = null;
        document.body.appendChild(this.flyingElem);
        
        const beginX = this.mouseX - elem.offsetLeft;
        const beginY = this.mouseY - elem.offsetTop;
        
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        
        this.dragBegin = {x:beginX, y:beginY};
        this.scrollBegin = {x:scrollX, y:scrollY};
        
        document.body.oncontextmenu = function() {
            return false;
        }
        this.teamMove();

        if(this.onStartMoving) {
            this.onStartMoving();
        }
    }
    stopMoving() {
        document.body.style.cursor = "default";
        const elem = this.getTeamDiv(this.draggedTeam);
        if(elem != null) {
            elem.classList.remove("team-selected");
            elem.style.visibility = "visible";
            this.flyingElem.remove();
        }
        this.draggedTeam = null;
        this.dragBegin = null;
        this.scrollBegin = null
        this.flyingElem = null;
    
        if(this.onStopMoving) {
            this.onStopMoving();
        }
    }

    updateMouse(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }
    updateTeam(id) {
        if(this.started) {
            if(this.draggedTeam == null) this.startMoving(id);
            else this.stopMoving();
        }
    }

    getSelectedTeam() {
        return this.draggedTeam;
    }

    teamMove() {
        if(this.draggedTeam != null) {
            const x = this.mouseX - this.dragBegin.x - this.scrollBegin.x + window.scrollX;
            const y = this.mouseY - this.dragBegin.y - this.scrollBegin.y + window.scrollY;
    
            this.flyingElem.style.left = x + "px";
            this.flyingElem.style.top = y + "px";
        }
    }
}

class TeamDiv {
    static CLASS_NAME = "team-elem";
    static ID_NAME = "team-div-";

    constructor(team, list, imgsArray) {
        this.team = team;
        this.list = list;
        this.imgsArray = imgsArray;
        this.createDiv();
    }
    createDiv() {
        let div = document.createElement("div");
        const id = this.team.id;
        this.div = div;

        div.id = TeamDiv.ID_NAME + id;
        div.innerHTML = `<div>${this.team.teamName}</div>`;
        div.className = TeamDiv.CLASS_NAME;
        div.setAttribute("title", this.team.teamName);
    
        if(this.team.type != TEAMS_MODE_CUSTOM) {
            div.prepend(getImg(this.team, this.imgsArray));
            div.classList.add("pre-team-elem");
        }

        let updateTeam = this.list.updateTeam.bind(this.list);
        div.onmousedown = function() {
            updateTeam(id);
        }
        this.list.container.appendChild(div);
    }
}

function parseNationalTeams(text) {
    let teamsArray = [];
    for(let t of JSON.parse(text)) {
        let team = new Team(t.id, t.name, t.link);
        team.con_id = parseInt(t.con_id);
        team.type = TEAMS_MODE_NATIONAL;
        teamsArray.push(team);
    }
    return teamsArray;
}
function parseClubsTeams(text) {
    let teamsArray = [];
    for(let t of JSON.parse(text)) {
        let team = new Team(t.id, t.name, findTeam(nationalTeams, t.national_team_id).imgLink);
        team.con_id = parseInt(t.con_id);
        team.national_team_id = t.national_team_id;
        team.type = TEAMS_MODE_CLUBS;
        teamsArray.push(team);
    }
    return teamsArray;
}
function getTeamsFromIDs(array, teamsArray) {
    let teams = [];
    for(let id of array) {
        teams.push(findTeam(teamsArray, id));
    }
    return teams;
}

function getImg(teamObject, imgs) {
    let nTeamId = (teamObject.type == TEAMS_MODE_NATIONAL) ? "id" : "national_team_id";
    let img = imgs[teamObject[nTeamId]];
    return img.cloneNode(true);
}
function initImgsObject(teamsArray) {
    let obj = {};
    for(let team of teamsArray) {
        const img = document.createElement("img");
        img.src = FLAGS_SRC + team.imgLink;
        img.setAttribute("draggable", "false");
        obj[team.id] = img;
    }
    return obj;
}