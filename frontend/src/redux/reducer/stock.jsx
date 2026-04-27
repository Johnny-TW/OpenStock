const initialState = {
  dailyAll: null,
  valuation: null,
  marketIndex: null,
  topVolume: null,
  intraday: null,
  indexHistory: null,
  stockDetail: null,
  stockDetailLoaded: false,
  stockHistory: null,
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
    case "SET_STOCK_DETAIL":
      return {
        ...state,
        stockDetail: action.data,
        stockDetailLoaded: true,
      }
    case "CLEAR_STOCK_DETAIL":
      return {
        ...state,
        stockDetail: null,
        stockDetailLoaded: false,
      }
    case "SET_STOCK_HISTORY":
      return {
        ...state,
        stockHistory: action.data,
      }
    case "CLEAR_STOCK_HISTORY":
      return {
        ...state,
        stockHistory: null,
      }
    default:
      return state
  }
}

export default reducer
