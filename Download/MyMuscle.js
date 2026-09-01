// ==UserScript==
// @name         mymusclevideo
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description
// @updateURL
// @downloadURL
// @author       Sam
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @match        https://mymusclevideo.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// ==/UserScript==
(function () {
    const direct_num = 100000;
    const baseUrl = "https://video314.mymusclevideo.com/mmv/media/videos/mp4/";
    const downloadPath = "E:\\Downloads\\Default\\Other\\phvideo\\"

    // 按钮组到底部的距离
    const btnTBPx = 100;
    const btnLRPx = 20;

    const TARGET_DIV_SELECTOR = "#resourceCheckBox"; // 用于展示结果的div选择器
    const TIMEOUT_MS = 4000; // 检测超时时间
    const CONCURRENT_COUNT = 3; // 并发检测数量，防止请求过多被封

    // 全部都检查，否则一条一条检查
    const ALL_CHECK = false

    function init() {
        // 获取所有的标题
        let x = document.getElementsByClassName("title");

        console.log(x.length)
        const regex = /<a href="(.+)?\/(\d+)\/.+\/" title="(.+)">.+<\/a>/;

        for (let i = 0; i < x.length; i++) {
            if (x[i].getAttribute("copied")) continue;

            let outerHTML = x[i].children[0].outerHTML;
            let parent = x[i].parentNode
            let views = parent.querySelector('.views')

            regex.test(outerHTML);
            let num = RegExp.$2;
            let title = RegExp.$3;

            // 生成内容
            let text = title + " (" + num + ") - MyMusclevideo.com \n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + ".mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_240p.mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_360p.mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_480p.mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_720p.mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_1080p.mp4\n"

            // 生成复制按钮样式
            let copy = document.createElement('button');
            copy.className = "t_button";
            copy.innerText = "copy";
            copy.setAttribute("num", num);
            copy.setAttribute("title", title);
            copy.value = text;
            // 点击按钮，拷贝内容到剪切板
            copy.onclick = function () {
                navigator.clipboard.writeText(this.value)
            }

            // 生成复制按钮样式
            let checkB = document.createElement('button');
            checkB.className = "t_button";
            checkB.innerText = "check";
            checkB.setAttribute("num", num);
            checkB.setAttribute("title", title);
            // checkB.value = text;
            // 点击按钮，拷贝内容到剪切板
            checkB.onclick = function () {
                check(title, num)
            }

            // copy.addEventListener('click', function (e) {
            //     copying(this.getAttribute("title"), this.getAttribute("num"))
            // });

            // 在标题前面插入一个空格 和复制按钮
            let span = document.createElement('span');
            span.innerText = " ";

/*            x[i].insertBefore(span, x[i].children[0]);
            x[i].insertBefore(copy, x[i].children[0]);
            x[i].insertBefore(span, x[i].children[0]);
            x[i].insertBefore(checkB, x[i].children[0]);*/

            parent.insertBefore(checkB, views)
            // parent.insertBefore(span, views)
            parent.insertBefore(copy, views)

            x[i].setAttribute("copied", true)
        }
    }

    init();

    const rs = [
        '1080p',
        '720p',
        '480p',
        '360p',
        '240p',
    ]

    async function copying(title, num) {
        let text = `#O,${downloadPath}\n`
        let filename = title + " (" + num + ") - MyMusclevideo.com";
        let url = "";
        Toast(`正在复制中…… (${num}) [${title}]`)

        // 如果是旧的
        if(num < direct_num) {
            url = `${baseUrl}${num}.mp4`
            text += `${filename}.mp4,${url}`
        }
        for(let r of rs) {
            url = `${baseUrl}${num}_${r}.mp4`;
            console.log(`${filename} ${r}.mp4,${url}`)

            await fetch(url, {
                method: "HEAD",
            }).then(res => {
                console.log(res.status)
            })
        }

        // 写入剪切板
        navigator.clipboard.writeText(text)
    }

    async function check(title, num) {
        let filename = title + " (" + num + ") - MyMusclevideo.com";
        let urls = []
        // 如果是旧的
        if(num < direct_num) {
            name = `${filename}`
            url = `${baseUrl}${num}.mp4`
            urls.push({'name': name, 'url': url})
        }
        for(let r of rs) {
            name = `${filename} ${r}`
            url = `${baseUrl}${num}_${r}.mp4`;
            resolution = `${r}`;
            urls.push({'name': name, 'url': url, 'resolution': resolution})
        }

        await batchCheckUrls(urls)
    }

    function showCheck() {
        let checkDiv = document.getElementById('my_checkDiv');
        let listWrap = checkDiv?.querySelector(".res-list");

        // 如果没有这个div 就生成一个
        if (!checkDiv) {
            checkDiv = document.createElement('div');
            checkDiv.id = 'my_checkDiv'
            let divStyle = `z-index:1001;position:fixed;margin:5px;padding:10px;border-radius:1em;` +
                `background-color: white;min-height: 100px; min-width: 100px;` // + `display:none;`
            checkDiv.style.cssText = divStyle;
            checkDiv.style.display = 'block';
            // checkDiv.style.display = 'none';
            checkDiv.className = 'my_check_container'
            checkDiv.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h4 style="margin:0;">资源检测结果</h4>
        <button class="btn_closeCheck" style="padding:2px 8px;cursor:pointer;">关闭</button>
    </div>
    <div class='res-list'></div>
`;
            // 添加样式
            GM_addStyle(`
.my_check_container {
    z-index: 1001;
    position: sticky;
    margin: 5px;
    padding: 10px;
    border-radius: 1em;
    background-color: rgba(128, 128, 128, 0.5);
    display: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    width: fit-content;
}
.my_check_square {
    width: 50px;
    height: 50px;
    background-color: #9a9a9a;
    border-radius: 5px;
    margin: 1px;
    cursor: pointer;
    text-align: center;
    line-height: 50px;
    
}
.my_check_square.active {
    background-color: #3498db;
}
`)

            let x = btnLRPx;
            let y = btnTBPx;

            // 在指定位置显示
            checkDiv.style.left = x + 'px';
            checkDiv.style.right = null
            checkDiv.style.top = null
            // checkDiv.style.bottom = window.innerHeight - y + 'px';
            checkDiv.style.bottom = y + 'px';
            
            // 加到页面上
            document.body.appendChild(checkDiv)
            listWrap = checkDiv.querySelector(".res-list");

            let btnCloseCheck = checkDiv.querySelector(".btn_closeCheck");
            btnCloseCheck.onclick = function () {
                closePopup('my_checkDiv')
            }

            // 添加关闭事件
            // setCloseEvent("my_checkDiv", "btn_closeCheck")

            // 添加点击事件
            // document.body.querySelectorAll('.my_check_square').forEach((item) => {
            //     item.addEventListener('click', (event) => {
            //         const classList = item.className.split(' ');
            //         const udlr = classList[1].replace('my_check_', '')
            //
            //         console.log(udlr, udlr.substring(0, 1), udlr.substring(1))
            //         document.body.querySelectorAll('.my_check_square').forEach((item) => {
            //             item.classList.remove('active');
            //         })
            //
            //         item.classList.add('active');
            //     });
            // });
        } else {
            checkDiv.style.display = 'block';
        }

        return listWrap
    }

    // ESC按键监听
    function escCloseHandler(e) {
        if (e.key === "Escape" || e.keyCode === 27) {
            const box = document.getElementById("my_checkDiv");
            if (box && box.style.display !== "none") {
                closePopup('my_checkDiv')
            }
        }
    }
    document.addEventListener("keydown", escCloseHandler);
    window.addEventListener("beforeunload", () => {
        document.removeEventListener("keydown", escCloseHandler);
    });

    // 设置关闭事件
    function setCloseEvent(id, parentId) {
        // 点击页面其他地方关闭弹窗
        document.addEventListener('click', function () {
            closePopup(id)
        });
    }

    // 关闭弹窗
    function closePopup(id) {
        // console.log('关闭 ', id)
        document.getElementById(id).style.display = 'none';
        let iframe = document.getElementById(`pop_iframe_${id}`);
        if (iframe) {
            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.body.style.display = 'none';
        }
    }

    // 3. GM函数检测单条URL，返回状态码标识
    function checkSingleUrl(url) {
        console.log("checkSingleUrl: ", url)
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "HEAD",
                url: url,
                timeout: TIMEOUT_MS,
                onload: (res) => resolve({ url, code: res.status }),
                onerror: () => resolve({ url, code: 0 }),
                ontimeout: () => resolve({ url, code: -1 })
            });
        });
    }

    // 4. 渲染单条条目（初始加载转圈，检测完成替换状态）
    function createUrlItem(url) {
        const item = document.createElement("div");
        item.className = "res-item";
        item.dataset.url = url.url;
        item.dataset.name = url.name;
        item.dataset.resolution = url.resolution;
        item.innerHTML = `
            <span class="spinner"></span>
            <span class="url-text">${url.name}</span>
            <span class="status-tip">检测中...</span>
        `;
        return item;
    }

    // 更新条目状态
    function updateItemStatus(item, code) {
        const spinner = item.querySelector(".spinner");
        const tip = item.querySelector(".status-tip");
        spinner.remove();
        if (code >= 200 && code < 300) {
            tip.className = "status-ok";
            tip.textContent = "✅ 正常";

            console.log(item.dataset)
            let cb = copyItemCopyButton(item)
            item.appendChild(cb)
        } else if (code === 404) {
            tip.className = "status-404";
            tip.textContent = "❌ 404不存在";
        } else {
            tip.className = "status-error";
            tip.textContent = `⚠️ 异常(${code})`;
        }
    }

    // 生成复制按钮
    function copyItemCopyButton(item) {
        let dataset = item.dataset;

        let text = `#O,${downloadPath}\n`
        text += `${dataset.name}.mp4,${dataset.url}\n`

        let copy = document.createElement('button');
        copy.className = "t_button";
        copy.innerText = "copy";
        copy.value = text;
        // 点击按钮，拷贝内容到剪切板
        copy.onclick = function () {
            navigator.clipboard.writeText(this.value)
            closePopup('my_checkDiv')
        }

        return copy
    }

    // 5. 批量串行分片执行（控制并发，防止大量请求）
    async function batchCheckUrls(urlList) {
        console.log(urlList)
        const listWrap = showCheck();
        listWrap.innerHTML = ""; // 清空上次结果

        // 先全部渲染加载中条目
        const itemMap = new Map();
        urlList.forEach(url => {
            const item = createUrlItem(url);
            itemMap.set(url.url, item);
            listWrap.appendChild(item);
        });

        if(ALL_CHECK) {
            // 分片并发检测
            for (let i = 0; i < urlList.length; i += CONCURRENT_COUNT) {
                const slice = urlList.slice(i, i + CONCURRENT_COUNT);
                const tasks = slice.map(url => checkSingleUrl(url.url));
                const results = await Promise.all(tasks);
                // 更新每条结果
                results.forEach(res => {
                    console.log(res)
                    const item = itemMap.get(res.url);
                    console.log(item)
                    if (item) updateItemStatus(item, res.code);
                });
            }
        } else {
            // 一条一条的检查
            // 逐条循环检测
            let foundValid = false;
            let hitUrl = "";
            for (const url of urlList) {
                // 已经找到可用链接，直接跳出循环，不再检测剩下的
                if (foundValid) break;

                const res = await checkSingleUrl(url.url);
                const item = itemMap.get(url.url);
                updateItemStatus(item, res.code);

                // 判断当前链接正常可用，标记并终止
                if (res.code >= 200 && res.code < 300) {
                    foundValid = true;
                    hitUrl = url;
                    // 在列表顶部增加提示文字
                    const tipDom = document.createElement('div');
                    tipDom.style.color = '#009688';
                    tipDom.style.padding = '8px 0';
                    tipDom.style.fontWeight = 'bold';
                    tipDom.textContent = `✅ 已找到可用资源：${url.resolution}，停止后续检测`;
                    listWrap.prepend(tipDom);
                }
            }

            // 找到有效链接后，把剩下未检测的条目改为“未检测”
            if (foundValid) {
                // 遍历所有条目，没更新状态的标为未检测
                itemMap.forEach((item, url) => {
                    console.log(item)
                    const tip = item.querySelector(".status-tip");
                    if (tip && tip.textContent === "检测中...") {
                        item.querySelector(".spinner").remove();
                        tip.className = "status-error";
                        tip.textContent = "⏸ 未检测";
                    }
                });
            }
        }
    }

    GM_addStyle(`
.t_button {
    border-radius: 1em;
    color: #ecf0f1;
    font-size: 12px;
    font-color: #ecf0f1;
    font-family: "微软雅黑";
    text-decoration: none;
    text-align: center;
    margin-top: 2px;
    margin-right: 5px;
    display: inline-block;
    appearance: none;
    cursor: pointer;
    border: none;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-transition-property: all;
    transition-property: all;
    -webkit-transition-duration: .3s;
    transition-duration: .3s;
    background: linear-gradient(to right, #3e3e3e, #878787);
}

.t_button:hover::after {
    -webkit-box-shadow: 0 0 16px #000000;
    box-shadow: 0 0 16px #000000
}
        .res-check-wrap { margin: 10px 0; padding: 12px; border: 1px solid #eee; border-radius: 8px; }
        .res-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #f5f5f5; word-break: break-all; font-size: 13px; }
        .res-item:last-child { border-bottom: none; }
        .spinner {
            width: 16px; height: 16px;
            border: 2px solid #e0e0e0;
            border-top-color: #2196F3;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .status-ok { color: #009688; font-weight: bold; }
        .status-404 { color: #f44336; font-weight: bold; }
        .status-error { color: #757575; font-weight: bold; }
        .url-text { flex: 1; }
`)

})();
