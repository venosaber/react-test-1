export interface Header{
    name: string,
    text: string
}

export interface Product{
    id: string,
    name: string,
    price: number,
    remaining: number,
}

export interface Order{
    id: string,
    date: string,
    product_id: string,
    quantity: number,
    amount: number,
}