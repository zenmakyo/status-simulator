// ========================================
// 育成状態の保存
// ========================================

const SAVE_STATE_STORAGE_KEY = "genmonoSavedStates";

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

// 保存名入力欄を表示
function openSaveStateDialog() {
    const dialog = document.getElementById("saveStateDialog");
    const nameInput = document.getElementById("saveStateName");
    const message = document.getElementById("saveStateMessage");

    dialog.hidden = false;
    nameInput.value = "";
    message.textContent = "";

    nameInput.focus();
}

// 保存名入力欄を閉じる
function closeSaveStateDialog() {
    document.getElementById("saveStateDialog").hidden = true;
}

// 育成状態を保存
function saveStateToList() {
    const nameInput = document.getElementById("saveStateName");
    const message = document.getElementById("saveStateMessage");

    const saveName = nameInput.value.trim();

    if (!saveName) {
        message.textContent = "保存名を入力してください。";
        nameInput.focus();
        return;
    }

    // 現在の育成状態を取得
    const state = saveCurrentState();

    // 保存済みデータを取得
    const savedStates = getSavedStates();

    // 同じ名前がある場合は上書き確認
    const existingIndex = savedStates.findIndex(
        saved => saved.name === saveName
    );

    if (existingIndex !== -1) {
        const confirmed = window.confirm(
            `「${saveName}」はすでに保存されています。\n上書きしますか？`
        );

        if (!confirmed) {
            return;
        }

        savedStates[existingIndex] = {
            name: saveName,
            state: state,
            updatedAt: new Date().toISOString()
        };
    } else {
        savedStates.push({
            name: saveName,
            state: state,
            updatedAt: new Date().toISOString()
        });
    }

    // ブラウザに保存
    try {
        localStorage.setItem(
            SAVE_STATE_STORAGE_KEY,
            JSON.stringify(savedStates)
        );

        message.textContent = `「${saveName}」を保存しました。`;
    } catch (error) {
        console.error("育成状態の保存に失敗しました。", error);

        message.textContent =
            "保存できませんでした。ブラウザの保存容量などを確認してください。";
    }
}

// 保存ボタンの初期設定
function setupSaveStateButtons() {
    const saveButton = document.getElementById("historySaveButton");
    const confirmButton = document.getElementById("saveStateConfirm");
    const cancelButton = document.getElementById("saveStateCancel");
    const nameInput = document.getElementById("saveStateName");

    if (!saveButton || !confirmButton || !cancelButton || !nameInput) {
        console.error("保存機能に必要なHTML要素が見つかりません。");
        return;
    }

    saveButton.addEventListener("click", openSaveStateDialog);

    confirmButton.addEventListener("click", saveStateToList);

    cancelButton.addEventListener("click", closeSaveStateDialog);

    // Enterキーでも保存
    nameInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            saveStateToList();
        }

        if (event.key === "Escape") {
            closeSaveStateDialog();
        }
    });
}

// HTMLの読み込み完了後に設定
setupSaveStateButtons();
