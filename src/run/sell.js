import colors from "colors";
import authService from "../services/auth.js";
import bananaService from "../services/banana.js";
import userService from "../services/user.js";

console.log(colors.red("⚠️  Lưu ý: Không thể bán chuối đang sử dụng!"));

const modeSell = await bananaService.selectModeSell();

const run = async (user) => {
  const ip = await user.http.checkProxyIP();
  if (ip === -1) {
    user.log.logError("Proxy lỗi, kiểm tra lại kết nối proxy");
    return;
  }
  const statusLogin = await authService.login(user, false, true);
  if (!statusLogin) return;
  const bananaInfo = await authService.getBananaEquipInfo(user);
  const bananas = await bananaService.getBananaList(user);
  await bananaService.handleSell(user, modeSell, bananas, bananaInfo);
};

const users = await userService.loadUser();
for (const [index, user] of users.entries()) {
  await run(user);
}
