// ========================================
// 育成ルート管理・画像出力
// ========================================

// ---------- 設定 ----------
const growthRouteExportSettings = {
    // 画像の横幅
    imageWidth: 1200,

    // 表の文字サイズ
    fontSize: 24,

    // 行の余白
    cellPadding: 14,

    // 罫線の色
    borderColor: "#999999",

    // 文字色
    textColor: "#222222",

    // 背景色
    backgroundColor: "#ffffff",

    // 転生ごとの見出し色
    // キーが転生回数、値が背景色
    rebirthHeaderColors: {
        0: "rgba(220, 221, 221, 0.5)",
        1: "rgba(187, 200, 230, 0.5)",
        2: "rgba(44, 169, 225, 0.5)",
        3: "rgba(102, 255, 102, 0.5)",
        4: "rgba(255, 255, 0, 0.5)",
        5: "rgba(255, 204, 0, 0.5)",
        6: "rgba(255, 153, 0, 0.5)",
        7: "rgba(204, 0, 0, 0.5)",
        8: "rgba(255, 51, 204, 0.5)",
        "9+": "rgba(153, 0, 204, 0.5)"
    },

    // 色が設定されていない転生回数の見出し色
    defaultRebirthHeaderColor: "#e5e5e5"
};


// ---------- 育成ルートのデータ ----------
let growthRoute = [];


// 現在の幻獣情報からルートの1行分を作成
function createGrowthRouteEntry(genjuId, rebirth) {
    return {
        genjuId: Number(genjuId),
        rebirth: Number(rebirth)
    };
}


// 育成ルートを初期化
function initializeGrowthRoute(genjuId, rebirth) {
    if (genjuId === undefined || genjuId === null) {
        return;
    }

    growthRoute = [
        createGrowthRouteEntry(genjuId, rebirth ?? 0)
    ];
}


// 現在の育成ルートに変化を追加
function recordGrowthRouteChange(genjuId, rebirth) {
    if (genjuId === undefined || genjuId === null) {
        return;
    }

    // ルートがまだ存在しない場合は初期化
    if (growthRoute.length === 0) {
        initializeGrowthRoute(genjuId, rebirth);
        return;
    }

    growthRoute.push(
        createGrowthRouteEntry(genjuId, rebirth ?? 0)
    );
}


// 育成ルートの保存用データを取得
function getGrowthRouteSnapshot() {
    // 初期ルートが未設定なら現在の幻獣で初期化
    if (
        growthRoute.length === 0 &&
        typeof currentGenjuId !== "undefined"
    ) {
        initializeGrowthRoute(
            currentGenjuId,
            typeof rebirthCount !== "undefined" ? rebirthCount : 0
        );
    }

    return growthRoute.map(entry => ({
        genjuId: entry.genjuId,
        rebirth: entry.rebirth
    }));
}


// 保存済みの育成ルートを復元
function restoreGrowthRouteSnapshot(snapshot) {
    if (!Array.isArray(snapshot)) {
        // 古い履歴データなどでルート情報がない場合
        if (typeof currentGenjuId !== "undefined") {
            initializeGrowthRoute(
                currentGenjuId,
                typeof rebirthCount !== "undefined" ? rebirthCount : 0
            );
        }
        return;
    }

    growthRoute = snapshot.map(entry => ({
        genjuId: Number(entry.genjuId),
        rebirth: Number(entry.rebirth)
    }));
}


// ---------- 画像描画 ----------

// 文字列をセル幅に合わせて折り返す
function wrapGrowthRouteText(ctx, text, maxWidth) {
    const result = [];
    const lines = String(text ?? "").split("\n");

    for (const sourceLine of lines) {
        let currentLine = "";

        for (const character of sourceLine) {
            const testLine = currentLine + character;

            if (
                currentLine !== "" &&
                ctx.measureText(testLine).width > maxWidth
            ) {
                result.push(currentLine);
                currentLine = character;
            } else {
                currentLine = testLine;
            }
        }

        result.push(currentLine);
    }

    return result.length > 0 ? result : [""];
}


// Canvasに文字を描画
function drawGrowthRouteText(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = wrapGrowthRouteText(ctx, text, maxWidth);

    lines.forEach((line, index) => {
        ctx.fillText(
            line,
            x,
            y + index * lineHeight
        );
    });

    return lines.length;
}


