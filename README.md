# SipLog 喝飲誌

一款用來記錄飲料店、飲品客製、個人評分與回購意願的現代化前端。資料會保存在瀏覽器 `localStorage`。

## 開始使用

```bash
npm install
npm run dev
```

## 功能

- 搜尋嘉義市飲料品牌、分店與地址
- 依品牌搜尋原始菜單飲品與分類
- 顯示原始價格規格、供應狀態及菜單完整度
- 依品牌資料設定甜度、冰量與最多三種配料
- 星級評分、備註與回購意願
- 最近品飲紀錄與摘要統計

## 嘉義市飲料資料庫 v12

- 資料版本：`2026.07.15-chiayi-dafa-v12`
- 品牌：29
- 已知分店：22
- 飲品：666
- 原始資料：[chiayi-drink-codex-v12.json](src/data/chiayi-drink-codex-v12.json)
- 驗證指令：`npm run validate:data`

前端不推測未知價格、不改寫原始品名，也不為缺少資料的品牌套用通用客製選項。既有品飲資料仍使用 `localStorage` 的 `siplog-records` key。

設計參考稿位於 `design/siplog-dashboard-concept.png`。

## 線上使用

[開啟 SipLog 喝飲誌](https://k89150-art.github.io/siplog-drink-journal/)
