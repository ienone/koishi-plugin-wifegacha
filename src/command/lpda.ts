import { Context, h } from "koishi";
import type { Config } from "../config";
import path from "path";
import { pathToFileURL } from "url";
import utils from "../utils";
import { createRecallSender } from "../utils/messageRecall";

export function lpda(ctx: Context, config: Config) {
  ctx
    .command("老婆档案 [wifeName] 查询老婆档案")
    .action(async ({ session }, wifeName) => {
        const send = createRecallSender(session, ctx, config, "archive");
      if (ctx.config.blockGroup.includes(session.channelId.toString())) {
        return;
      }
      // 查看是否关闭了某些功能
      // 离婚功能
      let divorceSwitchgear = true;
      if (!config.divorceSwitchgear) {
        divorceSwitchgear = false;
      }
      if (config.divorceBlockGroup.includes(session.channelId.toString())) {
        divorceSwitchgear = false;
      }
      // 日老婆功能
      let fuckWifeSwitchgear = true;
      if (!config.fuckWifeSwitchgear) {
        fuckWifeSwitchgear = false;
      }
      if (config.fuckWifeBlockGroup.includes(session.channelId.toString())) {
        fuckWifeSwitchgear = false;
      }
      // 牛老婆功能
      let ntrSwitchgear = true;
      if (!config.ntrSwitchgear) {
        ntrSwitchgear = false;
      }
      if (config.ntrBlockGroup.includes(session.channelId.toString())) {
        ntrSwitchgear = false;
      }
      // 创建用户数据
      await utils.createUserData(ctx, session);
      // 获取所有老婆数据
      const wifeData = await ctx.database.get("wifeData", {});
      // 获取用户数据
      const wifeUser = await ctx.database.get("wifeUser", {
        userId: session.userId,
        groupId: session.channelId.toString(),
      });

      if (wifeName) {
        if (!wifeData.find((item) => item.name === wifeName)) {
          // 查找可能的老婆
          const possibleWife = wifeData.filter((item) =>
            item.name.includes(wifeName)
          );
          if (possibleWife.length > 0) {
            send([
              h("quote", { id: session.messageId }),
              "你可能是想找：\n",
              possibleWife.map((item) => item.name).join("\n"),
            ]);
          } else {
            send([h("quote", { id: session.messageId }), "老婆不存在"]);
          }
        } else {
          const now = new Date().getTime();
          const diffTime = Math.abs(now - wifeUser[0].lpdaDate.getTime());
          const diffSeconds = Math.floor(diffTime / 1000);
          if (diffSeconds < config.lpdaDateInterval) {
            const minutes = Math.floor(
              (config.lpdaDateInterval - diffSeconds) / 60
            );
            const seconds = (config.lpdaDateInterval - diffSeconds) % 60;
            send([
              h("quote", { id: session.messageId }),
              `档案查询冷却中，${minutes}分${seconds}秒后可以再次查询`,
            ]);
            return;
          }
          // 更新用户档案查询时间
          await ctx.database.set(
            "wifeUser",
            {
              userId: session.userId,
              groupId: session.channelId.toString(),
            },
            {
              lpdaDate: new Date(),
            }
          );
          const wife = wifeData.find((item) => item.name === wifeName);
          if (wife) {
            if (
              !wife.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )
            ) {
              wife.groupData.push({
                groupId: session.channelId.toString(),
                drawCount: 0,
                ntrCount: 0,
                fuckCount: 0,
                divorceCount: 0,
                ntrFailCount: 0,
              });
              await ctx.database.set(
                "wifeData",
                {
                  name: wife.name,
                },
                {
                  groupData: wife.groupData,
                }
              );
            }
            if (
              wifeUser[0].wifeHistories.find(
                (item) => item.wifeName === wifeName
              )
            ) {
              const imageBuffer = await utils.readImageAsBinarySync(wife.filepath);
              send([
                h("quote", { id: session.messageId }),
                `名字：${wife.name}\n`,
                `${wife.comeFrom ? `来自：${wife.comeFrom}\n` : ""}`,
                h.image(imageBuffer, "image/png"),
                `${
                  wifeUser[0].wifeHistories.find(
                    (item) => item.wifeName === wifeName
                  )
                    ? `- 你们相遇的时间是：${
                        wifeUser[0].wifeHistories
                          .find((item) => item.wifeName === wifeName)
                          ?.getWifeDate.toLocaleString()
                          .split("T")[0]
                      }\n`
                    : ""
                }`,
                `${
                  wifeUser[0].wifeHistories.find(
                    (item) => item.wifeName === wifeName
                  )
                    ? `- 你一共抽到她${
                        wifeUser[0].wifeHistories.find(
                          (item) => item.wifeName === wifeName
                        )?.getNum
                      }次\n`
                    : ""
                }`,
                `${
                  ntrSwitchgear &&
                  wifeUser[0].wifeHistories.find(
                    (item) => item.wifeName === wifeName
                  )
                    ? `- 你一共牛到手${
                        wifeUser[0].wifeHistories.find(
                          (item) => item.wifeName === wifeName
                        )?.ntrGetCount
                      }次\n`
                    : ""
                }`,
                `${
                  wifeUser[0].wifeHistories.find(
                    (item) => item.wifeName === wifeName
                  )
                    ? `- 你一共交换到手${
                        wifeUser[0].wifeHistories.find(
                          (item) => item.wifeName === wifeName
                        )?.exchangeGetCount
                      }次\n`
                    : ""
                }`,
                `${
                  divorceSwitchgear &&
                  wifeUser[0].wifeHistories.find(
                    (item) => item.wifeName === wifeName
                  )
                    ? `- 你一共离婚${
                        wifeUser[0].wifeHistories.find(
                          (item) => item.wifeName === wifeName
                        )?.divorceCount
                      }次\n`
                    : ""
                }`,
                `${
                  fuckWifeSwitchgear &&
                  wifeUser[0].wifeHistories.find(
                    (item) => item.wifeName === wifeName
                  )
                    ? `- 她对你的好感度：${
                        wifeUser[0].wifeHistories.find(
                          (item) => item.wifeName === wifeName
                        )?.affection
                      }\n`
                    : ""
                }`,
                `${
                  fuckWifeSwitchgear &&
                  wifeUser[0].wifeHistories.find(
                    (item) => item.wifeName === wifeName
                  )
                    ? `- 她对你的好感等级：${
                        wifeUser[0].wifeHistories.find(
                          (item) => item.wifeName === wifeName
                        )?.affectionLevel
                      }\n`
                    : ""
                }`,
                `-----------\n`,
                `${
                  wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )
                    ? `- 本群一共抽到${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.drawCount
                      }次\n`
                    : ""
                }`,
                `${
                  ntrSwitchgear &&
                  wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )
                    ? `- 本群一共被牛${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.ntrCount
                      }次\n`
                    : ""
                }`,
                `${
                  fuckWifeSwitchgear &&
                  wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )?.fuckCount
                    ? `- 本群总好感度：${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.fuckCount
                      }\n`
                    : ""
                }`,
                `${
                  divorceSwitchgear&&wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )?.divorceCount
                    ? `- 本群一共离婚${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.divorceCount
                      }次\n`
                    : ""
                }`,
                `${
                  ntrSwitchgear&&wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )?.ntrFailCount
                    ? `- 本群一共被牛走${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.ntrFailCount
                      }次\n`
                    : ""
                }`,
              ]);
            } else {
              const imageBuffer = await utils.readImageAsBinarySync(wife.filepath);
              send([
                h("quote", { id: session.messageId }),
                `名字：${wife.name}\n`,
                `${wife.comeFrom ? `来自：${wife.comeFrom}\n` : ""}`,
                h.image(imageBuffer, "image/png"),
                `${wife.groupData.find(
                  (item) => item.groupId === session.channelId.toString()
                )?.drawCount ? `- 本群一共抽到${
                  wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )?.drawCount
                }次\n` : ""}`,
                `${
                  ntrSwitchgear&&wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )?.ntrCount
                    ? `- 本群一共被牛${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.ntrCount
                      }次\n`
                    : ""
                }`,
                `${
                  fuckWifeSwitchgear&&wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )?.fuckCount
                    ? `- 本群总好感度：${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.fuckCount
                      }\n`
                    : ""
                }`,
                `${
                  divorceSwitchgear&&wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )?.divorceCount
                    ? `- 本群一共离婚${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.divorceCount
                      }次\n`
                    : ""
                }`,
                `${
                  ntrSwitchgear&&wife.groupData.find(
                    (item) => item.groupId === session.channelId.toString()
                  )?.ntrFailCount
                    ? `- 本群一共被牛走${
                        wife.groupData.find(
                          (item) =>
                            item.groupId === session.channelId.toString()
                        )?.ntrFailCount
                      }次\n`
                    : ""
                }`,
              ]);
            }
          }
        }
      } else {
        const now = new Date().getTime();
        const diffTime = Math.abs(now - wifeUser[0].lpdaDate.getTime());
        const diffSeconds = Math.floor(diffTime / 1000);
        if (diffSeconds < config.lpdaDateInterval) {
          const minutes = Math.floor(
            (config.lpdaDateInterval - diffSeconds) / 60
          );
          const seconds = (config.lpdaDateInterval - diffSeconds) % 60;
          send([
            h("quote", { id: session.messageId }),
            `档案查询冷却中，${minutes}分${seconds}秒后可以再次查询`,
          ]);
          return;
        }
        // 更新用户档案查询时间
        await ctx.database.set(
          "wifeUser",
          {
            userId: session.userId,
            groupId: session.channelId.toString(),
          },
          {
            lpdaDate: new Date(),
          }
        );
        const groupWifeData = wifeData.filter((item) =>
          item.groupData.find(
            (item) => item.groupId === session.channelId.toString()
          )
        );
        if (groupWifeData.length > 0) {
          // 被娶最多的老婆
          const mostDrawWife = groupWifeData.sort(
            (a, b) =>
              b.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.drawCount -
              a.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.drawCount
          )[0];
          // 被牛最多的老婆
          const mostNtrWife = groupWifeData.sort(
            (a, b) =>
              b.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.ntrCount -
              a.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.ntrCount
          )[0];
          // 好感度最高的老婆
          const mostFuckWife = groupWifeData.sort(
            (a, b) =>
              b.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.fuckCount -
              a.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.fuckCount
          )[0];
          // 离婚最多的老婆
          const mostDivorceWife = groupWifeData.sort(
            (a, b) =>
              b.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.divorceCount -
              a.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.divorceCount
          )[0];
          // 被牛走最多的老婆
          const mostNtrFailWife = groupWifeData.sort(
            (a, b) =>
              b.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.ntrFailCount -
              a.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.ntrFailCount
          )[0];
          send([
            h("quote", { id: session.messageId }),
            "本群老婆统计：\n",
            `${mostDrawWife.groupData.find(
              (item) => item.groupId === session.channelId.toString()
            )?.drawCount ? `- 被娶最多的老婆：${mostDrawWife.name}，共${
              mostDrawWife.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.drawCount
            }次\n` : ""}`,
            `${mostNtrWife.groupData.find(
              (item) => item.groupId === session.channelId.toString()
            )?.ntrCount ? `- 被牛最多的老婆：${mostNtrWife.name}，共${
              mostNtrWife.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.ntrCount
            }次\n` : ""}`,
            `${mostFuckWife.groupData.find(
              (item) => item.groupId === session.channelId.toString()
            )?.fuckCount ? `- 好感度最高的老婆：${mostFuckWife.name}，共${
              mostFuckWife.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.fuckCount
            }次\n` : ""}`,
            `${mostDivorceWife.groupData.find(
              (item) => item.groupId === session.channelId.toString()
            )?.divorceCount ? `- 离婚最多的老婆：${mostDivorceWife.name}，共${
              mostDivorceWife.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.divorceCount
            }次\n` : ""}`,
            `${mostNtrFailWife.groupData.find(
              (item) => item.groupId === session.channelId.toString()
            )?.ntrFailCount ? `- 被牛走最多的老婆：${mostNtrFailWife.name}，共${
              mostNtrFailWife.groupData.find(
                (item) => item.groupId === session.channelId.toString()
              )?.ntrFailCount
            }次\n` : ""}`,
          ]);
        } else {
          send([
            h("quote", { id: session.messageId }),
            "本群没有老婆档案",
          ]);
        }
      }
    });
}
