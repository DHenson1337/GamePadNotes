import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Image,
  Platform,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../ThemeContext";
import GameImagePicker from "../components/GameImagePicker";

const AddGameScreen = ({ navigation, addGame }) => {
  const { theme, getTextSize } = useTheme();
  const [gameTitle, setGameTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState("default");
  const [customImage, setCustomImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Navigate to Home instead of closing app
        navigation.navigate("Home");
        return true; // Prevent default behavior
      };

      if (Platform.OS === "android") {
        const subscription = BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );
        return () => subscription?.remove();
      }

      return undefined;
    }, [navigation])
  );

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
      let imageToUse = null;

      if (selectedImage === "custom" && customImage) {
        imageToUse = customImage;
      } else {
        imageToUse = imageOptions.find((img) => img.id === selectedImage);
      }

      addGame(gameTitle.trim(), imageToUse);
      setShowSuccessModal(true);
    }
  };

  // Function to handle custom image selection
  const handleCustomImageSelected = (imageData) => {
    setCustomImage(imageData);
    setSelectedImage("custom");
  };

  // Function to handle success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.navigate("Home"); // Explicitly navigate to Home
  };

  // Function to handle cancel
  const handleCancel = () => {
    navigation.navigate("Home"); // Navigate to Home instead of goBack
  };

  const styles = getStyles(theme, getTextSize);

  return (
    <View style={styles.container}>
      {/* Header with Submit Button */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleCancel}>
          <Text style={styles.backButtonText}>← CANCEL</Text>
        </Pressable>
        <Text style={styles.headerTitle}>ADD NEW GAME</Text>
        <Pressable
          style={[
            styles.submitButton,
            !gameTitle.trim() && styles.submitButtonDisabled,
          ]}
          onPress={handleAddGame}
          disabled={!gameTitle.trim()}
        >
          <Text style={styles.submitButtonText}>ADD</Text>
        </Pressable>
      </View>

      {/* Scrollable Content - Full Height */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 GAME TITLE</Text>
          <TextInput
            style={styles.textInput}
            placeholder="ENTER GAME TITLE..."
            placeholderTextColor={theme.placeholderText}
            value={gameTitle}
            onChangeText={setGameTitle}
            autoFocus={true}
          />
        </View>

        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 CHOOSE GAME ICON</Text>
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
                <Text style={styles.imageLabel}>
                  {option.name.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Custom Image Option */}
        <View style={styles.section}>
          <Pressable
            style={[
              styles.customImageButton,
              selectedImage === "custom" && styles.customImageButtonSelected,
            ]}
            onPress={() => setShowImagePicker(true)}
          >
            {customImage ? (
              <View style={styles.customImagePreview}>
                <Image
                  source={{ uri: customImage.uri }}
                  style={styles.customImageThumbnail}
                  resizeMode="cover"
                />
                <Text style={styles.customImageText}>
                  CUSTOM IMAGE SELECTED
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.customImageIcon}>📷</Text>
                <Text style={styles.customImageText}>ADD CUSTOM IMAGE</Text>
                <Text style={styles.customImageSubtext}>
                  TAP TO SELECT GAME COVER ART
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Custom Game Image Picker */}
      <GameImagePicker
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleCustomImageSelected}
      />

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
            <Text style={styles.successTitle}>GAME ADDED!</Text>
            <Text style={styles.successMessage}>
              "{gameTitle.toUpperCase()}" HAS BEEN ADDED TO YOUR LIBRARY.
            </Text>
            <Pressable
              style={styles.successButton}
              onPress={handleSuccessClose}
            >
              <Text style={styles.successButtonText}>CONTINUE</Text>
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
      borderBottomWidth: 2,
      borderBottomColor: theme.borderColor,
    },
    backButton: {
      backgroundColor: theme.buttonSecondary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 4,
      minWidth: 80,
    },
    backButtonText: {
      color: "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
      textAlign: "center",
    },
    headerTitle: {
      fontSize: getTextSize(14),
      color: theme.text,
      fontFamily: "monospace",
      flex: 1,
      textAlign: "center",
    },
    submitButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 4,
      minWidth: 80,
    },
    submitButtonDisabled: {
      backgroundColor: "#ccc",
    },
    submitButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
      textAlign: "center",
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40, // Bottom spacing
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: getTextSize(14),
      marginBottom: 15,
      color: theme.text,
      fontFamily: "monospace",
    },
    textInput: {
      backgroundColor: theme.cardBackground,
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 4,
      padding: 15,
      fontSize: getTextSize(14),
      color: theme.text,
      fontFamily: "monospace",
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
      borderRadius: 8,
      padding: 15,
      alignItems: "center",
      width: "48%",
      marginBottom: 10,
    },
    imageOptionSelected: {
      borderColor: theme.buttonSuccess,
      backgroundColor: theme.isDark ? "#0A3A2A" : "#E8F5E8",
    },
    imageEmoji: {
      fontSize: getTextSize(30),
      marginBottom: 8,
    },
    imageLabel: {
      fontSize: getTextSize(10),
      textAlign: "center",
      color: theme.secondaryText,
      fontFamily: "monospace",
    },
    customImageButton: {
      backgroundColor: theme.cardBackground,
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderStyle: "dashed",
      borderRadius: 8,
      padding: 20,
      alignItems: "center",
    },
    customImageButtonSelected: {
      borderColor: theme.buttonSuccess,
      borderStyle: "solid",
      backgroundColor: theme.isDark ? "#0A3A2A" : "#E8F5E8",
    },
    customImageIcon: {
      fontSize: getTextSize(32),
      marginBottom: 10,
    },
    customImageText: {
      fontSize: getTextSize(12),
      color: theme.text,
      fontFamily: "monospace",
      marginBottom: 5,
    },
    customImageSubtext: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      fontFamily: "monospace",
      textAlign: "center",
    },
    customImagePreview: {
      alignItems: "center",
    },
    customImageThumbnail: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    bottomSpacing: {
      height: 40,
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
      borderRadius: 8,
      alignItems: "center",
      minWidth: 300,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    successEmoji: {
      fontSize: getTextSize(50),
      marginBottom: 15,
    },
    successTitle: {
      fontSize: getTextSize(16),
      marginBottom: 10,
      color: theme.text,
      fontFamily: "monospace",
    },
    successMessage: {
      fontSize: getTextSize(12),
      textAlign: "center",
      color: theme.secondaryText,
      marginBottom: 25,
      fontFamily: "monospace",
      lineHeight: 18,
    },
    successButton: {
      backgroundColor: theme.buttonPrimary,
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 4,
    },
    successButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
  });

export default AddGameScreen;
