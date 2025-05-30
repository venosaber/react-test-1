import {TextField, Stack, Typography} from "@mui/material";
import type {OrderDialogProp} from "../../utils"
import {useState} from "react";
import {DialogContainer} from "../Dialog"

interface OrderFormData{
    id?: string ;
    productName: string;
    quantity: string;
    amount: string; // not number but string, to be more flexible
}

const defaultFormData: OrderFormData = {
    id: '',
    productName: '',
    quantity: '',
    amount: ''
}

const requiredFields: (keyof OrderFormData)[] = ['productName','quantity'];

export default ({title, isOpen, onSave, onClose}: OrderDialogProp) => {
    const [formData, setFormData] = useState<OrderFormData>(defaultFormData);

    const [error, setError] = useState<string | null>(null);

    const onChange = (event: any) => {
        const {name, value} = event.target;
        setFormData(formData => ({...formData, [name]: value}));
        if(error) setError(null);
    }

    const handleSave = () => {
        setError(null);
        // form validation
        const missingFields = requiredFields.filter(key => {
            const value = formData[key];
            return value === null || value === undefined || (value.trim() === '');
        })
        if(missingFields.length > 0){
            setError(`Please fill out all required fields: ${missingFields.join(', ')}`);
            return;
        }

        const quantityNum = Number(formData.quantity);
        if (isNaN(quantityNum) || quantityNum < 0){
            setError('Quantity must be a non-negative number!');
            return;
        }

        // end of validation

        const finalOrderData = {
            // use Date.now() for temporary
            id: Date.now(),
            productName: formData.productName.trim(),
            quantity: quantityNum,
            amount: formData.amount,
        }

        onSave(finalOrderData);
    }


    return (
        <DialogContainer title={title}
                         isOpen={isOpen} onClose={onClose}
                         onConfirm={handleSave}>
            <Stack component="form" sx={{ width: 450}} spacing={2} autoComplete="off">
                <TextField name={'name'} fullWidth label="Name" variant="outlined"
                           required={requiredFields.includes('name')}
                           value={formData.name} onChange={onChange}
                           error={!!error && requiredFields.includes('name') && !formData.name.trim()}
                           helperText={!!error && requiredFields.includes('name') && !formData.name.trim() ? 'Name is required' : ''}
                    // error is set => !!error would be true
                />

                <TextField name={'price'} fullWidth label="Price" variant="outlined"
                           type={'number'}
                           required={requiredFields.includes('price')}
                           value={formData.price} onChange={onChange}
                           error={!!error && requiredFields.includes('price')
                               && (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0)}
                           helperText={!!error && requiredFields.includes('price')
                           && (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) ? 'Must be a non-negative number' : ''}
                />

                <TextField name={'remaining'} fullWidth label="Remaining" variant="outlined"
                           type={'number'}
                           required={requiredFields.includes('remaining')}
                           value={formData.remaining} onChange={onChange}
                           error={!!error && requiredFields.includes('remaining')
                               && (formData.remaining === '' || isNaN(Number(formData.remaining)) || Number(formData.remaining) < 0)}
                           helperText={!!error && requiredFields.includes('remaining')
                           && (formData.remaining === '' || isNaN(Number(formData.remaining)) || Number(formData.remaining) < 0) ? 'Must be a non-negative number' : ''}
                />




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