const THEMES_PATH = "styles/themes/";

const LIGHT_THEME = THEMES_PATH + "theme-light.css";
const DARK_THEME = THEMES_PATH + "theme-dark.css";
let currentTheme = DARK_THEME;

const settingsIcon = document.getElementById("settings");

function initTheme() {
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
    link.href = theme;
}