// ==UserScript==
// @name         GM论坛每日自动签到
// @id           GM_forum_daily_sign.js
// @description  右下角有小菜单栏速通签到日志投票，一键批量送勋章，延时回帖
// @version      V1.1
// @license      GNU General Public License v3.0
// @match        https://www.gamemale.com/forum.php*
// @match        https://www.gamemale.com/k_misign-sign.html
// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @connect      *
// @require      https://code.jquery.com/jquery-2.1.4.min.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/datetime.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// ==/UserScript==

const GM_KEY = "GM_forum_daily_sign";
const regex = /<root><!\[CDATA\[(.+)]]><\/root>/g;

(function () {
    const formhash = document.querySelector('input[name="formhash"]')?.value

    const url = `https://www.gamemale.com/plugin.php?id=k_misign:sign&operation=qiandao&formhash=${formhash}&format=empty`

    const today = formatDate(new Date(), 'YYYYMMdd')

    async function init() {
        console.log("formhash : ", formhash)
        let data = await GM_getValue(GM_KEY, {})
        if(!data[today]) {
            const resp = await sign()
            console.log(resp)
            if(resp.status == 200) {
                // 调用成功
                if(resp.responseText.indexOf("今日已签") > 0) {
                    console.log("今日已签")
                    console.log(resp.responseXML.firstChild.textContent)
                } else {
                    console.log(resp.responseText)
                }
                data[today] = resp.responseText
                await GM_setValue(GM_KEY, data)
                console.log("签到成功！", resp.responseText)
                Toast(`签到成功！ ${resp.responseXML?.firstChild?.textContent}`, null, null, 24)
            } else {
                console.log("签到失败！")
                Toast("签到失败！")
            }
        } else {
            console.log("今天已经签过：", data[today])
            if(window.location.pathname.startsWith('/k_misign-sign.html')) {
                Toast(`今天已经签过`, 3000, null, 24)
            }
        }
    }

    init();

    async function sign() {
        console.log("sign: ", url)
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                timeout: 2000,
                onload: function (response) {
                    try {
                        resolve(response);
                    }
                    catch (err) {
                        reject(err);
                    }
                },
                onerror: function (err) {
                    logger('getTranslationText()', 'reject', err);
                    reject(err);
                },
                ontimeout: () => resolve({ url, code: -1 })
            });
        });
    }

})();