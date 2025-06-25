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

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    onClick={handleViewProduct}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.title}
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
        {product.discount_percentage && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#ef4444',
            color: 'white',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: '600'
          }}>
            -{product.discount_percentage}%
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          opacity: 0,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        >
          <button
            onClick={handleAddToWishlist}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              borderRadius: '50%',
              border: 'none',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Heart size={16} color="#64748b" />
          </button>
        </div>
        {product.availability === 'limited' && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: '#f97316',
            color: 'white',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: '600'
          }}>
            Limited Stock
          </div>
        )}
      </div>
      
      <div style={{ padding: '16px 20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {product.brand && (
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{product.brand}</p>
            )}
            <h3 style={{
              fontWeight: '700',
              color: '#0f172a',
              fontSize: '15px',
              lineHeight: '1.3',
              marginBottom: '6px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxHeight: '2.6em'
            }}>
              {product.title}
            </h3>
          </div>
        </div>
        
        <p style={{
          fontSize: '13px',
          color: '#64748b',
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxHeight: '3em',
          lineHeight: '1.5'
        }}>
          {product.description}
        </p>
        
        {product.rating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.rating!) ? '#facc15' : 'none'}
                  color={i < Math.floor(product.rating!) ? '#facc15' : '#cbd5e1'}
                />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#0f172a'
            }}>
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span style={{
                fontSize: '13px',
                color: '#94a3b8',
                textDecoration: 'line-through'
              }}>
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleViewProduct}
              style={{
                padding: '8px',
                color: '#64748b',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.background = 'transparent';
              }}
              title="View Product"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.availability === 'out_of_stock'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: product.availability === 'out_of_stock' ? '#cbd5e1' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: product.availability === 'out_of_stock' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (product.availability !== 'out_of_stock') {
                  e.currentTarget.style.background = '#7c3aed';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (product.availability !== 'out_of_stock') {
                  e.currentTarget.style.background = '#8b5cf6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <ShoppingCart size={14} />
              Add
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '11px',
                background: '#f1f5f9',
                color: '#64748b',
                padding: '4px 8px',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};