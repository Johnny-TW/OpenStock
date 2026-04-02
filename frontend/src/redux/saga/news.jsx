import { takeLatest } from "redux-saga/effects"
import { API_METHOD } from "../api/apiService"
import { API_STOCK_NEWS, API_STOCK_NEWS_ALL } from "../api/API"
import { fetchApi } from "."

function* getNews() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_NEWS,
    reducer: "SET_NEWS",
  })
}

function* getAllNews() {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_STOCK_NEWS_ALL,
    reducer: "SET_ALL_NEWS",
  })
}

export default function* newsSaga() {
  yield takeLatest("GET_NEWS", getNews)
  yield takeLatest("GET_ALL_NEWS", getAllNews)
}
