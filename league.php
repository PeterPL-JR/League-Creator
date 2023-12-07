<?php

include_once 'database.php';

include_once 'php/functions.php';
include_once 'php/variables.php';

/** Function that gets data of a team from DB */
function get_teams($teams_names_array, $mode, $icons_mode=CLUBS_MODE_FLAGS) {
    global $base;
    $link = ($mode == TEAMS_MODE_CLUBS && $icons_mode == CLUBS_MODE_LOGOS) ? "logo_src" : "link";

    $QUERY_TEAMS = "SELECT team_id AS team_id, link, CAST(CONVERT(content USING utf8) AS BINARY) AS content, con_id FROM teams JOIN names_teams ON names_teams.team_id = teams.name WHERE lang_id = 1 AND BINARY content = BINARY ";
    $QUERY_CLUBS = "SELECT str_id AS team_id, $link AS link, (CASE WHEN content IS NULL THEN CAST(CONVERT(clubs.name USING utf8) AS BINARY) ELSE content END) AS content, con_id FROM clubs LEFT JOIN names_clubs ON names_clubs.club_id = clubs.str_id JOIN teams ON teams.name = clubs.national_team_id HAVING BINARY content = BINARY ";

    $teams = [];
    $array = json_decode($teams_names_array);

    foreach($array as $team_name) {
        $query = mysqli_query($base, (($mode == TEAMS_MODE_NATIONAL) ? $QUERY_TEAMS : $QUERY_CLUBS)."'$team_name';");
        while ($row = mysqli_fetch_assoc($query)) {
            array_push($teams, get_team($row));
        }
    }
    echo json_encode($teams)."";
}
/** Function that checks if a team exists in DB */
function check_team($team_name, $mode) {
    global $base;

    $QUERY_TEAMS = "SELECT COUNT(*) FROM teams JOIN names_teams ON names_teams.team_id = teams.name WHERE lang_id = 1 AND BINARY content = BINARY '$team_name';";
    $QUERY_CLUBS = "SELECT COUNT(*) FROM clubs LEFT JOIN names_clubs ON names_clubs.club_id = clubs.str_id WHERE (CASE WHEN lang_id IS NULL THEN TRUE ELSE lang_id = 1 END) AND (CASE WHEN content IS NULL THEN BINARY name ELSE BINARY content END) = BINARY '$team_name';";

    $query = mysqli_query($base, ($mode == TEAMS_MODE_NATIONAL) ? $QUERY_TEAMS : $QUERY_CLUBS);
    $amount = mysqli_fetch_row($query)[0];

    echo json_encode($amount == 1 ? TRUE : FALSE);
}

// Perform a function if script is defined or else display HTML page
if(isset($_POST['script'])) {
    // Script type
    $script = $_POST['script']; 

    // Perform functions
    if($script == GET_TEAMS_SCRIPT) {
        get_teams($_POST['data'], $_POST['mode'], $_POST['icons_mode']);
    }
    if($script == CHECK_TEAM_SCRIPT) {
        check_team($_POST['data'], $_POST['mode']);
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

<h1 id="logo">League Creator</h1>

<!-- Container of tournament settings -->
<div id="init-container">
    <!-- Menu settings page -->
    <div class='header'>Nazwa turnieju</div>
    <input type="text" id="league-name" placeholder="Turniej 1">
    <br><br><br>

    <div class='header'>Ilość drużyn</div>
    <input type="number" id="teams-amount" value="4"><br>

    <div class='header'>Drużyny</div>
    <select id="teams-mode-select" class="select">
        <option>Drużyny narodowe</option>
        <option>Kluby</option>
        <option>(Własne)</option>
    </select>
    <br><br>
    <div id="icons-mode" style="display: none;">
        <div class="header">Ikona</div>
        <select id="icons-mode-select" class="select">
            <option>Flaga</option>
            <option>Herb Klubu</option>
        </select>
        <br><br>
    </div>

    <button id="save-amount">Zapisz</button><br>
    
    <!-- Settings page -->
    <div id="init-properties-div">
        <!-- Colors settings -->
        <div class="header" id='colors-header'>
            <div class='colors-arrow' id='colors-arrow-left'><</div>
            <div>Kolory</div>
            <div class='colors-arrow' id='colors-arrow-right'>></div>
        </div>
        
        <div style='clear: both;'></div>

        <div id="colors-div-1" class='colors-div'></div>
        <div id="colors-div-2" class='colors-div'></div>
        <br>
        
        <!-- Number of rounds settings -->
        <div class='header'>Ilość Kolejek (1-2)</div>
        <input type="number" id="rounds-amount" min=1 max=2 value="1"><br>
    </div>
    <div id="inputs-div"></div>
    <button id="start-button" style="display: none;">Zacznij</button>
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

    <div id='team-matches-table-div'></div>
</div>
    <script src="init.js"></script>
    <script src="league.js"></script>
    <script src="scripts/themes.js"></script>
</body>
</html>
<?php }?>