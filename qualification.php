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