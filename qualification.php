<?php

include_once 'database.php';
include_once 'php/functions.php';

if(isset($_POST['find'])) {
    $teams = [];

    $text = $_POST['find'];
    $query = mysqli_query($base, "SELECT team_id, link, content FROM teams JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id WHERE confederations.name = 'UEFA' AND content LIKE '$text%' ORDER BY content;");

    while($row = mysqli_fetch_assoc($query)) {
        array_push($teams, get_team($row));
    }
    echo json_encode($teams);

} else if(isset($_POST['confed'])) {
    $teams = [];
    
    $con_name = $_POST['confed'];
    $query = mysqli_query($base, "SELECT team_id, link, content FROM teams JOIN names_teams ON names_teams.team_id = teams.name JOIN confederations ON teams.con_id = confederations.id WHERE confederations.name = '$con_name';");
    
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
    <title>League Qualification</title>
    <link rel="stylesheet" href="league.css" type="text/css">
    <link rel="stylesheet" href="qualification.css" type="text/css">
    <link rel="stylesheet" href="colors.css" type="text/css">
    <link id='theme' rel="stylesheet" href="styles/themes/theme-light.css" type='text/css'>

    <script src="scripts/library.js"></script>
    <script src="scripts/matches.js"></script>
    <script src="scripts/functions.js"></script>
    <script src="scripts/variables.js"></script>
</head>
<body onload="initTheme();">
<img src="images/user.png" id='settings'>

    <div id="pots"></div>
    <div id="container">
        <div id="input-div">
            <h2>Drużyny</h2>
            <input type="text" id="teams-input">
            <div id="teams-amount">(55)</div>
        </div>
        <div id="teams"></div>
    </div>
    <script src="qualification.js"></script>
    <script src="scripts/themes.js"></script>
</body>
</html>
<?php } ?>