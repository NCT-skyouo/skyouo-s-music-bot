switch (window.location.search) {
    case "?err=NOT_LOGIN":
        notify("error", "發生錯誤", '您必須要先登入, 才能使用該功能.<br /><br /> <a href="/auth">點我登入.</a>', { delay: 7000 });
        break;
    case "?err=LOGIN_FAILED":
        notify("error", "發生錯誤", '登錄失敗, 請稍後再試一次看看!<br /><br /> <a href="/auth">點我登入.</a>', { delay: 7000 });
        break;
    case "?success=true":
        notify("success", "登入成功", '接下來您就可以進行操作了!', { delay: 7000 });
        break;
}

if (window.location.search.includes("?err=ERROR_WHILE_PLAYING_SONG")) {
    var message = new URLSearchParams(window.location.search).get('message');
    notify("error", "播放歌曲時發生錯誤", filterXSS(message), { delay: 7000 });
}

if (window.location.search.includes("?playing=true")) {
    var urlParam = new URLSearchParams(window.location.search)
    var playing_title = urlParam.get('title')
    var playing_url = urlParam.get('url')
    var playing_author = urlParam.get('author')
    var playing_duration = urlParam.get('duration')
    var playing_requester = urlParam.get('requester')
    if (!playing_duration || !playing_title || !playing_url || !playing_author) {
        notify("error", "發生錯誤", '發生錯誤, 請稍後再試一次看看!', { delay: 7000 });
    } else {
        notify("success", "目前播放", `正在播放 ${filterXSS(playing_requester)} 添加的歌曲: <br><b><a href="${filterXSS(playing_url)}"> ${filterXSS(playing_title)}</a></b><br><br>時長: ${filterXSS(playing_duration)}`, { delay: 7000 });
    }
    var newURL = location.href.split("?")[0];
    window.history.pushState('object', document.title, newURL);
    // XSS Filter
}

if (window.location.search.includes("?addtoqueue=true")) {
    var urlParam = new URLSearchParams(window.location.search)
    var playing_title = urlParam.get('title')
    var playing_url = urlParam.get('url')
    var playing_duration = urlParam.get('duration')
    if (!playing_duration || !playing_title || !playing_url) {
        notify("error", "發生錯誤", '發生錯誤, 請稍後再試一次看看!', { delay: 7000 });
    } else {
        notify("success", "添加歌曲", `您添加了 <a href="${filterXSS(playing_url)}">${filterXSS(playing_title)}</a> 至隊列裡!<br><br>時長: ${filterXSS(playing_duration)}`, { delay: 7000 });
    }
    var newURL = location.href.split("?")[0];
    window.history.pushState('object', document.title, newURL);
    // XSS Filter
}