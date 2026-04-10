import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, ExternalLink, Info, Tag, Package, DollarSign } from 'lucide-react';
import './ShoppingView.css';

const ShoppingView = () => {
    const { shoppingItems } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    const categories = useMemo(() => {
        if (!shoppingItems) return ['All Categories'];
        const uniqueCategories = new Set(shoppingItems.map(item => item.category).filter(Boolean));
        return ['All Categories', ...Array.from(uniqueCategories).sort()];
    }, [shoppingItems]);

    const filteredItems = useMemo(() => {
        return shoppingItems.filter(item => {
            return selectedCategory === 'All Categories' || item.category === selectedCategory;
        });
    }, [shoppingItems, selectedCategory]);

    if (!shoppingItems || shoppingItems.length === 0) {
        return (
            <div className="shopping-empty animate-fade-in">
                <ShoppingCart size={48} />
                <p>No items available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="shopping-container animate-fade-in">
            <div className="shopping-header">
                <h1>Historical Shopping</h1>
                <p>Explore a collection of historical replicas, equipment, and memorabilia.</p>

                <div className="shopping-controls">
                    <div className="category-filter-wrapper glass-panel">
                        <Tag size={18} className="filter-icon" />
                        <select
                            className="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="shopping-grid">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                    <div key={item.id} className="shopping-card glass-panel">
                        <div className="shopping-card-content">
                            <div className="shopping-image-container">
                                <img src={item.image} alt={item.title} className="shopping-image" />
                            </div>
                            <div className="shopping-content">
                                <div className="shopping-header-row">
                                    <h2 className="shopping-title">{item.title}</h2>
                                    <span className="badge category-badge" style={{ backgroundColor: '#58a6ff' }}>
                                        <Tag size={12} />
                                        {item.category}
                                    </span>
                                </div>



                                <p className="shopping-description">{item.description}</p>
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
    );
};

export default ShoppingView;
