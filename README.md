# CPAP Mask Scanner App

A React Native app for creating custom CPAP masks using TrueDepth camera technology and 3D facial scanning.

## Features

- **OAuth Authentication**: Sign in with Google, Apple, or email/password
- **Medical Survey**: Comprehensive questionnaire for CPAP mask customization
- **3D Face Scanning**: TrueDepth camera integration for precise facial measurements
- **Multi-Angle Capture**: Front, left, right, top, and bottom facial scans
- **HIPAA Compliance**: Secure handling of medical data
- **Custom Mask Ordering**: Complete ordering system with customization options
- **Dark Mode Support**: Automatic theme switching
- **iOS Only**: Optimized for TrueDepth camera technology

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS) for styling
- **Expo Router** for navigation
- **Expo Camera** for TrueDepth integration
- **AsyncStorage** for local data persistence

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cpap-mask-scanner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on iOS simulator or device:
```bash
npm run ios
```

## App Structure

```
app/
├── (auth)/           # Authentication flow
│   ├── login.tsx     # Sign in page
│   └── signup.tsx    # Registration page
├── (tabs)/           # Main app tabs
│   ├── index.tsx     # Home dashboard
│   ├── scan.tsx      # Scan information
│   └── profile.tsx   # User profile
├── survey/           # Medical questionnaire
│   ├── welcome.tsx   # Survey introduction
│   ├── medical.tsx   # Medical questions
│   └── instructions.tsx # Scanning instructions
├── scan/             # Face scanning
│   ├── prepare.tsx   # Scan preparation
│   ├── active.tsx    # Active scanning
│   └── review.tsx    # Scan review
└── results/          # Results and ordering
    ├── summary.tsx   # Scan results
    └── order.tsx     # Order confirmation
```

## User Flow

1. **Authentication**: Users sign up/login with OAuth or email
2. **Survey**: Complete medical questionnaire for mask customization
3. **Scanning**: 3D face scan using TrueDepth camera
4. **Review**: Check scan quality and data
5. **Ordering**: Customize and order custom CPAP mask

## Key Features

### Authentication
- OAuth integration (Google, Apple)
- Email/password authentication
- HIPAA-compliant data storage
- Secure session management

### Medical Survey
- CPAP usage questions
- Mask type preferences
- Sleep position data
- Facial sensitivity information
- Pressure level tracking

### 3D Scanning
- TrueDepth camera integration
- Multi-angle facial capture
- Real-time quality assessment
- Depth data collection
- Facial landmark identification

### Ordering System
- Mask type selection
- Material customization
- Color options
- Shipping information
- Payment processing

## Privacy & Security

- **HIPAA Compliance**: All medical data handled according to HIPAA guidelines
- **Data Encryption**: Secure transmission and storage
- **User Consent**: Clear privacy policies and terms
- **Data Minimization**: Only collect necessary information

## Requirements

- iOS 10+ (for TrueDepth support)
- iPhone with TrueDepth camera (iPhone X or later)
- Good lighting conditions
- Stable internet connection

## Development

### Adding New Features

1. Create new components in appropriate directories
2. Update navigation in layout files
3. Add TypeScript interfaces for new data types
4. Update authentication context if needed

### Backend Integration

The app is designed to integrate with a backend API for:
- User authentication
- Survey data storage
- Scan data processing
- Order management
- Payment processing

### Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email: support@cpapscan.com
