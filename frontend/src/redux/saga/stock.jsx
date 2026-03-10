import { takeLatest } from "redux-saga/effects"
import { API_METHOD } from "../api/apiService"
import { API_STOCK_DAILY_ALL, API_STOCK_VALUATION } from "../api/API"
import { fetchApi } from "."

function* getStockDailyAll() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_DAILY_ALL,
    reducer: "SET_STOCK_DAILY_ALL",
  })
}

function* getStockValuation() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_VALUATION,
    reducer: "SET_STOCK_VALUATION",
  })
}

export default function* stockSaga() {
  yield takeLatest("GET_STOCK_DAILY_ALL", getStockDailyAll)
  yield takeLatest("GET_STOCK_VALUATION", getStockValuation)
}
