import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";

const HomeScreen = ({ navigation, games, addGame, deleteGame }) => {
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
    showMessage("Settings", "This will open the Settings screen later!");
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
      deleteGame(gameToDelete.id); // Use the shared delete function
      showMessage("Deleted", `"${gameToDelete.title}" has been deleted!`);
    }
    setShowDeleteConfirm(false);
    setGameToDelete(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome (Insert name)</Text>
        <Text style={styles.quote}>Quote of the Day is (Gotten from API)</Text>

        <View style={styles.headerButtons}>
          <Pressable
            style={({ hovered }) => [
              styles.addButton,
              hovered && styles.buttonHovered,
            ]}
            onPress={handleAddGame}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
          <Pressable
            style={({ hovered }) => [
              styles.settingsButton,
              hovered && styles.buttonHovered,
            ]}
            onPress={handleSettings}
          >
            <Text style={styles.settingsButtonText}>Settings</Text>
          </Pressable>
        </View>
      </View>

      {/* Game List */}
      <ScrollView style={styles.gameList}>
        {games.map((game) => (
          <Pressable
            key={game.id}
            style={({ hovered }) => [
              styles.gameCard,
              hovered && styles.cardHovered,
            ]}
            onPress={() => handleGameSelect(game.id, game.title)}
          >
            <View style={styles.gameImage}>
              <Text style={styles.imagePlaceholder}>🎮</Text>
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.lastEntry}>Last entry: {game.lastEntry}</Text>
            </View>
            <View style={styles.gameActions}>
              <Pressable
                style={({ hovered }) => [
                  styles.actionButton,
                  hovered && styles.buttonHovered,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleGameSelect(game.id, game.title);
                }}
              >
                <Text style={styles.actionButtonText}>+</Text>
              </Pressable>
              <Pressable
                style={({ hovered }) => [
                  styles.deleteButton,
                  hovered && styles.deleteButtonHovered,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDelete(game.id, game.title);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}
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
            <Text style={styles.modalTitle}>Delete Game</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{gameToDelete?.title}"?
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  quote: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  addButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    cursor: "pointer",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  settingsButton: {
    backgroundColor: "#666",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    cursor: "pointer",
  },
  settingsButtonText: {
    color: "white",
    fontSize: 16,
  },
  buttonHovered: {
    opacity: 0.8,
    transform: [{ scale: 1.05 }],
  },
  gameList: {
    flex: 1,
    padding: 20,
  },
  gameCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    cursor: "pointer",
  },
  cardHovered: {
    backgroundColor: "#f8f8f8",
    shadowOpacity: 0.2,
  },
  gameImage: {
    width: 60,
    height: 60,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  imagePlaceholder: {
    fontSize: 24,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  lastEntry: {
    fontSize: 14,
    color: "#666",
  },
  gameActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    cursor: "pointer",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#666",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    cursor: "pointer",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
  },
  deleteButtonHovered: {
    backgroundColor: "#ff4444",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    minWidth: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  modalButton: {
    backgroundColor: "#333",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelButton: {
    backgroundColor: "#666",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalDeleteButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default HomeScreen;
