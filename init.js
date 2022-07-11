let teams = [];
var matches = [];
var roundsAmount;
var teamsAmount;

const COLOR_GREEN = "#ccffcc";
const COLOR_YELLOW = "#ffffcc";
const COLOR_WHITE = "#fffffe";
const COLOR_RED = "#ffcccc";

var green, yellow, white, red;
var matchesPerRound;
var totalRounds;

var round = 0;
var match = 0;

var saveButton = getId("save-amount");
var initDiv = getId("init-div");
var gameDiv = getId("game-div");

initPage();

function findTeamByName(teamsArray, name) {
    for (var team of teamsArray) {
        if (team.name == name) {
            return team;
        }
    }
    return null;
}

function initPage() {
    var colorsDivs = document.querySelectorAll("#colors-div div");

    colorsDivs[0].style.backgroundColor = COLOR_GREEN;
    colorsDivs[1].style.backgroundColor = COLOR_YELLOW;

    colorsDivs[2].style.backgroundColor = COLOR_WHITE;
    colorsDivs[3].style.backgroundColor = COLOR_RED;

    saveButton.onclick = clickAmountButton;
}

function initTeamsInputs() {
    for (var i = 0; i < teamsAmount; i++) {
        var input = document.createElement("input");
        input.className = "init-team-div";
        input.placeholder = "Drużyna " + (i + 1);
        
        initDiv.appendChild(input);
        initDiv.appendChild(document.createElement("br"));
    }
}

function clickAmountButton() {
    var amountInput = getId("teams-amount");
    teamsAmount = parseInt(amountInput.value);

    saveButton.onclick = function () { }

    if (teamsAmount >= 4 && teamsAmount <= 10) {

        var colorsDiv = getId("init-properties-div");
        colorsDiv.style.display = "inline-block";
        getId("save-amount").style.display = "none";
        initTeamsInputs();

    } else {
        window.location.href = "";
    }
    var button = document.createElement("button");
    button.innerHTML = "Zacznij";
    button.id = "start-button";

    button.onclick = clickStartButton;
    initDiv.appendChild(button);
}

function clickStartButton() {
    var inputs = document.querySelectorAll(".init-team-div");
    var array = [];

    var roundsAmountInput = getId("rounds-amount");
    roundsAmount = parseInt(roundsAmountInput.value);

    for (var i = 0; i < teamsAmount; i++) {
        array.push(inputs[i].value);
    }

    serverPost("league.php", { get: JSON.stringify(array) }, function (text) {
        var allTeams = JSON.parse(text);

        green = getId("green").value;
        yellow = getId("yellow").value;
        white = getId("whitea").value;
        red = getId("red").value;

        initDiv.remove();
        gameDiv.style.display = "inline-block";

        for (var elem of array) {
            var teamObj = findTeamByName(allTeams, elem);
            if (teamObj != null) {
                teams.push(teamObj);
            }
        }
        if (teams.length == teamsAmount && (green && yellow && red && white) && (roundsAmount == 1 || roundsAmount == 2)) {
            init();
        } else {
            window.location.href = "";
        }
    });
}