import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useTheme } from "../../App"; // Fixed: changed from "../../App" to "../../App"

const HomeScreen = ({ navigation, games, addGame, deleteGame }) => {
  const { theme, getTextSize } = useTheme();

  // State for modal popup
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  // Function to show a simple message
  const showMessage = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // Function to handle adding a new game
  const handleAddGame = () => {
    navigation.navigate("AddGame");
  };

  // Function to handle settings - NOW PROPERLY NAVIGATES
  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  // Function to handle game selection
  const handleGameSelect = (gameId, gameTitle) => {
    navigation.navigate("GameDetail", {
      gameId: gameId,
    });
  };

  // Function to handle delete
  const handleDelete = (gameId, gameTitle) => {
    setGameToDelete({ id: gameId, title: gameTitle });
    setShowDeleteConfirm(true);
  };

  // Function to confirm delete
  const confirmDelete = () => {
    if (gameToDelete) {
      deleteGame(gameToDelete.id);
      showMessage("Deleted", `"${gameToDelete.title}" has been deleted!`);
    }
    setShowDeleteConfirm(false);
    setGameToDelete(null);
  };

  const styles = getStyles(theme, getTextSize);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, Gamer! 🎮</Text>
        <Text style={styles.quote}>
          "Every game is a new adventure waiting to be discovered"
        </Text>

        <View style={styles.headerButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleAddGame}
          >
            <Text style={styles.addButtonText}>+ Add Game</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSettings}
          >
            <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
          </Pressable>
        </View>
      </View>

      {/* Game List */}
      <ScrollView style={styles.gameList} showsVerticalScrollIndicator={false}>
        {games.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>No Games Yet</Text>
            <Text style={styles.emptyStateMessage}>
              Start building your gaming library by adding your first game!
            </Text>
            <Pressable style={styles.emptyStateButton} onPress={handleAddGame}>
              <Text style={styles.emptyStateButtonText}>
                Add Your First Game
              </Text>
            </Pressable>
          </View>
        ) : (
          games.map((game) => (
            <Pressable
              key={game.id}
              style={({ pressed }) => [
                styles.gameCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleGameSelect(game.id, game.title)}
            >
              <View style={styles.gameImage}>
                <Text style={styles.imagePlaceholder}>
                  {game.image ? game.image.emoji : "🎮"}
                </Text>
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.lastEntry}>
                  Last entry: {game.lastEntry}
                </Text>
                <Text style={styles.entryCount}>
                  {game.entries.length}{" "}
                  {game.entries.length === 1 ? "entry" : "entries"}
                </Text>
              </View>
              <View style={styles.gameActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleGameSelect(game.id, game.title);
                  }}
                >
                  <Text style={styles.actionButtonText}>📝</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(game.id, game.title);
                  }}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Simple Message Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.deleteModalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Delete Game</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{gameToDelete?.title}" and all
              its entries?
            </Text>
            <Text style={styles.deleteWarning}>
              This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme, getTextSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: 50,
    },
    header: {
      padding: 20,
      backgroundColor: theme.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    welcome: {
      fontSize: getTextSize(26),
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.text,
    },
    quote: {
      fontSize: getTextSize(16),
      color: theme.secondaryText,
      marginBottom: 20,
      fontStyle: "italic",
    },
    headerButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    addButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    addButtonText: {
      color: theme.isDark ? theme.background : "#ffffff",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
    settingsButton: {
      backgroundColor: theme.buttonSecondary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    settingsButtonText: {
      color: "#ffffff",
      fontSize: getTextSize(16),
    },
    buttonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }],
    },
    gameList: {
      flex: 1,
      padding: 20,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
    },
    emptyStateIcon: {
      fontSize: getTextSize(64),
      marginBottom: 20,
    },
    emptyStateTitle: {
      fontSize: getTextSize(24),
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 10,
    },
    emptyStateMessage: {
      fontSize: getTextSize(16),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    emptyStateButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 25,
      paddingVertical: 15,
      borderRadius: 8,
    },
    emptyStateButtonText: {
      color: theme.isDark ? theme.background : "#ffffff",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
    gameCard: {
      flexDirection: "row",
      backgroundColor: theme.cardBackground,
      padding: 18,
      marginBottom: 15,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    cardPressed: {
      backgroundColor: theme.isDark ? "#3a3a3a" : "#f8f8f8",
      transform: [{ scale: 0.98 }],
    },
    gameImage: {
      width: 60,
      height: 60,
      backgroundColor: theme.isDark ? "#404040" : "#e0e0e0",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    imagePlaceholder: {
      fontSize: getTextSize(28),
    },
    gameInfo: {
      flex: 1,
    },
    gameTitle: {
      fontSize: getTextSize(18),
      fontWeight: "bold",
      marginBottom: 4,
      color: theme.text,
    },
    lastEntry: {
      fontSize: getTextSize(14),
      color: theme.secondaryText,
      marginBottom: 2,
    },
    entryCount: {
      fontSize: getTextSize(12),
      color: theme.secondaryText,
      opacity: 0.8,
    },
    gameActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      backgroundColor: theme.buttonSuccess,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 8,
    },
    actionButtonText: {
      fontSize: getTextSize(18),
    },
    deleteButton: {
      backgroundColor: theme.buttonDanger,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 8,
    },
    deleteButtonText: {
      fontSize: getTextSize(18),
    },
    deleteButtonPressed: {
      backgroundColor: "#FF6B6B",
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.cardBackground,
      padding: 25,
      borderRadius: 12,
      minWidth: 300,
      maxWidth: 400,
      alignItems: "center",
    },
    deleteModalIcon: {
      fontSize: getTextSize(48),
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: getTextSize(20),
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.text,
    },
    modalMessage: {
      fontSize: getTextSize(16),
      textAlign: "center",
      marginBottom: 20,
      color: theme.secondaryText,
      lineHeight: 22,
    },
    deleteWarning: {
      fontSize: getTextSize(14),
      textAlign: "center",
      color: theme.buttonDanger,
      marginBottom: 25,
      fontWeight: "600",
    },
    modalButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 8,
    },
    modalButtonText: {
      color: theme.isDark ? theme.background : "#ffffff",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
    modalButtons: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    modalCancelButton: {
      flex: 1,
      backgroundColor: theme.buttonSecondary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    modalDeleteButton: {
      flex: 1,
      backgroundColor: theme.buttonDanger,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
  });

export default HomeScreen;
