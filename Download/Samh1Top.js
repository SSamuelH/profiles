// ==UserScript==
// @name         Samh1Top
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description  Samh1Top 统计图片数
// @author       Sam
// @match        https://samh1.top/comics/read/**
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/2.2.4/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/datetime.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/buttons.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// ==/UserScript==

const btnSwitchName = "btnSwitch"
const btnSizeName = "btnSize"

const buttonGroup = {
    "设置": {"name": "config", "func": "config", "color": "black"},
    "IMG统计": {name: "imgCount", type: "afterCreate", func: "imgCount", color: "translucence"},
};

const configButGroup = {
    "显示位置": {"name": "showPosition", "func": "showPosition"},
    "按钮大小": {"name": "changeSize", "func": "changeSize"},
}
const configBtnGroupId = 'my_configBtnGroup'

// 按钮组到底部的距离
const btnTBPx = 50;
const btnLRPx = 10;

(function () {
    console.log(" KemonoAndCommer init ");

    const targetNode = document.body;

    const config = {childList: true, subtree: true};
    const callback = function (mutationsList) {
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    function showImgCount(button) {
        let c = document.body.getElementsByClassName("chapter_dateil_flex").item(0)

        let count = c.getElementsByTagName("img").length
        if(count == 0) {
            // 3s后清除
            timer(3 * 1000, ()=> {
                showImgCount(button)
            })
        } else {
            button.textContent = `总计 ${c.getElementsByTagName("img").length} 张`
        }
    }

    // 方法组
    const funcs = {
        imgCount() {
            console.log("imgCount")
            // 回复冷却
            const id = "btn_imgCount";
            const button = document.getElementById(id);
            showImgCount(button);
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
            changeSize();
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
        const size = GM_getValue(btnSizeName, "large")

        let body = document.body;
        let div = document.createElement('div');
        div.id = "my_buttonGroup"
        div.style.cssText = `z-index:999;position:fixed;margin:10px;pointer-events: none;` +
            `${lr == "l" ? "left" : "right"}:${btnLRPx}px;${ud == "d" ? "bottom" : "top"}:${btnTBPx}px;` +
            `text-align:${lr == "l" ? "left" : "right"}`

        let btnStyle = `z-index:999;position:sticky;margin:5px;pointer-events: auto;`

        let i = 1
        for (let buttonName in buttonGroup) {
            let buttonConfig = buttonGroup[buttonName];

            let btn = document.createElement('button');
            btn.id = "btn_" + buttonGroup[buttonName].func;
            btn.className = `my_button ${(buttonGroup[buttonName].color || 'red')} ${nextSizeMap.hasOwnProperty(size) ? size : "large"}`

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
                funcs[buttonGroup[buttonName].func](event);
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

        check()
    }

    init();
    initHotkey()

    // 检查
    function check() {
        // 每隔两秒检测按钮组是否存在
        timer(2 * 1000, () => {
            const element = document.body.querySelector('#my_buttonGroup');
            if (element) {
                if (element.style.display == "none") {
                    element.style.display == "block"
                }
            } else {
                // 初始化
                init()
                initHotkey()
            }
            check()
        })
    }

    // todo 初始化热键
    function initHotkey() {

        let hotkeyGroup = {}
        for (let buttonName in buttonGroup) {
            let hotkey = buttonGroup[buttonName]["hotkey"]
            if(hotkey) {
                hotkeyGroup[hotkey] = {
                    "hotkey": hotkey,
                    "desc": buttonName,
                    "func": buttonGroup[buttonName]["func"]
                }
            }
        }
        console.log(hotkeyGroup)

        // 监听全局键盘按下事件
        document.addEventListener('keydown', function(e) {
            // 核心判断条件（全部满足才触发）
            const isKey = hotkeyGroup.hasOwnProperty(e.key.toUpperCase()) ;
            const isPageFocused = document.hasFocus(); // 当前页面是否获得焦点 ✅

            // ✅ 新增：判断当前是否在输入框内（输入框按键不触发）
            const isInputing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
            const isEditable = document.activeElement.isContentEditable; // 富文本编辑器
            // ✅ 关键修复：检测是否按下了Ctrl/Shift/Alt修饰键
            const isModifierKeyPressed = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey; // metaKey是Mac的Command键

            // 满足条件：按键 + 页面聚焦
            if (isKey && isPageFocused && !isInputing && !isEditable && !isModifierKeyPressed) {
                // 1. 阻止按键的原生行为（不会在输入框打字、不会触发其他快捷键）
                e.preventDefault();
                e.stopPropagation();

                // 2. 触发指定方法
                funcs[hotkeyGroup[e.key.toUpperCase()].func](event);
                Toast(`${hotkeyGroup[e.key.toUpperCase()].desc}`)
            }
        }, true);
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

    // 创建弹窗
    function createIFrame(id) {
        // 添加弹窗
        let htmlDivElement = document.createElement("div");
        htmlDivElement.id = id;
        htmlDivElement.className = "my_popup";
        htmlDivElement.style.display = "none";
        htmlDivElement.innerHTML = `
    <div class="popup-arrow" style="">
        <iframe id="pop_iframe_${id}" frameborder="no" scrolling="auto"  style="overflow-y：auto"></iframe>
    </div>`
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

    const buttonCSS = GM_getResourceText("buttonCSS");
    GM_addStyle(buttonCSS);
    const popupCSS = GM_getResourceText("popupCSS");
    GM_addStyle(popupCSS);

})();