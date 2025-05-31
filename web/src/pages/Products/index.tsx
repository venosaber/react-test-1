import {FTable} from '../../components'
import type {Header, Product} from '../../utils'
import {useState, useEffect, useMemo,type ChangeEvent} from 'react'
import api from "../../plugins/api.ts"
import {TextField, Button, Box} from '@mui/material';
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

    const [searchStr, setSearchStr] = useState<string>('');     // filter products by name

    const getData = async () => {
        try{
            const productsData = await api.get('/products/');
            setProducts(productsData.data);
        }catch(e){
            console.error(e);
        }
    }

    const filteredProducts = useMemo(()=> {
        return products.filter(product => {
            return product.name.toLowerCase().includes(searchStr.toLowerCase());
        })
    },[searchStr, products])

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
            <h1 style={{textAlign: 'center'}}>Product page</h1>
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

            <FTable width={1000} headers={headers} rows={filteredProducts} onDelete={onDelete} />
            <ProductDialog title={"Add New Product"}
                           isOpen={isDialogOpen}
                           onSave={onSave} onClose={() => setIsDialogOpen(false)}
                           key={Date.now()}

            />
        </>
    )
}

export default Products;

