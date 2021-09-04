const lang_data = {
    'zh_tw': '繁體中文',
    'zh_cn': '简体中文',
    'en_us': 'English (United State)',
    'en_uk': 'English (United Kingdom)'
}

function swapKV(jsObj) {
    let newObj = {}
    for (let key in jsObj) {
        newObj[jsObj[key]] = key
    }
    return newObj
}

function decideLanguageFromIndex(index) {
    return lang_data[index] || '繁體中文'
}

function decideLanguageFromValues(index) {
    return swapKV(lang_data)[index] || 'zh_tw'
}

module.exports = {
    swapKV,
    decideLanguageFromIndex,
    decideLanguageFromValues,
    lang_data
}