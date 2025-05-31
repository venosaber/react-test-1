import {FTable} from '../../components'
import type {Header, Order, Product} from '../../utils'
import {useState, useEffect, useMemo, type ChangeEvent} from 'react'
import api from "../../plugins/api.ts"
import {Box, Button, TextField} from '@mui/material';
import {OrderDialog, NavBar} from '../../components';

const headers: Header[] = [
    {name: 'id', text: 'ID'},
    {name: 'product_id', text: 'Product name'},
    {name: 'quantity', text: 'Quantity'},
    {name: 'amount', text: 'Amount'},
    {name: 'action', text: ''}
];

function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const [productOptions, setProductOptions] = useState<Product[]>([]);

    const [searchStr, setSearchStr] = useState<string>('');     // filter orders by product name

    const filteredOrders = useMemo(()=> {
        return orders.filter(order => {
            return order.product_id.toLowerCase().includes(searchStr.toLowerCase());
        })
    },[searchStr, orders])

    const groupData = (products: Product[], orders: Order[]) => {
        // hash table (product)
        const productObj: {[id: string]: string} = {};
        products.forEach((product: Product) => {
            productObj[product.id] = product.name;
        });

        // join products to orders
        orders.forEach((order: Order) => {
            order.product_id = productObj[order.product_id]
        });
        setOrders([...orders]);
    }

    const getData = async () => {
        try{
            const [productsData, ordersData] = await Promise.all(
                [api.get('/products/'), api.get('/orders/')]
            );

            // group data
            groupData(productsData.data, ordersData.data);

            // prop productOptions
            setProductOptions(productsData.data);
        }catch (e){
            console.error(e);
        }
    }

    const postData = async (order: Order) => {
        try{
            const response = await api.post('/orders/', order);
            return response.data;
        }catch (e){
            throw e;
        }
    }

    const deleteData = async (id: string) => {
        try{
            await api.delete(`/orders/${id}`);
        }catch (e){
            throw e;
        }
    }

    const putProductData = async (product: Product) => {
        try{
            const response = await api.put(`/products/${product.id}`, product);
            return response.data;
        }catch (e){
            throw e;
        }
    }

    // on mounted
    useEffect(()=>{
        getData();
    },[])

    const onAdd = () => {
        setIsDialogOpen(true);
    }

    const onSave = async (order: Order) => {
        setIsDialogOpen(false);

        const productId: string = order.product_id;
        const productName: string = productOptions.find((p: Product) => p.id === productId)?.name || productId;
        const orderForState = {...order, product_id: productName};

        // add a new order
        // Post - Optimistic UI update
        const id: string = String(Number(orders[orders.length - 1]?.id) + 1 || 1);
        const newOrderForState = {...orderForState, id};
        setOrders(orders => [...orders, newOrderForState]);

        // Update to server
        try{
            // update the remaining quantity (reduce)
            const curProduct: Product = productOptions.find(p => p.id === productId)!;
            curProduct.remaining -= order.quantity;
            await putProductData(curProduct);
            // add the order
            const addedOrder: Order = await postData({...order, id});
            console.log('Order added successfully: ', addedOrder);
        }catch (e){ // rollback
            setOrders(orders => orders.filter(order => order.id !== id));
            console.error('Error adding order: ', e);
        }
    }

    const onDelete = async (id: string) => {
        // Delete - Optimistic UI update
        const deleteIndex: number = orders.findIndex(order => order.id === id);
        const deletedOrder: Order = orders[deleteIndex];
        const newOrders: Order[] = [...orders].filter(order => order.id !== id);
        setOrders(newOrders);

        // Update to server
        try{
            // update the remaining quantity (add back)
            const curProduct: Product = productOptions.find(p => p.name === deletedOrder.product_id)!;
            curProduct.remaining += deletedOrder.quantity;
            await putProductData(curProduct);
            // delete the order
            await deleteData(id);
            console.log('Order deleted successfully: ', deletedOrder);
        }catch (e){ // rollback
            newOrders.splice(deleteIndex, 0, deletedOrder);
            setOrders(newOrders);
            console.error('Error deleting order: ', e);
        }
    }


    return (
        <>
            <NavBar />

            <h1 style={{textAlign: 'center', marginTop: '80px'}}>Order page</h1>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '1000px', margin: '20px auto'}}>
                <TextField label="Search" variant="outlined"
                           value={searchStr}
                           onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchStr(event.target.value)}
                           sx={{width: 400, fontSize: '16px', flexGrow: 1, marginRight: '20px'}}
                />
                <Button variant="contained" color={'success'} onClick={onAdd} sx={{padding: '15px'}}>
                    Add New
                </Button>
            </Box>

            <FTable width={1000} headers={headers} rows={filteredOrders} onDelete={onDelete} />
            <OrderDialog title={"Add New Order"}
                           isOpen={isDialogOpen}
                           onSave={onSave} onClose={() => setIsDialogOpen(false)}
                           productOptions={productOptions}
                           key={Date.now()}
            />
        </>
    )
}

export default Orders;