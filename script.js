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

// 読み込み時の残り割り振りポイントを調整する内部ポイント
let adjustmentPoint = 0;

// 最大割り振りポイント
let maxAllocationPoint = 0;

// 残り割り振りポイント
let remainingAllocationPoint = 0;

// ==============================
// 繭化ボーナス
// ==============================

const cocoonBonus = 5;

// 繭化中かどうか
let isCocooned = false;

// ==============================
// 操作履歴（戻る・進む）
// ==============================

// 履歴を保存する配列
let transformationHistory = [];

// 現在の履歴位置
let historyIndex = -1;

// 履歴の最大保存数
const maxHistoryCount = 100;

// ==============================
// 変化履歴の表示用データ
// ==============================

// 変化先ボタンを押したときの履歴（最大12件）
let transformationDisplayHistory = [];
const maxTransformationDisplayHistory = 12;

// 変化履歴を記録
function recordTransformationDisplayHistory(genju) {
    transformationDisplayHistory.push({
        name: genju.name,
        itemName: genju.itemName,

        // 変化直後の状態を保存
        state: saveCurrentState()
    });

    // 最新12件だけを残す
    if (
        transformationDisplayHistory.length >
        maxTransformationDisplayHistory
    ) {
        transformationDisplayHistory.shift();
    }

    displayTransformationHistory();
}

// 変化履歴を画面に表示
function displayTransformationHistory() {
    const historyContent = document.getElementById("historyContent");

    if (!historyContent) return;

    // 履歴エリアを空にする
    historyContent.innerHTML = "";

    // 既存の変化先と同じグリッド配置を使用
    historyContent.classList.add("change-genju");

    // 最新の履歴を左上に表示
    [...transformationDisplayHistory].reverse().forEach(entry => {
        // 履歴項目をボタンとして作成
        const button = document.createElement("button");
        button.type = "button";
        button.className = "change-button history-entry";

        // 幻獣名
        const name = document.createElement("div");
        name.className = "change-button-name";
        name.textContent = entry.name;

        // 変化名
        const itemName = document.createElement("div");
        itemName.className = "change-button-item";
        itemName.textContent = entry.itemName;

        button.appendChild(name);
        button.appendChild(itemName);

        // クリックした履歴の状態に戻す
        button.addEventListener("click", () => {
            if (!entry.state) {
                console.error("履歴の状態データがありません。");
                return;
            }

            // 保存された状態を復元
            restoreState(entry.state);

            // 復元した状態を「戻る・進む」にも記録
            recordHistory();
        });

        historyContent.appendChild(button);
    });
}

// 変化履歴の開閉ボタンを設定
function setupTransformationHistory() {
    const toggleButton = document.getElementById("historyToggle");
    const contentRow = document.getElementById("historyContentRow");
    const toggleIcon = document.getElementById("historyToggleIcon");

    if (!toggleButton || !contentRow || !toggleIcon) {
        console.error("変化履歴のHTMLが見つかりません。");
        return;
    }

    toggleButton.addEventListener("click", () => {
        const isOpening = contentRow.hidden;

        contentRow.hidden = !isOpening;
        toggleButton.setAttribute("aria-expanded", String(isOpening));
        toggleIcon.textContent = isOpening ? "▲" : "▼";
    });

    displayTransformationHistory();
}

// 現在の状態を保存する
function saveCurrentState() {
    return {
        currentGenjuId: currentGenjuId,
        currentLevel: currentLevel,
        rebirthCount: rebirthCount,

        statusPoint: { ...statusPoint },
        allocationPoint: { ...allocationPoint },
        adjustmentPoint: adjustmentPoint,

        isCocooned: isCocooned
    };
}

// 履歴の状態を復元する
function restoreState(state) {
    currentGenjuId = state.currentGenjuId;
    currentLevel = state.currentLevel;
    rebirthCount = state.rebirthCount;

    statusPoint = { ...state.statusPoint };
    allocationPoint = { ...state.allocationPoint };
    adjustmentPoint = state.adjustmentPoint ?? 0;

    isCocooned = state.isCocooned;

    // 表示をまとめて更新
    updateLevelPoints();
    displayCurrentGenju();
    displayAllocationPoints();

    document.getElementById("rebirthCount").textContent = rebirthCount;

    updateHistoryButtons();
}

