const THEMES_PATH = "styles/themes/"; // Main path of all themes

// Themes
const LIGHT_THEME = 0;
const DARK_THEME = 1;

const THEMES_FILES_PATHS = ["theme-light.css", "theme-dark.css"]; // Paths of CSS themes
let currentTheme = DARK_THEME; // Theme set currently

const settingsIcon = document.getElementById("settings");

/** Init themes system */
function initTheme() {
    // Load a theme saved before and set it
    let savedTheme = localStorage.getItem("league-creator-theme");
    if(savedTheme) {
        currentTheme = savedTheme;
    }
    setTheme(currentTheme);

    // Settings icon event that changes themes 
    settingsIcon.onclick = function() {
        changeTheme();
    }
}

/** Change theme (light theme/dark theme) */
function changeTheme() {
    currentTheme = currentTheme == LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    setTheme(currentTheme);
}

/** Set theme of given index */
function setTheme(theme) {
    let link = document.getElementById("theme");    
    link.href = THEMES_PATH + THEMES_FILES_PATHS[theme];

    localStorage.setItem("league-creator-theme", theme);
}