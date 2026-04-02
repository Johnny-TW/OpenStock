const initialState = {
  revenue: null,
  grossMargin: null,
  dividendYield: null,
  peRatio: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_RANKING_REVENUE":
      return { ...state, revenue: action.data }
    case "SET_RANKING_GROSS_MARGIN":
      return { ...state, grossMargin: action.data }
    case "SET_RANKING_DIVIDEND_YIELD":
      return { ...state, dividendYield: action.data }
    case "SET_RANKING_PE_RATIO":
      return { ...state, peRatio: action.data }
    default:
      return state
  }
}

export default reducer
