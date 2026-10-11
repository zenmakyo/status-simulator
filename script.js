// ==============================
// 現在の幻獣
// ==============================

let currentGenjuId = 0;

// ==============================
// レベル設定
// ==============================

let currentLevel = 1;

// 転生回数
let rebirthCount = 0;

// 転生ボーナス
// 後から変更できるように独立して管理する
const rebirthBonus = {
    1: 30,
    2: 40,
    3: 50,
    4: 60,
    5: 70,
    6: 80,
    7: 90,
    8: 100,
    9: 110
};

// 10回目以降の転生ボーナス
const maxRebirthBonus = 110;

// ==============================
// ステータスポイント
// ==============================

// 幻獣変化などで獲得するポイント
let statusPoint = {
    s: 5,
    a: 5,
    d: 5,
    l: 5
};

// ==============================
// 割り振りポイント
// ==============================

// S・A・D・Lに現在割り振っているポイント
let allocationPoint = {
    s: 0,
    a: 0,
    d: 0,
    l: 0
};

// 最大割り振りポイント
let maxAllocationPoint = 0;

// 残り割り振りポイント
let remainingAllocationPoint = 0;

// ==============================
// 最大割り振りポイントを計算
// ==============================

function calculateMaxAllocationPoint() {

    // レベルで獲得するポイント
    const levelPoint = (currentLevel - 1) * 2;

    // 転生ボーナス
    let bonus = 0;

    if (rebirthCount > 0) {
        bonus = rebirthBonus[rebirthCount] ?? maxRebirthBonus;
    }

    // 最大割り振りポイント
    maxAllocationPoint = levelPoint + bonus;

    // 使用済みポイントを計算
    const usedPoint =
        allocationPoint.s +
        allocationPoint.a +
        allocationPoint.d +
        allocationPoint.l;

    // 残りポイント
    remainingAllocationPoint = Math.max(
        0,
        maxAllocationPoint - usedPoint
    );
}

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

    if (!targetGenju) {
        console.error("幻獣データが見つかりません。ID:", targetId);
        return;
    }

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

// ==============================
// 割り振りポイントの操作
// ==============================

// ボタンの増減値
const pointButtonValues = {
    "-100": -100,
    "-10": -10,
    "-1": -1,
    "+1": 1,
    "+10": 10,
    "+100": 100
};

// ポイント表示を更新
function displayAllocationPoints() {

    document.getElementById("pointS").textContent =
        statusPoint.s + allocationPoint.s;

    document.getElementById("pointA").textContent =
        statusPoint.a + allocationPoint.a;

    document.getElementById("pointD").textContent =
        statusPoint.d + allocationPoint.d;

    document.getElementById("pointL").textContent =
        statusPoint.l + allocationPoint.l;

    // 残りポイントを計算
    const usedPoint =
        allocationPoint.s +
        allocationPoint.a +
        allocationPoint.d +
        allocationPoint.l;

    remainingAllocationPoint = Math.max(
        0,
        maxAllocationPoint - usedPoint
    );

    console.log("最大割り振りポイント:", maxAllocationPoint);
    console.log("使用済みポイント:", usedPoint);
    console.log("残り割り振りポイント:", remainingAllocationPoint);
}

// ポイント操作ボタンを設定
function setupAllocationButtons() {

    // S・A・D・Lの各テーブルを取得
    const tables = document.querySelectorAll(".number-table");

    // 先頭のテーブルはレベル操作用なので除外
    const statTables = Array.from(tables).slice(1);

    const statKeys = ["s", "a", "d", "l"];

    statTables.forEach((table, index) => {

        const statKey = statKeys[index];

        const buttons = table.querySelectorAll(".num-btn");

        buttons.forEach(button => {

            button.addEventListener("click", () => {

                const amount = pointButtonValues[button.textContent.trim()];

                if (amount === undefined) {
                    return;
                }

                // プラス操作
                if (amount > 0) {

                    // 残りポイント以上は割り振らない
                    const actualAmount = Math.min(
                        amount,
                        remainingAllocationPoint
                    );

                    allocationPoint[statKey] += actualAmount;
                }

                // マイナス操作
                else {

                    // 現在の割り振り以上は減らさない
                    const actualAmount = Math.min(
                        Math.abs(amount),
                        allocationPoint[statKey]
                    );

                    allocationPoint[statKey] -= actualAmount;
                }

                // 表示を更新
                displayAllocationPoints();
            });

        });

    });

}

// ==============================
// ポイント操作の初期設定
// ==============================

setupAllocationButtons();
displayAllocationPoints();
