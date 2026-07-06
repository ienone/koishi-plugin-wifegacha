"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInteraction = createInteraction;
async function createInteraction(ctx, session, otherUserId) {
    const wifeUser = (await ctx.database.get("wifeUser", {
        userId: session.userId,
        groupId: session.channelId.toString(),
    }));
    if ((!wifeUser[0].interactionWithOtherUser.find((item) => item.otherUserId === otherUserId && item.groupId === session.channelId.toString()))) {
        ctx.logger.info("没有与该用户交互，创建数据");
        wifeUser[0].interactionWithOtherUser.push({
            otherUserId: otherUserId,
            groupId: session.channelId.toString(),
            ntrCount: 0,
            ntrSuccessCount: 0,
            exchangeCount: 0,
        });
        await ctx.database.set("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
        }, {
            interactionWithOtherUser: wifeUser[0].interactionWithOtherUser
        });
    }
    const targetWifeUser = (await ctx.database.get("wifeUser", {
        userId: otherUserId,
        groupId: session.channelId.toString(),
    }));
    if ((!targetWifeUser[0].interactionWithOtherUser.find((item) => item.otherUserId === session.userId && item.groupId === session.channelId.toString()))) {
        targetWifeUser[0].interactionWithOtherUser.push({
            otherUserId: session.userId,
            groupId: session.channelId.toString(),
            ntrCount: 0,
            ntrSuccessCount: 0,
            exchangeCount: 0,
        });
        await ctx.database.set("wifeUser", {
            userId: otherUserId,
            groupId: session.channelId.toString(),
        }, {
            interactionWithOtherUser: targetWifeUser[0].interactionWithOtherUser
        });
    }
}
