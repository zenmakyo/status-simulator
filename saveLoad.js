// ========================================
// 育成状態の保存
// ========================================

const SAVE_STATE_STORAGE_KEY = "genmonoSavedStates";
const SAVE_STATE_SLOT_COUNT = 30;

// 保存済みデータを取得
function getSavedStates() {
    try {
        const savedData = localStorage.getItem(SAVE_STATE_STORAGE_KEY);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        console.error("保存データの読み込みに失敗しました。", error);
        return [];
    }
}

// 保存済みデータをブラウザに保存
function storeSavedStates(savedStates) {
    try {
        localStorage.setItem(
            SAVE_STATE_STORAGE_KEY,
            JSON.stringify(savedStates)
        );

        return true;
    } catch (error) {
        console.error("育成状態の保存に失敗しました。", error);
        return false;
    }
}

// 保存名を自動生成
function createDefaultSaveName() {
    const state = saveCurrentState();
    const rebirth = state.rebirthCount;

    // 現在の幻獣名を取得
    const genju = genjuData.find(
        item => String(item.id) === String(state.currentGenjuId)
    );

    const genjuName = genju ? genju.name : "幻獣名";

    return `${rebirth}転生・${genjuName}`;
}

// 保存モーダルを開く
function openSaveStateDialog() {
    const dialog = document.getElementById("saveStateDialog");
    const nameInput = document.getElementById("saveStateName");
    const message = document.getElementById("saveStateMessage");

    if (!dialog || !nameInput || !message) {
        console.error("保存モーダルのHTML要素が見つかりません。");
        return;
    }

    nameInput.value = "";
    message.textContent = "";

    renderSaveStateSlots();

    dialog.hidden = false;
    nameInput.focus();
}

// 保存モーダルを閉じる
function closeSaveStateDialog() {
    const dialog = document.getElementById("saveStateDialog");

    if (dialog) {
        dialog.hidden = true;
    }
}

// 30個の保存スロットを表示
function renderSaveStateSlots() {
    const list = document.getElementById("saveStateList");

    if (!list) {
        console.error("保存スロット一覧が見つかりません。");
        return;
    }

    const savedStates = getSavedStates();

    list.replaceChildren();

    for (let slotNumber = 1; slotNumber <= SAVE_STATE_SLOT_COUNT; slotNumber++) {
        const saved = savedStates.find(
            item => item.slot === slotNumber
        );

        const button = document.createElement("button");
        button.type = "button";
        button.className = "save-state-slot";
        button.dataset.slot = String(slotNumber);

        const slotLabel = document.createElement("span");
        slotLabel.textContent = `スロット${slotNumber}：`;

        const nameLabel = document.createElement("span");
        nameLabel.className = "save-state-slot-name";
        nameLabel.textContent = saved ? saved.name : "未保存";

        button.append(slotLabel, nameLabel);

        button.addEventListener("click", () => {
            saveStateToSlot(slotNumber);
        });

        list.appendChild(button);
    }
}

// 育成状態を指定スロットに保存
function saveStateToSlot(slotNumber) {
    const nameInput = document.getElementById("saveStateName");
    const message = document.getElementById("saveStateMessage");

    if (!nameInput || !message) {
        return;
    }

    // 名前が空欄なら自動命名
    const saveName = nameInput.value.trim() || createDefaultSaveName();

    const savedStates = getSavedStates();

    // 同じスロットに保存済みデータがあるか確認
    const existingIndex = savedStates.findIndex(
        item => item.slot === slotNumber
    );

    // 保存済みスロットなら上書き確認
    if (existingIndex !== -1) {
        const confirmed = window.confirm(
            `スロット${slotNumber}には「${savedStates[existingIndex].name}」が保存されています。\n上書きしますか？`
        );

        if (!confirmed) {
            return;
        }
    }

    // 現在の育成状態を取得
    const state = saveCurrentState();

    const savedData = {
        slot: slotNumber,
        name: saveName,
        state: state,
        updatedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
        savedStates[existingIndex] = savedData;
    } else {
        savedStates.push(savedData);
    }

    // ブラウザに保存
    if (!storeSavedStates(savedStates)) {
        message.textContent =
            "保存できませんでした。ブラウザの保存容量などを確認してください。";
        return;
    }

    message.textContent =
        `スロット${slotNumber}に${saveName}を保存しました。`;

    // 保存後に一覧を更新
    renderSaveStateSlots();

    // 保存完了を確認してからモーダルを閉じる
    window.alert(`スロット${slotNumber}に${saveName}を保存しました。`);

    closeSaveStateDialog();
}

// 保存機能の初期設定
function setupSaveStateButtons() {
    const saveButton = document.getElementById("historySaveButton");
    const cancelButton = document.getElementById("saveStateCancel");
    const nameInput = document.getElementById("saveStateName");

    if (!saveButton || !cancelButton || !nameInput) {
        console.error("保存機能に必要なHTML要素が見つかりません。");
        return;
    }

    // 「リストに保存」でモーダルを開く
    saveButton.addEventListener("click", openSaveStateDialog);

    // キャンセルで閉じる
    cancelButton.addEventListener("click", closeSaveStateDialog);

    // Enterキーで入力確定ではなく、最初の未保存スロットに保存
    nameInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();

            const savedStates = getSavedStates();

            let targetSlot = 1;

            while (
                targetSlot <= SAVE_STATE_SLOT_COUNT &&
                savedStates.some(item => item.slot === targetSlot)
            ) {
                targetSlot++;
            }

            if (targetSlot <= SAVE_STATE_SLOT_COUNT) {
                saveStateToSlot(targetSlot);
            } else {
                document.getElementById("saveStateMessage").textContent =
                    "空いているスロットがありません。保存先のスロットを選択してください。";
            }
        }

        if (event.key === "Escape") {
            closeSaveStateDialog();
        }
    });
}

// HTMLの読み込み完了後に設定
setupSaveStateButtons();
