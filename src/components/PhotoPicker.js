import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { useTheme } from "../../ThemeContext";

const PhotoPicker = ({
  visible,
  onClose,
  onPhotoSelected,
  gameId,
  entryId,
}) => {
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
  const selectPhotoWeb = (useCamera = false) => {
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
          const photoData = {
            id: Date.now(),
            uri: reader.result, // Data URL
            filename: `photo_${gameId}_${entryId}_${Date.now()}.jpg`,
            width: 800, // Estimated
            height: 600, // Estimated
            dateAdded: new Date().toISOString(),
            size: file.size,
          };

          onPhotoSelected(photoData);
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

  // Mobile photo functions (Expo)
  const takePhotoMobile = async () => {
    try {
      setIsProcessing(true);
      const ImagePicker = await import("expo-image-picker");

      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== "granted") {
        Alert.alert("PERMISSION NEEDED", "CAMERA ACCESS IS REQUIRED.");
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photoData = {
          id: Date.now(),
          uri: result.assets[0].uri,
          filename: `photo_${gameId}_${entryId}_${Date.now()}.jpg`,
          width: result.assets[0].width || 800,
          height: result.assets[0].height || 600,
          dateAdded: new Date().toISOString(),
        };

        onPhotoSelected(photoData);
        onClose();
      }
      setIsProcessing(false);
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("ERROR", "FAILED TO TAKE PHOTO.");
      setIsProcessing(false);
    }
  };

  const pickFromGalleryMobile = async () => {
    try {
      setIsProcessing(true);
      const ImagePicker = await import("expo-image-picker");

      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaPermission.status !== "granted") {
        Alert.alert("PERMISSION NEEDED", "PHOTO LIBRARY ACCESS IS REQUIRED.");
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photoData = {
          id: Date.now(),
          uri: result.assets[0].uri,
          filename: `photo_${gameId}_${entryId}_${Date.now()}.jpg`,
          width: result.assets[0].width || 800,
          height: result.assets[0].height || 600,
          dateAdded: new Date().toISOString(),
        };

        onPhotoSelected(photoData);
        onClose();
      }
      setIsProcessing(false);
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("ERROR", "FAILED TO SELECT PHOTO.");
      setIsProcessing(false);
    }
  };

  // Choose functions based on platform
  const takePhoto =
    Platform.OS === "web" ? () => selectPhotoWeb(true) : takePhotoMobile;
  const pickFromGallery =
    Platform.OS === "web" ? () => selectPhotoWeb(false) : pickFromGalleryMobile;

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
          <Text style={styles.modalSubtitle}>
            {Platform.OS === "web"
              ? "CAPTURE YOUR GAMING MOMENTS!"
              : "CAPTURE YOUR GAMING MOMENTS!"}
          </Text>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>📸 PROCESSING PHOTO...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Pressable style={styles.photoButton} onPress={takePhoto}>
                <Text style={styles.photoButtonIcon}>📷</Text>
                <Text style={styles.photoButtonText}>
                  {Platform.OS === "web" ? "TAKE PHOTO" : "TAKE PHOTO"}
                </Text>
                <Text style={styles.photoButtonSubtext}>
                  {Platform.OS === "web"
                    ? "USE CAMERA TO CAPTURE"
                    : "USE CAMERA TO CAPTURE MOMENT"}
                </Text>
              </Pressable>

              <Pressable style={styles.photoButton} onPress={pickFromGallery}>
                <Text style={styles.photoButtonIcon}>🖼️</Text>
                <Text style={styles.photoButtonText}>CHOOSE FROM GALLERY</Text>
                <Text style={styles.photoButtonSubtext}>
                  {Platform.OS === "web"
                    ? "SELECT IMAGE FROM DEVICE"
                    : "SELECT EXISTING SCREENSHOT"}
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
