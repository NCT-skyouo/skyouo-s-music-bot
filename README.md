# skyouo-s-music-bot-v6

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V76MG57)

English version of the document is coming soon!

## 許可證
本專案使用 Unlicense 和 MIT 開源證書進行開源, 如果您想要二次開發, 可以從中擇一

## 本地依賴庫
本地依賴庫在 libs 資料夾中
- Mojim, 魔鏡歌詞網爬蟲, Unlicense/MIT
- json-db, json 數據庫, Unlicense/MIT
- logger.js, 終端紀錄器, Unlicense/MIT

## 其他本地依賴庫
- [discord-player](https://github.com/Androz2091/discord-player), 原作者為 [Androz2091](https://github.com/Androz2091), MIT
- [notify-bootstrap](https://github.com/the-muda-organization/notify-bootstrap), 原作者為 [The MUDA Organization](https://github.com/the-muda-organization), MIT

## 託管
我們推薦以下數個託管, 可以託管 v6 :)

[DanBotHosting](https://discord.gg/dbh) - 100% CPU, 2GB RAM, 10GB DISK 

[Not.A.Free.Host](https://discord.gg/fEkt7qsUvr) - 100% CPU, 384MB RAM, 2GB DISK

[Not.A.Free.Host+](https://discord.gg/fEkt7qsUvr) - NTD $20 起, 最多 100% CPU, 512MB RAM, 10GB DISK

[SomeHost.xyz](https://discord.gg/AjtMYs5QEM) - 17-37% CPU, 150-512 MB RAM, 512-1200 MB DISK (credit 可用掛機賺取)

## 架設

本文檔假設您已經下載好並解壓縮 zip

### 1. 安裝 Node.js (16.6 以上) 與 Python3

Windows: 
- [Node.js](https://nodejs.org/zh-tw/download/current/)
- [Python3](https://www.python.org/ftp/python/3.9.7/python-3.9.7-amd64.exe)

Linux (Debian 系):
- Node.js:
  - `sudo apt install nodejs npm`
  - `sudo npm i -g n`
  - `sudo n 16`
  - `export PATH="$PATH"`
- Python3:
  - 您的系統應該已經預設安裝 Python3  了
  - 使用 `python3 --version` 查看是否安裝
  - 倘若沒有, 請使用以下指令
  - `sudo apt install python3.9 python-is-python3`

- MacOS:
  - 開啟terminal.app(終端機) 
  - 輸入 `curl -ssL https://raw.githubusercontent.com/XiaoSha-0711/website/main/macos.sh | bash`
  - 輸入您的密碼

- 託管:
  - 大多數的託管應該是 Linux 系統, 只須詢問如何更換 Node.js 版本即可.

### 2. 安裝依賴庫

進入 v6 資料夾

輸入 `npm install` 開始安裝依賴庫

(:warning: 倘若您是 Windows 平台的用戶, 您可能需要額外安裝一些依賴庫, 如果遇到問題可以開 Issues)

### 3. 配置 config.json

首先進入 config 資料夾

編輯 config.json.example

```
token - 機器人的 token, 可以在 https://discord.com/developers/applications 中獲取
download - 是否開啟下載功能, 此選項已廢棄
debug - 是否開啟除錯模式
help - 是否開啟 help 指令
ignore - 忽略特定等級的訊息, 例如 INFO, OK
footer - 在 Embed 下方顯示的訊息
prefix - 默認指令前輟
ownerid - 您的用戶 ID, 開啟開發者模式後, 右鍵點擊自己頭像, 然後選擇 "複製 ID"
disableMentionForPrefix - 是否關閉 @ 機器人時發出的提醒訊息, 默認為 false (否)
mentionForPrefixTitle - @ 機器人時發出的提醒訊息的標題
fetchAllMembers - 是否獲取所有用戶的資料, 此選項已廢棄
searchProvider - 獲取 Youtube 影片資料的方式, Scraping 為 爬取 (非正規方式), API 為 使用官方 API (正規方式, 該選項須填寫 APIKey 設置).
APIKEY - Youtube Data v3 API 的密鑰, 若 searchProvider 填寫 Scraping, 該選項則免填
offical_server - 您的 Discord 伺服器邀請連結, 將顯示在 invite 指令

genius.key - Genius API 的密鑰, 可以在 http://genius.com/api-clients 中獲取

web.enable - 是否開啟 Web Music Control
web.url - 網頁的 url, 格式為 https://example.com
web.clientSecret - 機器人的 secret, 可以在 https://discord.com/developers/applications 中獲取
web.port - 網頁的端口

gmt.offset - 時區調整, 8 為 GMT+8, -2 為 GMT-2, 以此類推

Database 選項

type - 類別, 可選 json, memory, mysql, mongo, redis, replit

json.path - 存儲 json 數據庫的資料夾
json.caching - 是否緩存數據庫資料
json.noRealTimeUpdate - 是否在關閉機器人時才將資料寫入數據庫

mysql.host - 資料庫的 IP / 域名
mysql.user - 資料庫用戶名稱
mysql.password - 資料庫用戶密碼

mongo.url - mongodb 的 url, 請見 atlas

redis.host - 資料庫的 IP / 域名
redis.port - 資料庫的端口
redis.family - 使用 IPv4 或 IPv6
redis.password - 資料庫用戶密碼 

插件權限選項

allowAll - 開啟所有權限 (風險較高)
allowBotAccess - 允許插件訪問機器人實例 bot (風險較高)
allowImportantConfigsAccess - 允許插件訪問 bot.config (風險較高)
allowClientUserAccess - 允許插件訪問 bot.user (風險較高)
allowDatabaseAccess - 允許插件訪問 userDB, songDB, cacheDB
allowCacheAccess - 允許插件訪問 bot.users, bot.channels, bot.guilds (風險較高)
allowCommandAccess - 允許插件註冊並獲取指令 (風險較高)
allowPlayerAccess - 允許插件訪問 bot.player (風險較高)
allowPluginAccess - 允許插件訪問其他插件
allowPluginLoaderAccess - 允許插件訪問插件加載器 (風險較高)
allowListenEvents - 允許插件聆聽事件 (風險較高)
allowEmitEvents - 允許插件觸發事件 (風險較高)
allowRevorkEvents - 允許插件取消聆聽事件
```

然後將 config.json.example 命名為 config.json

### 4. 開啟機器人

使用 `npm start`, 稍後機器人就會開始運行了!

## 還有問題?

如果有問題可以到 https://discord.gg/F3gSD5C
