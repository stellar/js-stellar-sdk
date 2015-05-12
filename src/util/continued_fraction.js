var MAX_INT = (1 << 31 >>> 0) - 1;

/**
* Calculats and returns the best rational approximation of the given real number.
* @returns {array} first element is n, second element is d
*/
export function best_r(number) {
    var a = Math.floor(number);
    var f;
    var fractions = [[0,1],[1,0]];
    var i = 2;
    while (true) {
        if (number > MAX_INT) {
            break;
        }
        a = Math.floor(number);
        f = number - a;
        var h = a * fractions[i - 1][0] + fractions[i - 2][0];
        var k = a * fractions[i - 1][1] + fractions[i - 2][1];
        if (h > MAX_INT || k > MAX_INT) {
            break;
        }
        fractions.push([h, k]);
        if (f === 0) {
            break;
        }
        number = 1 / f;
        i = i + 1;
    }
    return fractions[fractions.length - 1];
}