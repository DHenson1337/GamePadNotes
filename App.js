import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, BackHandler } from "react-native";
import { ThemeProvider } from "./ThemeContext";

// Import screens
import HomeScreen from "./src/screens/HomeScreen";
import GameDetailScreen from "./src/screens/GameDetailScreen";
import AddGameScreen from "./src/screens/AddGameScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

// Add CSS injection for web touch scrolling
if (Platform.OS === "web") {
  const style = document.createElement("style");
  style.textContent = `
    /* Fix mobile web scrolling for all screens */
    body, html, #root {
      height: 100vh !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
      overflow: hidden !important;
    }
    
    /* Make all ScrollView components work on web with touch */
    .css-view-1dbjc4n {
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
    }
    
    /* Specific fix for scrollable content */
    [data-class="RCTScrollView"] {
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
    }
    
    /* Ensure mobile viewport works correctly */
    @media (max-width: 768px) {
      body {
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }
      
      /* Enable scrolling on content areas */
      .css-view-1dbjc4n[style*="flex: 1"] {
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
    }
    
    /* Fix for React Native web ScrollView */
    div[style*="overflow-x: hidden"][style*="overflow-y: auto"] {
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
    }
  `;
  document.head.appendChild(style);
}

const Stack = createStackNavigator();

// Storage key for games data
const STORAGE_KEY = "@gamepad_notes_games";

// Default data structure
const defaultData = [];

// Helper function to get today's date in local timezone
const getTodaysDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const App = () => {
  const [games, setGames] = useState(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadData();
  }, []);

  // Save data to AsyncStorage whenever games change
  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [games, isLoaded]);

  // Function to load data from storage
  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setGames(parsedData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Function to save data to storage
  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  // Function to get sorted games by last entry date (newest first)
  const getSortedGames = () => {
    return [...games].sort((a, b) => {
      // Convert YYYY-MM-DD to Date for comparison
      const dateA = new Date(a.lastEntry);
      const dateB = new Date(b.lastEntry);
      return dateB - dateA; // Newest first (descending order)
    });
  };

  // Function to add a new game
  const addGame = (title, image = null) => {
    const newGame = {
      id: Date.now(),
      title: title,
      lastEntry: getTodaysDate(),
      image: image,
      entries: [],
    };
    setGames((prevGames) => [...prevGames, newGame]);
  };

  // Function to delete a game
  const deleteGame = (gameId) => {
    setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
  };

  // Function to get a specific game
  const getGame = (gameId) => {
    return games.find((game) => game.id === gameId);
  };

  // Function to add an entry to a game
  const addEntry = (gameId, text) => {
    const today = getTodaysDate();
    const newEntryId = Date.now();
    const newEntry = {
      id: newEntryId,
      date: today,
      text: text,
      images: [], // Initialize empty images array
    };

    setGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            lastEntry: today,
            entries: [newEntry, ...game.entries], // Add to beginning (newest first)
          };
        }
        return game;
      })
    );

    return newEntryId; // Return the new entry ID for photo attachment
  };

  // Function to edit an entry
  const editEntry = (gameId, entryId, newText) => {
    setGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            entries: game.entries.map((entry) =>
              entry.id === entryId ? { ...entry, text: newText } : entry
            ),
          };
        }
        return game;
      })
    );
  };

  // Function to delete an entry
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
            // Update lastEntry if we deleted the most recent entry
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

  // Function to add photo to an entry
  const addPhotoToEntry = (gameId, entryId, photoData) => {
    setGames((prevGames) =>
      prevGames.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            entries: game.entries.map((entry) => {
              if (entry.id === entryId) {
                return {
                  ...entry,
                  images: [...entry.images, photoData],
                };
              }
              return entry;
            }),
          };
        }
        return game;
      })
    );
  };

  // Function to delete photo from an entry
  const deletePhotoFromEntry = async (gameId, entryId, photoId) => {
    try {
      // Find the photo to get its file path
      const game = games.find((g) => g.id === gameId);
      const entry = game?.entries.find((e) => e.id === entryId);
      const photo = entry?.images.find((img) => img.id === photoId);

      // Delete the physical file
      if (photo && photo.uri) {
        const FileSystem = await import("expo-file-system");
        const fileInfo = await FileSystem.getInfoAsync(photo.uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(photo.uri);
        }
      }

      // Remove from state
      setGames((prevGames) =>
        prevGames.map((game) => {
          if (game.id === gameId) {
            return {
              ...game,
              entries: game.entries.map((entry) => {
                if (entry.id === entryId) {
                  return {
                    ...entry,
                    images: entry.images.filter((img) => img.id !== photoId),
                  };
                }
                return entry;
              }),
            };
          }
          return game;
        })
      );
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  // Don't render navigation until data is loaded
  if (!isLoaded) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false, // We'll use custom headers
          }}
        >
          <Stack.Screen
            name="Home"
            options={{
              // Prevent back button from closing app on home screen
              gestureEnabled: false,
            }}
          >
            {(props) => (
              <HomeScreen
                {...props}
                games={getSortedGames()} // Pass sorted games
                addGame={addGame}
                deleteGame={deleteGame}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="GameDetail"
            options={{
              // Allow back gesture but handle it properly
              gestureEnabled: true,
            }}
          >
            {(props) => (
              <GameDetailScreen
                {...props}
                getGame={getGame}
                addEntry={addEntry}
                editEntry={editEntry}
                deleteEntry={deleteEntry}
                addPhotoToEntry={addPhotoToEntry}
                deletePhotoFromEntry={deletePhotoFromEntry}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="AddGame"
            options={{
              // Prevent back button from closing app, navigate to Home instead
              gestureEnabled: true,
            }}
          >
            {(props) => <AddGameScreen {...props} addGame={addGame} />}
          </Stack.Screen>

          <Stack.Screen
            name="Settings"
            options={{
              // Allow back to home
              gestureEnabled: true,
            }}
          >
            {(props) => <SettingsScreen {...props} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
