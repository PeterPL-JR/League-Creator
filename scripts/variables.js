// PHP scripts
const GET_TEAMS_SCRIPT = 0;
const CHECK_TEAM_SCRIPT = 1;
const GET_NATIONAL_TEAMS = 4;
const GET_CLUBS_TEAMS = 5;
const GET_ALL_NATIONAL_TEAMS = 2;
const GET_ALL_CLUBS_TEAMS = 3;

const TEAMS_MODE_NATIONAL = 0;
const TEAMS_MODE_CLUBS = 1;
const TEAMS_MODE_CUSTOM = 2;

const CLUBS_MODE_FLAGS = 0;
const CLUBS_MODE_LOGOS = 1;

// PHP / SRC
const LEAGUE_PHP_FILE = "league.php";
const QUALIFICATION_PHP_FILE = "qualification.php";

const FLAGS_SRC = "../league-online/flags/";
const LOGOS_SRC = "../league-online/logos/";

// Mouse Buttons 
const LEFT_BUTTON = 0;
const SCROLL_BUTTON = 1;
const RIGHT_BUTTON = 2;

// Colors
const COLOR_GREEN = "var(--color-green)";
const COLOR_YELLOW = "var(--color-yellow)";
const COLOR_RED = "var(--color-red)";
const COLOR_DEFAULT = "var(--color-default)";

const COLOR_GOLD = "var(--color-gold)";
const COLOR_SILVER = "var(--color-silver)";
const COLOR_BROWN = "var(--color-brown)";

const COLORS = {
    green: COLOR_GREEN,
    yellow: COLOR_YELLOW,
    red: COLOR_RED,
    default: COLOR_DEFAULT,

    gold: COLOR_GOLD,
    silver: COLOR_SILVER,
    brown: COLOR_BROWN
};

const DEFAULT_MATCH_COLOR = COLOR_DEFAULT;
const ACTIVE_MATCH_COLOR = "var(--select-color-1)";

const COLORS_MODE_LEAGUE = 0;
const COLORS_MODE_PLACES = 1;

// IDs/Classes
const TEAMS_TABLE_CLASS = "teams-table";
const MATCHES_TABLE_CLASS = "matches-table";

// Directions
const DIRECTION_LEFT = 0;
const DIRECTION_RIGHT = 1;