<?php

include_once 'database.php';

include_once 'php/functions.php';
include_once 'php/variables.php';

define("NATIONAL_TEAMS_QUERY", "SELECT team_id, link, content, con_id FROM teams JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id");
define("CLUBS_TEAMS_QUERY", "SELECT str_id AS team_id, (CASE WHEN names_clubs.content IS NULL THEN clubs.name ELSE names_clubs.content END) AS content, national_team_id, con_id FROM clubs LEFT JOIN names_clubs ON names_clubs.club_id = clubs.str_id JOIN teams ON teams.name = clubs.national_team_id JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id");

function get_national_teams($confed, $team_text) {
    get_from_db(TEAMS_MODE_NATIONAL, "WHERE confederations.name = '$confed' AND content LIKE '$team_text%' ORDER BY content;");
}
function get_clubs_teams($confed, $team_text, $national_team_text) {
    get_from_db(TEAMS_MODE_CLUBS, "WHERE confederations.name = '$confed' AND names_teams.content LIKE '$national_team_text%' HAVING content LIKE '$team_text%' ORDER BY names_teams.content, content;");
}
function get_all_teams($teams_mode) {
    get_from_db($teams_mode);
}

function get_confeds() {
    global $base;

    $get_confeds = mysqli_query($base, "SELECT name FROM confederations;");
    while($row = mysqli_fetch_row($get_confeds)) {
        echo "<option>".$row[0]."</option>";
    }
}

function get_from_db($teams_mode, $where_clauses="") {
    global $base;
    if($teams_mode == TEAMS_MODE_NATIONAL) {
        $query_text = NATIONAL_TEAMS_QUERY;
    }
    if($teams_mode == TEAMS_MODE_CLUBS) {
        $query_text = CLUBS_TEAMS_QUERY;
    }

    $teams = [];
    $query = mysqli_query($base, $query_text." ".$where_clauses);

    while($row = mysqli_fetch_assoc($query)) {
        if($teams_mode == TEAMS_MODE_NATIONAL) {
            array_push($teams, get_national_team($row));
        }
        if($teams_mode == TEAMS_MODE_CLUBS) {
            array_push($teams, get_clubs_team($row));
        }
    }
    echo json_encode($teams);
}

if(isset($_POST['script'])) {
    // Script type
    $script = $_POST['script']; 

    // Perform functions
    if($script == GET_NATIONAL_TEAMS) {
        get_national_teams($_POST['confed'], $_POST['data']);
    }
    if($script == GET_CLUBS_TEAMS) {
        get_clubs_teams($_POST['confed'], $_POST['data'], $_POST['national_team']);
    }
    
    if($script == GET_ALL_NATIONAL_TEAMS) {
        get_all_teams(TEAMS_MODE_NATIONAL);
    }
    if($script == GET_ALL_CLUBS_TEAMS) {
        get_all_teams(TEAMS_MODE_CLUBS);
    }
} else {
?>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>League Qualification</title>
    <link rel="stylesheet" href="league.css" type="text/css">
    <link rel="stylesheet" href="qualification.css" type="text/css">
    <link id='theme' rel="stylesheet" href="styles/themes/theme-light.css" type='text/css'>

    <script src="scripts/library.js"></script>
    <script src="scripts/matches.js"></script>
    <script src="scripts/functions.js"></script>
    <script src="scripts/variables.js"></script>
</head>
<body onload="initTheme();">
<img src="images/user.png" id='settings'>
    <div id="pots-container">
        <div id="pots-inputs-div">
            <h2>Drużyny</h2>
            <input type="number" id='teams-amount-input' value="54">

            <h2>Grupy</h2>
            <input type="number" id='groups-amount-input' value="9">
            <br>

            <select id="teams-mode-select">
                <option>Drużyny narodowe</option>
                <option>Kluby</option>
                <option>(Własne)</option>
            </select>

            <br><button id='button-save'>Zapisz</button>
            <br><button id='button-draw-start'>Losuj</button>
        </div>    

        <div id="groups"></div>
        <div id="pots"></div>

        <div id="container">
            <h2>
                Drużyny
                <select id='confed-select'>
                    <?php get_confeds(); ?>
                </select>
            </h2>
            <input type="text" id="teams-input">
            
            <!-- Clubs content -->
            <div id="clubs-div">
                <h2>Kraj</h2>
                <input type="text" id="country-input">
            </div>
            
            <!-- Custom teams content -->
            <br><button id="button-add" style="display: none;">Dodaj</button>

            <div id="teams"></div>
        </div>
    </div>
    <div id="groups-container"></div>
    
    <script src="qualification.js"></script>
    <script src="scripts/themes.js"></script>
</body>
</html>
<?php } ?>