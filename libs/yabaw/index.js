const fetch = require('node-fetch')

class RequestFailedError extends Error {
    constructor(message) {
      super(message)
      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor)
    }
  }

const jsonToUrlEncoded = (json) => {
    const result = []
    for (const jsonKey of Object.keys(json)) {
        const key = encodeURIComponent(jsonKey)
        const value = encodeURIComponent(json[jsonKey])
        result.push(`${key}=${value}`)
    }

    return result.join("&")
}

function getFirefoxUserAgent() {
    let date = new Date()
    let version = ((date.getFullYear() - 2018) * 4 + Math.floor(date.getMonth() / 4) + 58) + ".0"
    return `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:${version}) Gecko/20100101 Firefox/${version}`
}

function getCustomUserAgent() {
    return "YABAW/1.0"
}

module.exports = class {
    constructor() {}

    async search(query, type="video") {
        var data = await fetch('http://api.bilibili.com/x/web-interface/search/all/v2?' + jsonToUrlEncoded({ keyword: query }), {
            method: "GET",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                "User-Agent": getFirefoxUserAgent()
            },
        }).then(r => r.json()).catch(e => { throw e })

        if (data.code !== 0) {
            throw new RequestFailedError("Error Code " + data.code)
        } else {
            var datas = data.data.result.filter(d => d.result_type === type && d.data.length);
            var result = datas[0]?.data || []
            return result;
        }
    }

    async getAnimeInfo(id) {
        var data = await fetch("https://www.biliplus.com/api/bangumi?season=" + id).then(res => res.json())
        if (data.code !== 0) {
            throw new RequestFailedError("Error Code " + data.code)
        } else {
            let { result } = data
            return {
                area: result.area,
                score: result.media.rating.score,
                title: result.media.title,
                sid: result.season_id
            }
        }
    }

    async hotKeyword() {
        var data = await fetch('http://s.search.bilibili.com/main/hotword').then(res => res.json())
        if (data.code !== 0) {
            throw new RequestFailedError("Error Code " + data.code)
        } else {
            var datas = data.list
            return datas.map(l => l.keyword);
        }
    }
}