import {TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell} from "@mui/material";

import DeleteIcon from '@mui/icons-material/Delete';
import type {Header} from '../../utils'

interface Props {
    headers: Header[];
    rows: any[];
    onDelete: (id: string) => void;
    width?: number;
}

function FTable({headers, rows, onDelete, width}: Props) {
    const renderActionBtn = (headers: Header[], row: any) =>{
        const keys = headers.map(header => header.name);
        if(!keys.includes('action')) return;
        return (
            <TableCell>
                <DeleteIcon color={'error'} onClick={()=>onDelete(row.id)}/>
            </TableCell>
        )
    }
    return (
        <>
            <TableContainer component={Paper} sx={{width: width, margin: 'auto'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {
                                headers.map(header => (
                                    <TableCell key={header.name}>
                                        {header.text}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            rows.map((row)=> (
                                <TableRow key={row.id}>
                                    {
                                        headers.map((header: Header) => {
                                            if(header.name === 'action') return;
                                            return (
                                                <TableCell key={`${header.name}-${row.id}`}>{row[header.name]}</TableCell>
                                            )
                                        })
                                    }

                                    {
                                        renderActionBtn(headers, row)
                                    }
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default FTable;