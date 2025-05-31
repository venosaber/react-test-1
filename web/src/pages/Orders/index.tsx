import {FTable} from '../../components'
import type {Header, Order, Product} from '../../utils'
import {useState, useEffect} from 'react'
import api from "../../plugins/api.ts"
import {Button} from '@mui/material';
import {OrderDialog} from '../../components';

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
            <Button variant="outlined" onClick={onAdd}>Add Order</Button>
            <FTable width={1000} headers={headers} rows={orders} onDelete={onDelete} />
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