import { Context, h, Session } from "koishi";
import type { Config } from "../config";
import path from "path";
import { pathToFileURL } from "url";
import { getRandomWavFile } from "../utils/getWavFlieName";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";
export function rlp(ctx: Context,config: Config) {

  let wifegachaPath = "";
  if (path.join(__dirname).split("\\").pop()=="command"){
    wifegachaPath = path.join(
      __dirname,
      "../",
      "wifeVoice"
    );
  }else{
    wifegachaPath = path.join(
      __dirname,
      "wifeVoice"
    );
  }

  ctx.command("日老婆 增加老婆好感度")
  .action(async ({ session }) => {
        const send = createRecallSender(session, ctx, config, "affection");
    if (ctx.config.blockGroup.includes(session.channelId.toString())) {
      return;
    }
    if(!config.fuckWifeSwitchgear){
      send([h("quote", { id: session.messageId }), "好感度功能未开启，请联系管理员"]);
      return;
    }
    if(config.fuckWifeBlockGroup.includes(session.channelId.toString())){
      send([h("quote", { id: session.messageId }), "本群好感度功能已被禁止，请联系管理员"]);
      return;
    }

    // 创建用户数据
    await utils.createUserData(ctx, session)
    // 创建群数据
    await utils.createGroupData(ctx, session)
    // 获取用户数据
    const userData = (
      await ctx.database.get("wifeUser", {
        userId: session.userId,
        groupId: session.channelId.toString(),
      })
    )[0];
    // 获取群数据
    const groupData = (
      await ctx.database.get("groupData", {
        groupId: session.channelId.toString(),
      })
    )[0];
    // 获取老婆数据
    const wifeData = (
      await ctx.database.get("wifeData", {
        name: userData.wifeName,
      })
    )[0];
    // 获取老婆名字
    const wifeName = userData.wifeName;
    // ctx.logger.info(wifeName)
    // 生成一个1-100的随机数
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    // ctx.logger.info(randomNumber)
    let affection = 0;
    let audioUrl = "";
    if(randomNumber <= 5){
      affection = -2;
      audioUrl = getRandomWavFile(path.join(wifegachaPath, "-2"));
      if(!audioUrl){
        // send([h("quote", { id: session.messageId }), "没有找到老婆语音文件"]);
        return;
      }
      audioUrl = path.join(wifegachaPath, "-2", audioUrl);
    }else if(randomNumber <= 15){
      affection = -1;
      audioUrl = getRandomWavFile(path.join(wifegachaPath, "-1"));
      if(!audioUrl){
        // send([h("quote", { id: session.messageId }), "没有找到老婆语音文件"]);
        return;
      }
      audioUrl = path.join(wifegachaPath, "-1", audioUrl);
    }else if(randomNumber <= 30){
      affection = 3;
      audioUrl = getRandomWavFile(path.join(wifegachaPath, "+3"));
      if(!audioUrl){
        // send([h("quote", { id: session.messageId }), "没有找到老婆语音文件"]);
        return;
      }
      audioUrl = path.join(wifegachaPath, "+3", audioUrl);
    }else if(randomNumber <= 55){
      affection = 2;
      audioUrl = getRandomWavFile(path.join(wifegachaPath, "+2"));
      if(!audioUrl){
        // send([h("quote", { id: session.messageId }), "没有找到老婆语音文件"]);
        return;
      }
      audioUrl = path.join(wifegachaPath, "+2", audioUrl);
    }else{
      affection = 1;
      audioUrl = getRandomWavFile(path.join(wifegachaPath, "+1"));
      if(!audioUrl){
        // send([h("quote", { id: session.messageId }), "没有找到老婆语音文件"]);
        return;
      }
      audioUrl = path.join(wifegachaPath, "+1", audioUrl);
    }
    if(wifeName){
        const fuckWifeDate = userData.fuckWifeDate;
        if(!fuckWifeDate){
          // 更新用户数据
          userData.fuckWifeDate = new Date();
          userData.wifeHistories.forEach(item => {
            if(item.wifeName === wifeName){
              item.affection = item.affection + affection;
              item.affectionLevel = utils.affectionLevel(item.affection);
            }
          })
          // const target = userData.todayAffection.find(item => item.wifeName === wifeName);

          // if (!target) {
          //   userData.todayAffection.push({
          //     wifeName: wifeName,
          //     todayAffection: affection,
          //   });
          // } else {
          //   target.todayAffection += affection;
          // }
          ctx.database.set("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
          }, {
            wifeHistories: userData.wifeHistories,
            fuckWifeDate: userData.fuckWifeDate,
            // todayAffection: userData.todayAffection,
          });
          // 更新群数据
          ctx.database.set("groupData", {
            groupId: session.channelId.toString(),
          }, {
            fuckTotalCount: groupData.fuckTotalCount + 1,
          });
          // 更新老婆数据
          await utils.createGroupWifeData(ctx, session, wifeName);
          const groupWifeData = wifeData.groupData.map(item =>{
            if(item.groupId === session.channelId.toString()){
              item.fuckCount += 1;
            }
            return item;
          })
          await ctx.database.set("wifeData", {
            name: wifeName,
          }, {
            groupData: groupWifeData
          });
          send([
            h("quote", { id: session.messageId }),
            `${userData.wifeName}好感度${affection > 0 ? "+" : ""}${affection}\n${config.fuckWifeDetailedReply ? `当前好感度：${userData.wifeHistories.find(item => item.wifeName === wifeName)?.affection}\n当前好感等级：${userData.wifeHistories.find(item => item.wifeName === wifeName)?.affectionLevel}\n每级好感度会影响被牛老婆成功率` : ""}`,
            audioUrl&&config.fuckWifeVoiceReply?h.audio(pathToFileURL(path.resolve(audioUrl)).href):""
          ]);
        }else{
        const now = new Date().getTime();
        const diffTime = Math.abs(now - fuckWifeDate.getTime());
        const diffSeconds = Math.floor(diffTime / 1000);
        // ctx.logger.info(diffSeconds,config.fuckWifeCoolingTime)
        if(diffSeconds > config.fuckWifeCoolingTime){
          // 更新用户数据
          userData.fuckWifeDate = new Date();
          userData.wifeHistories.forEach(item => {
            if(item.wifeName === wifeName){
              item.affection = item.affection + affection;
              item.affectionLevel = utils.affectionLevel(item.affection);
            }
          })
          // const target = userData.todayAffection.find(item => item.wifeName === wifeName);

          // if (!target) {
          //   userData.todayAffection.push({
          //     wifeName: wifeName,
          //     todayAffection: affection,
          //   });
          // } else {
          //   target.todayAffection += affection;
          // }
          ctx.database.set("wifeUser", {
            userId: session.userId,
            groupId: session.channelId.toString(),
          }, {
            wifeHistories: userData.wifeHistories,
            fuckWifeDate: userData.fuckWifeDate,
            // todayAffection: userData.todayAffection,
          });
          // 更新群数据
          ctx.database.set("groupData", {
            groupId: session.channelId.toString(),
          }, {
            fuckTotalCount: groupData.fuckTotalCount + 1,
          });
          // 更新老婆数据
          await utils.createGroupWifeData(ctx, session, wifeName);
          const groupWifeData = wifeData.groupData.map(item =>{
            if(item.groupId === session.channelId.toString()){
              item.fuckCount += 1;
            }
            return item;
          })
          await ctx.database.set("wifeData", {
            name: wifeName,
          }, {
            groupData: groupWifeData
          });
          send([
            h("quote", { id: session.messageId }),
            `${userData.wifeName}好感度${affection > 0 ? "+" : ""}${affection}\n${config.fuckWifeDetailedReply ? `当前好感度：${userData.wifeHistories.find(item => item.wifeName === wifeName)?.affection}\n当前好感等级：${userData.wifeHistories.find(item => item.wifeName === wifeName)?.affectionLevel}\n每级好感度会影响被牛老婆成功率` : ""}`,
            audioUrl&&config.fuckWifeVoiceReply?h.audio(pathToFileURL(path.resolve(audioUrl)).href):""
          ]);
          }else{
            const minutes = Math.floor((config.fuckWifeCoolingTime - diffSeconds)/60);
            const seconds = (config.fuckWifeCoolingTime - diffSeconds)%60;
            send([h("quote", { id: session.messageId }), `好感度冷却中，剩余冷却${minutes}分${seconds}秒`]);
          }
        }
    }
    else{
      send([h("quote", { id: session.messageId }), "你还没有老婆"]);
    }
  })
}
