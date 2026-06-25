import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, ExternalLink, Info, Tag, Package, DollarSign, X, ChevronDown, Mail, Copy, Check } from 'lucide-react';
import './ShoppingView.css';

const ShoppingView = ({ onClose }) => {
    const { shoppingItems, getPortalContainer } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const handleCopyEmail = (email, id) => {
        navigator.clipboard.writeText(email);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const categories = useMemo(() => {
        if (!shoppingItems) return ['All Categories'];
        const uniqueCategories = new Set(shoppingItems.map(item => item.category).filter(Boolean));
        return ['All Categories', ...Array.from(uniqueCategories).sort()];
    }, [shoppingItems]);

    const activeStats = useMemo(() => {
        const stats = { categories: {} };
        if (!shoppingItems) return stats;
        shoppingItems.forEach(item => {
            if (item.category) stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
        });
        return stats;
    }, [shoppingItems]);

    const filteredItems = useMemo(() => {
        if (!shoppingItems) return [];
        return shoppingItems.filter(item => {
            return selectedCategory === 'All Categories' || item.category === selectedCategory;
        });
    }, [shoppingItems, selectedCategory]);

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="view-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="shopping-modal-header">
                    <div className="modal-title-row">
                        <img src="/assets/NT_logo.png" alt="NT Logo" className="modal-logo" />
                        <div className="modal-title-info">
                            <h2>Marketplace</h2>
                            <p>If you want to place an ad here email us to nAPPoTrails@proton.me</p>
                        </div>
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="shopping-controls">
                        <div className="custom-dropdown-container">
                            <button
                                className="category-filter-wrapper glass-panel dropdown-trigger"
                                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            >
                                <Tag size={18} className="filter-icon" />
                                <span className="selected-text">{selectedCategory}</span>
                                <ChevronDown size={16} className={`chevron-icon ${isCategoryDropdownOpen ? 'rotated' : ''}`} />
                            </button>

                            {isCategoryDropdownOpen && (
                                <div className="dropdown-menu glass-panel animate-fade-in">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`dropdown-option ${selectedCategory === cat ? 'selected' : ''} ${cat !== 'All Categories' && activeStats.categories[cat] ? 'has-items' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setIsCategoryDropdownOpen(false);
                                            }}
                                        >
                                            {cat}
                                            {cat !== 'All Categories' && activeStats.categories[cat] > 0 && (
                                                <span className="item-count-indicator">{activeStats.categories[cat]}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <div className="shopping-modal-body">
                    <div className="shopping-grid">
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                                <div key={item.id} className="shopping-card glass-panel">
                                    <div className="shopping-card-content">
                                        <div className="shopping-image-container">
                                            <img src={item.image} alt={item.title} className="shopping-image" />
                                            <span 
                                                className="badge category-badge" 
                                                style={{ 
                                                    backgroundColor: '#58a6ff', 
                                                    position: 'absolute', 
                                                    bottom: '12px', 
                                                    right: '12px', 
                                                    zIndex: 10,
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                                }}
                                            >
                                                <Tag size={12} />
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="shopping-content">
                                            <div className="shopping-header-row">
                                                <h2 className="shopping-title">{item.title}</h2>
                                            </div>

                                            <p className="shopping-description">{item.description}</p>

                                            <div className="shopping-action-row">
                                                {item.link && (
                                                    <a
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="shop-link-btn"
                                                    >
                                                        <Info size={16} />
                                                        <span>View Details</span>
                                                        <ExternalLink size={14} className="ext-icon" />
                                                    </a>
                                                )}

                                                {item.email && (
                                                    <div className="email-info-container">
                                                        <span className="email-label">Send mail to:</span>
                                                        <div className="email-copy-wrapper">
                                                            <span className="email-address">{item.email}</span>
                                                            <button
                                                                className={`copy-email-btn ${copiedId === item.id ? 'success' : ''}`}
                                                                onClick={() => handleCopyEmail(item.email, item.id)}
                                                                title="Copy email address"
                                                            >
                                                                {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-items-found">
                                <p>No items found for the selected category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        getPortalContainer()
    );
};

export default ShoppingView;
