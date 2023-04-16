<?php

include_once 'database.php';

include_once 'php/functions.php';
include_once 'php/variables.php';

/** Function that gets data of a team from DB */
function get_teams($teams_names_array) {
    global $base;

    $teams = [];
    $array = json_decode($teams_names_array);

    foreach($array as $team_name) {
        $query = mysqli_query($base, "SELECT team_id, link, content FROM teams JOIN names_teams ON names_teams.team_id = teams.name WHERE lang_id = 1 AND content = '$team_name';");
        while ($row = mysqli_fetch_assoc($query)) {
            array_push($teams, get_team($row));
        }
    }
    echo json_encode($teams)."";
}
/** Function that checks if a team exists in DB */
function check_team($team_name) {
    global $base;
    
    $query = mysqli_query($base, "SELECT COUNT(*) FROM teams JOIN names_teams ON names_teams.team_id = teams.name WHERE lang_id = 1 AND content = '$team_name';");
    $amount = mysqli_fetch_row($query)[0];

    echo json_encode($amount == 1 ? TRUE : FALSE);
}

// Perform a function if script is defined or else display HTML page
if(isset($_POST['script'])) {
    // Script type
    $script = $_POST['script']; 

    // Perform functions
    if($script == GET_TEAMS_SCRIPT) {
        get_teams($_POST['data']);
    }
    if($script == CHECK_TEAM_SCRIPT) {
        check_team($_POST['data']);
    }
} else {
?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <meta charset="UTF-8">
    <title>League Creator</title>
    <script src="scripts/library.js"></script>
    <script src="scripts/matches.js"></script>
    <script src="scripts/functions.js"></script>
    <script src="scripts/variables.js"></script>
    
    <link rel="stylesheet" href="league.css" type="text/css">
    <link id='theme' rel="stylesheet" href="styles/themes/theme-light.css" type='text/css'>
</head>
<body onload="initMenuPage(); initTheme();">
<img src="images/user.png" id='settings'>

<!-- Container of tournament settings -->
<div id="init-container">
    <!-- Menu settings page -->
    <div style="font-size: 23px;">Nazwa turnieju</div>
    <input type="text" id="league-name" placeholder="Turniej 1">

    <div style="font-size: 23px;">Ilość drużyn</div>
    <input type="number" id="teams-amount" value="4"><br>

    <button id="save-amount">Zapisz</button><br>
    
    <!-- Settings page -->
    <div id="init-properties-div">
        <!-- Colors settings -->
        <div id="colors-div">
            <div></div><input class='color-input' type="number" value="0" id="green-color"><br>
            <div></div><input class='color-input' type="number" value="0" id="yellow-color"><br>
            <div></div><input class='color-input' type="number" value="0" id="red-color"><br>
            <div></div><input readonly class='color-input' type="number" value="0" id="default-color"><br>
        </div><br>

        <!-- Number of rounds settings -->
        <div style="font-size: 23px;">Ilość Kolejek (1-2)</div>
        <input type="number" id="rounds-amount" min=1 max=2 value="1"><br>
    </div>
    <div id="inputs-div"></div>
</div>

<!-- Container of the game -->
<div id="game-container">
    <!-- Teams table -->
    <div id="table-div"></div>
    
    <!-- Matches table -->
    <div id="round" class='active-round'>Runda 1</div>
    <div id="matches-div">
        <img class='arrow-button' src="images/arrow.png" id='left-arrow'>
        <div id="matches-table-div"></div>
        <img class='arrow-button' src="images/arrow.png" id='right-arrow'>
    </div>
    
    <button id="button">Zagraj</button>
</div>
    <script src="init.js"></script>
    <script src="league.js"></script>
    <script src="scripts/themes.js"></script>
</body>
</html>
<?php }?>