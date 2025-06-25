# Browseable.ai - AI Shopping Co-Pilot

> Version: 1.0.1 - Updated for GitHub tracking

An intelligent Chrome extension that serves as your personal shopping assistant, overlaying on any e-commerce site to provide AI-powered product recommendations, curation, and smart shopping features.

## 🎯 Vision

"Let any fashion shopper converse with a stylist-grade AI overlay that searches, curates, and carts items on whatever store they're already browsing."

## ✨ Features

### Core MVP Features
- **Floating Chat Interface**: Elegant chat bubble that expands to a full drawer panel
- **AI Shopping Assistant**: Conversational AI that understands your style preferences
- **Product Discovery**: Smart product search and semantic matching
- **Visual Product Cards**: Beautiful product displays with ratings, pricing, and actions
- **E-commerce Site Detection**: Automatically activates on supported shopping sites
- **Wishlist & Cart Integration**: Save favorites and quick add-to-cart functionality

### Supported Platforms
- Shopify stores
- Amazon
- eBay
- Etsy
- Target
- Walmart
- Generic e-commerce sites with product/shop pages

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Extension**: Chrome Manifest V3
- **AI**: OpenAI GPT-4 integration (configurable)
- **Build Tool**: Vite
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ChatBubble.tsx  # Floating chat trigger
│   ├── ChatDrawer.tsx  # Main chat interface
│   └── ProductCard.tsx # Product display cards
├── content/            # Content script components
│   ├── ChatWidget.tsx  # Main widget controller
│   └── content-script.tsx # Extension injection logic
├── background/         # Service worker
│   └── service-worker.ts
├── utils/             # Utility functions
│   ├── ai-client.ts   # AI API integration
│   └── dom-utils.ts   # DOM manipulation helpers
├── types/             # TypeScript definitions
│   └── product.ts     # Data models
└── data/              # Demo data
    └── demo-products.json
```

## 🚀 Development

### Prerequisites
- Node.js 18+
- Chrome browser for testing

### Setup
```bash
# Install dependencies
npm install

# Run development server (for testing UI)
npm run dev

# Build extension for Chrome
npm run build:extension
```

### Loading the Extension
1. Build the extension: `npm run build:extension`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

### Testing
- Visit any supported e-commerce site
- Look for the floating chat bubble in the bottom right
- Click to open the AI shopping assistant
- Try queries like:
  - "Show me trendy winter outfits under $100"
  - "I need professional attire for work"
  - "Find sustainable and eco-friendly options"

## 🎨 Design Philosophy

The extension follows modern design principles inspired by leading design systems:

- **Minimalist Aesthetic**: Clean, uncluttered interface focusing on content
- **Smooth Animations**: Subtle micro-interactions and transitions
- **Accessible Colors**: High contrast ratios and readable typography
- **Mobile-First**: Responsive design that works across all screen sizes
- **Premium Feel**: Apple-level attention to detail and polish

### Color System
- **Primary**: Purple (#8B5CF6) - Main brand color
- **Secondary**: Blue (#3B82F6) - Supporting actions
- **Accent**: Green (#10B981) - Success states and highlights
- **Neutral**: Gray scales for text and backgrounds

## 🤖 AI Integration

The MVP includes a mock AI client that demonstrates the intended functionality:

- **Query Processing**: Understands natural language shopping requests
- **Product Matching**: Semantic search through product catalogs
- **Style Recommendations**: Contextual suggestions based on user preferences
- **Conversation Flow**: Maintains chat context and follow-up questions

### Future AI Enhancements
- OpenAI GPT-4 integration for advanced reasoning
- Image recognition for style matching
- Trend analysis and seasonal recommendations
- Personalized learning from user behavior

## 📦 Extension Features

### Content Script
- **Site Detection**: Automatically identifies e-commerce platforms
- **DOM Integration**: Seamlessly injects chat interface
- **Shadow DOM**: Isolated styling to prevent conflicts
- **Event Handling**: Manages user interactions and state

### Background Service
- **Settings Management**: User preferences and configuration
- **Data Sync**: Cross-tab state synchronization
- **API Communication**: Handles external service calls
- **Performance Monitoring**: Usage analytics and optimization

### Popup Interface
- **Quick Status**: Shows extension state and supported sites
- **Feature Overview**: Highlights key capabilities
- **Settings Access**: Easy configuration management

## 🛠️ Development Roadmap

### Phase 1: MVP (Current)
- [x] Basic chat interface
- [x] Product card components
- [x] Mock AI responses
- [x] Extension structure
- [x] Site detection

### Phase 2: AI Integration
- [ ] OpenAI API integration
- [ ] Real product scraping
- [ ] Advanced search algorithms
- [ ] User preference learning

### Phase 3: E-commerce Integration
- [ ] Cart API integration
- [ ] Price tracking
- [ ] Affiliate link management
- [ ] Multi-site synchronization

### Phase 4: Premium Features
- [ ] Supabase database integration
- [ ] User authentication
- [ ] Stripe payment processing
- [ ] Advanced analytics

## 🔧 Configuration

### Environment Variables
Create a `.env` file for API keys:
```env
VITE_OPENAI_API_KEY=your_openai_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Extension Permissions
The extension requires minimal permissions:
- `activeTab`: Access current page content
- `storage`: Save user preferences
- `scripting`: Inject content scripts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Design inspiration from Linear, Figma, and Apple
- Icons by Lucide React
- Demo images from Pexels
- Built with React and Tailwind CSS