const initialState = {
  dailyAll: null,
  valuation: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_STOCK_DAILY_ALL":
      return {
        ...state,
        dailyAll: action.data,
      }
    case "SET_STOCK_VALUATION":
      return {
        ...state,
        valuation: action.data,
      }
    default:
      return state
  }
}

export default reducer
