const BaseExtractor = require('./BaseExtractor');

const BilibiliVideo = require('./BiliBiliVideo')
const BilibiliAnime = require('./BiliBiliAnime')
const BilibiliVideoKW = require('./BiliBiliVideoKeyword')
const BilibiliAnimeKW = require('./BiliBiliAnimeKeyword')
const LBRYVideo = require('./LbryVideo')
const LBRYVideoKW = require('./LbryVideoKeyword')
const NeteaseSong = require('./NeteaseSong')
const NeteaseSongKW = require('./NeteaseSongKeyword')
const NeteasePlaylist = require('./NeteasePlaylist')
const SoundCloudSong = require('./SoundCloudSong')
const SoundCloudSongKW = require('./SoundCloudSongKeyword')
const SoundCloudPlaylist = require('./SoundCloudPlaylist')
const SpotifySong = require('./SpotifySong')
const SpotifyPlaylist = require('./SpotifyPlaylist');
const TiktokVideo = require('./TiktokVideo')
const YoutubeVideo = require('./YoutubeVideo')
const YoutubeVideoKW = require('./YoutubeVideoKeywords')
const YoutubePlaylist = require('./YoutubePlaylist')
const YoutubeRelated = require('./YoutubeRelated');

module.exports = class Extractors {
    constructor() {
        this.extractors = [];
        this._genericExtractor = null;
        this.register(new BilibiliVideo());
        this.register(new BilibiliVideoKW());
        this.register(new BilibiliAnime());
        this.register(new BilibiliAnimeKW());
        this.register(new LBRYVideo());
        this.register(new LBRYVideoKW());
        this.register(new NeteaseSong());
        this.register(new NeteaseSongKW());
        this.register(new NeteasePlaylist());
        this.register(new SoundCloudSong());
        this.register(new SoundCloudSongKW());
        this.register(new SoundCloudPlaylist());
        this.register(new SpotifySong());
        this.register(new SpotifyPlaylist());
        this.register(new TiktokVideo());
        this.register(new YoutubeVideo());
        this.register(new YoutubeVideoKW());
        this.register(new YoutubePlaylist());
        this.register(new YoutubeRelated());
    }

    register(extractor) {
        if (!(extractor instanceof BaseExtractor)) throw new Error('Extractor must be an instance of BaseExtractor');
        if (extractor.generic) return this.overrideGeneric(extractor);
        return this.extractors.push(extractor);
    }

    overrideGeneric(extractor) {
        if (!(extractor instanceof BaseExtractor)) throw new Error('Extractor must be an instance of BaseExtractor');
        if (!extractor.generic) throw new Error('Extractor must be generic');
        this._genericExtractor = extractor;
    }

    searchTrack(query, options) {
        return new Promise((resolve, reject) => {
            var extractor = this.extractors.find(extractor => {
                var isMatch = extractor.validate(query);
                if (isMatch[0]) {
                    if (isMatch[1]) query = isMatch[1];
                    return true;
                } else return false;
            })

            if (!extractor) extractor = this._genericExtractor;

            if (!extractor) throw new Error('No extractor found that fits for video');

            return extractor.search(query, options).then(resolve).catch(reject);
        })
    }

    extractTrack(track, options) {
        var extractor = this.extractors.find(extractor => {
            var isMatch = extractor.validate(track.url);
            if (isMatch[0]) {
                if (isMatch[1]) track = isMatch[1];
                return true;
            } else return false;
        })

        if (!extractor) extractor = this._genericExtractor;

        if (!extractor) throw new Error('No extractor found that fits for video');

        return extractor.extract(track, options)
    }

    getId(query) {
        var extractor = this.extractors.find(extractor => {
            var isMatch = extractor.validate(query);
            if (isMatch[0]) {
                if (isMatch[1]) track = isMatch[1];
                return true;
            } else return false;
        })

        if (!extractor) extractor = this._genericExtractor;

        return extractor.id;
    }
}