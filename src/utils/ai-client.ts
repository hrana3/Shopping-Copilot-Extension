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
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  async searchProducts(query: string, allProducts: Product[]): Promise<Product[]> {
    // Simple keyword-based search for MVP
    const searchTerms = query.toLowerCase().split(' ');
    
    return allProducts.filter(product => {
      const searchText = `${product.title} ${product.description} ${product.category} ${product.tags.join(' ')} ${product.brand || ''}`.toLowerCase();
      
      return searchTerms.some(term => searchText.includes(term));
    });
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