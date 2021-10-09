const { fetch } = require('undici')

class LBRY {
    async search(query) {
        // 感謝 gohchengxian 提供代碼
        var data = [];

        //获取验证params 
        var html = await fetch(`https://lighthouse.lbry.com/search?s=${encodeURIComponent(query)}&size=20&from=0&claimType=file,channel&nsfw=false`);
        var json = await html.json();

        //转换成lbry 内置url
        json.forEach(d => {
            data.push(`lbry://${d.name}#${d.claimId}`);
        });

        //获取影片数据
        const jsons = await fetch(`https://api.lbry.tv/api/v1/proxy?m=resolve`, {
            method: "POST",
            body: JSON.stringify({
                id: Date.now(),
                jsonrpc: "2.0",
                method: "resolve",
                params: { include_purchase_receipt: true, urls: data }
            }),
            headers: {
                'content-type': 'application/json',
                "accept-language": "zh-TW,en-US;q=0.9,zh-CN;q=0.8,zh;q=0.7"
            }

        }).then(newjson => newjson.json());

        //search result 过滤
        var datas = [];
        data.forEach(d => {
            var json = jsons['result'][d];
            if (json.value.stream_type !== 'video') return;
            datas.push({
                title: json['name'], 
                description: json.value?.description, 
                languages: json.value?.languages, 
                thumbnail: json.value?.thumbnail?.url, 
                creation_timestamp: json.meta?.creation_timestamp, 
                url: json['canonical_url'].replace(/#/g, ":").replace("lbry://", "https://lbry.tv/"), // lbry.tv is gonna be deprecated soon - now redirect to odyssee.com (2021/08/22)
                channel: { 
                    name: json.signing_channel?.value?.title, 
                    thumbnail: json.signing_channel?.value?.thumbnail?.url
                }, 
                video: { 
                    videourl: `https://lbry.tv/$/stream/${json['name']}/${json['claim_id']}/`, // lbry.tv is gonna be deprecated soon - now redirect to odyssee.com (2021/08/22)
                    media_type: json.value?.source?.media_type, 
                    duration: json.value?.video?.duration 
                } 
            })
        })

        return datas;
    }

    // check if a url is a lbry video url
    isVideo(url) {
        return /https?:\/\/(?:www\.)?(?:lbry\.tv|odysee\.com)\/@.+:.+\/.+:.+/.test(url);
    }
}

module.exports = LBRY;