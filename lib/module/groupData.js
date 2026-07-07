"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupData = groupData;
function groupData(ctx, config) {
    // ctx.database.drop('groupData')
    ctx.model.extend('groupData', {
        id: 'unsigned',
        groupId: 'string',
        drawCount: 'integer',
        ntrTotalCount: 'integer',
        ntrSuccessCount: 'integer',
        exchangeCount: 'integer',
        divorceTotalCount: 'integer',
        fuckTotalCount: 'integer',
    }, {
        autoInc: true
    });
    ctx.logger.info('groupData 表初始化完成');
}
