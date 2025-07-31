# 🧠 AceMind - AI-Powered Learning Platform

A modern, responsive web application built with Next.js and Framer Motion that provides personalized AI tutoring and study assistance for every learner.

![AceMind Banner](https://img.shields.io/badge/AceMind-AI%20Learning-orange?style=for-the-badge&logo=brain&logoColor=white)

## ✨ Features

### 🎨 **Modern UI/UX Design**
- **Dark Theme**: Sleek dark mode interface with gray color palette
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop
- **Fixed Viewport**: Content perfectly contained within 100vh height
- **Gradient Accents**: Yellow-to-orange gradients for CTAs and highlights

### 🎭 **Smooth Animations**
- **Framer Motion**: Professional-grade animations throughout the app
- **Spring Physics**: Natural, bouncy animations for all interactions
- **Staggered Animations**: Elements appear in sequence for visual flow
- **Micro-interactions**: Delightful hover and tap feedback

### 📱 **Responsive Components**
- **Collapsible Sidebar**: Mobile-friendly sidebar with hamburger menu
- **Study Form**: Clean form interface for topic and syllabus input
- **Popular Topics**: Quick-select buttons for common study subjects
- **Chat History**: Visual representation of recent study sessions

### 🚀 **Technical Excellence**
- **Component Architecture**: Modular, reusable components
- **TypeScript Ready**: Clean code structure for easy TypeScript migration
- **Performance Optimized**: Hardware-accelerated animations and optimized renders
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Fonts**: [Geist Sans & Mono](https://vercel.com/font)
- **Build Tool**: Turbopack for fast development

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.js          # Root layout with fonts and metadata
│   ├── page.js            # Main application page
│   ├── globals.css        # Global styles and animations
│   └── favicon.ico        # App icon
└── components/
    ├── home.jsx           # Home page wrapper component
    ├── ResponsiveStudyForm.jsx  # Main layout orchestrator
    ├── Sidebar.jsx        # Animated sidebar component
    ├── StudyFormContent.jsx     # Main form with animations
    ├── form.jsx           # Legacy form component
    ├── pdf_form.jsx       # PDF upload form component
    └── text_form.jsx      # Text input form component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aaditya-paul/acemind.git
   cd acemind
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Key Components

### **ResponsiveStudyForm**
The main layout component that orchestrates the sidebar and content areas.
- Manages mobile sidebar state
- Handles responsive breakpoints
- Provides 100vh fixed height container

### **Sidebar**
An animated sidebar with chat history and user profile.
- **Animations**: Slide-in/out with spring physics
- **Mobile**: Collapsible with backdrop blur overlay
- **Interactive**: Animated chat items and profile elements

### **StudyFormContent**
The main study form with topic input and syllabus textarea.
- **Animations**: Staggered entry animations
- **Interactive**: Focus animations and popular topic buttons
- **Responsive**: Adapts beautifully across all screen sizes

## 🎨 Design System

### **Colors**
- **Background**: `#111827` (gray-900)
- **Surface**: `#1f2937` (gray-800)
- **Accent**: `#fbbf24` to `#f97316` (yellow-400 to orange-500)
- **Text**: `#ffffff` (white) and `#9ca3af` (gray-400)

### **Typography**
- **Primary**: Geist Sans
- **Monospace**: Geist Mono
- **Scale**: Responsive from mobile (text-2xl) to desktop (text-5xl)

### **Animations**
- **Duration**: 0.2s to 0.8s for different interactions
- **Easing**: Spring physics with stiffness 100-400
- **Stagger**: 0.1s delays for sequential animations

## 📱 Responsive Breakpoints

- **Mobile**: < 640px - Compact layout with hamburger menu
- **Tablet**: 640px - 1024px - Balanced spacing and typography
- **Desktop**: > 1024px - Full sidebar with generous spacing

## 🎭 Animation Highlights

### **Sidebar Animations**
- Smooth slide-in/out with spring physics
- Staggered chat history items
- Animated logo with periodic brain emoji wiggle
- Interactive profile picture with hover effects

### **Form Animations**
- Sequential element appearance with stagger
- Input focus animations with scale and border color
- Submit button with hover/tap feedback
- Popular topic buttons with individual entry animations

## 🔧 Development

### **Available Scripts**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### **Key Dependencies**
- `react` & `react-dom` - ^19.0.0
- `next` - 15.3.5
- `framer-motion` - Latest
- `tailwindcss` - ^4
- `@tailwindcss/postcss` - ^4

## 🌟 Features Showcase

### **Mobile Experience**
- Touch-friendly interface with proper tap targets
- Smooth sidebar animations with backdrop blur
- Optimized typography and spacing for small screens
- Gesture-based interactions

### **Desktop Experience**
- Spacious layout with generous whitespace
- Larger typography for comfortable reading
- Sophisticated hover effects and micro-interactions
- Professional appearance suitable for productivity apps

### **Accessibility**
- Proper ARIA labels for form elements
- Keyboard navigation support
- Focus indicators with yellow accent colors
- Screen reader friendly structure

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
# Deploy to Vercel
```

### **Other Platforms**
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aaditya Paul**
- GitHub: [@aaditya-paul](https://github.com/aaditya-paul)
- Email: aaditya@example.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Framer Motion](https://www.framer.com/motion/) for beautiful animations
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Vercel](https://vercel.com/) for the font family and deployment platform

---

<div align="center">
  <p>Made with ❤️ and lots of ☕</p>
  <p>⭐ Star this repo if you like it!</p>
</div>
