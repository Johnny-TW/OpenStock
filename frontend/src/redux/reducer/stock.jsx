const initialState = {
  dailyAll: null,
  valuation: null,
  marketIndex: null,
  topVolume: null,
  intraday: null,
  indexHistory: null,
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
    case "SET_STOCK_MARKET_INDEX":
      return {
        ...state,
        marketIndex: action.data,
      }
    case "SET_STOCK_TOP_VOLUME":
      return {
        ...state,
        topVolume: action.data,
      }
    case "SET_STOCK_INTRADAY":
      return {
        ...state,
        intraday: action.data,
      }
    case "SET_STOCK_INDEX_HISTORY":
      return {
        ...state,
        indexHistory: action.data,
      }
    default:
      return state
  }
}

export default reducer
