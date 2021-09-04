module.exports = class BaseExtractor {
    constructor(options) {
        this.id = options.id;
    }

    search(query, options) {
        throw new Error('Not implemented');
    }

    extract(track, options) {
        throw new Error('Not implemented');
    }

    validate(query) {
        throw new Error('Not implemented');
    }
}