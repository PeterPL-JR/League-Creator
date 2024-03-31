<?php

function get_team_obj($mysqli_row) {
    return [
        "name" => $mysqli_row['content'],
        "link" => $mysqli_row['link'],
        "id" => $mysqli_row['team_id'],
        "con_id" => intval($mysqli_row['con_id'])
    ];
}

function get_from_db($query_text) {
    global $base;

    $teams = [];
    $query = mysqli_query($base, $query_text);

    while($row = mysqli_fetch_assoc($query)) {
        $team = [];
        foreach(array_keys($row) as $key) {
            $team[$key] = $row[$key];
        }
        array_push($teams, $team);
    }
    return $teams;
}

function columns($columns) {
    $array = [];
    foreach(array_keys($columns) as $arr_key) {
        $key = is_int($arr_key) ? $columns[$arr_key] : $arr_key;
        $alias = is_int($arr_key) ? "" : " AS ".$columns[$arr_key];
        array_push($array, $key.$alias);
    }
    return implode(", ", $array);
}

function send_data($data) {
    echo json_encode($data);
}

?>