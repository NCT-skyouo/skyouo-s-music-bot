# skyouo-s-music-bot-v5
English Version is coming soon!

## 許可證

本專案使用 Unlicense 和 MIT 開源證書進行開源, 如果您想要二次開發, 可以從中擇一
## 依賴庫

本地依賴庫在 libs 資料夾中
- Mojim, 魔鏡歌詞網爬蟲, Unlicense/MIT
- json-db, json 數據庫, Unlicense/MIT
- [discord-player](https://github.com/Androz2091/discord-player), 原作者為 [Androz2091](https://github.com/Androz2091), NCT-skyouo 添加, 分發, 再許可了該本地庫, Unlicense/MIT
- logger.js, 終端紀錄器, Unlicense/MIT
## 設置

我假設您會了創建機器人, 複製機器人 token 和使用 git...
- 1. 首先下載 [node.js](https://www.nodejs.org/)
- Ubuntu/Debian: 
```bash
sudo apt install nodejs -y
npm install n -g
n 12
```
- 2. git clone 該 專案
- 3. 使用 ``npm install``
- 4. 配置 config/config.json
- 5. 使用 npm start
- 6. 享受你的音樂機器人!

## android 支援
目前 android 支援還在測試階段

步驟 (若已經完成安裝請按照步驟5, 9 啟動機器人):
- 1. 使用 andronix 安裝您喜歡的 linux distro (這裡以 ubuntu/debian 作為示範)
- 2. 啟動您的 linux distro (例 ``./start-ubuntu.sh``)
- 3. 使用 ``apt install git nodejs -y``
- 4. 使用 ``git clone https://github.com/NCT-skyouo/skyouo-s-music-bot``
- 5. 使用 ``cd skyouo-s-music-bot``
- 6. 將 package.json 中的 ``"@discordjs/opus": "0.3.2"`` 替換成 ``"opusscript": "0.0.7"``
- 7. 使用 ``npm i``
- 8. 填配置
- 9. 使用 ``npm start``
