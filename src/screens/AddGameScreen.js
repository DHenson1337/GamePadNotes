import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";

const AddGameScreen = ({ navigation, addGame }) => {
  const [gameTitle, setGameTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState("default");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Default game image options
  const imageOptions = [
    { id: "default", name: "Default Game Icon", emoji: "🎮" },
    { id: "rpg", name: "RPG", emoji: "⚔️" },
    { id: "racing", name: "Racing", emoji: "🏎️" },
    { id: "sports", name: "Sports", emoji: "⚽" },
    { id: "puzzle", name: "Puzzle", emoji: "🧩" },
    { id: "shooter", name: "Action/Shooter", emoji: "🔫" },
    { id: "adventure", name: "Adventure", emoji: "🗺️" },
    { id: "platform", name: "Platform", emoji: "🦘" },
  ];

  // Function to handle adding the game
  const handleAddGame = () => {
    if (gameTitle.trim()) {
      const selectedImageData = imageOptions.find(
        (img) => img.id === selectedImage
      );
      addGame(gameTitle.trim(), selectedImageData);
      setShowSuccessModal(true);
    }
  };

  // Function to handle success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack(); // Return to home screen
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add New Game</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Game Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter game title..."
            value={gameTitle}
            onChangeText={setGameTitle}
            autoFocus={true}
          />
        </View>

        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Game Icon</Text>
          <View style={styles.imageGrid}>
            {imageOptions.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.imageOption,
                  selectedImage === option.id && styles.imageOptionSelected,
                ]}
                onPress={() => setSelectedImage(option.id)}
              >
                <Text style={styles.imageEmoji}>{option.emoji}</Text>
                <Text style={styles.imageLabel}>{option.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Custom Image Option (Placeholder for now) */}
        <View style={styles.section}>
          <Pressable style={styles.customImageButton}>
            <Text style={styles.customImageText}>
              📷 Add Custom Image (Coming Soon)
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Fixed Add Game Button at bottom */}
      <View style={styles.bottomSection}>
        <Pressable
          style={[
            styles.addButton,
            !gameTitle.trim() && styles.addButtonDisabled,
          ]}
          onPress={handleAddGame}
          disabled={!gameTitle.trim()}
        >
          <Text style={styles.addButtonText}>Add Game</Text>
        </Pressable>
      </View>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Game Added!</Text>
            <Text style={styles.successMessage}>
              "{gameTitle}" has been added to your game library.
            </Text>
            <Pressable
              style={styles.successButton}
              onPress={handleSuccessClose}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    backgroundColor: "#666",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 80, // Same width as back button for centering
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 0, // Remove bottom padding since button is now fixed
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageOption: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    width: "48%",
    marginBottom: 10,
  },
  imageOptionSelected: {
    borderColor: "#333",
    backgroundColor: "#f0f0f0",
  },
  imageEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  customImageButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  customImageText: {
    fontSize: 16,
    color: "#666",
  },
  bottomSection: {
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  addButton: {
    backgroundColor: "#333",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModal: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 300,
  },
  successEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
  },
  successButton: {
    backgroundColor: "#333",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  successButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddGameScreen;
