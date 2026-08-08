// Inside Header.jsx
<button 
    className={`custom-select-trigger filter-select 
        ${showFilters ? 'active' : ''} 
        ${isModalFiltered 
            ? (showFilters ? 'filters-active-solid' : 'filters-active-red') 
            : ''
        }`
    }
    onClick={() => setShowFilters(!showFilters)}
>


/* 2. Solid Red (When filters are active and window is OPEN) */
.filters-active-solid {
    background: #ff4444 !important; /* The solid red background */
    color: #ffffff !important;    /* White text */
    border: 1.5px solid #ff4444 !important;
}

/* You should also ensure the icon/SVG inside turns white */
.filters-active-solid svg,
.filters-active-solid span {
    color: #ffffff !important;
}
