// 現在の幻獣ID
let currentGenjuId = 0;

// 現在の幻獣データを取得
const currentGenju = genjuData[currentGenjuId];

console.log("現在の幻獣:", currentGenju);

// HTMLに表示
document.getElementById("genjuName").textContent = currentGenju.name;
document.getElementById("changeName").textContent = currentGenju.itemName;
document.getElementById("genjuClass").textContent = currentGenju.class;
document.getElementById("attribute").textContent = currentGenju.attribute;

// ==============================
// 変化先を表示
// ==============================

function displayChangesTo() {

    const changeContainer = document.getElementById("changeGenju");

    // 一度中身を空にする
    changeContainer.innerHTML = "";

    // 現在の幻獣が持っている変化先ID
    currentGenju.changesTo.forEach(targetId => {

        const targetGenju = genjuData[targetId];

        // ボタン作成
        const button = document.createElement("button");
        button.className = "change-button";

        // 幻獣名
        const name = document.createElement("div");
        name.className = "change-button-name";
        name.textContent = targetGenju.name;

        // 変化名
        const item = document.createElement("div");
        item.className = "change-button-item";
        item.textContent = targetGenju.itemName;

        // ボタンに追加
        button.appendChild(name);
        button.appendChild(item);

        // クリック処理はまだ作らない
        changeContainer.appendChild(button);
    });
}


// 変化先を表示
displayChangesTo();
