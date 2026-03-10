import { importAll } from "@utils/import"

const context = require.context("./", false, /\.jsx$/)
export default importAll(context)