// 新しい操作を履歴に記録する
function recordHistory() {

    // 戻った状態から別の操作をしたら、
    // それより先の履歴を削除する
    transformationHistory =
        transformationHistory.slice(0, historyIndex + 1);

    // 現在の状態を記録
    transformationHistory.push(saveCurrentState());

    // 履歴数を制限
    if (transformationHistory.length > maxHistoryCount) {
        transformationHistory.shift();
    }

    historyIndex = transformationHistory.length - 1;

    updateHistoryButtons();
}

// ひとつ前に戻る
function historyBack() {
    if (historyIndex <= 0) {
        return;
    }

    historyIndex--;
    restoreState(transformationHistory[historyIndex]);
}

// ひとつ先に進む
function historyForward() {
    if (historyIndex >= transformationHistory.length - 1) {
        return;
    }

    historyIndex++;
    restoreState(transformationHistory[historyIndex]);
}

// ボタンの有効・無効を更新
function updateHistoryButtons() {
    const backButton = document.getElementById("historyBack");
    const forwardButton = document.getElementById("historyForward");

    if (!backButton || !forwardButton) {
        return;
    }

    backButton.disabled = historyIndex <= 0;

    forwardButton.disabled =
        historyIndex >= transformationHistory.length - 1;
}

// 戻る・進むボタンを設定
function setupHistoryButtons() {
    document.getElementById("historyBack")
        .addEventListener("click", historyBack);

    document.getElementById("historyForward")
        .addEventListener("click", historyForward);

    // 初期状態を履歴に保存
    recordHistory();
}

// ==============================
// 最大割り振りポイントを計算
// ==============================

function calculateMaxAllocationPoint() {

    // レベルで獲得するポイント
    const levelPoint = (currentLevel - 1) * 2;

    // ボーナスポイント
    let bonus = 0;

    if (isCocooned) {

        // 繭化中は繭化ボーナスのみ
        bonus = cocoonBonus;

    } else if (rebirthCount > 0) {

        // 通常時は転生回数に応じたボーナス
        bonus = rebirthBonus[rebirthCount] ?? maxRebirthBonus;
    }

    // 最大割り振りポイント
    maxAllocationPoint = levelPoint + bonus;

    // 使用済みポイント
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
    // 転生する場合
    // ==============================

    if (targetGenju.changeType === "rebirth") {

        // 転生前のS・A・D・Lの合計ポイントを取得
        const beforeRebirth = {
            s: statusPoint.s + allocationPoint.s,
            a: statusPoint.a + allocationPoint.a,
            d: statusPoint.d + allocationPoint.d,
            l: statusPoint.l + allocationPoint.l
        };

        // 各ステータスを10分の1にして切り上げ、
        // 転生先の変化ポイントを加算
        statusPoint = {
            s: Math.ceil(beforeRebirth.s / 10) + targetGenju.changePoint.s,
            a: Math.ceil(beforeRebirth.a / 10) + targetGenju.changePoint.a,
            d: Math.ceil(beforeRebirth.d / 10) + targetGenju.changePoint.d,
            l: Math.ceil(beforeRebirth.l / 10) + targetGenju.changePoint.l
        };

        // 割り振りポイントをリセット
        allocationPoint = { s: 0, a: 0, d: 0, l: 0 };
        adjustmentPoint = 0;

        // 転生回数を増やす
        rebirthCount++;
        document.getElementById("rebirthCount").textContent = rebirthCount;

        // 繭化状態を解除
        isCocooned = false;

        // レベルを1に戻す
        currentLevel = 1;

    } else if (targetGenju.changeType === "resetStatus") {

        // ==============================
        // 繭化する場合
        // ==============================

        // 繭化ボーナスを適用
        isCocooned = true;

        // ステータスポイントをリセットし、
        // 変化先の変化ポイントを加算
        statusPoint = {
            s: targetGenju.changePoint.s,
            a: targetGenju.changePoint.a,
            d: targetGenju.changePoint.d,
            l: targetGenju.changePoint.l
        };

        // 割り振りポイントをリセット
        allocationPoint = { s: 0, a: 0, d: 0, l: 0 };
        adjustmentPoint = 0;

        // レベルを1に戻す
        currentLevel = 1;

        // 転生回数は変更しない

    } else {

        // ==============================
        // 通常の幻獣変化
        // ==============================

        // 変化ポイントを加算
        statusPoint.s += targetGenju.changePoint.s;
        statusPoint.a += targetGenju.changePoint.a;
        statusPoint.d += targetGenju.changePoint.d;
        statusPoint.l += targetGenju.changePoint.l;

        // 変化先のクラスに応じてレベルを加算
        const targetClass = targetGenju.class;

        const levelBonus =
            ["F", "E", "D", "C", "B", "A"].includes(targetClass)
                ? 5
                : 20;

        currentLevel += levelBonus;
    }

    // ==============================
    // 変化先の幻獣に変更
    // ==============================

    currentGenjuId = targetId;

    // レベル・割り振りポイントを更新
    updateLevelPoints();

    // ステータスポイントを表示
    displayAllocationPoints();

    // 幻獣の表示を更新
    displayCurrentGenju();

    // 変化後の状態を履歴に記録
    recordHistory();

    // 変化履歴の表示用データを記録
    recordTransformationDisplayHistory(targetGenju);
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

    // 「Status Point」の隣にある数字を更新
    document.getElementById("remainingPoint").textContent =
        remainingAllocationPoint;

    console.log("最大割り振りポイント:", maxAllocationPoint);
    console.log("使用済みポイント:", usedPoint);
    console.log("残り割り振りポイント:", remainingAllocationPoint);

    // 実際のステータスを更新
    displayActualStatus();
}

