import { ListItemIcon, MenuItem } from '@mui/material'
import Link from 'next/link'
import React from 'react'
import EditIcon from '@mui/icons-material/Edit';
const EditAction = ({ href }) => {
    if (!href) return null
    return (
        <MenuItem key="edit"  >
            <Link href={href}>
                <ListItemIcon>
                    <EditIcon />
                </ListItemIcon>
                Edit
            </Link>
        </MenuItem>
    )
}

export default EditAction