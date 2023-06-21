<?php

function get_team($mysqli_row) {
    return [
        "name" => $mysqli_row['content'],
        "link" => $mysqli_row['link'],
        "id" => $mysqli_row['team_id'],
        "con_id" => intval($mysqli_row['con_id'])
    ];
}

function get_national_team($mysqli_row) {
    return get_team($mysqli_row);
}
function get_clubs_team($mysqli_row) {
    return [
        "name" => $mysqli_row['content'],
        "id" => $mysqli_row['team_id'],
        "con_id" => intval($mysqli_row['con_id']),
        "national_team_id" => $mysqli_row['national_team_id']
    ];
}

?>