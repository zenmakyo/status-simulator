// =========================
// サイトメニューの開閉処理
// =========================

document.addEventListener("DOMContentLoaded", () => {
    const menuOpen = document.getElementById("menuOpen");
    const siteMenu = document.getElementById("siteMenu");

    // 必要なHTML要素が存在しない場合は終了
    if (!menuOpen || !siteMenu) {
        return;
    }

    // メニューを開く
    function openMenu() {
        siteMenu.hidden = false;
        menuOpen.setAttribute("aria-expanded", "true");
    }

    // メニューを閉じる
    function closeMenu() {
        siteMenu.hidden = true;
        menuOpen.setAttribute("aria-expanded", "false");
    }

    // ロゴボタンを押したとき
    menuOpen.addEventListener("click", () => {
        if (siteMenu.hidden) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    // メニューの外側を押したとき
    siteMenu.addEventListener("click", (event) => {
        if (event.target === siteMenu) {
            closeMenu();
        }
    });

    // Escapeキーで閉じる
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !siteMenu.hidden) {
            closeMenu();
            menuOpen.focus();
        }
    });
});
