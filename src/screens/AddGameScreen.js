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
import { useTheme } from "../../App";

const AddGameScreen = ({ navigation, addGame }) => {
  const { theme, getTextSize } = useTheme();
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

  const styles = getStyles(theme, getTextSize);

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Game Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter game title..."
            placeholderTextColor={theme.placeholderText}
            value={gameTitle}
            onChangeText={setGameTitle}
            autoFocus={true}
          />
        </View>

        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Choose Game Icon</Text>
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
          <Text style={styles.addButtonText}>🚀 Add Game</Text>
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

const getStyles = (theme, getTextSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.headerBackground,
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    backButton: {
      backgroundColor: theme.buttonSecondary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 6,
    },
    backButtonText: {
      color: "white",
      fontSize: getTextSize(16),
    },
    headerTitle: {
      fontSize: getTextSize(20),
      fontWeight: "bold",
      color: theme.text,
    },
    placeholder: {
      width: 80,
    },
    content: {
      flex: 1,
      padding: 20,
      paddingBottom: 0,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: getTextSize(18),
      fontWeight: "bold",
      marginBottom: 15,
      color: theme.text,
    },
    textInput: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 8,
      padding: 15,
      fontSize: getTextSize(16),
      color: theme.text,
    },
    imageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    imageOption: {
      backgroundColor: theme.cardBackground,
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 12,
      padding: 15,
      alignItems: "center",
      width: "48%",
      marginBottom: 10,
    },
    imageOptionSelected: {
      borderColor: theme.buttonSuccess,
      backgroundColor: theme.isDark ? "#0A3A2A" : "#E8F5E8", // Fixed: removed undefined theme.accentBackground
    },
    imageEmoji: {
      fontSize: getTextSize(30),
      marginBottom: 8,
    },
    imageLabel: {
      fontSize: getTextSize(12),
      textAlign: "center",
      color: theme.secondaryText,
    },
    customImageButton: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderStyle: "dashed",
      borderRadius: 8,
      padding: 20,
      alignItems: "center",
    },
    customImageText: {
      fontSize: getTextSize(16),
      color: theme.secondaryText,
    },
    bottomSection: {
      backgroundColor: theme.headerBackground,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
    },
    addButton: {
      backgroundColor: theme.buttonPrimary,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: "center",
    },
    addButtonDisabled: {
      backgroundColor: "#ccc",
    },
    addButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(18),
      fontWeight: "bold",
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    successModal: {
      backgroundColor: theme.cardBackground,
      padding: 30,
      borderRadius: 12,
      alignItems: "center",
      minWidth: 300,
    },
    successEmoji: {
      fontSize: getTextSize(50),
      marginBottom: 15,
    },
    successTitle: {
      fontSize: getTextSize(22),
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.text,
    },
    successMessage: {
      fontSize: getTextSize(16),
      textAlign: "center",
      color: theme.secondaryText,
      marginBottom: 25,
    },
    successButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 8,
    },
    successButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
  });

export default AddGameScreen;
