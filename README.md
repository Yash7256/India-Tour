# 🇮🇳 India Tour - Tourism Website

A beautiful and modern tourism website showcasing India's incredible destinations, built with React, TypeScript, and Supabase.

## ✨ Features

- **Beautiful UI/UX**: Modern design with stunning visuals of Indian destinations
- **Featured Destinations**: Showcase of iconic places like Taj Mahal, Golden Temple, Kerala Backwaters
- **User Authentication**: Secure login/signup with Google OAuth 2.0 integration
- **Real-time Data**: Powered by Supabase for seamless data management
- **Responsive Design**: Optimized for all devices and screen sizes
- **TypeScript**: Full type safety and better developer experience
- **Context API**: Efficient state management across the application

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Authentication)
- **Authentication**: Google OAuth 2.0
- **State Management**: React Context API
- **Build Tool**: Vite
- **Linting**: ESLint + TypeScript ESLint

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project
- Google Cloud Console project with OAuth 2.0 credentials

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/India-Tour.git
   cd India-Tour
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your actual credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5174`

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Set up your database tables as needed
4. Configure Row Level Security (RLS) policies

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5174/auth/callback` (development)
   - Your production domain callback URL

## 📁 Project Structure

```
India-Tour/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── pages/              # Page components
│   ├── services/           # API services and utilities
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
├── supabase/               # Supabase configuration
├── public/                 # Static assets
└── ...
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🌟 Key Features Implemented

### ✅ Completed Features
- Hero section with India Gate background
- Featured destinations showcase
- User authentication system
- Context API integration
- Responsive design
- TypeScript type safety
- Error-free codebase (32+ issues resolved)

### 🔄 Future Enhancements
- Advanced search and filtering
- User reviews and ratings
- Booking system integration
- Multi-language support
- Progressive Web App (PWA) features

## 🐛 Troubleshooting

### Common Issues

1. **White screen on load**
   - Ensure all environment variables are set correctly
   - Check browser console for errors

2. **Build failures**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors with `npm run type-check`

3. **Authentication not working**
   - Verify Google OAuth credentials
   - Check redirect URIs in Google Cloud Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Beautiful destinations and cultural heritage of India
- React and TypeScript communities
- Supabase for excellent backend services
- Tailwind CSS for amazing styling utilities

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the Supabase and Google OAuth documentation

---

**Made with ❤️ for showcasing the incredible beauty of India** 🇮🇳
