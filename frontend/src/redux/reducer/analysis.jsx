const initialState = {
  result: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ANALYSIS_RESULT":
      return { ...state, result: action.data ?? null }
    default:
      return state
  }
}

export default reducer
