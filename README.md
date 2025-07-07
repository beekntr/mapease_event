# MapEase Client

A complete frontend solution for event navigation and management using React.js, TypeScript, and Tailwind CSS. MapEase provides interactive maps, QR-based check-ins, and real-time navigation for event attendees.

## 🌟 Features

### Landing Page

- Clean, animated landing interface with MapEase branding
- Google Authentication integration for college/workplace email domains
- Role-based redirect system (Super Admin vs Tenant User)

### Super Admin Dashboard

- Create new tenant organizations
- Upload custom SVG maps for venues
- Configure subdomains for multi-tenant support
- Seamless redirect to tenant-specific environments

### Tenant Dashboard

- Create and manage events
- Configure event types (Open/Closed registration)
- Generate shareable registration links
- Quick access to approval panel and QR scanner

### Event Registration

- User-friendly registration forms
- Support for both open and closed events
- Responsive mobile-first design
- Real-time form validation

### Approval Panel

- Review pending registrations
- Approve/reject attendees with one click
- Generate unique QR codes for approved users
- Download QR codes for distribution

### QR Scanner

- Real-time camera-based QR code scanning
- Validate attendee entries
- Prevent duplicate check-ins
- Lock used QR codes automatically

### Interactive Map

- SVG-based venue navigation
- Search and filter locations
- Zoom and pan controls
- Location details and directions

## 🛠 Tech Stack

- **Frontend Framework**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM with protected routes
- **Animations**: Framer Motion for smooth transitions
- **QR Codes**: QRCode generation and HTML5 QR scanning
- **State Management**: React Context API
- **Authentication**: Mock Google Auth (ready for real implementation)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mapease_event
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗 Project Structure

```
src/
├── components/           # React components
│   ├── LandingPage.tsx
│   ├── SuperAdminDashboard.tsx
│   ├── TenantDashboard.tsx
│   ├── EventRegistration.tsx
│   ├── ApprovalPanel.tsx
│   ├── QRScanner.tsx
│   ├── InteractiveMap.tsx
│   └── ProtectedRoute.tsx
├── context/             # React context providers
│   ├── AuthContext.tsx
│   └── TenantContext.tsx
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── auth.ts
│   ├── qrcode.ts
│   └── tenant.ts
├── App.tsx              # Main app component with routing
└── index.tsx            # App entry point
```

## 🎨 Design System

### Colors

- **Primary**: Blue shades (#3b82f6 family)
- **Secondary**: Gray shades (#64748b family)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Components

- **Cards**: Rounded white containers with subtle shadows
- **Buttons**: Primary (blue) and secondary (gray) variants
- **Forms**: Consistent styling with focus states
- **Animations**: Smooth transitions and micro-interactions

## 🔐 Authentication Flow

1. **Landing Page**: Users click "Continue with Google"
2. **Role Detection**: System determines user role based on email domain
3. **Redirect Logic**:
   - Super Admin → `/admin-dashboard`
   - Tenant Admin → `/dashboard` (subdomain-specific)
   - Regular User → Registration pages

## 🏢 Multi-Tenant Architecture

- **Subdomain Routing**: `company-a.mapease.com`
- **Tenant Context**: Provides tenant-specific data throughout the app
- **Dynamic Configuration**: Each tenant has custom maps and settings

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch-Friendly**: Large touch targets and gestures
- **Progressive Enhancement**: Works across all device sizes

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Create a `.env` file with:

```
REACT_APP_API_URL=your-api-url
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Hosting Recommendations

- **Netlify**: Automatic deployments with subdomain support
- **Vercel**: Edge functions for API integration
- **AWS S3 + CloudFront**: Scalable static hosting

## 🔧 Configuration

### Tailwind CSS

The project uses a custom Tailwind configuration with:

- Extended color palette
- Custom animations
- Component utilities

### TypeScript

Strict TypeScript configuration ensures type safety across the application.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- QR Scanner uses mock data (integrate with real QR scanning library)
- Google Auth is mocked (implement real OAuth flow)
- Maps use placeholder SVG (integrate with real venue maps)

## 🚧 Future Enhancements

- [ ] Real-time notifications
- [ ] Analytics dashboard
- [ ] Mobile app companion
- [ ] Advanced map editing
- [ ] Multi-language support
- [ ] Integration with calendar systems
- [ ] Automated email notifications
- [ ] Advanced user roles and permissions

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ by the MapEase team
