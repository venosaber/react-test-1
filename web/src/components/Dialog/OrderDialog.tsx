import {TextField, Stack, Typography, Autocomplete} from "@mui/material";
import type {OrderDialogProp, Product} from "../../utils"
import {useState} from "react";
import type {ChangeEvent} from "react";
import {DialogContainer} from "../Dialog"

import {DesktopDatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type {PickerValue} from "@mui/x-date-pickers/internals";

interface OrderFormData{
    id?: string ;
    product_id: string;
    quantity: string;       // not number but string, to be more flexible
    amount: string;
    date: string;
}

const defaultFormData: OrderFormData = {
    id: '',
    product_id: '',
    quantity: '',
    amount: '',
    date: ''
}

const requiredFields: (keyof OrderFormData)[] = ['product_id','quantity','date'];

export default ({title, isOpen, onSave, onClose, productOptions}: OrderDialogProp) => {
    // hash table (product)
    const productObj: {[id: string]: Product} = {};
    productOptions.forEach((product: Product) => {
        productObj[product.id] = product;
    });

    const [formData, setFormData] = useState<OrderFormData>(defaultFormData);

    const [error, setError] = useState<string | null>(null);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFormData(formData => ({...formData, [name]: value}));
        if(error) setError(null);
    }

    const handleSave = () => {
        setError(null);
        // form validation
        const missingFields: (keyof OrderFormData)[] = requiredFields.filter((key: keyof OrderFormData) => {
            const value = formData[key];
            return value === null || value === undefined || (value.trim() === '');
        })
        if(missingFields.length > 0){
            setError(`Please fill out all required fields: ${missingFields.join(', ')}`);
            return;
        }

        const quantityNum: number = Number(formData.quantity);
        if (isNaN(quantityNum) || quantityNum < 0){
            setError('Quantity must be a non-negative number!');
            return;
        }
        const maxQuantity: number = productOptions.find((product: Product) => product.name === formData.product_id)?.remaining || 0;
        if(quantityNum > maxQuantity){
            setError(`Quantity must be less than or equal to ${maxQuantity}`);
            return;
        }

        const selectedProductId = productOptions.find((product: Product) => product.name === formData.product_id)?.id;
        if(!selectedProductId){
            setError('Product is invalid!');
            return;
        }

        // end of validation

        const finalOrderData = {
            // use Date.now() for temporary
            id: String(Date.now()),
            product_id: selectedProductId,
            quantity: quantityNum,
            amount: productObj[selectedProductId].price * quantityNum,
            date: formData.date,
        }

        onSave(finalOrderData);
    }

    // use this variable as a prop 'value' of Autocomplete
    const selectedProductObject: Product|null = productOptions.find(option => option.name === formData.product_id) || null;


    return (
        <DialogContainer title={title}
                         isOpen={isOpen} onClose={onClose}
                         onConfirm={handleSave}>
            <Stack component="form" sx={{ width: 450}} spacing={2} autoComplete="off">

                <Autocomplete
                    options={productOptions}
                    getOptionLabel={(option: Product) => option.name} // only show the name, not the id of the product
                    value={selectedProductObject}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_event, newValue: Product | null) => {
                        setFormData(formData => ({...formData, product_id: newValue?.name ?? ''}));
                        if(error) {
                            setError(null);
                        }}}
                    // Render a TextField ínside
                    renderInput={(params ) => (
                        <TextField {...params}
                                   fullWidth label="Product" variant="outlined"
                                   required={requiredFields.includes('product_id')}
                        />)} />

                <TextField name={'quantity'} fullWidth label="Quantity" variant="outlined"
                           required={requiredFields.includes('quantity')}
                           value={formData.quantity} onChange={onChange}

                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                        sx={{width: '100%'}}
                        // defaultValue={dayjs(new Date())}
                        onChange={(value: PickerValue) => setFormData({...formData, date: value!.format('YYYY-MM-DD')})}

                    />
                </LocalizationProvider>

                {
                    error && (
                        <Typography color="error" variant="body2" sx={{m: 1}}>
                            {error}
                        </Typography>
                    )
                }

            </Stack>
        </DialogContainer>
    )
}