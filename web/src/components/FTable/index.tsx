import {TableContainer, Paper, Table, TableHead, TableBody, TableRow, TableCell} from "@mui/material";

import DeleteIcon from '@mui/icons-material/Delete';
import type {Header} from '../../utils'

interface Props {
    tableName: string;
    headers: Header[];
    rows: any[];
    onDelete: (id: number) => void;
    width?: number;
}

function FTable({tableName, headers, rows, onDelete, width}: Props) {
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
            <h1>{tableName}</h1>
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
                                        Object.keys(row).map((rowKey: string) => (
                                            <TableCell key={`${rowKey}-${row.id}`}>{row[rowKey]}</TableCell>
                                        ))
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