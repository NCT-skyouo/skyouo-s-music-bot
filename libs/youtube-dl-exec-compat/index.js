// reason I created this file: I'm done with youtube-dl-exec's python version check
// target: compatibile with youtube-dl-exec
// I don't want to change youtube-dl-exec's code, so the code is totally written from scratch by myself

const os = require('os')

const osPlatform = os.platform();
const fs = require('fs');
const cp = require('child_process');

const { fetch, request } = require('undici')

const Constants = {
    YOUTUBE_DL_PATH: __dirname + '/youtube-dl',
    YOUTUBE_DL_GITHUB_RESP: "yt-dlp/yt-dlp"
}

if (!fs.existsSync(Constants.YOUTUBE_DL_PATH)) {
    fetch(`https://api.github.com/repos/${Constants.YOUTUBE_DL_GITHUB_RESP}/releases`, {
        "headers": {
            "Accept": "application/vnd.github.v3+json"
        }
    }).then(res => {
        return res.json();
    }).then(json => {
        const latest = json[0];
        var target = latest.assets.find(a => {
            var check = (osPlatform === 'win32' && os.arch() === 'x64') ? (data) => {
                return data.content_type === 'application/vnd.microsoft.portable-executable' && !data.name.includes('x86.exe')
            } : (osPlatform === 'win32' && os.arch() === 'x86') ? (data) => {
                return data.content_type === 'application/vnd.microsoft.portable-executable' && !data.name.includes('x86.exe')
            } : (osPlatform === 'linux') ? (data) => {
                return data.content_type === 'application/octet-stream' && !data.name.includes('macos')
            } : (osPlatform === 'darwin') ? (data) => {
                return data.content_type === 'application/octet-stream' && data.name.includes('macos') && !data.name.includes('macos.zip')
            } : () => {
                return false;
            };

            return check(a)
        })

        if (target) {
            const url = target.browser_download_url;
            const file = Constants.YOUTUBE_DL_PATH;

            request(url, {
                "headers": {
                    'Accept': 'application/octet-stream',
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
                }
            }).then(res => {
                request(res.headers.location, {
                    'Accept': 'application/octet-stream',
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
                }).then(res2 => {
                    const ws = fs.createWriteStream(file);
                    res2.body.pipe(ws);
                    ws.once('close', () => {
                        fs.chmodSync(file, '755');
                    })
                })
            })
        }
        /*const url = asset.browser_download_url;
        const name = asset.name;
        const ext = name.split('.').pop();
        const file = `${__dirname}/youtube-dl.${ext}`;
        request(url).pipe(fs.createWriteStream(file));
        console.log(`Downloading youtube-dl to ${file}`);
        console.log(`Please wait...`);
        cp.exec(`chmod +x ${file}`);
        console.log(`Downloaded youtube-dl to ${file}`);*/
    }).catch(err => {
        console.log(err);
    });
}

module.exports = (url, args, opt) => {
    return new Promise((resolve, reject) => {
        const child = cp.spawn(__dirname + '', [..._convertYoutubeDlExecArgs(args), url], opt);
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (data) => {
            stdout += data;
        });

        child.stderr.on('data', (data) => {
            stderr += data;
        });

        child.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(stdout));
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(stderr);
            }
        });
    })
}

module.exports.raw = (url, args, opt) => {
    resolve(cp.spawn(__dirname + '', [..._convertYoutubeDlExecArgs(args), url], opt));
}

module.exports.Constants = Constants;

// first, args is JSON like object
// init a varible called results as []
// get keys with Object.keys(args)
// loop the keys as k
// if k.length equals to 1, then push '--' + k, args[k] to results
// if k includes uppercase, convert the uppercase to -lowercase like httpCode to http-code, then push '--' + k, args[k] to results
// After all, return results
function _convertYoutubeDlExecArgs(args) {
    const results = [];
    const keys = Object.keys(args);
    for (let k of keys) {
        if (k.length === 1) {
            results.push('-' + k);
            results.push(args[k]);
        } else if (k.match(/[A-Z]/)) {
            results.push('--' + k.replace(/[A-Z]/g, '-$&').toLowerCase());
            results.push(args[k]);
        } else {
            results.push('--' + k);
            results.push(args[k]);
        }
    }
    return results;
}