 // ==UserScript==
// @name         GM论坛回复记录
// @namespace    http://tampermonkey.net/
// @version      V1.1
// @description  GM_forum_Reply_Record
// @updateURL    https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/GM_forum_Reply_Record.js
// @downloadURL  https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/GM_forum_Reply_Record.js
// @author       Sam
// @match        https://www.gamemale.com/**
// @exclude      https://www.gamemale.com/search.php*
// @exclude      https://www.gamemale.com/home.php?mod=editor*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/datetime.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// @resource tableCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/table.css
// @resource popupCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/popup.css
// @resource timerJS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/test/updateTimer.js
// ==/UserScript==
const btnSwitchName = "btnSwitch"
const btnSizeName = "btnSize"

// 页面类型
const pageTypeMatch = {
    // 帖子
    "thread": [
        /(\w*)?\/thread-(\d*)-(\d*)-(\d*).html(.+)?$/,
        /(\w*)?\/forum.php\?mod=viewthread\&tid=(\d*)(.+)?$/]
}

const buttonGroup = {
    "查看今日奖励": {"name": "ReplyAward", "func": "ReplyAward"},
    "今天还未回复过": {"name": "NotReplied", "func": "NotReplied", "color": "gray"},
    "查看往期奖励": {"name": "ReplyAward_history", "func": "ReplyAward_history", color: "orange"},
    "查看回复板块": {"name": "ReplyPlate", "func": "ReplyPlate"},
    "看看系统奖励": {"name": "SystemAward", "func": "SystemAward", "color": "blue"},
    "跳到附件位置": {"name": "LocateAttach", "func": "LocateAttach", "color": "light-purple", pageType: "thread"},
    "跳到评分位置": {"name": "LocateRate", "func": "LocateRate", "color": "light-purple", pageType: "thread"},
    "跳到回复位置": {"name": "LocateReply", "func": "LocateReply", "color": "purple", pageType: "thread"},
    // "测试": {"name": "test", "func": "test", "color": "gray"},
    // "测试2": {"name": "test2", "func": "test2", "color": "gray"},
    // "清除": {"name": "clean", "func": "clean", "color": "gray"},
    "设置": {"name": "config", "func": "config", "color": "black"},
    // "显示位置": {"name": "showPosition", "func": "showPosition"},
    // "提示": {"name": "config", "func": "toast", "color": "black"},
    "回复倒计时": {name: "ReplyCD", type: "afterCreate", func: "ReplyCD", color: "translucence"},
};

const configButGroup = {
    "显示位置": {"name": "showPosition", "func": "showPosition"},
    "按钮大小": {"name": "changeSize", "func": "changeSize"},
}
const configBtnGroupId = 'my_configBtnGroup'

const nextSizeMap = {
    "large": "medium",
    "medium": "small",
    "small": "xsmall",
    "xsmall": "large",
}

// 按钮组到底部的距离
const btnTBPx = 100;
const btnLRPx = 20;

// 表位置
const trHeight = 30;
const tableWidth = 640;
const tableHeight = 800;

const key_prefix = 'replyAward_';
const awardGroup = {
    '金币': {color: '#ffd700', emoji: '🪙'},
    '血液': {color: '#ff0000', emoji: '🩸'},
    '旅程': {color: '#008000', emoji: '🌍'},
    '咒术': {color: '#a279f4', emoji: '🔮'},
    '知识': {color: '#0000ff', emoji: '📖'},
    '堕落': {color: '#000000', emoji: '🖤'},
};
const awardRate = {
    '金币': 1,
    '血液': 1,
    '旅程': 30,
    '咒术': 5,
    '知识': 50,
    '堕落': 0,
    '灵魂': 1000,
};
const awardUnit = {
    '旅程': 'km',
    '金币': '枚',
    '血液': '滴',
    '咒术': '卷',
    '知识': '点',
    '堕落': '黑',
    '灵魂': '只',
}

const ReplyPlate_key = 'ReplyPlate';
const ReplyPlate_limit = {
    "五花八门": {"limit_type": "24H", "times": 10},
    "C O D E": {"limit_type": "24H", "times": 10},
    "男色图影": {"limit_type": "24H", "times": 15},
    "ALL": {"limit_type": "1H", "times": 99},
};

