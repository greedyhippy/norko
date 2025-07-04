# Norko - Premium Infrared Heating Solutions

A modern e-commerce platform for infrared heaters built with Remix, Crystallize CMS, and Railway hosting.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Remix Store   │────│   Railway API    │────│   Crystallize   │
│ Frontend (React)│    │   GraphQL API    │    │   Headless CMS  │
│ localhost:3018  │    │   Authentication │    │   Product Data  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Tech Stack

- **Frontend**: Remix (React Router v7) + TypeScript
- **CMS**: Crystallize (Headless Commerce)
- **API**: Custom GraphQL server on Railway
- **Styling**: Tailwind CSS
- **Infrastructure**: Railway hosting

## 📁 Project Structure

```
norko/
├── heatshop-scraper/          # Product data scraping tools
│   ├── scrape-heatshop.js     # Web scraper for product data
│   └── crystallize-import.json # Product import configuration
├── norko-graphql-api/         # Custom GraphQL API server
│   ├── server.js              # Express + GraphQL server
│   └── crystallize-products.json # Product data cache
└── norko-crystallize-frontend/ # Remix e-commerce frontend
    └── application/           # Main Remix app
        ├── src/routes/        # Page routes
        ├── src/ui/           # UI components
        └── .env              # Environment configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/norko.git
cd norko
```

### 2. Set Up the Frontend

```bash
cd norko-crystallize-frontend/application
npm install
```

Create a `.env` file with your credentials:

```env
CRYSTALLIZE_TENANT_IDENTIFIER=your-tenant-identifier
CRYSTALLIZE_TENANT_ID=your-tenant-id
CRYSTALLIZE_ACCESS_TOKEN_ID=your-access-token-id
CRYSTALLIZE_ACCESS_TOKEN_SECRET=your-access-token-secret
RAILWAY_API_URL=your-railway-api-url
RAILWAY_API_KEY=your-railway-api-key
```

### 3. Start the Development Server

```bash
npm run dev
```

The store will be available at `http://localhost:3018`

### 4. Set Up the GraphQL API (Optional)

```bash
cd ../../norko-graphql-api
npm install
npm start
```

## 🎯 Features

### Current Features ✅

- **Modern Responsive Design** - Mobile-first approach
- **Product Categories** - 5 infrared heater categories
- **Fallback Content** - Graceful handling when CMS is empty
- **Environment Management** - Secure credential handling
- **TypeScript Support** - Full type safety
- **Error Handling** - Robust error boundaries

### Planned Features 🚧

- **Product Catalog** - Integration with Railway API products
- **Authentication** - User accounts and login
- **Shopping Cart** - Add to cart and checkout
- **Search & Filters** - Product discovery tools
- **Product Configurator** - Heater selection wizard
- **B2B Features** - Bulk pricing and quotes
- **Content Management** - Full Crystallize integration

## 🔧 Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Deployment

The application is configured for Railway deployment. Connect your GitHub repository to Railway for automatic deployments.

## 📱 Product Categories

- **Panel Heaters** - Residential and office solutions
- **Ceiling Heaters** - Commercial environments
- **Industrial Heaters** - Heavy-duty workshop solutions
- **Patio Heaters** - Outdoor hospitality heating
- **Far Infrared Heaters** - Health-focused technology

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@norko.com or create an issue in this repository.

## 🙏 Acknowledgments

- [Crystallize](https://crystallize.com) - Headless Commerce Platform
- [Remix](https://remix.run) - Full Stack Web Framework
- [Railway](https://railway.app) - Infrastructure Platform
- [Tailwind CSS](https://tailwindcss.com) - Utility-First CSS Framework
