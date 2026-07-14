// ==UserScript==
// @name         HentaiVerse sell T2-T6 trophies
// @desc         一键售卖奖杯
// @version      2026-01-08T02:17:34.965Z
// @icon         https://hentaiverse.org/y/favicon.png
// @supportURL   https://forums.e-hentai.org/index.php?showtopic=291628
// @match        https://hentaiverse.org/?s=Bazaar&ss=mk&screen=browseitems&filter=tr
// @match        https://hentaiverse.org/?s=Bazaar&ss=mk&screen=sellorders&filter=tr
// ==/UserScript==

const el = document.createElement('button');
// el.innerText = 'Sell trophies';
el.innerText = '出售奖杯';
el.onclick = async () => {
    el.disabled = true;
    el.innerText = '出售中...';
    const dp = new DOMParser;
    let result = ['更新出售订单:'];
    let credit = 0;
    for (const [itemid, itemname, default_price] of [
        // Add/Remove the item ID and name of thophies you want to sell/not sell
        [30016, 'ManBearPig Tail (T2)', 890],
        [30017, 'Holy Hand Grenade of Antioch (T2)', 890],
        [30018, 'Mithra\'s Flower (T2)', 890],
        [30019, 'Dalek Voicebox (T2)', 890],
        [30020, 'Lock of Blue Hair (T2)', 890],
        [30021, 'Bunny-Girl Costume (T3)', 1780],
        [30022, 'Hinamatsuri Doll (T3)', 1780],
        [30023, 'Broken Glasses (T3)', 1780],
        // [30024, 'Black T-Shirt (T4)', 3600],
        [30030, 'Sapling (T4)', 3600],
        // [30031, 'Unicorn Horn (T5)', 7500],
        [30032, 'Noodly Appendage (T6)', 43800],
    ]) {
        el.innerText = `出售 ${itemname} (获取库存)`;
        const url = `https://hentaiverse.org/?s=Bazaar&ss=mk&screen=browseitems&filter=tr&itemid=${itemid}`;
        const r = await fetch(url).then(r => r.text());
        const d = dp.parseFromString(r, 'text/html');
        const token = d.querySelector('#market_itemsell input[name="marketoken"]').value;
        const count = parseInt(/你有 (\d+) 可以出售\./g.exec(d.getElementById('market_iteminfo').innerText)[1]);
        const countCurrent = parseInt(d.getElementById('sellorder_batchcount').value);
        // 没有库存就跳过
        if (!count || count === countCurrent) continue;
        // #market_itembuy  -> Market Bid price, sell immediately
        // #market_itemsell -> Market Ask price, you need to wait for a while but the price is a bit higher
        // 市场出价
        const marketSell_price = parseInt(
            d.querySelector('#market_itemsell .market_itemorders table tr:nth-child(2) td:nth-child(2)')
                .innerText
                .replaceAll(',', '')
                .replaceAll(' C', '')
        );
        // console.log(d.querySelector('#market_itemsell .market_placeorder tr:nth-child(2) td:nth-child(2) input:nth-child(2)'))
        // 你的出价
        let price = parseInt(
            d.querySelector('#market_itemsell .market_placeorder tr:nth-child(2) td:nth-child(2) input:nth-child(2)')
                .value
        );
        console.log(itemid, itemname, token, count, marketSell_price, price);
        // 如果没有出价，也设置了默认价格，就用默认价格
        if(!price && default_price) {
            price = default_price;
            console.log('Sell', itemname, 'as default price', default_price);
        }
        if(price) {
            el.innerText = `出售 ${itemname} (更新订单)`;
            await fetch(url, {
                method: 'POST',
                body: new URLSearchParams({
                    marketoken: token,
                    sellorder_batchcount: count,
                    sellorder_batchprice: price,
                    sellorder_update: 'Update',
                }),
            }).then(r => r.text());
            result.push(`#${itemid} ${itemname} x ${count} @ ${price} C`);
            credit += Math.floor(count * price * 0.99);
            el.innerText = `出售 ${itemname} (等待中…)`;
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
    result.push(`\n合计: ${credit} C (1% 手续费已扣除)`);
    el.innerText = `完成! 合计: ${credit} C (1% 手续费已扣除)`;
    alert(result.join('\n'));
    location.reload();
};

document.querySelector('#market_itemlist table tr:nth-child(1) th:nth-child(1)').appendChild(el);