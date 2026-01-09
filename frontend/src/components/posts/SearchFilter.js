import React, { useState } from 'react';
import { CATEGORIES, POST_TYPES } from '../../utils/constants';
import './SearchFilter.css';

const SearchFilter = ({ onFilter, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        type: initialFilters.type || '',
        category: initialFilters.category || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);

        // Trigger filter immediately on change
        if (onFilter) {
            onFilter(newFilters);
        }
    };

    const clearFilters = () => {
        const clearedFilters = { search: '', type: '', category: '' };
        setFilters(clearedFilters);
        if (onFilter) {
            onFilter(clearedFilters);
        }
    };

    const hasActiveFilters = filters.search || filters.type || filters.category;

    return (
        <div className="search-filter">
            <div className="filter-group">
                <input
                    type="text"
                    name="search"
                    placeholder="Search posts..."
                    value={filters.search}
                    onChange={handleChange}
                    className="search-input"
                />
            </div>

            <div className="filter-group">
                <select
                    name="type"
                    value={filters.type}
                    onChange={handleChange}
                    className="filter-select"
                >
                    <option value="">All Types</option>
                    {POST_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="clear-filters-btn"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
};

export default SearchFilter;