import { takeLatest } from "redux-saga/effects"
import { API_METHOD } from "../api/apiService"
import {
  API_STOCK_DAILY_ALL,
  API_STOCK_VALUATION,
  API_STOCK_MARKET_INDEX,
  API_STOCK_TOP_VOLUME,
  API_STOCK_INTRADAY,
  API_STOCK_INDEX_HISTORY,
} from "../api/API"
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

function* getStockMarketIndex() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_MARKET_INDEX,
    reducer: "SET_STOCK_MARKET_INDEX",
  })
}

function* getStockTopVolume() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_TOP_VOLUME,
    reducer: "SET_STOCK_TOP_VOLUME",
  })
}

function* getStockIntraday() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_INTRADAY,
    reducer: "SET_STOCK_INTRADAY",
  })
}

function* getStockIndexHistory() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_INDEX_HISTORY,
    reducer: "SET_STOCK_INDEX_HISTORY",
  })
}

export default function* stockSaga() {
  yield takeLatest("GET_STOCK_DAILY_ALL", getStockDailyAll)
  yield takeLatest("GET_STOCK_VALUATION", getStockValuation)
  yield takeLatest("GET_STOCK_MARKET_INDEX", getStockMarketIndex)
  yield takeLatest("GET_STOCK_TOP_VOLUME", getStockTopVolume)
  yield takeLatest("GET_STOCK_INTRADAY", getStockIntraday)
  yield takeLatest("GET_STOCK_INDEX_HISTORY", getStockIndexHistory)
}
