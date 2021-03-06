<?php
include 'database.php';

if (isset($_POST['get'])) {
    $teams = [];
    $array = json_decode($_POST['get']);

    foreach($array as $team) {
        $query = mysqli_query($base, "SELECT team_id, link, content FROM teams JOIN names_teams ON names_teams.team_id = teams.name WHERE lang_id = 1 AND content = '$team';");
        while ($row = mysqli_fetch_assoc($query)) {
            array_push($teams, [
                "name" => $row['content'],
                "link" => $row['link'],
                "id" => $row['team_id']
            ]);
        }
    }
    echo json_encode($teams)."";
} else if(isset($_POST['check'])) {

    $content = $_POST['check'];
    $query = mysqli_query($base, "SELECT COUNT(*) FROM teams JOIN names_teams ON names_teams.team_id = teams.name WHERE lang_id = 1 AND content = '$content';");
    
    $amount = mysqli_fetch_row($query)[0];
    echo $amount;

} else {
?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <meta charset="UTF-8">
    <title>League Creator</title>
    <script src="library.js"></script>
    <link rel="stylesheet" href="league.css" type="text/css">
</head>
<body>

<div id="init-div">
    <div style="font-size: 23px;">Ilość drużyn (4-10)</div>
    <input type="number" id="teams-amount" min=4 max=10 value="4"><br>
    <button id="save-amount">Zapisz</button><br>
    
    <div id="init-properties-div">
        <div id="colors-div">
            <div></div><input type="number" value="0" id="green"><br>
            <div></div><input type="number" value="0" id="yellow"><br>
            <div></div><input type="number" value="0" id="red"><br>
            <div></div><input type="number" value="0" id="whitea"><br>
        </div><br>

        <div style="font-size: 23px;">Ilość Kolejek (1-2)</div>
        <input type="number" id="rounds-amount" min=1 max=2 value="1"><br>
    </div><br><br>
    <div id="inputs-div"></div>
</div>

<div id="game-div">
    <div id="table-div"></div>
    <div id="round">Runda 1</div>
    
    <div id="matches-div"></div>
    <button id="button">Zagraj</button>
</div>
    <script src="init.js"></script>
    <script src="league.js"></script>
</body>
</html>
<?php }?>