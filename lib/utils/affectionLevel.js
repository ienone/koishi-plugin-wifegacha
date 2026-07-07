"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.affectionLevel = affectionLevel;
function affectionLevel(affection) {
    if (affection < 10) {
        return 0;
    }
    if (affection < 20) {
        return 1;
    }
    if (affection < 30) {
        return 2;
    }
    if (affection < 40) {
        return 3;
    }
    if (affection < 50) {
        return 4;
    }
    if (affection < 60) {
        return 5;
    }
    if (affection < 70) {
        return 6;
    }
    if (affection < 80) {
        return 7;
    }
    if (affection < 90) {
        return 8;
    }
    return 9;
}
