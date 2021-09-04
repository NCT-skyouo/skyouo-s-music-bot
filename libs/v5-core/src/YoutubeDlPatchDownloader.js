const os = require('os');
const request = require('request');
const fs = require('fs');
const ytdlPath = require("youtube-dl-exec/src/constants").YOUTUBE_DL_PATH;

function getFirefoxUserAgent() {
    let date = new Date()
    let version = ((date.getFullYear() - 2018) * 4 + Math.floor(date.getMonth() / 4) + 58) + ".0"
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version}) Gecko/20100101 Firefox/${version}`
  }

const existsPath = process.cwd() + "/.ignore_ytdl_patch_download"
if (!fs.existsSync(existsPath)) {
    if (os.platform() === "linux" || os.platform() === "darwin") {
        request.get("https://kristen.skyouo.tech/archives/yt-dlp", { headers: { "User-Agent": getFirefoxUserAgent() } }).pipe(fs.createWriteStream(ytdlPath)).on("close", () => {
            fs.chmodSync(ytdlPath, "755")
        });
    } else if (os.platform() === "win32") {
        switch (os.arch()) {
            case "x64":
                request("https://www.dropbox.com/s/pytoc6em0pb8b74/yt-dlp.exe?dl=1").pipe(fs.createWriteStream(ytdlPath));
                fs.chmodSync(ytdlPath, "755")
                break;
            case "x32":
                request("https://www.dropbox.com/s/oiqvwt2diiu6o1h/yt-dlp_x86.exe?dl=1").pipe(fs.createWriteStream(ytdlPath));
                fs.chmodSync(ytdlPath, "755")
                break;
            default: // arm
                throw new Error("Unsupported architecture: " + os.arch());
        }
    }

    fs.writeFileSync(existsPath, "")
}