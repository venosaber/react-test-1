import {FTable} from '../../components'
import type {Header, Product} from '../../utils'
import {useState, useEffect} from 'react'
import api from "../../plugins/api.ts"
import {Button} from '@mui/material';
import {ProductDialog} from '../../components';

const headers: Header[] = [
    {name: 'id', text: 'ID'},
    {name: 'name', text: 'Name'},
    {name: 'price', text: 'Price'},
    {name: 'remaining', text: 'Remaining'},
    {name: 'action', text: ''}
];

function Products() {
    const [products, setProducts] = useState<Product[]>([]);

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const getData = async () => {
        try{
            const productsData = await api.get('/products/');
            setProducts(productsData.data);
        }catch(e){
            console.error(e);
        }
    }

    const postData = async (product: Product) => {
        try{
            const response = await api.post('/products/', product);
            return response.data;
        }catch (e){
            throw e;
        }
    }

    const deleteData = async (id: string) => {
        try{
            await api.delete(`/products/${id}`);
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

    const onSave = async (product: Product) => {
        setIsDialogOpen(false);

        // add a new product
        // Post - Optimistic UI update
        const id: string = String(Number(products[products.length - 1]?.id) + 1 || 1); // if products[] is empty => new id is 1
        const newProduct = {...product, id};
        setProducts(products => [...products, newProduct]);

        // Update to server
        try{
            const addedProduct: Product = await postData({...product, id});
            console.log('Product added successfully: ', addedProduct);
        }catch (e){ // rollback
            setProducts(products => products.filter(p => p.id !== id));
            console.error('Error adding product: ', e);
        }
    }

    const onDelete = async (id: string) => {
        // Delete - Optimistic UI update
        const deleteIndex: number = products.findIndex(p => p.id === id);
        const deletedProduct: Product = products[deleteIndex];
        const newProducts: Product[] = [...products].filter(p => p.id !== id);
        setProducts(newProducts);

        // Update to server
        try{
            await deleteData(id);
            console.log('Product deleted successfully: ', deletedProduct);
        }catch (e){ // rollback
            newProducts.splice(deleteIndex, 0, deletedProduct);
            setProducts(newProducts);
            console.error('Error deleting product: ', e);
        }
    }


    return (
        <>
            <h1>Product page</h1>
            <Button variant="outlined" onClick={onAdd}>Add Product</Button>
            <FTable width={1000} headers={headers} rows={products} onDelete={onDelete} />
            <ProductDialog title={"Add New Product"}
                           isOpen={isDialogOpen}
                           onSave={onSave} onClose={() => setIsDialogOpen(false)}
                           key={Date.now()}

            />
        </>
    )
}

export default Products;

