"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wifeUser = wifeUser;
function wifeUser(ctx, config) {
    ctx.model.extend("wifeUser", {
        id: "unsigned",
        userId: "string",
        groupId: "string",
        wifeName: "string",
        operationDate: "timestamp",
        ntrOrdinal: "integer",
        fuckWifeDate: "timestamp",
        kissWifeDate: "timestamp",
        dateWifeDate: "timestamp",
        lpdaDate: "timestamp",
        divorceDate: "timestamp",
        affectionDecayDate: "timestamp",
        drawBanUntil: "timestamp",
        wifeHistories: "json",
        interactionWithOtherUser: "json",
        createdAt: "timestamp",
        ntrCount: "integer",
        ntrTotalCount: "integer",
        ntrSuccessCount: "integer",
        drawCount: "integer",
        exchangeCount: "integer",
        divorceCount: "integer",
        totalAffection: "integer",
        currentWifeAffection: "integer",
        maxAffection: "integer",
        targetNtrCount: "integer",
        targetNtrSuccessCount: "integer",
    }, {
        autoInc: true,
    });
    ctx.logger.info("wifeUser 表初始化完成");
}
