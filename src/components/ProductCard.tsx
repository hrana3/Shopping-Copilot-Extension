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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 group">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount_percentage && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            -{product.discount_percentage}%
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleAddToWishlist}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transition-colors"
          >
            <Heart className="w-3 h-3 text-gray-600 hover:text-red-500" />
          </button>
        </div>
        {product.availability === 'limited' && (
          <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            Limited Stock
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            {product.brand && (
              <p className="text-xs text-gray-500 font-medium truncate">{product.brand}</p>
            )}
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {product.title}
            </h3>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {product.description}
        </p>
        
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-base font-bold text-gray-900">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleViewProduct}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="View Product"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.availability === 'out_of_stock'}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium transition-colors"
            >
              <ShoppingCart className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};