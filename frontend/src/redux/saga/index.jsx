import { all, put } from "redux-saga/effects"
import { API_METHOD, call } from "../api/apiService"
import _ from "lodash"
import { importAll } from "@utils/import"
import Cookies from "js-cookie"
import { getSession } from "next-auth/react"
import { login } from "@/providers/LoginHandler"

export function* setLoading(loading, path, params = null) {
  yield put({ type: "SET_LOADING", data: { loading, path, params } })
}

export function* fetchApi({
  method,
  path,
  reducer = null,
  data: variables = null,
  successMessage = null,
  success: successAction,
  error: errorAction,
  failValue = null,
  params = {},
  useFormData = false,
}) {
  yield setLoading(true, path, params)
  let result = failValue
  let success = false

  let data
  if (useFormData) {
    //laravel put patch 無法讀取 formdata
    //用_method給定方法 統一用POST發
    if (method === API_METHOD.PUT || method === API_METHOD.PATCH)
      variables._method = method

    //轉換formdata
    data = convertFormdata(variables)

    //統一用POST發
    method = API_METHOD.POST
  } else data = variables

  const session = yield globalThis?.window ? getSession() : Promise.resolve(null)
  params = {
    ...params,
    headers: {
      Authorization: `Bearer ${session?.accessToken ?? ""}`,
    },
  }

  try {
    const { data: response } = yield call({ method, path, params, data })

    // NestJS / v2 API 直接回傳資料，不包 { status, result }
    if (path.startsWith("v2") || path.startsWith("stock")) {
      success = true
      result = response
    } else {
      const status = response?.status ?? 0
      if (status === 1) {
        result = response?.result
        success = true
      } else {
        yield put({
          type: "SET_API_ERROR",
          data: {
            message: response?.message ?? "Something Error, Please Try again.",
            action: errorAction && errorAction(status),
          },
        })
      }
    }
  } catch (error) {
    console.log(error)
    let statusCode = error?.response?.status
    //未驗證 前往驗證
    if (typeof error?.response === "undefined" || statusCode === 401) {
      yield put({
        type: "SET_API_ERROR",
        data: {
          message: "Please login again.",
          action: () => login(),
        },
      })
      return
    }

    if (statusCode === 502 || statusCode === 400) {
      if (!Cookies.get(process.env.NEXT_PUBLIC_TRY_RELOAD_KEY)) {
        Object.keys(Cookies.get()).forEach(function (cookieName) {
          if (cookieName !== process.env.NEXT_PUBLIC_TRY_RELOAD_KEY)
            Cookies.remove(cookieName, {})
        })
        Cookies.set(process.env.NEXT_PUBLIC_TRY_RELOAD_KEY, true, {
          expires: 1 / 24 / 12,
        })
        window.location.reload()
        return
      }
    }
    let message = error?.response?.data?.message ?? error?.response?.message ?? `${error}`

    yield put({
      type: "SET_API_ERROR",
      data: {
        message,
        action: errorAction && errorAction(statusCode),
      },
    })
  }

  //有設定 reducer才會呼叫
  if (reducer) yield put({ type: reducer, data: result, request: data, params })

  if (success && successMessage)
    yield put({
      type: "SET_API_SUCCESS",
      data: {
        message: successMessage,
        // action: successAction,
        action: () => successAction && successAction(result),
      },
    })

  if (success && !successMessage && successAction) successAction(result)

  yield setLoading(false, path)

  return result
}

const convertFormdata = (variables) => {
  let data = new FormData()
  for (var key in variables) {
    if (Array.isArray(variables[key])) {
      for (var i = 0; i < variables[key]?.length; i++) {
        data.append(key + "[" + i + "]", variables[key][i] ?? "")
      }
    } else data.append(key, variables[key] ?? "")
  }
  return data
}

function* rootSaga() {
  const context = require.context(".", false, /\.jsx$/)

  const sagas = _.map(importAll(context), (o) => o())

  yield all(sagas)
}

export default rootSaga
