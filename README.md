# 🎮 GamePad Notes

A Progressive Web App (PWA) for documenting your gaming journey. Keep track of your favorite games, memorable moments, and gaming progress with photos and notes.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-gamepadnotes.netlify.app-brightgreen)](https://gamepadnotes.netlify.app)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](https://github.com/yourusername/GamePadNotes)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## ✨ Features

- 🎯 **Game Library Management** - Add and organize your gaming collection
- 📝 **Daily Gaming Entries** - Document your gaming sessions with detailed notes
- 📷 **Photo Attachments** - Capture screenshots and gaming moments
- 🎨 **Custom Game Covers** - Upload your own game artwork
- 📧 **Email Backup System** - Export and import your data via email
- 💾 **Offline Functionality** - Works without internet after installation
- 🌙 **Dark Mode Support** - Easy on the eyes during late-night gaming
- 📱 **PWA Installation** - Install to home screen like a native app
- 🎪 **Responsive Design** - Works perfectly on mobile and desktop

## 🚀 Installation

### For Users (PWA Installation)

#### iPhone (Safari)

1. Visit [gamepadnotes.netlify.app](https://gamepadnotes.netlify.app) in Safari
2. Tap the **Share button** (📤) at the bottom
3. Select **"Add to Home Screen"**
4. Tap **"Add"** - the app icon will appear on your home screen
5. Launch from the home screen for the full app experience

#### Android (Chrome)

1. Visit [gamepadnotes.netlify.app](https://gamepadnotes.netlify.app) in Chrome
2. Look for the **"Install"** prompt or tap menu (⋮) → **"Add to Home screen"**
3. Confirm installation
4. Launch from your app drawer or home screen

### For Developers

```bash
# Clone the repository
git clone https://github.com/yourusername/GamePadNotes.git
cd GamePadNotes

# Install dependencies
npm install

# Start development server
npx expo start --web

# Build for production
npx expo export --platform web
```

## 🛠️ Tech Stack

- **Framework:** React Native (Expo)
- **Web Platform:** React Native Web
- **Navigation:** React Navigation
- **Storage:** AsyncStorage (local browser storage)
- **Photos:** Expo Image Picker / Web File API
- **PWA:** Expo Web with Service Workers
- **Deployment:** Netlify

## 📱 How It Works

### Game Management

- Add games with custom titles and icons
- Choose from preset game categories (RPG, Racing, Sports, etc.)
- Upload custom game cover art from photos or camera

### Note Taking

- Create daily entries for each game
- Add detailed notes about gameplay, strategies, or memorable moments
- Attach photos and screenshots to entries
- Edit or delete entries as needed

### Data Backup

- **Export:** Create backup files with all your games, notes, and photos
- **Import:** Restore data from backup files on new devices
- **Email Integration:** Send backups to yourself for safekeeping
- **Cross-Platform:** Backup files work across different devices

## 🎯 Use Cases

- **Game Progress Tracking** - Document your journey through RPGs and story games
- **Strategy Notes** - Keep tactics and tips for competitive games
- **Achievement Logging** - Record memorable gaming accomplishments
- **Screenshot Collection** - Organize gaming photos with context
- **Gaming Journal** - Maintain a personal gaming diary
- **Speedrun Notes** - Track strategies and improvement areas

## 🔧 Configuration

### Environment Variables

No environment variables required - the app runs entirely client-side.

### Storage

- **Local Storage:** Game data and settings stored in browser
- **Photos:** Stored as data URLs (web) or local files (mobile)
- **Backup:** JSON files containing all app data

## 📊 Browser Support

- ✅ **Chrome/Chromium** (Desktop & Mobile)
- ✅ **Safari** (Desktop & Mobile)
- ✅ **Firefox** (Desktop & Mobile)
- ✅ **Edge** (Desktop & Mobile)

### PWA Features Support

- ✅ **Install to Home Screen**
- ✅ **Offline Functionality**
- ✅ **Camera Access** (when installed)
- ✅ **File System Access**
- ✅ **Push Notifications** (planned)

## 🔒 Privacy & Security

- **Local-Only Storage** - All data stays on your device
- **No Server Required** - No data transmitted to external servers
- **User-Controlled Backups** - You control your own data exports
- **No Analytics** - No tracking or data collection
- **Offline-First** - Works without internet connection

## 🚧 Development

### Project Structure

```
GamePadNotes/
├── App.js                 # Main app navigation
├── ThemeContext.js        # Theme and settings management
├── src/
│   ├── components/
│   │   ├── PhotoPicker.js       # Photo capture component
│   │   └── GameImagePicker.js   # Game cover upload
│   └── screens/
│       ├── HomeScreen.js        # Game library view
│       ├── GameDetailScreen.js  # Game notes and entries
│       ├── AddGameScreen.js     # Add new games
│       └── SettingsScreen.js    # App settings and backup
├── app.json               # Expo configuration
└── package.json          # Dependencies
```

### Available Scripts

```bash
# Development
npm start                  # Start Expo development server
npx expo start --web      # Start web development
npx expo start --tunnel   # Start with tunnel for mobile testing

# Building
npx expo export --platform web    # Build for web deployment
npx expo build:web               # Alternative build command

# Testing
npm test                   # Run tests (if configured)
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues & Limitations

- **Web Camera Access:** Limited in some browsers when not installed as PWA
- **File Size:** Large photo collections may impact performance
- **Storage Limits:** Browser storage limits apply (typically 50MB+)
- **iOS Safari:** Some PWA features require home screen installation

## 🗺️ Roadmap

### Version 1.1

- [ ] **Search functionality** across all notes
- [ ] **Note templates** for different game types
- [ ] **Tag system** for categorizing entries
- [ ] **Export to PDF** feature

### Version 1.2

- [ ] **Cloud sync** option (optional)
- [ ] **Collaborative notes** for multiplayer games
- [ ] **Gaming time tracking**
- [ ] **Achievement galleries**

### Version 2.0

- [ ] **Game API integration** (Steam, Xbox, PlayStation)
- [ ] **Automatic screenshot detection**
- [ ] **Social sharing** features
- [ ] **Gaming community** integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Davon Henson**

- GitHub: [@yourusername](https://github.com/DHenson1337)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- Icons and emojis from system fonts
- Hosted on [Netlify](https://netlify.com/)
- Inspired by the need for better gaming documentation tools

## 📞 Support

---

**Made with ❤️ for gamers who love to document their journey**

_Start documenting your gaming adventures today!_ 🎮✨
