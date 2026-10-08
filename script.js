// 現在の幻獣ID
let currentGenjuId = 0;

// 現在の幻獣データを取得
const currentGenju = genjuData[currentGenjuId];

console.log("現在の幻獣:", currentGenju);

// 現在の幻獣ID
let currentGenjuId = 0;

// 現在の幻獣データ
const currentGenju = genjuData[currentGenjuId];

// HTMLに表示
document.getElementById("genjuName").textContent = currentGenju.name;
document.getElementById("changeName").textContent = currentGenju.itemName;
document.getElementById("genjuClass").textContent = currentGenju.class;
document.getElementById("attribute").textContent = currentGenju.attribute;
