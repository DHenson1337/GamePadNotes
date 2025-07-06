import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { useTheme } from "../../App";

const GameDetailScreen = ({
  route,
  navigation,
  getGame,
  addEntry,
  editEntry,
  deleteEntry,
}) => {
  const { theme, getTextSize } = useTheme();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

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

  // Function to show delete confirmation
  const handleDeleteEntry = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteConfirm(true);
  };

  // Function to confirm delete
  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(gameId, entryToDelete.id);
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

  // Function to cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEntryToDelete(null);
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

  const styles = getStyles(theme, getTextSize);

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
          <Pressable
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
          </Pressable>
        </View>

        <View style={styles.gameHeader}>
          <View style={styles.gameImage}>
            <Text style={styles.imagePlaceholder}>
              {game.image ? game.image.emoji : "🎮"}
            </Text>
          </View>
          <Text style={styles.gameTitle}>{game.title}</Text>
          {game.image && game.image.id !== "default" && (
            <Text style={styles.gameCategory}>{game.image.name}</Text>
          )}
          <Pressable
            style={styles.addEntryButton}
            onPress={() => setShowAddEntry(true)}
          >
            <Text style={styles.addEntryButtonText}>+ Add Entry</Text>
          </Pressable>
        </View>
      </View>

      {/* Entries List */}
      <ScrollView
        style={styles.entriesList}
        showsVerticalScrollIndicator={false}
      >
        {game.entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text style={styles.emptyStateTitle}>No entries yet</Text>
            <Text style={styles.emptyStateMessage}>
              Start documenting your gaming journey!
            </Text>
            <Pressable
              style={styles.emptyStateButton}
              onPress={() => setShowAddEntry(true)}
            >
              <Text style={styles.emptyStateButtonText}>Add First Entry</Text>
            </Pressable>
          </View>
        ) : (
          game.entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                <View style={styles.entryActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEditEntry(entry)}
                  >
                    <Text style={styles.editButtonIcon}>✏️</Text>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEntry(entry)}
                  >
                    <Text style={styles.deleteButtonIcon}>🗑️</Text>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.entryContent}>
                <Text style={styles.entryText}>{entry.text}</Text>
                {/* Placeholder for images */}
                <View style={styles.entryImagePlaceholder}>
                  <Text style={styles.entryImageIcon}>📷</Text>
                  <Text style={styles.entryImageText}>Photo</Text>
                </View>
              </View>
            </View>
          ))
        )}
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
              placeholderTextColor={theme.placeholderText}
              multiline={true}
              numberOfLines={6}
              value={newEntryText}
              onChangeText={setNewEntryText}
              textAlignVertical="top"
              autoFocus={true}
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
              placeholderTextColor={theme.placeholderText}
              multiline={true}
              numberOfLines={6}
              value={editEntryText}
              onChangeText={setEditEntryText}
              textAlignVertical="top"
              autoFocus={true}
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

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteConfirm}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteModalIcon}>⚠️</Text>
            <Text style={styles.deleteModalTitle}>Delete Entry</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this entry from{" "}
              {entryToDelete && formatDate(entryToDelete.date)}?
            </Text>
            <Text style={styles.deleteModalWarning}>
              This action cannot be undone.
            </Text>

            <View style={styles.deleteModalButtons}>
              <Pressable
                style={styles.deleteCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.deleteConfirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
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
    },
    header: {
      backgroundColor: theme.headerBackground,
      paddingTop: 50,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    backButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 6,
    },
    backButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(16),
    },
    settingsButton: {
      backgroundColor: theme.buttonSecondary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 6,
    },
    settingsButtonText: {
      color: "white",
      fontSize: getTextSize(16),
    },
    gameHeader: {
      alignItems: "center",
      paddingHorizontal: 20,
    },
    gameImage: {
      width: 80,
      height: 80,
      backgroundColor: theme.isDark ? "#404040" : "#e0e0e0",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    imagePlaceholder: {
      fontSize: getTextSize(32),
    },
    gameTitle: {
      fontSize: getTextSize(24),
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 5,
      color: theme.text,
    },
    gameCategory: {
      fontSize: getTextSize(14),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 15,
    },
    addEntryButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    addEntryButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
    entriesList: {
      flex: 1,
      padding: 20,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyStateIcon: {
      fontSize: getTextSize(48),
      marginBottom: 20,
    },
    emptyStateTitle: {
      fontSize: getTextSize(22),
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    emptyStateMessage: {
      fontSize: getTextSize(16),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 25,
    },
    emptyStateButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyStateButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
    entryCard: {
      backgroundColor: theme.cardBackground,
      padding: 20,
      marginBottom: 20,
      borderRadius: 12,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 15,
    },
    entryDate: {
      fontSize: getTextSize(18),
      fontWeight: "bold",
      color: theme.text,
      flex: 1,
      marginRight: 15,
    },
    entryActions: {
      flexDirection: "row",
      gap: 8,
    },
    editButton: {
      backgroundColor: theme.buttonSuccess,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    editButtonIcon: {
      fontSize: getTextSize(14),
    },
    editButtonText: {
      color: "white",
      fontSize: getTextSize(12),
      fontWeight: "600",
    },
    deleteButton: {
      backgroundColor: theme.buttonDanger,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    deleteButtonIcon: {
      fontSize: getTextSize(14),
    },
    deleteButtonText: {
      color: "white",
      fontSize: getTextSize(12),
      fontWeight: "600",
    },
    entryContent: {
      flexDirection: "row",
    },
    entryText: {
      flex: 1,
      fontSize: getTextSize(16),
      lineHeight: 24,
      color: theme.text,
      marginRight: 15,
    },
    entryImagePlaceholder: {
      width: 60,
      height: 60,
      backgroundColor: theme.isDark ? "#3a3a3a" : "#f0f0f0",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
    },
    entryImageIcon: {
      fontSize: getTextSize(16),
      marginBottom: 2,
    },
    entryImageText: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    addEntryModal: {
      backgroundColor: theme.cardBackground,
      padding: 20,
      borderRadius: 12,
      width: "100%",
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: getTextSize(20),
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 5,
      color: theme.text,
    },
    modalSubtitle: {
      fontSize: getTextSize(16),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 20,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 8,
      padding: 15,
      fontSize: getTextSize(16),
      minHeight: 120,
      marginBottom: 20,
      backgroundColor: theme.inputBackground,
      color: theme.text,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.buttonSecondary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButtonText: {
      color: "white",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
    saveButton: {
      flex: 1,
      backgroundColor: theme.buttonPrimary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    saveButtonDisabled: {
      backgroundColor: "#ccc",
    },
    saveButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
    // Delete modal styles
    deleteModal: {
      backgroundColor: theme.cardBackground,
      padding: 25,
      borderRadius: 12,
      maxWidth: 350,
      width: "100%",
      alignItems: "center",
    },
    deleteModalIcon: {
      fontSize: getTextSize(40),
      marginBottom: 15,
    },
    deleteModalTitle: {
      fontSize: getTextSize(20),
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.text,
    },
    deleteModalMessage: {
      fontSize: getTextSize(16),
      textAlign: "center",
      color: theme.secondaryText,
      marginBottom: 8,
      lineHeight: 22,
    },
    deleteModalWarning: {
      fontSize: getTextSize(14),
      textAlign: "center",
      color: theme.buttonDanger,
      marginBottom: 25,
      fontWeight: "600",
    },
    deleteModalButtons: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    deleteCancelButton: {
      flex: 1,
      backgroundColor: theme.buttonSecondary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    deleteCancelButtonText: {
      color: "white",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
    deleteConfirmButton: {
      flex: 1,
      backgroundColor: theme.buttonDanger,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    deleteConfirmButtonText: {
      color: "white",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
  });

export default GameDetailScreen;
