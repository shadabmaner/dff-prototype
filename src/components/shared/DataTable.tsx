"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps {
    data: any[]
    columns: {
        key: string
        header: string
        render?: (item: any) => React.ReactNode
    }[]
    className?: string
}

export function DataTable({ data, columns, className }: DataTableProps) {
    return (
        <div className={cn("w-full overflow-auto", className)}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-800 border-b-0">
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold py-4 px-6"
                            >
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((item, rowIndex) => (
                            <TableRow
                                key={item.id || rowIndex}
                                className="group hover:bg-slate-50/80 border-b border-slate-100 transition-colors"
                            >
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        className="py-4 px-6"
                                    >
                                        {column.render ? column.render(item) : item[column.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="py-16 text-center text-sm text-slate-500"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="font-medium">No records found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