// 画像を共有またはダウンロード
function downloadGrowthRouteImage(canvas, format, shareWindow = window) {
    const mimeType = format === "jpeg"
        ? "image/jpeg"
        : "image/png";

    const extension = format === "jpeg"
        ? "jpg"
        : "png";

    canvas.toBlob(async blob => {
        if (!blob) {
            alert("画像の作成に失敗しました。");
            return;
        }

        const file = new File(
            [blob],
            `育成ルート.${extension}`,
            { type: mimeType }
        );

        const shareNavigator = shareWindow.navigator;

        // ファイル共有に対応しているか確認
        let canShareFile = false;

        try {
            canShareFile =
                typeof shareNavigator.share === "function" &&
                typeof shareNavigator.canShare === "function" &&
                shareNavigator.canShare({ files: [file] });
        } catch (error) {
            canShareFile = false;
        }

        // 対応していれば共有メニューを開く
        if (canShareFile) {
            try {
                await shareNavigator.share({
                    files: [file],
                    title: "育成ルート"
                });

                return;

            } catch (error) {
                // 共有をキャンセルした場合はプレビューに留まる
                if (error.name === "AbortError") {
                    return;
                }
            }
        }

        // 共有に対応していない場合はダウンロード
        const url = URL.createObjectURL(blob);
        const link = shareWindow.document.createElement("a");

        link.href = url;
        link.download = `育成ルート.${extension}`;

        shareWindow.document.body.appendChild(link);
        link.click();
        shareWindow.document.body.removeChild(link);

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

    }, mimeType, format === "jpeg" ? 0.92 : undefined);
}

