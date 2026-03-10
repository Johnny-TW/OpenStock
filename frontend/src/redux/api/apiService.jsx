import axios from "axios"
import { CANCEL } from "redux-saga"

const APIKIT = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
  timeout: 60000,
})

export const call = ({ method, path, params: originParams = {}, data }) => {
  let controller = new AbortController()

  const signal = controller.signal
  const params = { ...originParams, signal }
  const promise =
    method === API_METHOD.GET || method === API_METHOD.DELETE
      ? APIKIT[method](path, params)
      : APIKIT[method](path, data, params)

  promise[CANCEL] = () => controller.abort()

  return promise
}

export const API_METHOD = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
}
