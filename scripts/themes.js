const THEMES_PATH = "styles/themes/";

const LIGHT_THEME = 0;
const DARK_THEME = 1;

const THEMES_FILES_PATHS = ["theme-light.css", "theme-dark.css"];
let currentTheme = DARK_THEME;

const settingsIcon = document.getElementById("settings");

function initTheme() {
    let savedTheme = localStorage.getItem("league-creator-theme");
    if(savedTheme) {
        currentTheme = savedTheme;
    }

    setTheme(currentTheme);
    settingsIcon.onclick = function() {
        changeTheme();
    }
}

function changeTheme() {
    currentTheme = currentTheme == LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    setTheme(currentTheme);
}

function setTheme(theme) {
    let link = document.getElementById("theme");    
    link.href = THEMES_PATH + THEMES_FILES_PATHS[theme];

    localStorage.setItem("league-creator-theme", theme);
}