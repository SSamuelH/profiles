/*
#R,https://pawchive.pw/patreon/user/68263570/post/166102522
#O,E:\Downloads\Default\Other\Kemono\@ArtisticJinsky [patreon] - (2026年08月31日) Dick sales on the Shinkansen🚄
@Holo Eden [patreon] - (2026年08月08日) 💪.jpg,https://file.pawchive.pw/data/bb/e2/bbe2ebb17000107fc25caceaec78fc7450dde1d8c5e9a43ac2f22ec7be3859cc.jpg

To

{
  "jsonrpc":"2.0",
  "id":"test1",
  "method":"aria2.addUri",
  "params":[
    "token:mysecret123",
    ["https://speed.hetzner.de/100MB.bin"],
    {"dir":"D:/aria2_test","out":"test_100mb.bin"}
  ]
}
* */

const RPC_URL = "http://localhost:29100/jsonrpc"
const RPC_SECRET = "KywRqotNpBCfsdDH"

function getShort5() {
    return crypto.randomUUID().slice(0, 5);
}

function IDMToAria2(idm) {
    const uuid = formatDate(new Date(), 'YYYYMMddhhmm') + getShort5()

    let jsonTemp = {
        "jsonrpc": "2.0",
        "id": uuid,
        "method": "aria2.addUri",
    }

    const arr = idm.split(/\r?\n/);
    console.log(arr);

    let referer = ""
    let dir;

    for(let line of arr) {
        if(line.startsWith('#R,')) {
            referer = line.replace('#R,', '')
            dir = undefined
        } else if(line.startsWith('#O,,')) {
            dir = line.replace('#O,', '')
        } else {
            let _arr = line.split(/,/);
            let url;
            let name;

            if(_arr.length > 1) {
                name = _arr[0]
                url = _arr[1]
            } else {
                url = _arr[0]
            }

            params = [
                `token:${RPC_SECRET}`,
                [url],
                {
                    dir: dir,
                    out: name,
                    referer: referer
                }
            ]

            RPC(jsonTemp, params)
        }
    }
}

function RPC(json, params) {
    json.params = params

    GM_xmlhttpRequest({
        method: "POST",
        url: RPC_URL,
        headers: {
            "Content‑Type": "application/json"
        },
        data: JSON.stringify(json),
        onload: (resp) => {
            console.log("aria2返回：", resp.responseText);
        },
        onerror: (err) => {
            console.error("调用RPC失败", err);
        }
    });
}