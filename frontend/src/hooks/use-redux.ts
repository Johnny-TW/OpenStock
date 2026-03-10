import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
  type TypedUseSelectorHook,
} from "react-redux"
import type { RootState, AppDispatch } from "@/redux/types"

/**
 * Typed useDispatch — 自動推斷 dispatch 型別
 * 使用方式：const dispatch = useAppDispatch()
 */
export const useAppDispatch: () => AppDispatch = useReduxDispatch

/**
 * Typed useSelector — 自動推斷 state 型別
 * 使用方式：const token = useAppSelector(state => state.auth.token)
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector
