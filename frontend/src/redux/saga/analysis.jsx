import { put, takeLatest } from "redux-saga/effects"
import { API_METHOD } from "../api/apiService"
import { API_ANALYSIS_MARKET } from "../api/API"
import { fetchApi } from "."

function* getCachedAnalysis() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_ANALYSIS_MARKET,
    reducer: "SET_ANALYSIS_RESULT",
  })
}

function* analyzeMarket(action) {
  yield fetchApi({
    method: API_METHOD.POST,
    path: API_ANALYSIS_MARKET,
    reducer: "SET_ANALYSIS_RESULT",
    data: action.data ?? {},
    timeout: 180000,
  })
}

export default function* analysisSaga() {
  yield takeLatest("GET_CACHED_ANALYSIS", getCachedAnalysis)
  yield takeLatest("ANALYZE_MARKET", analyzeMarket)
}
