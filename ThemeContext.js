import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create the Theme Context
const ThemeContext = createContext();

// Settings storage key
const SETTINGS_STORAGE_KEY = "@gamepad_notes_settings";

// Default settings - Start with light mode for the seafoam theme
const defaultSettings = {
  darkMode: false, // Default to light mode for seafoam
  textSize: "medium",
  showConfirmDeletes: true,
  autoSave: true,
};

// Text size multipliers
const textSizeMultipliers = {
  small: 0.9,
  medium: 1.0,
  large: 1.1,
};

// Light theme colors - Seafoam Green with Silver/Light Gray
const lightTheme = {
  isDark: false,
  background: "#f8faf9", // Very light seafoam/mint
  headerBackground: "#e8f4f0", // Light seafoam
  cardBackground: "#ffffff", // Clean white cards
  inputBackground: "#ffffff",
  text: "#2c5f5d", // Dark seafoam for main text
  secondaryText: "#5a8b87", // Medium seafoam for secondary text
  placeholderText: "#a0bfbc", // Light seafoam for placeholders
  borderColor: "#7fb3b0", // Seafoam borders
  shadowColor: "#000000",
  modalOverlay: "rgba(44, 95, 93, 0.6)", // Dark seafoam overlay

  // Button colors - Seafoam theme
  buttonPrimary: "#4a9b96", // Primary seafoam
  buttonSecondary: "#6c8fa8", // Complementary blue-gray
  buttonSuccess: "#5cb85c", // Green success
  buttonDanger: "#d9534f", // Red danger
};

// Dark theme colors - Seafoam Green with Black/Dark Gray
const darkTheme = {
  isDark: true,
  background: "#0f1514", // Very dark with seafoam tint
  headerBackground: "#1a2622", // Dark seafoam
  cardBackground: "#253330", // Dark seafoam cards
  inputBackground: "#2a3a36",
  text: "#a3d4d0", // Light seafoam for main text
  secondaryText: "#7fb3b0", // Medium seafoam for secondary text
  placeholderText: "#4a6663", // Dim seafoam for placeholders
  borderColor: "#5a8b87", // Seafoam borders
  shadowColor: "#000000",
  modalOverlay: "rgba(15, 21, 20, 0.85)", // Dark overlay

  // Button colors - Dark seafoam theme
  buttonPrimary: "#6bb6b1", // Lighter seafoam for visibility
  buttonSecondary: "#7a9fb8", // Complementary blue-gray
  buttonSuccess: "#6abf6a", // Lighter green success
  buttonDanger: "#e67e7b", // Lighter red danger
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveSettings();
    }
  }, [settings, isLoaded]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Get current theme based on dark mode setting
  const theme = settings.darkMode ? darkTheme : lightTheme;

  // Function to get text size based on setting
  const getTextSize = (baseSize) => {
    const multiplier = textSizeMultipliers[settings.textSize] || 1.0;
    return Math.round(baseSize * multiplier);
  };

  const value = {
    theme,
    settings,
    updateSettings,
    getTextSize,
    isLoaded,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
