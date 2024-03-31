<?php

include_once 'database.php';

include_once 'php/functions.php';
include_once 'php/variables.php';

define("TEAM_NAME_QUERY", "(CASE WHEN names_clubs.content IS NULL THEN clubs.name ELSE names_clubs.content END)");

define("NATIONAL_TEAMS_ELEMENTS", columns(["team_id" => "id", "link", "content" => "name", "con_id"]));
define("CLUBS_TEAMS_ELEMENTS", columns(["str_id" => "id", TEAM_NAME_QUERY => "name", "national_team_id", "con_id"]));

function NATIONAL_TEAMS_QUERY($select_columns, $clauses="") {
    return "SELECT $select_columns FROM teams JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id WHERE lang_id = 1 $clauses;";
}
function CLUBS_TEAMS_QUERY($select_columns, $clauses="") {
    return "SELECT $select_columns FROM clubs LEFT JOIN names_clubs ON names_clubs.club_id = clubs.str_id JOIN teams ON teams.name = clubs.national_team_id JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id WHERE names_teams.lang_id = 1 $clauses;";
}

function QUERY_ALL_NATIONAL_TEAMS() {
    return NATIONAL_TEAMS_QUERY(NATIONAL_TEAMS_ELEMENTS);
}
function QUERY_ALL_CLUBS_TEAMS() {
    return CLUBS_TEAMS_QUERY(CLUBS_TEAMS_ELEMENTS);
}

function QUERY_NATIONAL_TEAM_ID($con_id, $team_text) {
    return NATIONAL_TEAMS_QUERY(columns(["team_id" => "id"]), "AND confederations.id = $con_id AND ".OPERATOR_LIKE("content", $team_text)." ORDER BY content");
}
function QUERY_CLUBS_TEAM_ID($con_id, $team_text, $national_team_text) {
    return CLUBS_TEAMS_QUERY(columns(["str_id" => "id", TEAM_NAME_QUERY => "name"]), "AND confederations.id = $con_id AND ".OPERATOR_LIKE("names_teams.content", $national_team_text)." HAVING ".OPERATOR_LIKE("name", $team_text)." ORDER BY names_teams.content, level DESC, name");
}

function OPERATOR_LIKE($column_name, $name) {
    return "($column_name LIKE '$name%' || $column_name LIKE '% $name%')";
}

function get_confeds() {
    global $base;

    $get_confeds = mysqli_query($base, "SELECT id, name FROM confederations;");
    while($row = mysqli_fetch_row($get_confeds)) {
        echo "<option value='$row[0]'>$row[1]</option>";
    }
}

function get_teams($query) {
    $db_data = get_from_db($query);
    $teams = [];
    foreach($db_data as $team) {
        array_push($teams, $team["id"]);
    }
    send_data($teams);
}

function get_all_teams($query) {
    send_data(get_from_db($query));
}

function get_national_teams($con_id, $team_text) {
    get_teams(QUERY_NATIONAL_TEAM_ID($con_id, $team_text));
}
function get_clubs_teams($con_id, $team_text, $national_team_text) {
    $n_teams = get_from_db(NATIONAL_TEAMS_QUERY(columns(["teams.name" => "id"]), " AND con_id = $con_id AND ".OPERATOR_LIKE("names_teams.content", $national_team_text)." ORDER BY names_teams.content"));
    if(count($n_teams) == 1 || !empty($team_text)) {
        get_teams(QUERY_CLUBS_TEAM_ID($con_id, $team_text, $national_team_text));
    }
    else {
        $teams = [];
        foreach($n_teams as $team) {
            $id = $team["id"];
            $clubs_teams = get_from_db(CLUBS_TEAMS_QUERY(CLUBS_TEAMS_ELEMENTS, " AND national_team_id = '$id' AND level = 5 ORDER BY ".TEAM_NAME_QUERY));
            foreach($clubs_teams as $club) {
                array_push($teams, $club["id"]);
            }
        }
        send_data($teams);
    }
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
        get_all_teams(QUERY_ALL_NATIONAL_TEAMS());
    }
    if($script == GET_ALL_CLUBS_TEAMS) {
        get_all_teams(QUERY_ALL_CLUBS_TEAMS());
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
    <script src="scripts/football.js"></script>

    <script src="scripts/functions.js"></script>
    <script src="scripts/variables.js"></script>
</head>
<body onload="get(); initTheme();">
<img src="images/user.png" id='settings'>
    <div id="pots-container">
        <div id="pots-inputs-div">
            <h2>Drużyny</h2>
            <input type="number" id='teams-amount-input' value="54">

            <h2>Grupy</h2>
            <input type="number" id='groups-amount-input' value="9">
            <br>

            <select id="teams-mode-select" class="select">
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