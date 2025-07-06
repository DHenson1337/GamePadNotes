import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
} from "react-native";

const GameDetailScreen = ({
  route,
  navigation,
  getGame,
  addEntry,
  editEntry,
  deleteEntry,
}) => {
  // Get the game data passed from HomeScreen
  const { gameId } = route.params;
  const game = getGame(gameId);

  // If game not found, go back
  if (!game) {
    navigation.goBack();
    return null;
  }

  const [newEntryText, setNewEntryText] = useState("");
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editEntryText, setEditEntryText] = useState("");
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isLongPressing, setIsLongPressing] = useState(null);

  // Helper function to get today's date in local timezone
  const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to add a new entry
  const handleAddEntry = () => {
    if (newEntryText.trim()) {
      addEntry(gameId, newEntryText);
      setNewEntryText("");
      setShowAddEntry(false);
    }
  };

  // Function to start editing an entry
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditEntryText(entry.text);
  };

  // Function to save edited entry
  const handleSaveEdit = () => {
    if (editEntryText.trim() && editingEntry) {
      editEntry(gameId, editingEntry.id, editEntryText.trim());
      setEditingEntry(null);
      setEditEntryText("");
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditEntryText("");
  };

  // Function to handle long press start
  const handleLongPressStart = (entry) => {
    setIsLongPressing(entry.id);
    const timer = setTimeout(() => {
      // Delete after 3 seconds
      deleteEntry(gameId, entry.id);
      setIsLongPressing(null);
    }, 3000);
    setLongPressTimer(timer);
  };

  // Function to handle long press end (user lifted finger)
  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(null);
  };

  // Function to format date nicely
  const formatDate = (dateString) => {
    // Create date object from the YYYY-MM-DD string
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Pressable style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Settings</Text>
          </Pressable>
        </View>

        <View style={styles.gameHeader}>
          <View style={styles.gameImage}>
            <Text style={styles.imagePlaceholder}>🎮</Text>
          </View>
          <Text style={styles.gameTitle}>{game.title}</Text>
          <Pressable
            style={styles.addImgButton}
            onPress={() => setShowAddEntry(true)}
          >
            <Text style={styles.addImgButtonText}>Add Entry</Text>
          </Pressable>
        </View>
      </View>

      {/* Entries List */}
      <ScrollView style={styles.entriesList}>
        {game.entries.map((entry) => (
          <View
            key={entry.id}
            style={[
              styles.entryCard,
              isLongPressing === entry.id && styles.entryCardDeleting,
            ]}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>
                Entry from {formatDate(entry.date)}
              </Text>
              <View style={styles.entryActions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => handleEditEntry(entry)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.deleteEntryButton,
                    isLongPressing === entry.id &&
                      styles.deleteEntryButtonPressed,
                  ]}
                  onPressIn={() => handleLongPressStart(entry)}
                  onPressOut={handleLongPressEnd}
                  onLongPress={() => {}} // Required for onPressIn/Out to work properly
                >
                  <Text style={styles.deleteEntryButtonText}>
                    {isLongPressing === entry.id ? "⏱️" : "🗑️"}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.entryContent}>
              <Text style={styles.entryText}>{entry.text}</Text>
              {/* Placeholder for images */}
              <View style={styles.entryImage}>
                <Text style={styles.entryImagePlaceholder}>📷</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddEntry}
        onRequestClose={() => setShowAddEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addEntryModal}>
            <Text style={styles.modalTitle}>Add New Entry</Text>
            <Text style={styles.modalSubtitle}>
              {formatDate(getTodaysDate())}
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="Write your game notes here..."
              multiline={true}
              numberOfLines={6}
              value={newEntryText}
              onChangeText={setNewEntryText}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddEntry(false);
                  setNewEntryText("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  !newEntryText.trim() && styles.saveButtonDisabled,
                ]}
                onPress={handleAddEntry}
                disabled={!newEntryText.trim()}
              >
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editingEntry !== null}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addEntryModal}>
            <Text style={styles.modalTitle}>Edit Entry</Text>
            <Text style={styles.modalSubtitle}>
              {editingEntry && formatDate(editingEntry.date)}
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="Edit your game notes..."
              multiline={true}
              numberOfLines={6}
              value={editEntryText}
              onChangeText={setEditEntryText}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  !editEntryText.trim() && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveEdit}
                disabled={!editEntryText.trim()}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
  },
  header: {
    backgroundColor: "white",
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  settingsButton: {
    backgroundColor: "#666",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  settingsButtonText: {
    color: "white",
    fontSize: 16,
  },
  gameHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  gameImage: {
    width: 80,
    height: 80,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  imagePlaceholder: {
    fontSize: 32,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  addImgButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addImgButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  entriesList: {
    flex: 1,
    padding: 20,
  },
  entryCard: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  entryCardDeleting: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FF3B30",
    borderWidth: 2,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  entryDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  entryActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteEntryButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  deleteEntryButtonPressed: {
    backgroundColor: "#FFE5E5",
    borderColor: "#FF3B30",
    borderWidth: 2,
    transform: [{ scale: 1.15 }],
  },
  deleteEntryButtonText: {
    fontSize: 16,
  },
  entryContent: {
    flexDirection: "row",
  },
  entryText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginRight: 15,
  },
  entryImage: {
    width: 60,
    height: 60,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  entryImagePlaceholder: {
    fontSize: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addEntryModal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#666",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GameDetailScreen;
