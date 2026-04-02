import { takeLatest } from "redux-saga/effects"
import { API_METHOD } from "../api/apiService"
import { API_STOCK_HEATMAP } from "../api/API"
import { fetchApi } from "."

function* getHeatmap({ data: period }) {
  yield fetchApi({
    method: API_METHOD.GET,
    path: `${API_STOCK_HEATMAP}${period ? `?period=${period}` : ""}`,
    reducer: "SET_HEATMAP",
  })
}

export default function* heatmapSaga() {
  yield takeLatest("GET_HEATMAP", getHeatmap)
}
