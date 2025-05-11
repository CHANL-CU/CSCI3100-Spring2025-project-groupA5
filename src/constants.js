const gridSize = 20;

class GameMap {
    constructor(height, width, initialPacmanX, initialPacmanY, powerupSpawns, map) {
        this.height = height;
        this.width = width;
        this.initialPacmanX = initialPacmanX*gridSize;
        this.initialPacmanY = initialPacmanY*gridSize;
        this.powerupSpawns = powerupSpawns;
        this.map = map;
    }
}

module.exports = Object.freeze({
    LOGIN_OK: 'Login successful',
    LOGIN_NOUSER: 'User not found',
    LOGIN_WRONGPW: 'Wrong password',
    LOGIN_WRONGKEY: 'Wrong license key',
    LOGIN_NOADMIN: 'User not Admin',
    LOGIN_ERR: 'Login error',
    //
    GRID_SIDE: gridSize,
    MAX_MEM: 10,
    NODIR: 0,
    UP: 1, 
    DOWN: 2, 
    LEFT: 3, 
    RIGHT: 4, 
    // 0 - path; 1 - wall; 2 - gate; 3 - ghost spawn
    GRID_PATH: 0,
    GRID_WALL: 1,
    GRID_GATE: 2,
    GRID_GSPAWN: 3,
    GAMEMAP_1: new GameMap(23, 23, 11, 15, [[2,5], [21,6], [11,7], [21,16], [2,17]], "1111111111111111111111110001000000000000010001101010111110111110101011000000010000010000000111101010101110101010111100010101011101010101111010101010111010101010110001010000000001010001111110101111111010111111000001000000000100000110111110111211101111101000000001333331000000001011111011111110111110110000010000000001000001111110101111111010111111000101000000000101000110101010101110101010101100010101011101010101111110101010111010101011110000000100000100000001101010111110111110101011000100000000000001000111111111111111111111111"),
    //
    PICKUP_SCORE: 10,
    GHOST_SCORE: 200,
    // colorTheme: [wall, background, pacman, theme name]
    COLOR_THEMES: [ ["#0000ff", "#000000", "#ffff00", "Pac-Man's Default"],
                    ["#893290", "#000000", "#ffc602", "I ♡ CU"],
                    ["#efb780", "#c66b47", "#faf3ec", "Sunny Milk"],
                    ["#abcdef", "#000000", "#ff0f0f", "Nanomachine"]]
});
