import {Button, Dialog, DialogContent, DialogTitle, DialogActions} from "@mui/material";
import type {DialogProp} from "../../utils";

export default ({title, isOpen, onConfirm, onClose, children}: DialogProp) => {

    return (
        <Dialog open={isOpen} sx={{margin: 'auto'}}>
            <DialogTitle sx={{margin: 'auto'}}>{title}</DialogTitle>
            <DialogContent>
                {
                    children
                }
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onConfirm} sx={{margin: 'auto', padding: '10px 70px'}}
                        color={'success'}>Save</Button>
                <Button variant="contained" onClick={onClose} sx={{margin: 'auto', padding: '10px 70px'}}
                        color={'error'}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}