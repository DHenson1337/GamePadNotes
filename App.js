import React, { useState, useEffect, createContext, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "./src/screens/HomeScreen";
import GameDetailScreen from "./src/screens/GameDetailScreen";
import AddGameScreen from "./src/screens/AddGameScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createStackNavigator();

// Theme Context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// 🌊 SEAGREEN LIGHT THEME - No Pink!
export const lightTheme = {
  background: "#E0F2F1",
  cardBackground: "#FFFFFF",
  headerBackground: "#B2DFDB",
  text: "#004D40",
  secondaryText: "#00695C",
  primary: "#00BCD4",
  accent: "#4DD0E1",
  accentBackground: "#E0F7FA",
  borderColor: "#80CBC4",
  buttonPrimary: "#00ACC1",
  buttonSecondary: "#26A69A",
  buttonDanger: "#FF5722", // Deep orange instead of pink
  buttonSuccess: "#66BB6A",
  modalOverlay: "rgba(0, 77, 64, 0.7)",
  placeholderText: "#4DB6AC",
  inputBackground: "#F1F8E9",
  shadowColor: "#004D40",
  neonGlow: "#00E5FF",
  neonOrange: "#FF6D00", // Orange accent
  neonGreen: "#69F0AE",
  isDark: false,
};

// 🌃 NEON DARK THEME - Orange instead of Pink
export const darkTheme = {
  background: "#0A0A0A",
  cardBackground: "#1A1A1A",
  headerBackground: "#1E1E1E",
  text: "#E0F2F1",
  secondaryText: "#80CBC4",
  primary: "#00E5FF",
  accent: "#1DE9B6",
  accentBackground: "#003D40",
  borderColor: "#004D40",
  buttonPrimary: "#00E5FF",
  buttonSecondary: "#1DE9B6",
  buttonDanger: "#FF6D00", // Electric orange
  buttonSuccess: "#69F0AE",
  modalOverlay: "rgba(0, 0, 0, 0.9)",
  placeholderText: "#4DB6AC",
  inputBackground: "#2A2A2A",
  shadowColor: "#00E5FF",
  neonGlow: "#00E5FF",
  neonOrange: "#FF6D00",
  neonGreen: "#69F0AE",
  isDark: true,
};

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    textSize: "medium",
    showConfirmDeletes: true,
    autoSave: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const SETTINGS_KEY = "@gamepad_notes_settings";

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveSettings();
    }
  }, [settings, isLoading]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const theme = settings.darkMode ? darkTheme : lightTheme;

  const textSizeMultipliers = {
    small: 0.9,
    medium: 1.0,
    large: 1.15,
  };

  const getTextSize = (baseSize) => {
    return Math.round(baseSize * textSizeMultipliers[settings.textSize]);
  };

  const themeValue = {
    theme,
    settings,
    updateSettings,
    getTextSize,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
};

export default function App() {
  const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const defaultGames = [
    {
      id: 1,
      title: "Cyberpunk 2077",
      lastEntry: "2025-07-06",
      image: { id: "shooter", name: "Action/Shooter", emoji: "🔫" },
      entries: [
        {
          id: 1,
          date: "2025-07-06",
          text: "Night City looks incredible in the neon lights! Finally got the hang of the hacking mechanics. The atmosphere is pure retro-futurism. 🌃",
          images: [],
        },
        {
          id: 2,
          date: "2025-07-05",
          text: "Completed the first major quest. The branching dialogue system is amazing. Every choice feels meaningful in this neon-soaked world.",
          images: [],
        },
      ],
    },
    {
      id: 2,
      title: "Stardew Valley",
      lastEntry: "2025-07-04",
      image: { id: "adventure", name: "Adventure", emoji: "🗺️" },
      entries: [
        {
          id: 3,
          date: "2025-07-04",
          text: "Spring Year 2! My crops are thriving and I've got a chicken coop going. The pixel art style never gets old - so relaxing after long days. 🌱",
          images: [],
        },
      ],
    },
  ];

  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const STORAGE_KEY = "@gamepad_notes_games";

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveGames();
    }
  }, [games, isLoading]);

  const loadGames = async () => {
    try {
      const savedGames = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedGames !== null) {
        const parsedGames = JSON.parse(savedGames);
        setGames(parsedGames);
      } else {
        setGames(defaultGames);
      }
    } catch (error) {
      console.error("Error loading games:", error);
      setGames(defaultGames);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGames = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error("Error saving games:", error);
    }
  };

  const addGame = (gameTitle, gameImage = null) => {
    const newGame = {
      id: Date.now(),
      title: gameTitle,
      lastEntry: getTodaysDate(),
      image: gameImage,
      entries: [],
    };
    setGames((prevGames) => [newGame, ...prevGames]);
    return newGame.id;
  };

  const deleteGame = (gameId) => {
    setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
  };

  const addEntry = (gameId, entryText) => {
    const newEntry = {
      id: Date.now(),
      date: getTodaysDate(),
      text: entryText.trim(),
      images: [],
    };

    setGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            lastEntry: newEntry.date,
            entries: [newEntry, ...game.entries],
          };
        }
        return game;
      })
    );
  };

  const editEntry = (gameId, entryId, newText) => {
    setGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            entries: game.entries.map((entry) => {
              if (entry.id === entryId) {
                return { ...entry, text: newText };
              }
              return entry;
            }),
          };
        }
        return game;
      })
    );
  };

  const deleteEntry = (gameId, entryId) => {
    setGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === gameId) {
          const updatedEntries = game.entries.filter(
            (entry) => entry.id !== entryId
          );
          return {
            ...game,
            entries: updatedEntries,
            lastEntry:
              updatedEntries.length > 0
                ? updatedEntries[0].date
                : getTodaysDate(),
          };
        }
        return game;
      })
    );
  };

  const getGame = (gameId) => {
    return games.find((game) => game.id === gameId);
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                games={games}
                addGame={addGame}
                deleteGame={deleteGame}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="GameDetail">
            {(props) => (
              <GameDetailScreen
                {...props}
                getGame={getGame}
                addEntry={addEntry}
                editEntry={editEntry}
                deleteEntry={deleteEntry}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AddGame">
            {(props) => <AddGameScreen {...props} addGame={addGame} />}
          </Stack.Screen>
          <Stack.Screen name="Settings">
            {(props) => <SettingsScreen {...props} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