// ---------- 育成ルートのプレビュー画面 ----------
function showGrowthRoutePreview(canvas, previewWindow, format) {
    const doc = previewWindow.document;

    // プレビュー画面のHTML
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>育成ルートプレビュー</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 20px;
                    background: #f3f3f3;
                    font-family: sans-serif;
                    text-align: center;
                }

                .preview-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .button-area {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                button {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                }

                #saveButton {
                    background: #3988d6;
                    color: white;
                }

                #backButton {
                    background: #777;
                    color: white;
                }

                #previewImage {
                    display: block;
                    width: 100%;
                    height: auto;
                    background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
            </style>
        </head>

        <body>
            <div class="preview-container">

                <div class="button-area">
                    <button id="saveButton">
                        画像を保存
                    </button>

                    <button id="backButton">
                        この画面を閉じる
                    </button>
                </div>

                <img id="previewImage" alt="育成ルート">

            </div>
        </body>
        </html>
    `);
    doc.close();

    // 生成済みCanvasをプレビュー表示
    doc.getElementById("previewImage").src =
        canvas.toDataURL("image/png");

    // 保存ボタン
    doc.getElementById("saveButton").addEventListener("click", () => {
    downloadGrowthRouteImage(canvas, format, previewWindow);
    });

    // プレビュー画面を閉じるボタン
    doc.getElementById("backButton").addEventListener("click", () => {
        previewWindow.close();
    });

    previewWindow.focus();
}

// ---------- 育成ルート画像の出力 ----------
function exportGrowthRouteImage(format = "png") {

    // 出力時点の最新ルートを取得
    const routeSnapshot = getGrowthRouteSnapshot();

    if (routeSnapshot.length === 0) {
        alert("出力する育成ルートがありません。");
        return;
    }

    if (typeof genjuData === "undefined") {
        alert("幻獣データを読み込めません。");
        return;
    }

    // 新しいタブを開く
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
        alert("プレビュー画面を開けませんでした。ポップアップを許可してください。");
        return;
    }

    const settings = growthRouteExportSettings;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = settings.imageWidth;
    const margin = 40;
    const tableWidth = width - margin * 2;

    // 列幅：幻獣名45%、クラス10%、変化アイテム名45%
    const columnWidths = [
        tableWidth * 0.45,
        tableWidth * 0.10,
        tableWidth * 0.45
    ];

    const columnX = [
        margin,
        margin + columnWidths[0],
        margin + columnWidths[0] + columnWidths[1]
    ];

    const fontSize = settings.fontSize;
    const lineHeight = Math.ceil(fontSize * 1.5);
    const padding = settings.cellPadding;

    ctx.font = `${fontSize}px sans-serif`;

    // 転生回数ごとにまとめる
    const groupedRoutes = new Map();

    routeSnapshot.forEach(entry => {
        if (!groupedRoutes.has(entry.rebirth)) {
            groupedRoutes.set(entry.rebirth, []);
        }

        groupedRoutes.get(entry.rebirth).push(entry);
    });

    // 新しい転生回数を上にする
    const rebirthNumbers = [...groupedRoutes.keys()]
        .sort((a, b) => b - a);

    // 描画する行の情報を作成
    const drawRows = [];

    rebirthNumbers.forEach(rebirth => {
        drawRows.push({
            type: "rebirth",
            rebirth
        });

        const entries = groupedRoutes.get(rebirth);

        // 同じ転生内は逆順（新しい変化を上にする）
        [...entries].reverse().forEach(entry => {
            const genju = genjuData[entry.genjuId];

            if (!genju) {
                return;
            }

            drawRows.push({
                type: "data",
                name: genju.name ?? "",
                className: genju.class ?? "",
                itemName: genju.itemName ?? ""
            });
        });
    });

    // ---------- 必要な画像高さを計算 ----------
    let totalHeight = margin;

    ctx.font = `bold ${fontSize + 4}px sans-serif`;

    totalHeight += lineHeight + 24;

    drawRows.forEach(row => {
        if (row.type === "rebirth") {
            totalHeight += lineHeight + padding * 2;
            return;
        }

        ctx.font = `${fontSize}px sans-serif`;

        const values = [
            row.name,
            row.className,
            row.itemName
        ];

        let maxLines = 1;

        values.forEach((value, index) => {
            const lines = wrapGrowthRouteText(
                ctx,
                value,
                columnWidths[index] - padding * 2
            );

            maxLines = Math.max(maxLines, lines.length);
        });

        totalHeight += maxLines * lineHeight + padding * 2;
    });

    totalHeight += margin;

    canvas.width = width;
    canvas.height = totalHeight;

    // Canvasのサイズ設定後にスタイルを再設定
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, width, totalHeight);

    let y = margin;

    // タイトル
    ctx.fillStyle = settings.textColor;
    ctx.font = `bold ${fontSize + 4}px sans-serif`;
    ctx.textBaseline = "top";

    ctx.fillText("育成ルート", margin, y);

    y += lineHeight + 24;

    // ---------- 表を描画 ----------
    drawRows.forEach(row => {
        // 転生見出し
        if (row.type === "rebirth") {
            const color = row.rebirth >= 9
                ? (
                    settings.rebirthHeaderColors["9+"] ??
                    settings.defaultRebirthHeaderColor
                )
                : (
                    settings.rebirthHeaderColors[row.rebirth] ??
                    settings.defaultRebirthHeaderColor
                );

            const height = lineHeight + padding * 2;

            ctx.fillStyle = color;
            ctx.fillRect(margin, y, tableWidth, height);

            ctx.strokeStyle = settings.borderColor;
            ctx.strokeRect(margin, y, tableWidth, height);

            ctx.fillStyle = settings.textColor;
            ctx.font = `bold ${fontSize}px sans-serif`;

            ctx.fillText(
                `${row.rebirth}転生目`,
                margin + padding,
                y + padding
            );

            y += height;
            return;
        }

        // 通常データ行
        ctx.font = `${fontSize}px sans-serif`;

        const values = [
            row.name,
            row.className,
            row.itemName
        ];

        const wrappedValues = values.map((value, index) => {
            return wrapGrowthRouteText(
                ctx,
                value,
                columnWidths[index] - padding * 2
            );
        });

        const maxLines = Math.max(
            ...wrappedValues.map(lines => lines.length)
        );

        const height = maxLines * lineHeight + padding * 2;

        // 背景
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(margin, y, tableWidth, height);

        // 外枠
        ctx.strokeStyle = settings.borderColor;
        ctx.strokeRect(margin, y, tableWidth, height);

        // 縦罫線
        ctx.beginPath();
        ctx.moveTo(columnX[1], y);
        ctx.lineTo(columnX[1], y + height);
        ctx.moveTo(columnX[2], y);
        ctx.lineTo(columnX[2], y + height);
        ctx.stroke();

        // 文字
        ctx.fillStyle = settings.textColor;

        wrappedValues.forEach((lines, index) => {
            lines.forEach((line, lineIndex) => {
                ctx.fillText(
                    line,
                    columnX[index] + padding,
                    y + padding + lineIndex * lineHeight
                );
            });
        });

        y += height;
    });

    showGrowthRoutePreview(canvas, previewWindow, format);
}


// ---------- 出力ボタンの設定 ----------
function setupGrowthRouteExportButton() {
    const button = document.getElementById("historyExportButton");

    if (!button || button.dataset.growthRouteReady === "true") {
        return;
    }

    button.dataset.growthRouteReady = "true";

    // 既存の「履歴の出力」ボタンからPNGを出力
    button.addEventListener("click", () => {
        exportGrowthRouteImage("png");
    });
}


// ---------- 初期設定 ----------
function setupGrowthRouteExport() {
    // 初期ルートが未設定なら現在の幻獣を開始地点にする
    if (
        growthRoute.length === 0 &&
        typeof currentGenjuId !== "undefined"
    ) {
        initializeGrowthRoute(
            currentGenjuId,
            typeof rebirthCount !== "undefined" ? rebirthCount : 0
        );
    }

    setupGrowthRouteExportButton();
}


// DOMの読み込み後にボタンを設定
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        setupGrowthRouteExport
    );
} else {
    setupGrowthRouteExport();
}
