<?php

include_once 'database.php';

include_once 'php/functions.php';
include_once 'php/variables.php';

define("TEAMS_QUERY", "SELECT team_id, link, content FROM teams JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id");

function get_teams($confed, $team_text) {
    get_from_db("WHERE confederations.name = '$confed' AND content LIKE '$team_text%' ORDER BY content;");
}
function get_all_teams() {
    get_from_db();
}

function get_from_db($where_clauses="") {
    global $base;

    $teams = [];
    $query = mysqli_query($base, TEAMS_QUERY." ".$where_clauses);

    while($row = mysqli_fetch_assoc($query)) {
        array_push($teams, get_team($row));
    }
    echo json_encode($teams);
}

if(isset($_POST['script'])) {
    // Script type
    $script = $_POST['script']; 

    // Perform functions
    if($script == GET_TEAMS_SCRIPT) {
        get_teams($_POST['confed'], $_POST['data']);
    }
    if($script == GET_ALL_TEAMS) {
        get_all_teams();
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
    <div id="pots-inputs-div">
        <h2>Drużyny</h2>
        <input type="number" id='teams-amount-input' value="54">
        
        <h2>Grupy</h2>
        <input type="number" id='groups-amount-input' value="9">
        
        <br><button id='button-draw-start'>Losuj</button>
    </div>    

    <div id="pots"></div>
    <div id="container">
        <div id="input-div">
            <h2>
                Drużyny
                <select id='confed-select'>
                    <?php
                    
                    include_once 'database.php';

                    $get_confeds = mysqli_query($base, "SELECT name FROM confederations;");
                    while($row = mysqli_fetch_row($get_confeds)) {
                        echo "<option>".$row[0]."</option>";
                    }
                    
                    ?>
                </select>
            </h2>
            <input type="text" id="teams-input">
            <div id="teams-amount"></div>
        </div>
        <div id="teams"></div>
    </div>
    <script src="qualification.js"></script>
    <script src="scripts/themes.js"></script>
</body>
</html>
<?php } ?>