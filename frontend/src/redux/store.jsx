import { combineReducers, configureStore } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"

import reducers from "./reducer"
import mySaga from "./saga"

const sagaMiddleware = createSagaMiddleware()

const reducer = combineReducers({
  ...reducers,
})

export default configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
})

sagaMiddleware.run(mySaga)
