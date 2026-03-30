const initialState = {
  list: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_WATCHLIST":
      return { ...state, list: action.data ?? [] }
    default:
      return state
  }
}

export default reducer
