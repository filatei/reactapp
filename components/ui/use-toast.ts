// Inspired by react-hot-toast library
import * as React from "react"

import type {
    ToastActionElement,
    ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
}

type ToastState = {
    toasts: ToasterToast[]
}

type ToastAction = {
    type: "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST"
    toast?: ToasterToast
}

const reducer = (state: ToastState, action: ToastAction): ToastState => {
    switch (action.type) {
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [action.toast!, ...state.toasts].slice(0, TOAST_LIMIT),
            }

        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast?.id
                        ? { ...t, ...action.toast }
                        : t
                ),
            }

        case "DISMISS_TOAST": {
            const { toasts } = state
            return {
                ...state,
                toasts: toasts.map((t) =>
                    t.id === action.toast?.id
                        ? {
                            ...t,
                            open: false,
                        }
                        : t
                ),
            }
        }

        case "REMOVE_TOAST":
            if (action.toast?.id) {
                return {
                    ...state,
                    toasts: state.toasts.filter((t) => t.id !== action.toast?.id),
                }
            }
            return {
                ...state,
                toasts: [],
            }
    }
}

function useToast() {
    const [state, dispatch] = React.useReducer(reducer, {
        toasts: [],
    })

    React.useEffect(() => {
        state.toasts.forEach((toast) => {
            if (toast.open === false) {
                setTimeout(() => {
                    dispatch({
                        type: "REMOVE_TOAST",
                        toast,
                    })
                }, TOAST_REMOVE_DELAY)
            }
        })
    }, [state.toasts])

    function toast(props: Omit<ToasterToast, "id">) {
        const id = Math.random().toString(36).substring(2, 9)
        const update = (props: ToasterToast) =>
            dispatch({
                type: "UPDATE_TOAST",
                toast: { ...props, id },
            })
        const dismiss = () => dispatch({ type: "DISMISS_TOAST", toast: { id } as ToasterToast })

        dispatch({
            type: "ADD_TOAST",
            toast: {
                ...props,
                id,
                open: true,
                onOpenChange: (open) => {
                    if (!open) dismiss()
                },
            },
        })

        return {
            id,
            dismiss,
            update,
        }
    }

    return {
        toast,
        toasts: state.toasts,
    }
}

export { useToast } 