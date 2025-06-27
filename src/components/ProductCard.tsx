import React from 'react';
import { ShoppingCart, Heart, Star, ExternalLink } from 'lucide-react';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  const handleViewProduct = () => {
    window.open(product.url, '_blank');
  };

  // Format price to always show 2 decimal places if it's a number
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'number') {
      return price.toFixed(2);
    }
    return String(price);
  };

  // Validate image URL - check if it's a valid URL and not a placeholder
  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Check if it's a valid URL
    try {
      new URL(url);
    } catch {
      return false;
    }
    
    // Check if it's not a placeholder or shopping cart image
    const invalidPatterns = [
      'placeholder', 
      'loading', 
      'spinner', 
      'cart', 
      'shopping-cart',
      'no-image'
    ];
    
    return !invalidPatterns.some(pattern => url.toLowerCase().includes(pattern));
  };

  // Ensure we have a valid image URL
  const imageUrl = validateImageUrl(product.image) 
    ? product.image 
    : 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800';

  // Ensure title is not too long
  const title = product.title.length > 40 
    ? product.title.substring(0, 40) + '...' 
    : product.title;

  // Ensure description is not too long
  const description = product.description && product.description.length > 80
    ? product.description.substring(0, 80) + '...'
    : product.description;

  return (
    <div 
      className="browseable-product-card"
      style={{
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        marginBottom: '10px',
        width: '100%'
      }}
      onClick={handleViewProduct}
    >
      <div style={{ position: 'relative', overflow: 'hidden', height: '140px' }}>
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onError={(e) => {
            // Fallback image if the product image fails to load
            e.currentTarget.src = 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800';
          }}
        />
        {product.discount_percentage && (
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            background: '#ef4444',
            color: 'white',
            fontSize: '10px',
            padding: '2px 5px',
            borderRadius: '6px',
            fontWeight: '600'
          }}>
            -{product.discount_percentage}%
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '6px'
        }}>
          <button
            onClick={handleAddToWishlist}
            style={{
              padding: '5px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              borderRadius: '50%',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Heart size={12} color="#64748b" />
          </button>
        </div>
        {product.availability === 'limited' && (
          <div style={{
            position: 'absolute',
            bottom: '6px',
            left: '6px',
            background: '#f97316',
            color: 'white',
            fontSize: '10px',
            padding: '2px 5px',
            borderRadius: '6px',
            fontWeight: '600'
          }}>
            Limited Stock
          </div>
        )}
      </div>
      
      <div style={{ padding: '10px 12px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          marginBottom: '4px'
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {product.brand && (
              <p style={{
                fontSize: '10px',
                color: '#64748b',
                fontWeight: '600',
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{product.brand}</p>
            )}
            <h3 style={{
              fontWeight: '700',
              color: '#0f172a',
              fontSize: '13px',
              lineHeight: '1.3',
              marginBottom: '3px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxHeight: '2.6em'
            }}>
              {title}
            </h3>
          </div>
        </div>
        
        {description && (
          <p style={{
            fontSize: '11px',
            color: '#64748b',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxHeight: '2.8em',
            lineHeight: '1.4'
          }}>
            {description}
          </p>
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontSize: '15px',
              fontWeight: '800',
              color: '#0f172a'
            }}>
              ${formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span style={{
                fontSize: '11px',
                color: '#94a3b8',
                textDecoration: 'line-through'
              }}>
                ${formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleViewProduct}
              style={{
                padding: '4px',
                color: '#64748b',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="View Product"
            >
              <ExternalLink size={12} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.availability === 'out_of_stock'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                background: product.availability === 'out_of_stock' ? '#cbd5e1' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: product.availability === 'out_of_stock' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ShoppingCart size={10} />
              Add
            </button>
          </div>
        </div>
        
        {product.tags && product.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  fontSize: '9px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};