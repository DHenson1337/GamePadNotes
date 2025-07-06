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
  Image,
  Dimensions,
} from "react-native";
import { useTheme } from "../../ThemeContext";
import PhotoPicker from "../components/PhotoPicker";

const { width: screenWidth } = Dimensions.get("window");

const GameDetailScreen = ({
  route,
  navigation,
  getGame,
  addEntry,
  editEntry,
  deleteEntry,
  addPhotoToEntry,
  deletePhotoFromEntry,
}) => {
  const { theme, getTextSize } = useTheme();
  const { gameId } = route.params;
  const game = getGame(gameId);

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

  // Photo-related state
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [currentEntryForPhoto, setCurrentEntryForPhoto] = useState(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleAddEntry = () => {
    if (newEntryText.trim()) {
      const newEntryId = addEntry(gameId, newEntryText);
      setNewEntryText("");
      setShowAddEntry(false);

      // If we want to add a photo immediately, open photo picker
      // setCurrentEntryForPhoto(newEntryId);
      // setShowPhotoPicker(true);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditEntryText(entry.text);
  };

  const handleSaveEdit = () => {
    if (editEntryText.trim() && editingEntry) {
      editEntry(gameId, editingEntry.id, editEntryText.trim());
      setEditingEntry(null);
      setEditEntryText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditEntryText("");
  };

  const handleDeleteEntry = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(gameId, entryToDelete.id);
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEntryToDelete(null);
  };

  // Photo functions
  const handleAddPhoto = (entryId) => {
    setCurrentEntryForPhoto(entryId);
    setShowPhotoPicker(true);
  };

  const handlePhotoSelected = (photoData) => {
    if (currentEntryForPhoto && addPhotoToEntry) {
      addPhotoToEntry(gameId, currentEntryForPhoto, photoData);
    }
    setCurrentEntryForPhoto(null);
  };

  const handleViewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };

  const handleDeletePhoto = (entryId, photoId) => {
    Alert.alert("DELETE PHOTO", "ARE YOU SURE YOU WANT TO DELETE THIS PHOTO?", [
      { text: "CANCEL", style: "cancel" },
      {
        text: "DELETE",
        style: "destructive",
        onPress: () => {
          if (deletePhotoFromEntry) {
            deletePhotoFromEntry(gameId, entryId, photoId);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day);
    return date
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();
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
            <Text style={styles.backButtonText}>← BACK</Text>
          </Pressable>
          <Pressable
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.settingsButtonText}>⚙️ SETTINGS</Text>
          </Pressable>
        </View>

        <View style={styles.gameHeader}>
          <View style={styles.gameImage}>
            {game.image && game.image.uri ? (
              <Image
                source={{ uri: game.image.uri }}
                style={styles.customGameHeaderImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.imagePlaceholder}>
                {game.image ? game.image.emoji : "🎮"}
              </Text>
            )}
          </View>
          <Text style={styles.gameTitle}>{game.title.toUpperCase()}</Text>
          {game.image && game.image.id !== "default" && (
            <Text style={styles.gameCategory}>
              {game.image.name.toUpperCase()}
            </Text>
          )}
          <Pressable
            style={styles.addEntryButton}
            onPress={() => setShowAddEntry(true)}
          >
            <Text style={styles.addEntryButtonText}>+ ADD ENTRY</Text>
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
            <Text style={styles.emptyStateTitle}>NO ENTRIES YET</Text>
            <Text style={styles.emptyStateMessage}>
              START DOCUMENTING YOUR GAMING JOURNEY!
            </Text>
            <Pressable
              style={styles.emptyStateButton}
              onPress={() => setShowAddEntry(true)}
            >
              <Text style={styles.emptyStateButtonText}>ADD FIRST ENTRY</Text>
            </Pressable>
          </View>
        ) : (
          game.entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                <View style={styles.entryActions}>
                  <Pressable
                    style={styles.photoButton}
                    onPress={() => handleAddPhoto(entry.id)}
                  >
                    <Text style={styles.photoButtonIcon}>📷</Text>
                    <Text style={styles.photoButtonText}>PHOTO</Text>
                  </Pressable>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEditEntry(entry)}
                  >
                    <Text style={styles.editButtonIcon}>✏️</Text>
                    <Text style={styles.editButtonText}>EDIT</Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEntry(entry)}
                  >
                    <Text style={styles.deleteButtonIcon}>🗑️</Text>
                    <Text style={styles.deleteButtonText}>DEL</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.entryContent}>
                <Text style={styles.entryText}>{entry.text}</Text>
              </View>

              {/* Photo Gallery for Entry - Only show if photos exist */}
              {entry.images && entry.images.length > 0 && (
                <View style={styles.photoGallery}>
                  <Text style={styles.photoGalleryTitle}>
                    PHOTOS ({entry.images.length}):
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.photoScroll}
                  >
                    {entry.images.map((photo) => (
                      <View key={photo.id} style={styles.photoContainer}>
                        <Pressable onPress={() => handleViewPhoto(photo)}>
                          <Image
                            source={{ uri: photo.uri }}
                            style={styles.photoThumbnail}
                            resizeMode="cover"
                          />
                        </Pressable>
                        <Pressable
                          style={styles.photoDeleteButton}
                          onPress={() => handleDeletePhoto(entry.id, photo.id)}
                        >
                          <Text style={styles.photoDeleteIcon}>🗑️</Text>
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Show helpful message if no photos */}
              {(!entry.images || entry.images.length === 0) && (
                <View style={styles.noPhotosContainer}>
                  <Pressable
                    style={styles.addFirstPhotoButton}
                    onPress={() => handleAddPhoto(entry.id)}
                  >
                    <Text style={styles.addFirstPhotoIcon}>📷</Text>
                    <Text style={styles.addFirstPhotoText}>
                      TAP TO ADD FIRST PHOTO
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Photo Picker Modal */}
      <PhotoPicker
        visible={showPhotoPicker}
        onClose={() => {
          setShowPhotoPicker(false);
          setCurrentEntryForPhoto(null);
        }}
        onPhotoSelected={handlePhotoSelected}
        gameId={gameId}
        entryId={currentEntryForPhoto}
      />

      {/* Photo Viewer Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPhotoViewer}
        onRequestClose={() => setShowPhotoViewer(false)}
      >
        <View style={styles.photoViewerOverlay}>
          <Pressable
            style={styles.photoViewerClose}
            onPress={() => setShowPhotoViewer(false)}
          >
            <Text style={styles.photoViewerCloseText}>✕ CLOSE</Text>
          </Pressable>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto.uri }}
              style={styles.photoViewerImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Add Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddEntry}
        onRequestClose={() => setShowAddEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addEntryModal}>
            <Text style={styles.modalTitle}>ADD NEW ENTRY</Text>
            <Text style={styles.modalSubtitle}>
              {formatDate(getTodaysDate())}
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="WRITE YOUR GAME NOTES HERE..."
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
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  !newEntryText.trim() && styles.saveButtonDisabled,
                ]}
                onPress={handleAddEntry}
                disabled={!newEntryText.trim()}
              >
                <Text style={styles.saveButtonText}>SAVE ENTRY</Text>
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
            <Text style={styles.modalTitle}>EDIT ENTRY</Text>
            <Text style={styles.modalSubtitle}>
              {editingEntry && formatDate(editingEntry.date)}
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="EDIT YOUR GAME NOTES..."
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
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  !editEntryText.trim() && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveEdit}
                disabled={!editEntryText.trim()}
              >
                <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
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
            <Text style={styles.deleteModalTitle}>DELETE ENTRY</Text>
            <Text style={styles.deleteModalMessage}>
              DELETE ENTRY FROM{" "}
              {entryToDelete && formatDate(entryToDelete.date)}?
            </Text>
            <Text style={styles.deleteModalWarning}>
              THIS CANNOT BE UNDONE!
            </Text>

            <View style={styles.deleteModalButtons}>
              <Pressable
                style={styles.deleteCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteCancelButtonText}>CANCEL</Text>
              </Pressable>
              <Pressable
                style={styles.deleteConfirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>DELETE</Text>
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
      borderBottomWidth: 2,
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
      color: theme.isDark ? theme.text : "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    settingsButton: {
      backgroundColor: theme.buttonSecondary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 6,
    },
    settingsButtonText: {
      color: "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    gameHeader: {
      alignItems: "center",
      paddingHorizontal: 20,
    },
    gameImage: {
      width: 80,
      height: 80,
      backgroundColor: theme.isDark ? "#2a3a36" : "#e8f4f0",
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.borderColor,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    imagePlaceholder: {
      fontSize: getTextSize(32),
    },
    customGameHeaderImage: {
      width: 76,
      height: 76,
      borderRadius: 8,
    },
    gameTitle: {
      fontSize: getTextSize(16),
      textAlign: "center",
      marginBottom: 5,
      color: theme.text,
      fontFamily: "monospace",
      lineHeight: 22,
    },
    gameCategory: {
      fontSize: getTextSize(12),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 15,
      fontFamily: "monospace",
    },
    addEntryButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 6,
    },
    addEntryButtonText: {
      color: theme.isDark ? theme.text : "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
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
      fontSize: getTextSize(18),
      color: theme.text,
      marginBottom: 8,
      fontFamily: "monospace",
    },
    emptyStateMessage: {
      fontSize: getTextSize(12),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 25,
      fontFamily: "monospace",
      lineHeight: 18,
    },
    emptyStateButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 6,
    },
    emptyStateButtonText: {
      color: theme.isDark ? theme.text : "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    entryCard: {
      backgroundColor: theme.cardBackground,
      padding: 18,
      marginBottom: 20,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.borderColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 15,
    },
    entryDate: {
      fontSize: getTextSize(12),
      color: theme.text,
      flex: 1,
      marginRight: 15,
      fontFamily: "monospace",
    },
    entryActions: {
      flexDirection: "row",
      gap: 6,
    },
    photoButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    photoButtonIcon: {
      fontSize: getTextSize(10),
    },
    photoButtonText: {
      color: theme.isDark ? theme.text : "white",
      fontSize: getTextSize(8),
      fontFamily: "monospace",
    },
    editButton: {
      backgroundColor: theme.buttonSuccess,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    editButtonIcon: {
      fontSize: getTextSize(10),
    },
    editButtonText: {
      color: "white",
      fontSize: getTextSize(8),
      fontFamily: "monospace",
    },
    deleteButton: {
      backgroundColor: theme.buttonDanger,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    deleteButtonIcon: {
      fontSize: getTextSize(10),
    },
    deleteButtonText: {
      color: "white",
      fontSize: getTextSize(8),
      fontFamily: "monospace",
    },
    entryContent: {
      marginBottom: 15,
    },
    entryText: {
      fontSize: getTextSize(14),
      lineHeight: 20,
      color: theme.text,
      fontFamily: "monospace",
    },
    // Photo Gallery Styles
    photoGallery: {
      marginTop: 10,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
    },
    photoGalleryTitle: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      marginBottom: 10,
      fontFamily: "monospace",
    },
    photoScroll: {
      flexDirection: "row",
    },
    photoContainer: {
      marginRight: 10,
      position: "relative",
    },
    photoThumbnail: {
      width: 80,
      height: 80,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    photoDeleteButton: {
      position: "absolute",
      top: -5,
      right: -5,
      backgroundColor: theme.buttonDanger,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.cardBackground,
    },
    photoDeleteIcon: {
      fontSize: 10,
    },
    // No Photos State
    noPhotosContainer: {
      marginTop: 10,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
    },
    addFirstPhotoButton: {
      backgroundColor: theme.isDark
        ? "rgba(163, 212, 208, 0.1)"
        : "rgba(74, 155, 150, 0.1)",
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderStyle: "dashed",
      borderRadius: 8,
      padding: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    addFirstPhotoIcon: {
      fontSize: getTextSize(24),
      marginBottom: 8,
    },
    addFirstPhotoText: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      fontFamily: "monospace",
      textAlign: "center",
    },
    // Photo Viewer Styles
    photoViewerOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    photoViewerClose: {
      position: "absolute",
      top: 50,
      right: 20,
      backgroundColor: theme.buttonSecondary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 6,
      zIndex: 1,
    },
    photoViewerCloseText: {
      color: "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    photoViewerImage: {
      width: screenWidth - 40,
      height: screenWidth - 40,
      maxHeight: "80%",
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
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    modalTitle: {
      fontSize: getTextSize(16),
      textAlign: "center",
      marginBottom: 5,
      color: theme.text,
      fontFamily: "monospace",
    },
    modalSubtitle: {
      fontSize: getTextSize(12),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 20,
      fontFamily: "monospace",
    },
    textInput: {
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 6,
      padding: 15,
      fontSize: getTextSize(14),
      minHeight: 120,
      marginBottom: 20,
      backgroundColor: theme.inputBackground,
      color: theme.text,
      fontFamily: "monospace",
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
      borderRadius: 6,
      alignItems: "center",
    },
    cancelButtonText: {
      color: "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    saveButton: {
      flex: 1,
      backgroundColor: theme.buttonPrimary,
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: "center",
    },
    saveButtonDisabled: {
      backgroundColor: "#ccc",
    },
    saveButtonText: {
      color: theme.isDark ? theme.text : "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    // Delete modal styles
    deleteModal: {
      backgroundColor: theme.cardBackground,
      padding: 25,
      borderRadius: 12,
      maxWidth: 350,
      width: "100%",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    deleteModalIcon: {
      fontSize: getTextSize(40),
      marginBottom: 15,
    },
    deleteModalTitle: {
      fontSize: getTextSize(16),
      marginBottom: 10,
      color: theme.text,
      fontFamily: "monospace",
    },
    deleteModalMessage: {
      fontSize: getTextSize(12),
      textAlign: "center",
      color: theme.secondaryText,
      marginBottom: 8,
      lineHeight: 18,
      fontFamily: "monospace",
    },
    deleteModalWarning: {
      fontSize: getTextSize(11),
      textAlign: "center",
      color: theme.buttonDanger,
      marginBottom: 25,
      fontFamily: "monospace",
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
      borderRadius: 6,
      alignItems: "center",
    },
    deleteCancelButtonText: {
      color: "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    deleteConfirmButton: {
      flex: 1,
      backgroundColor: theme.buttonDanger,
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: "center",
    },
    deleteConfirmButtonText: {
      color: "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
  });

export default GameDetailScreen;