// ==============================
// 実際のステータスを計算・表示
// ==============================

function displayActualStatus() {

    // 現在の幻獣データを取得
    const genju = genjuData[currentGenjuId];

    if (!genju) {
        console.error("幻獣データが見つかりません。ID:", currentGenjuId);
        return;
    }

    // 実際のステータスを計算
    const actualS =
        genju.uniqueValue.s * (statusPoint.s + allocationPoint.s);

    const actualA =
        genju.uniqueValue.a * (statusPoint.a + allocationPoint.a);

    const actualD =
        genju.uniqueValue.d * (statusPoint.d + allocationPoint.d);

    const actualL =
        genju.uniqueValue.l * (statusPoint.l + allocationPoint.l);

    // 計算結果を画面に表示
    document.getElementById("statusS").textContent = Math.floor(actualS);
    document.getElementById("statusA").textContent = Math.floor(actualA);
    document.getElementById("statusD").textContent = Math.floor(actualD);
    document.getElementById("statusL").textContent = Math.floor(actualL);
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
                
                // 操作後の状態を履歴に記録
                recordHistory();
            });

        });

    });

}

// ==============================
// ポイント操作の初期設定
// ==============================

setupAllocationButtons();
displayAllocationPoints();

// ==============================
// レベル変更ボタン
// ==============================

// レベル上限を取得・表示

    function getMaxLevel() {
        const maxLevel = rebirthCount >= 8 ? 250 : 200;
    // HTMLの上限レベル表示を更新
        document.getElementById("maxLevel").textContent = maxLevel;
        return maxLevel;
    }

// レベルに応じたポイントを再計算
function updateLevelPoints() {

    const maxLevel = getMaxLevel();

    // レベルを上限・下限の範囲内に収める
    currentLevel = Math.max(1, Math.min(currentLevel, maxLevel));

    // レベル表示を更新
    document.getElementById("genjuLevel").textContent = currentLevel;

    // 最大割り振りポイントを再計算
    calculateMaxAllocationPoint();

    // 割り振り済みポイントが上限を超えた場合は調整
    let usedPoint =
        allocationPoint.s +
        allocationPoint.a +
        allocationPoint.d +
        allocationPoint.l;

    while (usedPoint > maxAllocationPoint) {

        if (allocationPoint.l > 0) {
            allocationPoint.l--;
        } else if (allocationPoint.d > 0) {
            allocationPoint.d--;
        } else if (allocationPoint.a > 0) {
            allocationPoint.a--;
        } else if (allocationPoint.s > 0) {
            allocationPoint.s--;
        }

        usedPoint =
            allocationPoint.s +
            allocationPoint.a +
            allocationPoint.d +
            allocationPoint.l;
    }

    // ポイント表示を更新
    displayAllocationPoints();
}

// レベル変更ボタンを設定
function setupLevelButtons() {

    // 先頭のnumber-tableがレベル操作用
    const levelTable = document.querySelector(".number-table");

    if (!levelTable) {
        console.error("レベル操作用のテーブルが見つかりません。");
        return;
    }

    const buttons = levelTable.querySelectorAll(".num-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const buttonText = button.textContent.trim();

            const levelChanges = {
                "-100": -100,
                "-10": -10,
                "-1": -1,
                "+1": 1,
                "+10": 10,
                "+100": 100
            };

            const change = levelChanges[buttonText];

            if (change === undefined) {
                return;
            }

            // レベルを変更
            currentLevel += change;

            // 表示とポイントを更新
            updateLevelPoints();
            
            // 操作後の状態を履歴に記録
            recordHistory();
        });
    });
}

