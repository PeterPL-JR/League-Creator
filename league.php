<?php
include 'database.php';

function get_team($mysqli_row) {
    return [
        "name" => $mysqli_row['content'],
        "link" => $mysqli_row['link'],
        "id" => $mysqli_row['team_id']
    ];
}

if (isset($_POST['get'])) {
    $teams = [];
    $array = json_decode($_POST['get']);

    foreach($array as $team) {
        $query = mysqli_query($base, "SELECT team_id, link, content FROM teams JOIN names_teams ON names_teams.team_id = teams.name WHERE lang_id = 1 AND content = '$team';");
        while ($row = mysqli_fetch_assoc($query)) {
            array_push($teams, get_team($row));
        }
    }
    echo json_encode($teams)."";
} else if(isset($_POST['check'])) {

    $content = $_POST['check'];
    $query = mysqli_query($base, "SELECT COUNT(*) FROM teams JOIN names_teams ON names_teams.team_id = teams.name WHERE lang_id = 1 AND content = '$content';");
    
    $amount = mysqli_fetch_row($query)[0];
    echo $amount;

} else if(isset($_POST['confed'])) {
    $teams = [];
    
    $con_name = $_POST['confed'];
    $query = mysqli_query($base, "SELECT team_id, link, content FROM teams JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id WHERE confederations.name = '$con_name';");
    
    while($row = mysqli_fetch_assoc($query)) {
        array_push($teams, get_team($row));
    }
    echo json_encode($teams);

} else if(isset($_POST['find'])) {
    $teams = [];

    $text = $_POST['find'];
    $query = mysqli_query($base, "SELECT team_id, link, content FROM teams JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id WHERE confederations.name = 'UEFA' AND content LIKE '$text%' ORDER BY content;");

    while($row = mysqli_fetch_assoc($query)) {
        array_push($teams, get_team($row));
    }
    echo json_encode($teams);

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
    <div id="round">Runda 1</div>
    <div id="matches-div"></div>
    
    <button id="button">Zagraj</button>
</div>
    <script src="init.js"></script>
    <script src="league.js"></script>
    <script src="scripts/themes.js"></script>
</body>
</html>
<?php }?>