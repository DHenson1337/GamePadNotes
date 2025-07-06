import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { useTheme } from "../../ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

const PhotoPicker = ({
  visible,
  onClose,
  onPhotoSelected,
  gameId,
  entryId,
}) => {
  const { theme, getTextSize } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to request permissions
  const requestPermissions = async () => {
    try {
      // Request camera permission
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== "granted") {
        Alert.alert(
          "PERMISSION NEEDED",
          "CAMERA ACCESS IS REQUIRED TO TAKE PHOTOS. PLEASE ENABLE IN SETTINGS.",
          [{ text: "OK" }]
        );
        return false;
      }

      // Request media library permission
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaPermission.status !== "granted") {
        Alert.alert(
          "PERMISSION NEEDED",
          "PHOTO LIBRARY ACCESS IS REQUIRED. PLEASE ENABLE IN SETTINGS.",
          [{ text: "OK" }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Permission request error:", error);
      return false;
    }
  };

  // Function to create unique filename
  const createPhotoFilename = () => {
    const timestamp = Date.now();
    return `gamepad_photo_${gameId}_${entryId}_${timestamp}.jpg`;
  };

  // Function to save and compress photo
  const processAndSavePhoto = async (uri) => {
    try {
      setIsProcessing(true);

      // Compress and resize image
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: Math.min(800, screenWidth * 2) } }, // Max 800px wide
        ],
        {
          compress: 0.8, // 80% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Create directory for GamePad Notes photos
      const photosDir = `${FileSystem.documentDirectory}gamepad_photos/`;
      const dirInfo = await FileSystem.getInfoAsync(photosDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }

      // Create unique filename
      const filename = createPhotoFilename();
      const newPath = `${photosDir}${filename}`;

      // Copy compressed image to app directory
      await FileSystem.copyAsync({
        from: compressedImage.uri,
        to: newPath,
      });

      // Create photo object
      const photoData = {
        id: Date.now(),
        uri: newPath,
        filename: filename,
        width: compressedImage.width,
        height: compressedImage.height,
        dateAdded: new Date().toISOString(),
      };

      setIsProcessing(false);
      onPhotoSelected(photoData);
      onClose();
    } catch (error) {
      setIsProcessing(false);
      console.error("Photo processing error:", error);
      Alert.alert("ERROR", "FAILED TO SAVE PHOTO. PLEASE TRY AGAIN.", [
        { text: "OK" },
      ]);
    }
  };

  // Function to take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndSavePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("ERROR", "FAILED TO TAKE PHOTO. PLEASE TRY AGAIN.");
    }
  };

  // Function to pick from gallery
  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndSavePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("ERROR", "FAILED TO SELECT PHOTO. PLEASE TRY AGAIN.");
    }
  };

  const styles = getStyles(theme, getTextSize);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.photoPickerModal}>
          <Text style={styles.modalTitle}>ADD PHOTO</Text>
          <Text style={styles.modalSubtitle}>CAPTURE YOUR GAMING MOMENTS!</Text>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>📸 PROCESSING PHOTO...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Pressable style={styles.photoButton} onPress={takePhoto}>
                <Text style={styles.photoButtonIcon}>📷</Text>
                <Text style={styles.photoButtonText}>TAKE PHOTO</Text>
                <Text style={styles.photoButtonSubtext}>
                  USE CAMERA TO CAPTURE MOMENT
                </Text>
              </Pressable>

              <Pressable style={styles.photoButton} onPress={pickFromGallery}>
                <Text style={styles.photoButtonIcon}>🖼️</Text>
                <Text style={styles.photoButtonText}>CHOOSE FROM GALLERY</Text>
                <Text style={styles.photoButtonSubtext}>
                  SELECT EXISTING SCREENSHOT
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme, getTextSize) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    photoPickerModal: {
      backgroundColor: theme.cardBackground,
      padding: 25,
      borderRadius: 12,
      width: "100%",
      maxWidth: 400,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    modalTitle: {
      fontSize: getTextSize(16),
      textAlign: "center",
      marginBottom: 8,
      color: theme.text,
      fontFamily: "monospace",
    },
    modalSubtitle: {
      fontSize: getTextSize(12),
      color: theme.secondaryText,
      textAlign: "center",
      marginBottom: 25,
      fontFamily: "monospace",
    },
    buttonContainer: {
      gap: 15,
      marginBottom: 20,
    },
    photoButton: {
      backgroundColor: theme.isDark ? "#2a3f3b" : "#f0f6f5",
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
    },
    photoButtonIcon: {
      fontSize: getTextSize(32),
      marginBottom: 10,
    },
    photoButtonText: {
      fontSize: getTextSize(14),
      color: theme.text,
      marginBottom: 5,
      fontFamily: "monospace",
    },
    photoButtonSubtext: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      textAlign: "center",
      fontFamily: "monospace",
      lineHeight: 14,
    },
    processingContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    processingText: {
      fontSize: getTextSize(14),
      color: theme.text,
      fontFamily: "monospace",
      textAlign: "center",
    },
    cancelButton: {
      backgroundColor: theme.buttonSecondary,
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: "center",
    },
    cancelButtonText: {
      color: "#ffffff",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
  });

export default PhotoPicker;
