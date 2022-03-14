
/** Writes on console the text input with the specified color and background
 * @param {string} text 
 * @param {colour, background} obj 
 */
function consoleColour() {
    let finalString = "";
    for (let i = 0; i < arguments.length; i++) {
        let current = arguments[i];
        let next = arguments[i + 1];

        if (typeof (current) == "string") {

            if (typeof (next) == "object" && next) {
                let colour = validColour(next.colour) ? `\u001b[1;3${colours[next.colour]}m` : "";
                let background = validColour(next.background) ? `\u001b[1;4${colours[next.background]}m` : "";
                let bright = validColour(next.bright) ? `\u001b[1;9${colours[next.bright]}m` : "";
                finalString += colour + background + bright;
            }

            finalString += current + "\u001b[0m"; //resets the color and background
        }
    }
    console.log(finalString);
}

module.exports.me = consoleColour;

function validColour(colour) {
    return colours[colour]
}

let colours = {
    red: 1,
    green: 2,
    yellow: 3,
    blue: 4,
    purple: 5,
    cyan: 6,
    pass: 0
    //   pass: 90,
    //   fail: 31,
    //   'bright pass': 92,
    //   'bright fail': 91,
    //   'bright yellow': 93,
    //   pending: 36,
    //   suite: 0,
    //   'error title': 0,
    //   'error message': 31,
    //   'error stack': 90,
    //   checkmark: 32,
    //   fast: 90,
    //   medium: 33,
    //   slow: 31,
    //   green: 32,
    //   light: 90,
    //   'diff gutter': 90,
    //   'diff added': 32,
    //   'diff removed': 31
}
