"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSameDay = isSameDay;
async function isSameDay(ctx, inputTime, session) {
    const userData = (await ctx.database.get("wifeUser", {
        userId: session.userId,
        groupId: session.channelId.toString(),
    }))[0];
    if (!userData.operationDate) {
        userData.operationDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    const inputDateOnly = inputTime.toLocaleDateString();
    const storedDateOnly = userData.operationDate.toLocaleDateString();
    return inputDateOnly === storedDateOnly;
}
