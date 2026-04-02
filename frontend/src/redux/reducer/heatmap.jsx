const initialState = {
  data: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_HEATMAP":
      return { ...state, data: action.data }
    default:
      return state
  }
}

export default reducer
