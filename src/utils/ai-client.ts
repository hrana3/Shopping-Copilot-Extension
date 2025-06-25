// Version: 1.0.1 - Updated for GitHub tracking
import { Product, ChatMessage } from '../types/product';

export class AIClient {
  private apiKey: string | null = null;
  
  constructor() {
    // In production, this would come from environment variables or user settings
    this.apiKey = null; // Set via extension options
  }
  
  async generateResponse(userMessage: string, products: Product[], context?: any): Promise<string> {
    // For MVP, return a mock response
    const responses = [
      `I found ${products.length} products that match your style! Let me show you the best options.`,
      "Based on your preferences, I'd recommend checking out these items. They're trending and perfect for your style!",
      "Great choice! These products are highly rated and would work well with your existing wardrobe.",
      "I've curated some amazing options for you. Would you like me to explain why each one would be perfect?",
      "These picks are spot-on for your taste! Each one offers great quality and style."
    ];
    
    // Simple keyword matching for more relevant responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
      return "I've filtered for budget-friendly options that don't compromise on style. Here are some great value picks!";
    }
    
    if (lowerMessage.includes('luxury') || lowerMessage.includes('premium') || lowerMessage.includes('high-end')) {
      return "I've selected some premium pieces that offer exceptional quality and craftsmanship. These investment pieces will elevate your wardrobe.";
    }
    
    if (lowerMessage.includes('casual') || lowerMessage.includes('everyday')) {
      return "Perfect for everyday wear! These pieces are comfortable, versatile, and effortlessly stylish.";
    }
    
    if (lowerMessage.includes('formal') || lowerMessage.includes('professional') || lowerMessage.includes('work')) {
      return "These sophisticated pieces are perfect for professional settings while maintaining your personal style.";
    }
    
    if (products.length === 0) {
      return "I couldn't find any products matching your request. Could you try a different search term or category?";
    }
    
    if (products.length === 1) {
      return `I found this ${products[0].category.toLowerCase()} that matches your request! It's a ${products[0].title} from ${products[0].brand || 'a great brand'}.`;
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  async searchProducts(query: string, allProducts: Product[]): Promise<Product[]> {
    console.log('🔍 Searching products with query:', query);
    console.log('🔍 Available products:', allProducts.length);
    
    if (allProducts.length === 0) {
      console.log('⚠️ No products available to search');
      return [];
    }
    
    // More sophisticated keyword-based search
    const searchTerms = query.toLowerCase().split(' ')
      .filter(term => term.length > 2) // Filter out short words
      .map(term => term.replace(/[^\w\s]/gi, '')); // Remove special characters
    
    console.log('🔍 Search terms:', searchTerms);
    
    if (searchTerms.length === 0) {
      console.log('⚠️ No valid search terms found, returning all products');
      return allProducts;
    }
    
    // Score each product based on matches
    const scoredProducts = allProducts.map(product => {
      const searchText = `${product.title} ${product.description} ${product.category} ${product.tags.join(' ')} ${product.brand || ''}`.toLowerCase();
      
      let score = 0;
      
      // Check for exact matches in title (highest weight)
      searchTerms.forEach(term => {
        if (product.title.toLowerCase().includes(term)) {
          score += 10;
        }
        
        // Check for matches in other fields
        if (searchText.includes(term)) {
          score += 5;
        }
        
        // Bonus for exact tag matches
        if (product.tags.some(tag => tag.toLowerCase() === term)) {
          score += 3;
        }
      });
      
      return { product, score };
    });
    
    // Sort by score and filter out zero scores
    const results = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
    
    console.log(`🔍 Found ${results.length} matching products`);
    
    // If no results, return all products
    if (results.length === 0) {
      console.log('⚠️ No matching products found, returning all products');
      return allProducts;
    }
    
    return results;
  }
  
  async categorizeProducts(products: Product[]): Promise<{ [category: string]: Product[] }> {
    return products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as { [category: string]: Product[] });
  }
  
  async recommendProducts(userProfile: any, products: Product[]): Promise<Product[]> {
    // For MVP, return products sorted by rating and availability
    return products
      .filter(p => p.availability === 'in_stock')
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  }
}

export const aiClient = new AIClient();