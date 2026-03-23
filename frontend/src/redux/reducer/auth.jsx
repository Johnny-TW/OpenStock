const initialState = {
  session: null,
  token: null,
  user: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "AUTH_RESULT":
      return {
        ...state,
        session: action.data?.session,
        token: action.data?.session?.accessToken,
        user: action.data?.session?.user,
      }
    case "LOGOUT":
      return initialState
    default:
      return state
  }
}

export default reducer
