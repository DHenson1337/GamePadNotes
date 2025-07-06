import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "./src/screens/HomeScreen";
import GameDetailScreen from "./src/screens/GameDetailScreen";

const Stack = createStackNavigator();

export default function App() {
  // Helper function to get today's date in local timezone
  const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Default games data
  const defaultGames = [
    {
      id: 1,
      title: "The Legend of Zelda: Tears of the Kingdom",
      lastEntry: "2025-07-03",
      image: null,
      entries: [
        {
          id: 1,
          date: "2025-07-03",
          text: "Found a new shrine near the central tower. The puzzle involved moving water with the ultrahand ability. Really clever design!",
          images: [],
        },
        {
          id: 2,
          date: "2025-07-02",
          text: "Defeated my first Lynel today! The strategy was to use perfect dodges and then attack during the slow-mo. Took about 15 tries but finally got it.",
          images: [],
        },
      ],
    },
    {
      id: 2,
      title: "Spider-Man 2",
      lastEntry: "2025-07-01",
      image: null,
      entries: [
        {
          id: 3,
          date: "2025-07-01",
          text: "The web-swinging mechanics feel amazing. The new web wings add a whole new dimension to traversal. Brooklyn Bridge area is beautifully detailed.",
          images: [],
        },
      ],
    },
  ];

  // Shared state for all games and their entries
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Storage key for AsyncStorage
  const STORAGE_KEY = "@gamepad_notes_games";

  // Load games from storage when app starts
  useEffect(() => {
    loadGames();
  }, []);

  // Save games to storage whenever games state changes
  useEffect(() => {
    if (!isLoading) {
      saveGames();
    }
  }, [games, isLoading]);

  // Load games from AsyncStorage
  const loadGames = async () => {
    try {
      const savedGames = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedGames !== null) {
        // Data exists, load it
        const parsedGames = JSON.parse(savedGames);
        setGames(parsedGames);
      } else {
        // No saved data, use default games
        setGames(defaultGames);
      }
    } catch (error) {
      console.error("Error loading games:", error);
      // If there's an error, use default games
      setGames(defaultGames);
    } finally {
      setIsLoading(false);
    }
  };

  // Save games to AsyncStorage
  const saveGames = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error("Error saving games:", error);
    }
  };

  // Function to add a new game
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

  // Function to delete a game
  const deleteGame = (gameId) => {
    setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
  };

  // Function to add an entry to a specific game
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

  // Function to get a specific game
  const getGame = (gameId) => {
    return games.find((game) => game.id === gameId);
  };

  // Show loading screen while data is loading
  if (isLoading) {
    return null; // You could add a loading spinner here later
  }

  return (
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
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
