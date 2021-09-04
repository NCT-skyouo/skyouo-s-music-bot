const BaseExtractor = require('./BaseExtractor');
const Track = require("../Track");

const ytsr = require('youtube-sr');
const spotify = require('spotify-url-info');
const { ms2mmss } = require('../LocalTools');

module.exports = class SpotifyPlaylistExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'spotify-playlist' })
        this.playlist = true;
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            let res = await spotify.getData(query).catch(e => resolve([]))
            return resolve(await Promise.all(res.tracks.items.map(async i => {
                return new Track({
                    title: `${i.track.artists.map(artist => artist.name).join(', ')} - ${i.track.name}`,
                    url: (await ytsr.default.search(`${i.track.artists.map(artist => artist.name).join(', ')} - ${i.track.name}`))[0].url,
                    duration: ms2mmss(i.track.duration_ms),
                    bestThumbnail: { url: i.track.album.images[0].url },
                    author: { name: i.track.artists.map(artist => artist.name).join(', ') },
                    fromPlaylist: true,
                    fromYoutube: false
                }, null, null);
            })));
        })
    }

    extract(track, options) {
        throw new Error('Not implemented');
    }

    validate(query) {
        return [/https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/.test(query)]
    }
}