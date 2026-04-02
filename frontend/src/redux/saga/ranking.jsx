import { takeLatest } from "redux-saga/effects"
import { API_METHOD } from "../api/apiService"
import {
  API_STOCK_RANKING_REVENUE,
  API_STOCK_RANKING_GROSS_MARGIN,
  API_STOCK_RANKING_DIVIDEND_YIELD,
  API_STOCK_RANKING_PE_RATIO,
} from "../api/API"
import { fetchApi } from "."

function* getRankingRevenue() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_RANKING_REVENUE,
    reducer: "SET_RANKING_REVENUE",
  })
}

function* getRankingGrossMargin() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_RANKING_GROSS_MARGIN,
    reducer: "SET_RANKING_GROSS_MARGIN",
  })
}

function* getRankingDividendYield() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_RANKING_DIVIDEND_YIELD,
    reducer: "SET_RANKING_DIVIDEND_YIELD",
  })
}

function* getRankingPeRatio() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_RANKING_PE_RATIO,
    reducer: "SET_RANKING_PE_RATIO",
  })
}

export default function* rankingSaga() {
  yield takeLatest("GET_RANKING_REVENUE", getRankingRevenue)
  yield takeLatest("GET_RANKING_GROSS_MARGIN", getRankingGrossMargin)
  yield takeLatest("GET_RANKING_DIVIDEND_YIELD", getRankingDividendYield)
  yield takeLatest("GET_RANKING_PE_RATIO", getRankingPeRatio)
}
