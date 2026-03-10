/**
 * 使用 webpack require.context 自動匯入模組
 * @param context - require.context 的回傳值
 * @returns 以檔名 (不含副檔名) 為 key 的物件
 */
export function importAll(context) {
  const modules = {}
  context.keys().forEach((key) => {
    // 取得檔名，去除 ./ 前綴與副檔名
    const name = key.replace(/^\.\//, "").replace(/\.\w+$/, "")
    // 跳過 index 本身
    if (name === "index") return
    const mod = context(key)
    modules[name] = mod.default || mod
  })
  return modules
}
