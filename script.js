// ==============================
// 現在の幻獣
// ==============================

let currentGenjuId = 0;


// ==============================
// 現在の幻獣を表示
// ==============================

function displayCurrentGenju() {

    const currentGenju = genjuData[currentGenjuId];

    console.log("現在の幻獣:", currentGenju);

    // HTMLに表示
    document.getElementById("genjuName").textContent = currentGenju.name;
    document.getElementById("changeName").textContent = currentGenju.itemName;
    document.getElementById("genjuClass").textContent = currentGenju.class;
    document.getElementById("attribute").textContent = currentGenju.attribute;

    // 変化先を表示
    displayChangesTo();
}


// ==============================
// 変化先を表示
// ==============================

function displayChangesTo() {

    const changeContainer = document.getElementById("changeGenju");

    // 一度中身を空にする
    changeContainer.innerHTML = "";

    // 現在の幻獣データ
    const currentGenju = genjuData[currentGenjuId];

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

// ==============================
// ボタンを押したとき
// ==============================

        button.addEventListener("click", () => {

// ==============================
// 変化ポイントを加算
// ==============================

    statusPoint.s += targetGenju.changePoint.s;
    statusPoint.a += targetGenju.changePoint.a;
    statusPoint.d += targetGenju.changePoint.d;
    statusPoint.l += targetGenju.changePoint.l;

// ==============================
// 変化先の幻獣に変更
// ==============================

    currentGenjuId = targetId;

// ==============================
// ステータスポイントを表示
// ==============================

    document.getElementById("pointS").textContent = statusPoint.s;
    document.getElementById("pointA").textContent = statusPoint.a;
    document.getElementById("pointD").textContent = statusPoint.d;
    document.getElementById("pointL").textContent = statusPoint.l;

    // 表示を更新
    displayCurrentGenju();
});

    // ボタンを追加
    changeContainer.appendChild(button);
});
}


// ==============================
// 初期表示
// ==============================

displayCurrentGenju();
