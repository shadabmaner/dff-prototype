"use client"

import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface FilterOption {
  label: string
  value: string
}

interface SearchFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
  additionalFilters?: {
    label: string
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
  }[]
  placeholder?: string
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  additionalFilters = [],
  placeholder = "Search...",
}: SearchFilterBarProps) {
  const hasActiveFilters = statusFilter !== "all" || additionalFilters.some(f => f.value !== "all")

  const clearFilters = () => {
    onStatusFilterChange?.("all")
    additionalFilters.forEach(filter => filter.onChange("all"))
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {onStatusFilterChange && (
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      )}

      {additionalFilters.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              {additionalFilters.map((filter) => (
                <div key={filter.label} className="space-y-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  <Select value={filter.value} onValueChange={filter.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {hasActiveFilters && (
        <Badge variant="secondary" className="gap-1">
          Filtered
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={clearFilters}
          />
        </Badge>
      )}
    </div>
  )
}
