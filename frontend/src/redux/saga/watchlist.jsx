import { put, takeLatest } from "redux-saga/effects"
import { getSession } from "next-auth/react"
import { API_METHOD } from "../api/apiService"
import { API_WATCHLIST } from "../api/API"
import { fetchApi } from "."

function* getWatchlist() {
  const session = yield getSession()
  const userId = session?.user?.email ?? ""
  if (!userId) return
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_WATCHLIST,
    reducer: "SET_WATCHLIST",
    params: { params: { userId } },
  })
}

function* addWatchlist(action) {
  yield fetchApi({
    method: API_METHOD.POST,
    path: API_WATCHLIST,
    data: action.data,
    successMessage: "已加入自選股",
  })
  yield put({ type: "GET_WATCHLIST" })
}

function* updateWatchlistGroup(action) {
  yield fetchApi({
    method: API_METHOD.PATCH,
    path: `${API_WATCHLIST}/${action.id}/group`,
    data: { groupName: action.groupName, userId: action.userId },
    successMessage: "已更新群組",
  })
  yield put({ type: "GET_WATCHLIST" })
}

function* removeWatchlist(action) {
  yield fetchApi({
    method: API_METHOD.DELETE,
    path: `${API_WATCHLIST}/${action.id}`,
    params: { params: { userId: action.userId } },
    successMessage: "已移除自選股",
  })
  yield put({ type: "GET_WATCHLIST" })
}

export default function* watchlistSaga() {
  yield takeLatest("GET_WATCHLIST", getWatchlist)
  yield takeLatest("ADD_WATCHLIST", addWatchlist)
  yield takeLatest("UPDATE_WATCHLIST_GROUP", updateWatchlistGroup)
  yield takeLatest("REMOVE_WATCHLIST", removeWatchlist)
}
