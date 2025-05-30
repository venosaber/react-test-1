export interface Header{
    name: string,
    text: string
}

export interface Product{
    id: number,
    name: string,
    price: number,
    remaining: number,
}

export interface Order{
    id: number,
    productName: string,
    quantity: number,
    amount: number,
}