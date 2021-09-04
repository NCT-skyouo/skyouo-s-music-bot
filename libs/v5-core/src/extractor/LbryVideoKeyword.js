const Track = require("../Track");
const BaseExtractor = require("./BaseExtractor");
const { ms2mmss, s2ms } = require("../LocalTools")

const LBRY = new (require("../../../lbry-api/lbry"))()


module.exports = class LbryExtractor extends BaseExtractor {

    constructor(options) {
        super({ id: "lbry-keyword" });
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            let info = await LBRY.search(query)
            return resolve(info.map(d => {
                return new Track({
                    title: d.title,
                    description: d.description,
                    duration: ms2mmss(s2ms(d.video.duration)),
                    bestThumbnail: { url: d.thumbnail },
                    author: d.channel,
                    url: d.url,
                    fromPlaylist: false,
                    fromYoutube: false
                }, null, null)
            }));
        });
    }

    extract(track, options) {
        throw new Error('Not implemented');
    }

    validate(query) {
        return [query.startsWith("lbry-keyword:"), query.slice('lbry-keyword:'.length)]
    }
}


/*
{
                title: json['name'],
                description: json['value']['description'],
                languages: json['value']['languages'],
                thumbnail: json['value']['thumbnail']['url'],
                creation_timestamp: json['meta']['creation_timestamp'],
                url: json['canonical_url'].replace(/#/g, ":").replace("lbry://", "https://lbry.tv/"), // lbry.tv is gonna be deprecated
                channel: {
                    name: json.signing_channel.value.title,
                    thumbnail: json.signing_channel.value.thumbnail?.url
                },
                video: {
                    videourl: `https://lbry.tv/$/stream/${json['name']}/${json['claim_id']}/`, // lbry.tv is gonna be deprecated
                    media_type: json['value']['source']['media_type'],
                    duration: json['value']['video']['duration']
                }
            }
*/