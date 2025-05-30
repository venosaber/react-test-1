import {FTable} from '../../components'
import type {Header, Order} from '../../utils'
import {useState, useEffect} from 'react'
import api from "../../plugins/api.ts"
import {Button} from '@mui/material';
import {OrderDialog} from '../../components/Dialog';

const headers: Header[] = [
    {name: 'id', text: 'ID'},
    {name: 'productName', text: 'Product name'},
    {name: 'quantity', text: 'Quantity'},
    {name: 'amount', text: 'Amount'},
    {name: 'action', text: ''}
];

function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const getData = async () => {
        try{
            const ordersData = await api.get('/orders/');
            setOrders(ordersData.data);
        }catch(e){
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

    const deleteData = async (id: number) => {
        try{
            await api.delete(`/orders/${id}`);
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

        // add a new product
        // Post - Optimistic UI update
        const id = orders[orders.length - 1]?.id + 1 || 1;
        const newOrder = {...order, id};
        setOrders(products => [...products, newOrder]);

        // Update to server
        try{
            const addedProduct = await postData({...order, id});
            console.log('Product added successfully: ', addedProduct);
        }catch (e){ // rollback
            setOrders(orders => orders.filter(p => p.id !== id));
            console.error('Error adding product: ', e);
        }
    }

    const onDelete = async (id: number) => {
        // Delete - Optimistic UI update
        const deleteIndex: number = orders.findIndex(p => p.id === id);
        const deletedOrder: Order = orders[deleteIndex];
        const newOrders: Order[] = [...orders].filter(p => p.id !== id);
        setOrders(newOrders);

        // Update to server
        try{
            await deleteData(id);
            console.log('Order deleted successfully: ', deletedOrder);
        }catch (e){ // rollback
            newOrders.splice(deleteIndex, 0, deletedOrder);
            setOrders(newOrders);
            console.error('Error deleting product: ', e);
        }
    }


    return (
        <>
            <h1>Order page</h1>
            <Button variant="outlined" onClick={onAdd}>Add Product</Button>
            <FTable tableName={'Products'} width={1000} headers={headers} rows={orders} onDelete={onDelete} />
            <OrderDialog title={"Add New Order"}
                           isOpen={isDialogOpen}
                           onSave={onSave} onClose={() => setIsDialogOpen(false)}
                           key={Date.now()}

            />
        </>
    )
}

export default Orders;