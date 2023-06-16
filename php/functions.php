<?php

function get_team($mysqli_row) {
    return [
        "name" => $mysqli_row['content'],
        "link" => $mysqli_row['link'],
        "id" => $mysqli_row['team_id'],
        "con_id" => intval($mysqli_row['con_id'])
    ];
}

?>