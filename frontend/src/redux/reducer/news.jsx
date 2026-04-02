const initialState = {
  data: null,
  allNews: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_NEWS":
      return { ...state, data: action.data }
    case "SET_ALL_NEWS":
      return { ...state, allNews: action.data }
    default:
      return state
  }
}

export default reducer
