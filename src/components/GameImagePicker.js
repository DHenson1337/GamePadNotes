import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useTheme } from "../../ThemeContext";

const GameImagePicker = ({ visible, onClose, onImageSelected }) => {
  const { theme, getTextSize } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Create hidden file input for web
  React.useEffect(() => {
    if (Platform.OS === "web" && !fileInputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";
      document.body.appendChild(input);
      fileInputRef.current = input;

      return () => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };
    }
  }, []);

  // Web photo selection
  const selectImageWeb = (useCamera = false) => {
    if (!fileInputRef.current) return;

    const input = fileInputRef.current;

    // Set capture attribute for camera
    if (useCamera) {
      input.setAttribute("capture", "environment");
    } else {
      input.removeAttribute("capture");
    }

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setIsProcessing(true);

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert(
            "FILE TOO LARGE",
            "PLEASE SELECT AN IMAGE SMALLER THAN 5MB."
          );
          setIsProcessing(false);
          return;
        }

        // Convert to data URL
        const reader = new FileReader();
        reader.onload = () => {
          const imageData = {
            id: "custom",
            name: "Custom Image",
            emoji: null,
            uri: reader.result, // Data URL for web
            filename: `gamepad_cover_${Date.now()}.jpg`,
            width: 200, // Estimated
            height: 200, // Estimated
            dateAdded: new Date().toISOString(),
          };

          onImageSelected(imageData);
          setIsProcessing(false);
          onClose();
        };

        reader.onerror = () => {
          Alert.alert("ERROR", "FAILED TO READ IMAGE FILE.");
          setIsProcessing(false);
        };

        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  // Mobile functions (Expo) - keeping original logic
  const requestPermissions = async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaPermission.status !== "granted") {
        Alert.alert(
          "PERMISSION NEEDED",
          "PHOTO LIBRARY ACCESS IS REQUIRED TO SELECT GAME COVER ART. PLEASE ENABLE IN SETTINGS.",
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

  const createGameImageFilename = () => {
    const timestamp = Date.now();
    return `gamepad_cover_${timestamp}.jpg`;
  };

  const processAndSaveImageMobile = async (uri) => {
    try {
      setIsProcessing(true);
      const ImageManipulator = await import("expo-image-manipulator");
      const FileSystem = await import("expo-file-system");

      // Compress and resize image for game cover (square format)
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 200, height: 200 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Create directory for GamePad Notes covers
      const coversDir = `${FileSystem.documentDirectory}gamepad_covers/`;
      const dirInfo = await FileSystem.getInfoAsync(coversDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(coversDir, { intermediates: true });
      }

      // Create unique filename
      const filename = createGameImageFilename();
      const newPath = `${coversDir}${filename}`;

      // Copy compressed image to app directory
      await FileSystem.copyAsync({
        from: compressedImage.uri,
        to: newPath,
      });

      // Create image object
      const imageData = {
        id: "custom",
        name: "Custom Image",
        emoji: null,
        uri: newPath,
        filename: filename,
        width: compressedImage.width,
        height: compressedImage.height,
        dateAdded: new Date().toISOString(),
      };

      setIsProcessing(false);
      onImageSelected(imageData);
      onClose();
    } catch (error) {
      setIsProcessing(false);
      console.error("Image processing error:", error);
      Alert.alert("ERROR", "FAILED TO SAVE IMAGE. PLEASE TRY AGAIN.", [
        { text: "OK" },
      ]);
    }
  };

  const takePhotoMobile = async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== "granted") {
        Alert.alert(
          "PERMISSION NEEDED",
          "CAMERA ACCESS IS REQUIRED TO TAKE GAME COVER PHOTOS.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: [1, 1], // Square aspect for game covers
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndSaveImageMobile(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("ERROR", "FAILED TO TAKE PHOTO. PLEASE TRY AGAIN.");
    }
  };

  const pickFromGalleryMobile = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const ImagePicker = await import("expo-image-picker");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: [1, 1], // Square aspect for game covers
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndSaveImageMobile(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("ERROR", "FAILED TO SELECT IMAGE. PLEASE TRY AGAIN.");
    }
  };

  // Choose functions based on platform
  const takePhoto =
    Platform.OS === "web" ? () => selectImageWeb(true) : takePhotoMobile;
  const pickFromGallery =
    Platform.OS === "web" ? () => selectImageWeb(false) : pickFromGalleryMobile;

  const styles = getStyles(theme, getTextSize);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.imagePickerModal}>
          <Text style={styles.modalTitle}>ADD CUSTOM GAME COVER</Text>
          <Text style={styles.modalSubtitle}>
            CHOOSE A CUSTOM IMAGE FOR YOUR GAME
          </Text>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>🎨 PROCESSING IMAGE...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Pressable style={styles.imageButton} onPress={takePhoto}>
                <Text style={styles.imageButtonIcon}>📷</Text>
                <Text style={styles.imageButtonText}>TAKE PHOTO</Text>
                <Text style={styles.imageButtonSubtext}>
                  {Platform.OS === "web"
                    ? "PHOTOGRAPH GAME BOX"
                    : "PHOTOGRAPH GAME BOX OR SCREEN"}
                </Text>
              </Pressable>

              <Pressable style={styles.imageButton} onPress={pickFromGallery}>
                <Text style={styles.imageButtonIcon}>🖼️</Text>
                <Text style={styles.imageButtonText}>CHOOSE FROM GALLERY</Text>
                <Text style={styles.imageButtonSubtext}>
                  {Platform.OS === "web"
                    ? "SELECT IMAGE FROM DEVICE"
                    : "SELECT EXISTING GAME ARTWORK"}
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
    imagePickerModal: {
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
      lineHeight: 18,
    },
    buttonContainer: {
      gap: 15,
      marginBottom: 20,
    },
    imageButton: {
      backgroundColor: theme.isDark ? "#2a3f3b" : "#f0f6f5",
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
    },
    imageButtonIcon: {
      fontSize: getTextSize(32),
      marginBottom: 10,
    },
    imageButtonText: {
      fontSize: getTextSize(14),
      color: theme.text,
      marginBottom: 5,
      fontFamily: "monospace",
    },
    imageButtonSubtext: {
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

export default GameImagePicker;