// ステータス読み込み欄の開閉
function setupStatusLoadToggle() {
    const toggleButton = document.getElementById("statusLoadToggle");
    const contentRow = document.getElementById("statusLoadContentRow");
    const toggleIcon = document.getElementById("statusLoadToggleIcon");

    if (!toggleButton || !contentRow || !toggleIcon) return;

    toggleButton.addEventListener("click", () => {
        const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";

        // 開閉を切り替える
        contentRow.hidden = isExpanded;
        toggleButton.setAttribute("aria-expanded", String(!isExpanded));

        // アイコンを切り替える
        toggleIcon.textContent = isExpanded ? "▼" : "▲";
    });
}

// ==============================
// ステータス読み込み：幻獣名検索
// ==============================
function setupStatusLoadGenjuSearch() {
    const input = document.getElementById("statusLoadGenju");
    const list = document.getElementById("statusLoadGenjuList");

    if (!input || !list || typeof genjuData === "undefined") {
        return;
    }

    // 幻獣ID・名前・クラスの一覧を作成
    const genjuList = Object.entries(genjuData)
        .map(([id, genju]) => ({
            id,
            name: genju.name,
            class: genju.class
        }))
        .filter(genju => typeof genju.name === "string")
        .sort((a, b) => Number(a.id) - Number(b.id));

    // 候補リストを表示
    function displayCandidates(keyword = "") {
        const normalizedKeyword = keyword.trim().toLowerCase();

        // 名前の部分一致で候補を絞り込む
        const candidates = genjuList.filter(genju =>
            genju.name.toLowerCase().includes(normalizedKeyword)
        );

        // 以前の候補を消去
        list.innerHTML = "";

        // 候補がなければリストを閉じる
        if (candidates.length === 0) {
            list.hidden = true;
            return;
        }

        // 候補を1件ずつ作成
        candidates.forEach(genju => {
            const option = document.createElement("button");

            option.type = "button";
            option.className = "status-load-genju-option";
            option.setAttribute("role", "option");
            option.setAttribute("aria-selected", "false");

            // 番号欄
            const number = document.createElement("span");
            number.className = "status-load-genju-number";
            number.textContent = `No.${genju.id}`;

            // 番号エリア
            const numberArea = document.createElement("span");
            numberArea.className = "status-load-genju-number-area";
            numberArea.appendChild(number);

            // クラスと幻獣名
            const name = document.createElement("span");
            name.className = "status-load-genju-name";

            // クラス名の左端に縦線を配置
            const separator = document.createElement("span");
            separator.className = "status-load-genju-separator";
            separator.textContent = "|";

            name.appendChild(separator);
            name.append(` ${genju.class}: ${genju.name}`);

            option.appendChild(numberArea);
            option.appendChild(name);

            // 候補を選択したら入力欄に反映
            option.addEventListener("click", () => {
                input.value = genju.name;

                // 選択した幻獣IDを保持
                input.dataset.genjuId = genju.id;

                // 候補リストを閉じる
                list.hidden = true;
            });

            list.appendChild(option);
        });

        list.hidden = false;
    }

    // 入力欄をクリックしたら候補を表示
    input.addEventListener("focus", () => {
        displayCandidates(input.value);
    });

    input.addEventListener("click", () => {
        displayCandidates(input.value);
    });

    // 入力文字に応じて候補を絞り込む
    input.addEventListener("input", () => {
        // 手入力で変更された場合は選択済みIDを解除
        delete input.dataset.genjuId;

        displayCandidates(input.value);
    });

    // Escapeキーで候補リストを閉じる
    input.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            list.hidden = true;
        }
    });

    // 入力欄・候補リストの外をクリックしたら閉じる
    document.addEventListener("click", event => {
        if (
            !input.contains(event.target) &&
            !list.contains(event.target)
        ) {
            list.hidden = true;
        }
    });
}

// 検索機能を初期化
setupStatusLoadGenjuSearch();

// ステータス読み込み欄の初期化
setupStatusLoadToggle();

// ==============================
// レベル変更の初期設定
// ==============================

setupLevelButtons();
updateLevelPoints();
document.getElementById("rebirthCount").textContent = rebirthCount;

// 戻る・進むボタンの初期設定
setupHistoryButtons();

// 変化履歴の初期設定
setupTransformationHistory();
