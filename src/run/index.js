import delayHelper from "../helpers/delay.js";
import authService from "../services/auth.js";
import bananaService from "../services/banana.js";
import { LotteryService } from "../services/lottery.js";
import questService from "../services/quest.js";
import tapService from "../services/tap.js";
import userService from "../services/user.js";

const DELAY_ACC = 6;

const run = async (user) => {
  await delayHelper.delay((user.index - 1) * DELAY_ACC);
  const ip = await user.http.checkProxyIP();
  if (ip === -1) {
    user.log.logError("Proxy lỗi, kiểm tra lại kết nối proxy");
    return;
  }

  let isStart = true;
  while (true) {
    const statusLogin = await authService.login(user, false, !isStart);
    if (!statusLogin) return;
    isStart = false;
    const info = await authService.getUserInfo(user);
    if (!info) return;
    const { quests, progress } = await questService.getQuestList(user);
    await questService.handleQuest(user, quests, progress);
    const lotteryService = new LotteryService();
    await lotteryService.handleLottery(user);
    await bananaService.handleEquip(user, info.equip_banana_id);
    const speedupCount = await tapService.handleTap(
      user,
      info.max_click_count,
      info.today_click_count,
      info.speedup_count
    );
    const ressTime = await tapService.handleSpeedUp(user, speedupCount);
    await delayHelper.delay((ressTime + 2) * 60);
  }
};

console.log("Start.....");
const users = await userService.loadUser();

for (const [index, user] of users.entries()) {
  run(user);
}
