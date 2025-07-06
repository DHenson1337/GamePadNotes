import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Image,
} from "react-native";
import { useTheme } from "../../ThemeContext";

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

  // Function to handle settings
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
        <Text style={styles.welcome}>WELCOME, GAMER! 🎮</Text>
        <Text style={styles.quote}>"EVERY GAME IS A NEW ADVENTURE"</Text>

        <View style={styles.headerButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleAddGame}
          >
            <Text style={styles.addButtonText}>+ ADD GAME</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSettings}
          >
            <Text style={styles.settingsButtonText}>⚙️ SETTINGS</Text>
          </Pressable>
        </View>
      </View>

      {/* Game List */}
      <ScrollView style={styles.gameList} showsVerticalScrollIndicator={false}>
        {games.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>NO GAMES YET</Text>
            <Text style={styles.emptyStateMessage}>
              START BUILDING YOUR GAMING LIBRARY!
            </Text>
            <Pressable style={styles.emptyStateButton} onPress={handleAddGame}>
              <Text style={styles.emptyStateButtonText}>
                ADD YOUR FIRST GAME
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
              {/* Game Title with Border - Now at the top! */}
              <View style={styles.gameTitleContainer}>
                <View style={styles.gameTitleBorder}>
                  <Text style={styles.gameTitle} numberOfLines={2}>
                    {game.title.toUpperCase()}
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
              </View>

              {/* Content Row - Icon and Info */}
              <View style={styles.gameContentRow}>
                <View style={styles.gameImage}>
                  {game.image && game.image.uri ? (
                    <Image
                      source={{ uri: game.image.uri }}
                      style={styles.customGameImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.imagePlaceholder}>
                      {game.image ? game.image.emoji : "🎮"}
                    </Text>
                  )}
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.lastEntry}>LAST: {game.lastEntry}</Text>
                  <Text style={styles.entryCount}>
                    {game.entries.length}{" "}
                    {game.entries.length === 1 ? "ENTRY" : "ENTRIES"}
                  </Text>
                </View>
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
            <Text style={styles.modalTitle}>{modalTitle.toUpperCase()}</Text>
            <Text style={styles.modalMessage}>
              {modalMessage.toUpperCase()}
            </Text>
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
            <Text style={styles.modalTitle}>DELETE GAME</Text>
            <Text style={styles.modalMessage}>
              DELETE "{gameToDelete?.title.toUpperCase()}" AND ALL ENTRIES?
            </Text>
            <Text style={styles.deleteWarning}>THIS CANNOT BE UNDONE!</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL</Text>
              </Pressable>
              <Pressable
                style={styles.modalDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText}>DELETE</Text>
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
      borderBottomWidth: 2,
      borderBottomColor: theme.borderColor,
    },
    welcome: {
      fontSize: getTextSize(22),
      fontWeight: "400",
      marginBottom: 12,
      color: theme.text,
      fontFamily: "monospace", // Will be Press Start 2P when loaded
      textAlign: "center",
    },
    quote: {
      fontSize: getTextSize(12),
      color: theme.secondaryText,
      marginBottom: 20,
      fontFamily: "monospace",
      textAlign: "center",
      lineHeight: 18,
    },
    headerButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      gap: 10,
    },
    addButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 6,
      flex: 1,
      marginRight: 5,
    },
    addButtonText: {
      color: theme.isDark ? theme.text : "#ffffff",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
      textAlign: "center",
    },
    settingsButton: {
      backgroundColor: theme.buttonSecondary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 6,
      flex: 1,
      marginLeft: 5,
    },
    settingsButtonText: {
      color: "#ffffff",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
      textAlign: "center",
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
      fontSize: getTextSize(20),
      fontFamily: "monospace",
      color: theme.text,
      marginBottom: 15,
      textAlign: "center",
    },
    emptyStateMessage: {
      fontSize: getTextSize(12),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 30,
      paddingHorizontal: 20,
      fontFamily: "monospace",
      lineHeight: 18,
    },
    emptyStateButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 25,
      paddingVertical: 15,
      borderRadius: 6,
    },
    emptyStateButtonText: {
      color: theme.isDark ? theme.text : "#ffffff",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    gameCard: {
      backgroundColor: theme.cardBackground,
      padding: 18,
      marginBottom: 15,
      borderRadius: 12,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    cardPressed: {
      backgroundColor: theme.isDark ? "#2a3f3b" : "#f0f6f5",
      transform: [{ scale: 0.98 }],
    },
    // NEW: Title container with border
    gameTitleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 15,
    },
    gameTitleBorder: {
      flex: 1,
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 15,
      backgroundColor: theme.isDark
        ? "rgba(163, 212, 208, 0.1)"
        : "rgba(74, 155, 150, 0.1)", // Subtle seafoam background
    },
    gameTitle: {
      fontSize: getTextSize(14),
      color: theme.text,
      fontFamily: "monospace",
      lineHeight: 20,
      textAlign: "center",
    },
    gameActions: {
      flexDirection: "row",
      gap: 8,
    },
    // Content row with icon and info
    gameContentRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    gameImage: {
      width: 60,
      height: 60,
      backgroundColor: theme.isDark ? "#2a3a36" : "#e8f4f0",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    imagePlaceholder: {
      fontSize: getTextSize(28),
    },
    customGameImage: {
      width: 56,
      height: 56,
      borderRadius: 8,
    },
    gameInfo: {
      flex: 1,
    },
    lastEntry: {
      fontSize: getTextSize(11),
      color: theme.secondaryText,
      marginBottom: 6,
      fontFamily: "monospace",
    },
    entryCount: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      fontFamily: "monospace",
    },
    actionButton: {
      backgroundColor: theme.buttonSuccess,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 6,
    },
    actionButtonText: {
      fontSize: getTextSize(16),
    },
    deleteButton: {
      backgroundColor: theme.buttonDanger,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 6,
    },
    deleteButtonText: {
      fontSize: getTextSize(16),
    },
    deleteButtonPressed: {
      backgroundColor: "#e67e7b",
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
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    deleteModalIcon: {
      fontSize: getTextSize(48),
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: getTextSize(16),
      marginBottom: 15,
      color: theme.text,
      fontFamily: "monospace",
      textAlign: "center",
    },
    modalMessage: {
      fontSize: getTextSize(12),
      textAlign: "center",
      marginBottom: 20,
      color: theme.secondaryText,
      lineHeight: 18,
      fontFamily: "monospace",
    },
    deleteWarning: {
      fontSize: getTextSize(11),
      textAlign: "center",
      color: theme.buttonDanger,
      marginBottom: 25,
      fontFamily: "monospace",
    },
    modalButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 6,
    },
    modalButtonText: {
      color: theme.isDark ? theme.text : "#ffffff",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
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
      borderRadius: 6,
      alignItems: "center",
    },
    modalDeleteButton: {
      flex: 1,
      backgroundColor: theme.buttonDanger,
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: "center",
    },
  });

export default HomeScreen;
