import type {Product} from "./common.ts";
import type {Order} from "./common.ts";

export interface BaseDialogProp {
    title: string,
    isOpen: boolean,
    onClose: () => void
}

export interface DialogProp extends BaseDialogProp{
    onConfirm: () => void,
    children?: any
}

export interface ProductDialogProp extends BaseDialogProp {
    onSave: (product: Product) => void
}

export interface OrderDialogProp extends BaseDialogProp {
    onSave: (order: Order) => void,
    productOptions: Product[]
}