(function () {
    const targetNode = document.body;

    // 监听页面变化
    const config = {childList: true, subtree: true};
    const callback = function (mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeName === "DIV" || node.nodeName === "SECTION") {
                        console.log('全局 DOM 发生变化');
                        if (!node) {
                            continue;
                        }

                        // 回复奖励
                        if (node.id == "ntcwin" || node.className == "ntcwin") {
                            if(node.classList.contains('test')) {
                                console.log("只是测试")
                            } else {
                                console.log("检测到回复奖励触发~")
                                console.log(node.outerHTML);
                                save(node)
                            }
                        }
                    }
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // 方法组
    const funcs = {
        ReplyAward() {
            let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`
            if (!localStorage.getItem(key)) {
                Toast("没有今天的回复记录！", 3000)
                return;
            }
        },
        ReplyAward_history() {
            let key = `${key_prefix}keys`
            if (!localStorage.getItem(key)) {
                Toast("没有回复记录！", 3000)
                return;
            }
        },
        NotReplied() {
            Toast("别点了，快去回复吧~", 1000)
        },
        ReplyPlate() {
        },
        SystemAward() {
            myWindow = window.open('/home.php?mod=spacecp&ac=credit&op=log&suboperation=creditrulelog');
        },
        LocateAttach() {
            locateAttach();
        },
        LocateRate() {
            locateRate();
        },
        LocateReply() {
            LocateReply();
        },
        test() {
            test()
        },
        test2() {
            test2()
        },
        clean() {
            clean()
        },
        config(event) {
            // 生成一套按钮组
            console.log(`点击的位置是 X=${event.clientX},Y=${event.clientY}`)
            const configBtnGroup = document.getElementById(configBtnGroupId);
            if (configBtnGroup) {
                showDiv(configBtnGroup, event.clientX, event.clientY)
            }
        },
        showPosition(event) {
            let positionDiv = document.getElementById('my_positionDiv');

            // 如果没有这个div 就生成一个
            if (!positionDiv) {
                positionDiv = document.createElement('div');
                positionDiv.id = 'my_positionDiv'
                let divStyle = `z-index:1001;position:fixed;margin:5px;padding:10px;border-radius:1em;` +
                    `background-color: rgba(128, 128, 128, 0.5);` + `display:none;`
                positionDiv.style.cssText = divStyle;
                positionDiv.style.display = 'none';
                positionDiv.className = 'my_position_container'
                positionDiv.innerHTML = `
<div class="my_position_square my_position_ul">↖</div>
<div class="my_position_square my_position_ur">↗</div>
<div class="my_position_square my_position_dl">↙</div>
<div class="my_position_square my_position_dr">↘</div>
`

                // 添加样式
                GM_addStyle(`
.my_position_container {
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
.my_position_square {
    width: 50px;
    height: 50px;
    background-color: #9a9a9a;
    border-radius: 5px;
    margin: 1px;
    cursor: pointer;
    text-align: center;
    line-height: 50px;
    
}
.my_position_square.active {
    background-color: #3498db;
}
`)

                // 加到页面上
                document.body.appendChild(positionDiv)

                // 添加关闭事件
                setCloseEvent("my_positionDiv", "btn_showPosition")

                // 添加点击事件
                document.body.querySelectorAll('.my_position_square').forEach((item) => {
                    item.addEventListener('click', (event) => {
                        const classList = item.className.split(' ');
                        const udlr = classList[1].replace('my_position_', '')

                        console.log(udlr, udlr.substring(0, 1), udlr.substring(1))
                        document.body.querySelectorAll('.my_position_square').forEach((item) => {
                            item.classList.remove('active');
                        })

                        item.classList.add('active');

                        // 切换位置
                        changePosition(udlr.substring(0, 1), udlr.substring(1));
                    });
                });
            }

            positionDiv.style.display = 'grid'; // 临时显示以应用网格
            if (positionDiv) {
                // 在指定位置显示
                showDiv(positionDiv, event.clientX, event.clientY)

                // left or right
                const lr = GM_getValue("lr") || "r"
                // up or down
                const ud = GM_getValue("ud") || "u"

                let name = `.my_position_square.my_position_${ud}${lr}`
                console.log(name)
                // 指定的亮起来
                document.body.querySelector(name).classList.add("active")
            }

        },
        changeSize() {
            document.querySelectorAll('.my_button').forEach(el => {
                if (el.classList.contains('small')) {
                    el.classList.remove('small')
                    el.classList.add('large')
                    GM_setValue(btnSizeName, 'large')
                    localStorage.setItem(btnSizeName, 'large')
                } else if(el.classList.contains('medium')) {
                    el.classList.remove('medium')
                    el.classList.add('small')
                    GM_setValue(btnSizeName, 'small')
                    localStorage.setItem(btnSizeName, 'small')
                } else {
                    el.classList.remove('large')
                    el.classList.add('medium')
                    GM_setValue(btnSizeName, 'medium')
                    localStorage.setItem(btnSizeName, 'medium')
                }
            })
        },
        toast() {
          Toast("提示", 10000)
        },
        ReplyCD() {
            console.log("ReplyCD")
            // 回复冷却
            const id = "btn_ReplyCD";
            const button = document.getElementById(id);
            showReplyCD(button);
        },
    }

    // 显示DIV
    function showDiv(div, x, y) {
        console.log('显示 ', div.id)

        // left or right
        const lr = GM_getValue("lr") || "r"
        // up or down
        const ud = GM_getValue("ud") || "u"

        // 如果弹窗已显示，则进行关闭
        if (div.style.display != 'none' && div.style.display != 'grid') {
            div.style.display = 'none';
            return;
        }

        // 整体在右边，就向左边显示
        if (lr == 'r') {

            div.style.left = null
            div.style.right = window.innerWidth - x + 'px';
        } else {
            div.style.left = x + 'px';
            div.style.right = null
        }

        // 整体在上面，就向下面显示
        if (ud == 'u') {
            div.style.top = y + 'px';
            div.style.bottom = null
        } else {
            div.style.top = null
            div.style.bottom = window.innerHeight - y + 'px';
        }

        // 显示配置按钮组
        if (div.style.display != 'grid') {
            div.style.display = 'block';
        }
    }

    // 保存奖励收益到本地缓存空间
    function save(node) {
        const now = new Date();
        let today_str = formatDate(now, 'YYYYMMdd');

        let text = node.innerText.trim();
        // 过滤部分消息条件
        if (text.indexOf('抱歉') > -1 ||
            text.indexOf('已发送') > -1
        ) {
            return
        }
        let key = `${key_prefix}${today_str}`
        let sum_key = `${key}_sum`
        let keys_key = `${key_prefix}keys`

        // 从浏览器缓存中获取
        let ra = JSON.parse(localStorage.getItem(key) || '[]');
        let ra_sum = JSON.parse(localStorage.getItem(sum_key) || '{}');
        let ra_keys = JSON.parse(localStorage.getItem(keys_key) || '{}');

        let map = {
            "text": text,
            "date": now
        }

        // 计算当天每个资源点的合计数量
        let spans = node.querySelectorAll('span')
        if (spans.length > 0) {
            for (const span of spans) {
                if (span && span.childNodes && span.childNodes.length >= 2) {
                    let name = span.childNodes[0].textContent
                    let value = span.childNodes[1].textContent

                    map[name] = value

                    // 合计
                    if (value) {
                        let _value = (ra_sum[name] ? ra_sum[name] : 0)
                        _value += Number(value)
                        ra_sum[name] = _value
                    }
                }
            }
        }

        ra.push(map);

        // 保存到浏览器缓存中
        localStorage.setItem(key, JSON.stringify(ra));
        localStorage.setItem(sum_key, JSON.stringify(ra_sum));

        // 只有回复成功才重置上次回复时间
        if (text.indexOf('发表回复') > -1) {
            localStorage.setItem('replyAward_lastTime', JSON.stringify(map)); // 保存上次的时间
        }

        // 如果没有当天的记录，就新增一条，方便后面遍历删除
        if (!ra_keys[today_str]) {
            ra_keys[today_str] = now;
            localStorage.setItem(keys_key, JSON.stringify(ra_keys));
        }

        saveReplyPlate(now)
    }

    // 保存回复的板块积累数量
    function saveReplyPlate(date) {
        if (!date) {
            date = new Date();
        }
        const keywords = document.querySelector('meta[name="keywords"]')
        const contentValue = keywords?.content; // 使用可选链避免空值报错

        if (contentValue) {
            // 板块名
            const plateName = contentValue.split(',')[0]
            console.log(plateName);

            // https://www.gamemale.com/thread-${tid}-1-1.html
            // https://www.gamemale.com/forum.php?mod=viewthread&tid=149849&ctid=486

            let matchArray = window.location.href.match(/(\w*)?\/thread-(\d*)-(\d*)-(\d*).html(.+)?$/);
            if(!matchArray) {
                matchArray = window.location.href.match(/(\w*)?\/forum.php\?mod=viewthread\&tid=(\d*)(.+)?$/);
            }
            // 帖子id
            let tid = matchArray[2];
            console.log(tid)

            // 主题
            const subject = targetNode.querySelector('#thread_subject');

            let ReplyPlateObj = JSON.parse(localStorage.getItem(ReplyPlate_key) || '{}');
            let reply = {
                "plateName": plateName,
                "tid": tid,
                "subject": subject.innerText,
                "date": date
            }

            // 如果有限制，就加入相应的列表中
            if (ReplyPlate_limit[plateName]) {
                let plateReplies = ReplyPlateObj[plateName] || []

                plateReplies.push(reply)
                plateReplies = clearExpiredData(ReplyPlate_limit[plateName].limit_type, ReplyPlate_limit[plateName].times, plateReplies);

                ReplyPlateObj[plateName] = plateReplies;
            }

            // 加入全部回复列表
            let allReplies = ReplyPlateObj['ALL'] || [];
            allReplies.push(reply)
            allReplies = clearExpiredData(ReplyPlate_limit['ALL'].limit_type, ReplyPlate_limit['ALL'].times, allReplies);
            ReplyPlateObj['ALL'] = allReplies;
            localStorage.setItem(ReplyPlate_key, JSON.stringify(ReplyPlateObj))
            console.log(ReplyPlateObj)
        }
    }

    function clearExpiredData(limit_type, limit_times, list) {
        // 如果限制次数是24H的话，那就清除24H前的数据
        if (limit_type == '24H') {
            // 时间戳
            const ts = Date.now();
            const onedayms = 24 * 60 * 60 * 1000;
            const y_ts = ts - onedayms;

            const newList = list.filter(item => {
                return (new Date(item.date)).getTime() > y_ts
            });
            return newList;
        } else if (limit_type == '1H') {
            // 时间戳
            const ts = Date.now();
            const onedayms = 1 * 60 * 60 * 1000;
            const y_ts = ts - onedayms;

            const newList = list.filter(item => {
                return (new Date(item.date)).getTime() > y_ts
            });
            return newList;
        }

        return list
    }

    function test() {
        saveReplyPlate()
    }

    function test2() {
        const rp = JSON.parse(localStorage.getItem(ReplyPlate_key) || '{}');
        for (let name in ReplyPlate_limit) {
            if (rp[name]) {
                let data = clearExpiredData(ReplyPlate_limit[name].limit_type, ReplyPlate_limit[name].times, rp[name]);
                console.log("清除前：", rp[name].length, "清除后：", data.length)
                console.log(data)
            }
        }
    }

    // 初始化按钮
    function init() {
        let afterCreateFuncs = [];

        // left or right
        const lr = GM_getValue("lr") || "r"
        // up or down
        const ud = GM_getValue("ud") || "u"
        // large or small
        const size = GM_getValue(btnSizeName) || "large"

        let body = document.body;
        let div = document.createElement('div');
        div.id = "my_buttonGroup"
        div.style.cssText = `z-index:999;position:fixed;margin:10px;pointer-events: none;` +
            `${lr == "l" ? "left" : "right"}:${btnLRPx}px;${ud == "d" ? "bottom" : "top"}:${btnTBPx}px;` +
            `text-align:${lr == "l" ? "left" : "right"}`

        // 不显示
        const btnSwitch = GM_getValue(btnSwitchName);
        if (!btnSwitch) {
            div.style.display = "none";
        }

        let btnStyle = `z-index:999;position:sticky;margin:5px;pointer-events: auto;`

        let i = 1
        let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`

        for (let buttonName in buttonGroup) {
            let buttonConfig = buttonGroup[buttonName];

            // 如果有页面类型要求的话，需要判断页面类型来控制按钮是否展示
            if(buttonConfig.pageType) {
                const pageType = buttonConfig.pageType;
                const matches = pageTypeMatch[pageType]
                if(matches) {
                    let passed = false;
                    let href = location.href;

                    console.log(matches)
                    for (let _match of matches) {
                        if(href.match(_match)) {
                            console.log(href)
                            console.log(_match + "")
                            console.log("匹配，通过")
                            passed = true
                            break;
                        }
                    }

                    if(!passed) {
                        continue
                    }
                }
            }

            if (buttonName === "查看今日奖励") {
                // 需要有数据才显示按钮
                if (!localStorage.getItem(key)) {
                    continue
                }
            }
            if (buttonName === "今天还未回复过") {
                // 需要无数据才显示按钮
                if (localStorage.getItem(key)) {
                    continue
                }
            }
            let btn = document.createElement('button');
            btn.id = "btn_" + buttonConfig.func;
            btn.className = `my_button ${(buttonConfig.color || 'red')} ${(size == "small" ? "small" : (size == "medium" ? "medium" : "large"))}`

            btn.style.cssText = btnStyle;

            btn.textContent = buttonName;

            if(buttonConfig.type == 'auto') {
                console.log("auto")
                // 自动执行的类型
                funcs[buttonConfig.func]();
            } else if(buttonConfig.type == 'afterCreate') {
                afterCreateFuncs.push(buttonConfig.func)
            } else {
                // 点击触发的类型
                btn.addEventListener('click', (event) => {
                    funcs[buttonConfig.func](event);
                });
            }

            if (!btn.textContent) {
                continue
            }

            div.appendChild(btn);
            div.appendChild(document.createElement('br'));
            i += 1
        }

        body.appendChild(div);

        // 设置按钮组
        let configDiv = document.createElement('div');
        let configDivStyle = `z-index:1000;position:fixed;margin:5px;padding:10px;border-radius:1em;` +
            `background-color: rgba(128, 128, 128, 0.5);` + `display:none;`
        let configBtnstyle = `z-index:1000;position:sticky;margin:5px;`

        configDiv.id = configBtnGroupId;
        configDiv.style.cssText = configDivStyle;
        for (let buttonName in configButGroup) {
            let btn = document.createElement('button');
            btn.id = "btn_" + configButGroup[buttonName].func;
            btn.className = `my_button ${(configButGroup[buttonName].color || 'red')} ${(size == "small" ? "small" : (size == "medium" ? "medium" : "large"))}`

            btn.style.cssText = configBtnstyle;

            btn.textContent = buttonName;
            btn.addEventListener('click', (event) => {
                funcs[configButGroup[buttonName].func](event);
            });

            if (!btn.textContent) {
                continue
            }

            configDiv.appendChild(btn);
            configDiv.appendChild(document.createElement('br'));

            i += 1
        }

        body.appendChild(configDiv);
        setCloseEvent(configBtnGroupId, "btn_config")

        // 如果有创建后才执行的方法，此时进行执行
        if(afterCreateFuncs.length > 0) {
            afterCreateFuncs.forEach(item => {
                funcs[item]();
            })
        }
    }

    GM_registerMenuCommand("左右切换", () => {
        const lrSwitch = GM_getValue("lr");
        console.log(lrSwitch);

        changeLR(lrSwitch)
    }, "l");
    GM_registerMenuCommand("上下切换", () => {
        const udSwitch = GM_getValue("ud");
        console.log(udSwitch);

        changeUD(udSwitch)
    }, "u");
    GM_registerMenuCommand("显隐切换", () => {
        const btnSwitch = GM_getValue(btnSwitchName);
        GM_setValue(btnSwitchName, !btnSwitch)

        if (btnSwitch) {
            document.querySelector('#my_buttonGroup').style.display = 'none';
        } else {
            document.querySelector('#my_buttonGroup').style.display = 'block';
        }
    }, "h");
    init();

    // 把收益json 转换成 html table
    function raToHtml(_ras) {
        let ras = _ras.reverse();
        let sum = {}
        let lastReplyTime = new Date();
        if (ras[0]) {
            lastReplyTime = new Date(ras[0].date);
        }
        ras = ras.filter(item => {
            return item.text.indexOf('发表回复') >= 0
        })

        let html = []
        html.push('<html>')

        const tableCSS = GM_getResourceText("tableCSS");
        html.push(`
  <head><style>${tableCSS}
  tr {
    height: ${trHeight}px;
  }
  </style></head>`)
        html.push(
            `<body>
<input style="display: none;" id="lastReplyTime" value="${lastReplyTime}"/>
<table><caption>${formatDate(new Date(), 'YYYY年MM月DD日')} 共计回复 <span class="emphasis">${ras.length}</span> 次</caption>
<caption id="passTime">距离上次回复已过去： <span id="timer" class="emphasis">00:00:00</span> </caption>
<tbody>`)

        // 表头
        html.push('<tr><th>回复时间</th>')
        for (let _th in awardGroup) {
            html.push(`<th style="color:${awardGroup[_th]["color"]};">${_th}${awardGroup[_th]["emoji"]}</th>`)
        }
        html.push('<th class="">收益</th>')
        html.push('<th class="ellipsis-column t-text">文本</th></tr>')
 
        // awardGroup
        let last = undefined
        ras.forEach((ra, index) => {
            // 单行回复生成
            if (ra.text.indexOf('发表回复') === -1) {
                return
            }

            // 本次收益
            let income = 0;

            let className = "tr ";
            if (last) {
                if ((new Date(ra.date)).getHours() != (new Date(last.date)).getHours()) {
                    className += "separator"
                }
            }
            html.push(`<tr class="${className}">`)
            html.push(`<td>${formatDate(new Date(ra.date), 'HH:mm:SS')}</td>`)
            for (let _th in awardGroup) {
                html.push(`<td class="inner-text">${ra[_th] ? ra[_th] : ''}</td>`)
                income += (ra[_th] ? Number(ra[_th]) : 0) * awardRate[_th]

                if (ra[_th]) {
                    let value = sum[_th] ? sum[_th] : 0;
                    value += Number(ra[_th])
                    sum[_th] = value
                }
            }
            // 本次收益
            html.push(`<td class="inner-text my_income" ra='${JSON.stringify(ra)}'>${income}</td>`)
            html.push(`<td class="t-text">${ra.text}</td>`)
            html.push('</tr>')
            last = ra
        })
        // console.log(sum)
        html.push('</tbody>')

        let foot = '<tr><td>合计</td>'
        for (let name in awardGroup) {
            foot += `<td class="inner-text">${sum[name] ? sum[name] : '0'}</td>`
        }
        foot += '</tr>'
        html.push(`<tfoot>${foot}</tfoot>`)

        html.push('</table></body></html>')

        return html.join('');
    }

    // 把回复json 转换成 html table
    function rpToHtml() {
        let _rps = JSON.parse(localStorage.getItem(ReplyPlate_key) || '[]');

        let html = []
        html.push('<html>')

        const tableCSS = GM_getResourceText("tableCSS");
        html.push(`<head><style>${tableCSS}</style></head><body>`)

        for (let name in ReplyPlate_limit) {
            let plateReplies = _rps[name] || []
            if (plateReplies) {
                // 生成前清理一下
                plateReplies = clearExpiredData(ReplyPlate_limit[name].limit_type, ReplyPlate_limit[name].times, plateReplies);
                _rps[name] = plateReplies;

                html.push(
                    `<div style="margin: 20px;text-align: center;">` +
                    `<div class="important-text">${name} 板块下 共计回复 <span class="emphasis">${_rps[name].length}</span> 次` +
                    `<button id="toggleBtn" class="toggle-btn t_button" onclick="let table = document.getElementById(\'table_${name}\');table.style.display == 'none'?table.style.display = 'block':table.style.display = 'none'">显隐表格</button>` +
                    `</div>` +
                    `<div class="">该板块下 限制 <span class="emphasis">${ReplyPlate_limit[name].limit_type}</span> 期间 回复 <span class="emphasis">${ReplyPlate_limit[name].times}</span> 次</div>` +
                    `<div id="table_${name}" style="display: none;"><table><caption>${name} 板块</caption><tbody>`
                )
                html.push('<tr><th>回复时间</th><th>标题</th><th>跳转</th></tr>')
                for (const rp of _rps[name]) {
                    html.push(`<tr><td>${formatDate(new Date(rp.date), 'DD日 HH:mm:SS')}</td><td class="title ellipsis-column">${rp.subject}</td><td><button class="t_button" onclick="window.open('https://www.gamemale.com/thread-${rp.tid}-1-1.html', '_blank')">查看</button></td></tr>`)
                }
                html.push('</tbody></table></div></div><hr/>')
            } else {
                html.push(
                    `<div style="margin: 20px;text-align: center;">` +
                    `<div class="important-text">${name} 板块下 共计回复 <span class="emphasis">0</span> 次` +
                    `</div>` +
                    (name == 'ALL' ? '' : `<div class="">该板块下 限制 <span class="emphasis">${ReplyPlate_limit[name].limit_type}</span> 期间 回复 <span class="emphasis">${ReplyPlate_limit[name].times}</span> 次</div>`) +
                    '</div><hr/>'
                );
            }
        }

        html.push('</body></html>')

        return html.join('');
    }

    // ReplyAward_history to HTML 往期奖励弹窗内容
    function rapToHtml(_rap) {
        let now = new Date();
        let today = formatDate(now, 'YYYYMMdd');

        let html = []

        const tableCSS = GM_getResourceText("tableCSS");
        html.push(`<html><head>
<style>${tableCSS}
  tr {
    height: ${trHeight}px;
  }
  </style></head>`)
        html.push(`<body><table><tbody>`)
        // 表头
        html.push('<tr><th>回复时间</th><th>查看</th><th>操作</th></tr>')

        let index = 0
        let lastDate
        Object.keys(_rap).forEach(key => {
            const datetime = _rap[key];
            const date = new Date(datetime)
            let _date = formatDate(date, 'YYYYMMdd');
            // 第一个日期，或者每月第一天，或者前一天和本日不是一个月
            if(index == 0 || date.getDate() == 1 ||
                (lastDate != undefined && lastDate.getMonth() != date.getMonth())) {
                html.push(`<tr class="tr month"><td colspan="2" style="text-align: center;font-weight: 1000;">${formatDate(date, 'YYYY年MM月')}</td><td class=""><button id="delete" class="toggle-btn t_button ra_history_delete_button" onclick="" date="${key.substring(0, 6)}">删除</button></td></tr>`)
            }
            html.push(`<tr class="tr day" date="${_date}" month="${formatDate(date, 'YYYYMM')}">`)
            html.push(`<td class="" ${today == _date ? 'colspan="3" style="text-align: center;"' : ''}>${formatDate(date, 'YYYY-MM-dd')}${today == _date ? ' （今日）' : ''}</td>`)

            if(today != _date) {
                html.push(`<td class=""><button id="look" class="toggle-btn t_button ra_history_show_button" onclick="" date="${key}">查看</button></td>`)
                html.push(`<td class=""><button id="delete" class="toggle-btn t_button ra_history_delete_button" onclick="" date="${key}">删除</button></td>`)
            } else {
            }

            html.push(`</tr>`)

            index += 1
            lastDate = date
        })

        html.push('</tbody></table></body></html>')

        return html.join('');
    }

    // 创建弹窗
    function createIFrame(id) {
        // 添加弹窗
        let htmlDivElement = document.createElement("div");
        htmlDivElement.id = id;
        htmlDivElement.className = "my_popup";
        htmlDivElement.style.display = "none";
        htmlDivElement.scrolling = true;
        htmlDivElement.innerHTML = `<iframe id="pop_iframe_${id}" frameborder="no" scrolling="yes" style="overflow-y：auto;width: 100%; height: 100%"></iframe>`
        targetNode.appendChild(htmlDivElement);
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

    // 关闭所有弹窗
    function closeAllPopup() {
        let elementNodeListOf = document.body.querySelectorAll('.my_popup');

        elementNodeListOf.forEach(element => {
            console.log(element.id, " : ", element.style.display);
            element.style.display = 'none';
        })
    }

    // 设置关闭事件
    function setCloseEvent(id, parentId) {
        // 点击页面其他地方关闭弹窗
        document.addEventListener('click', function () {
            closePopup(id)
        });

        // 防止弹窗内部点击关闭弹窗
        document.getElementById(id).addEventListener('click', function (e) {
            e.stopPropagation();
        });

        if (parentId) {
            // 防止点击父级按钮时关闭弹窗
            document.getElementById(parentId).addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    }

    function popupEvent(buttonId, popupId, callback) {
        // 如果弹窗按钮存在
        const button = document.getElementById(buttonId);
        if (button) {
            createIFrame(popupId)

            // 增加点击监听 显示弹出窗口
            button.addEventListener('click', function (e) {
                closeAllPopup()

                // 如果弹窗已显示，则进行关闭
                if (document.getElementById(popupId).style.display != 'none') {
                    closePopup(popupId);
                    return;
                }

                callback(e, popupId);

                // 阻止事件冒泡
                e.stopPropagation();
            });

            setCloseEvent(popupId);
        }
    }

    function createPopup(e, popupId, HTMLFunc, iframeFunc, endFunc) {
        const popup = document.getElementById(popupId);
        const btn = e.target;

        // 计算弹窗位置（左下角）
        const rect = btn.getBoundingClientRect();
        const lr = GM_getValue("lr") || "r"
        if (lr == 'l') {
            popup.style.left = (btnLRPx + 50) + 'px';
        } else {
            popup.style.right = (btnLRPx + 50) + 'px';
        }
        popup.style.top = (rect.bottom) + 'px';

        let html = HTMLFunc()

        let iframe = document.getElementById(`pop_iframe_${popupId}`);
        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.body.innerHTML = html;
        iframeDoc.body.style.display = 'block';

        // 显示弹窗
        popup.style.display = 'block';
        popup.style.width = tableWidth + 'px';
        // popup.style.minHeight = tableHeight - 10 + 'px';
        // popup.style.height = tableHeight - 10 + 'px';

        console.log("window.innerHeight : ", window.innerHeight)
        popup.style.height = (window.innerHeight * 0.8) + 'px';
        popup.style.maxHeight = (window.innerHeight - popup.style.top) + 'px';

        // 对iFram做特殊处理
        if(iframeFunc) {
            iframeFunc(iframe, popup)
        }

        if(endFunc) {
            endFunc(iframe);
        }
    }

    // 回复奖励的弹窗
    popupEvent("btn_ReplyAward", "popup_ReplyAward", function (e, popupId) {
        createPopup(e, popupId, ()=> {
            let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`
            if (!localStorage.getItem(key)) {
                Toast("没有今天的回复记录！", 3000)
                return;
            }
            let ra = JSON.parse(localStorage.getItem(key) || '[]');
            let html = raToHtml(ra);

            return html;
        }, (iframe, popup) => {
            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            const timerJS = GM_getResourceText("timerJS");
            let scriptElement = iframeDoc.createElement("script");
            scriptElement.append(timerJS);
            iframeDoc.body.appendChild(scriptElement);

            // 点击收益触发事件
            iframeDoc.body.querySelectorAll(".my_income").forEach(el=>{
                el.addEventListener('click', function (e) {
                    showRA(el.getAttribute('ra'))
                });
            })

        }, () => {
        });
    });

    // 往期回复奖励的弹窗
    popupEvent("btn_ReplyAward_history", "popup_ReplyAward_history", function (e, popupId) {
        createPopup(e, popupId, ()=> {
            let key = `${key_prefix}keys`
            if (!localStorage.getItem(key)) {
                Toast("没有回复记录！", 3000)
                return;
            }
            let rap = JSON.parse(localStorage.getItem(key) || '{}');
            let html = rapToHtml(rap);

            return html;
        }, (iframe, popup) => {
            popup.style.width = 300 + 'px';
        }, (iframe) => {
            iframe.contentWindow.document.querySelectorAll('.ra_history_show_button').forEach(el=>{
                // 查看按钮绑定事件
                el.addEventListener('click', function (e) {
                    let _date = el.getAttribute('date')
                    console.log(_date)
                })
            })
            iframe.contentWindow.document.querySelectorAll('.ra_history_delete_button').forEach(el=>{
                // 查看按钮绑定事件
                el.addEventListener('click', function (e) {
                    let now = new Date();
                    let today = formatDate(now, 'YYYYMMdd')
                    let _date = el.getAttribute('date')
                    console.log(_date)

                    let containToday = false;
                    if(_date.length == 6) {
                        console.log("删除这个月的数据：", _date)
                        console.log(this.parentElement.parentElement.parentElement)
                        let list = this.parentNode.parentNode.parentNode
                        Array.from(list.childNodes)
                            .filter(child => child.getAttribute("month") == _date)
                            .forEach(child => {
                                let date = child.getAttribute("date");
                                if(date == today) {
                                    containToday = true;
                                    return
                                }
                                console.log('删除', date);
                                list.removeChild(child);
                            });

                        if(!containToday) {
                            this.parentElement.parentElement.remove();
                        }

                        let key = `${key_prefix}keys`;
                        let keys = JSON.parse(localStorage.getItem(key) || '{}');
                        for (let _key in keys) {
                            if(_key.startsWith(_date)) {
                                if(containToday) {
                                    continue;
                                }
                                console.log(`删除 ${_key}`)
                                keys[_key] = undefined

                                localStorage.removeItem(`${key_prefix}${_key}`)
                                localStorage.removeItem(`${key_prefix}${_key}_sum`)
                            }
                        }
                        localStorage.setItem(`${key_prefix}keys`, JSON.stringify(keys));

                    } else if(_date.length == 8) {
                        console.log("删除这天的数据：", _date)

                        // console.log(this.parentElement.parentElement)
                        this.parentElement.parentElement.remove();

                        let key = `${key_prefix}keys`;
                        let keys = JSON.parse(localStorage.getItem(key) || '{}');
                        if(keys[_date]) {
                            Toast("没有找到这天的数据")
                            return
                        }
                        keys[_date] = undefined
                        localStorage.setItem(`${key_prefix}keys`, JSON.stringify(keys));

                        localStorage.removeItem(`${key_prefix}${_date}`)
                        localStorage.removeItem(`${key_prefix}${_date}_sum`)
                    }
                })
            })
        });
    });

    // 回复板块的弹窗
    popupEvent("btn_ReplyPlate", "popup_ReplyPlate", function (e, popupId) {
        createPopup(e, popupId, ()=> {
            return rpToHtml();
        });
    });

    function changePosition(ud, lr) {
        changeUD(ud)
        changeLR(lr)
    }

    function changeUD(ud) {
        GM_setValue("ud", ud != "u" ? "d" : "u")

        if (ud != 'u') {
            console.log("换到下边")
            document.querySelector('#my_buttonGroup').style.top = null
            document.querySelector('#my_buttonGroup').style.bottom = btnTBPx + 'px'
        } else {
            console.log("换到上边")
            document.querySelector('#my_buttonGroup').style.top = btnTBPx + 'px';
            document.querySelector('#my_buttonGroup').style.bottom = null
        }
    }

    function changeLR(lr) {
        GM_setValue("lr", lr != "l" ? "r" : "l")

        if (lr != 'l') {
            console.log("换到右边")
            document.querySelector('#my_buttonGroup').style.textAlign = 'right';
            document.querySelector('#my_buttonGroup').style.left = null
            document.querySelector('#my_buttonGroup').style.right = btnLRPx + 'px'
        } else {
            console.log("换到左边")
            document.querySelector('#my_buttonGroup').style.textAlign = 'left';
            document.querySelector('#my_buttonGroup').style.left = btnLRPx + 'px';
            document.querySelector('#my_buttonGroup').style.right = null
        }
    }

    // 展示指定日期收益记录
    function showHistoryRA(date) {

    }

    // 删除指定日期收益记录
    function deleteHistoryRA(date) {

    }

    // 模拟展示收益
    function showRA(_ra) {
        let ra = JSON.parse(_ra);
        const element = document.querySelector('#ntcwin');
        if(element) {
            console.log('已经有存在的奖励提示了')
            return
        }

        const div = document.createElement('div');
        div.id = "ntcwin";
        div.className = "ntcwin test";
        div.style = 'position: fixed; z-index: 501; left: 50%; top: 40%; transform: translate(-50%, -50%);'

        let html = `
        <table cellspacing="0" cellpadding="0" class="popupcredit"><tbody><tr><td class="pc_l">&nbsp;</td><td class="pc_c"><div class="pc_inner">
        <div id="creditpromptdiv">
        <i>发表回复 勋章功能触发</i>`;
        Object.keys(awardUnit).forEach((key) => {
            if(ra[key]) {
                html += `<span>${key}<em>${ra[key]}</em>${awardUnit[key]}</span>`
            }
        })
        html += `</div></div></td><td class="pc_r">&nbsp;</td></tr></tbody></table>`;

        div.innerHTML = html;
        document.body.appendChild(div);

        let time = 3;
        // Toast(`${time} 秒后消失`, time * 1000, 100)

        // 3s后清除
        timer(time * 1000, ()=> {
            const element = document.querySelector('#ntcwin');
            element.remove()
        })

        document.body.querySelector("#popup_ReplyAward").style.display = 'none';
    }

    // 格式化时间显示
    function formatTime(milliseconds) {
        let totalSeconds = Math.floor(milliseconds / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;

        return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
    }

    // 更新计时器显示
    function updateTimer(timerElement, date) {
        if (!date) {
            date = _startTime;
        }
        let now = new Date();
        let elapsedMilliseconds = now - date;
        timerElement.textContent = formatTime(elapsedMilliseconds);
    }

    function showReplyCD(button) {
            // 每秒更新一次
            let timer = setInterval(function () {
                    let last = JSON.parse(localStorage.getItem('replyAward_lastTime') || '{}');
                    if(button && last.date) {
                        let date = new Date(last.date);
                        // console.log(date.getDate())
                        // console.log(new Date().getDate())

                        if(button.display == 'none') {
                            console.log("停止更新计时器")
                            clearInterval(timer)
                            return;
                        }
                        updateTimer(button, date);
                    } else {
                        console.log("停止更新计时器")
                        // console.log(button)
                        // console.log(last)
                        clearInterval(timer)
                        return;
                    }
                }, 1000
            );

    }

    // 定位到附件位置
    let attachs = []
    let currentAttach = 0
    let hasLocated = false;
    function locateAttach() {
        if(!hasLocated) {
            // 检查页面上所有的附件元素
            let es = document.body.querySelectorAll('ignore_js_op');
            for (const e of es) {
                // 找到附件名
                let attnm = e.querySelector('.attnm');
                if(attnm) {
                    attachs.push(e);
                }

                attnm = e.querySelector('[id^="attach_"]');
                if(attnm) {
                    attachs.push(e);
                }
            }
        }

        if(attachs.length == 0) {
            Toast("没有找到任何附件内容！", 2000)
        } else {
            // 定位到指定位置
            let attach = attachs[currentAttach]
            attach.scrollIntoView({
                behavior: 'smooth', // 平滑滚动
                block: 'center'     // 垂直居中对齐视口
            });

            // 指定附件闪烁

            let dl = attach.querySelector('dl');
            if(dl) {
                flashElement(dl);
            } else {
                flashElement(attach);
            }
            console.log("当前附件是：", attach.querySelector('.attnm').innerText)

            // 计数器加1
            currentAttach += 1;
            if(currentAttach >= attachs.length) {
                currentAttach = 0
            }
        }
    }

    // 跳转到评分位置
    function locateRate() {
        let rate = document.body.querySelector("#ak_rate")
        rate.scrollIntoView({
            behavior: 'smooth', // 平滑滚动
            block: 'center'     // 垂直居中对齐视口
        });
    }

    // 跳转到回复位置
    function LocateReply() {
        let rate = document.body.querySelector("#fastposteditor")
        rate.scrollIntoView({
            behavior: 'smooth', // 平滑滚动
            block: 'center'     // 垂直居中对齐视口
        });
    }

    // 3. JS 控制：给目标元素添加动画类，动画结束后移除（避免重复触发）
    function flashElement(target) {
        // 添加动画类（触发闪烁）
        target.classList.add('flash-three-times');

        // 动画结束后移除类（确保下次点击仍能触发）
        target.addEventListener('animationend', function onAnimationEnd() {
            target.classList.remove('flash-three-times');
            // 移除事件监听（避免内存泄漏）
            target.removeEventListener('animationend', onAnimationEnd);
        }, { once: true }); // { once: true } 表示事件只执行一次，无需手动移除
    }

    // 添加CSS样式
    const buttonCSS = GM_getResourceText("buttonCSS");
    GM_addStyle(buttonCSS);
    const popupCSS = GM_getResourceText("popupCSS");
    GM_addStyle(popupCSS);

    GM_addStyle(`
.my_button.translucence {
    color: #888888;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.2), rgba(70, 70, 70, 0.2), rgba(135, 135, 135, 0.2));
}
.my_button.translucence:hover::after {
    -webkit-box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);
}
.my_button.translucence:hover:active {
    color: #888888;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.2), rgba(70, 70, 70, 0.2), rgba(135, 135, 135, 0.2));
}

/* 1. 定义闪烁动画：切换背景色 */
@keyframes flashYellow {
  0% { background-color: inherit; } /* 初始颜色（继承元素原有背景） */
  50% { background-color: #ffeb3b; } /* 黄色（可调整深浅，#ffeb3b 更亮） */
  100% { background-color: inherit; } /* 恢复初始颜色 */
}

/* 2. 动画类：绑定动画，执行 3 次，每次 0.5 秒（总时长 1.5 秒） */
.flash-three-times {
  animation: flashYellow 0.5s ease-in-out 3; /* 动画名 + 单次时长 + 速度曲线 + 重复次数 */
  /* 可选：添加 !important 确保动画优先级（避免被元素原有背景色覆盖） */
  /* background-color: inherit !important; */
}
`);
})();

