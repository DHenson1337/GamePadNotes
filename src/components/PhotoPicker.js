import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
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

  // Web-compatible photo capture
  const takePhotoWeb = async () => {
    try {
      setIsProcessing(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        Alert.alert(
          "CAMERA NOT SUPPORTED",
          "YOUR BROWSER DOESN'T SUPPORT CAMERA ACCESS."
        );
        return;
      }

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
        audio: false,
      });

      // Create video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.style.position = "fixed";
      video.style.top = "0";
      video.style.left = "0";
      video.style.width = "100vw";
      video.style.height = "100vh";
      video.style.objectFit = "cover";
      video.style.zIndex = "10000";
      video.style.backgroundColor = "black";

      // Create capture button
      const captureBtn = document.createElement("button");
      captureBtn.textContent = "📷 TAKE PHOTO";
      captureBtn.style.position = "fixed";
      captureBtn.style.bottom = "30px";
      captureBtn.style.left = "50%";
      captureBtn.style.transform = "translateX(-50%)";
      captureBtn.style.padding = "15px 30px";
      captureBtn.style.fontSize = "18px";
      captureBtn.style.backgroundColor = "#4a9b96";
      captureBtn.style.color = "white";
      captureBtn.style.border = "none";
      captureBtn.style.borderRadius = "8px";
      captureBtn.style.zIndex = "10001";

      // Create close button
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕ CLOSE";
      closeBtn.style.position = "fixed";
      closeBtn.style.top = "30px";
      closeBtn.style.right = "30px";
      closeBtn.style.padding = "10px 20px";
      closeBtn.style.fontSize = "16px";
      closeBtn.style.backgroundColor = "#666";
      closeBtn.style.color = "white";
      closeBtn.style.border = "none";
      closeBtn.style.borderRadius = "6px";
      closeBtn.style.zIndex = "10001";

      // Add to DOM
      document.body.appendChild(video);
      document.body.appendChild(captureBtn);
      document.body.appendChild(closeBtn);

      // Handle capture
      captureBtn.onclick = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        // Convert to blob and process
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const photoData = await processPhotoBlob(blob);
              onPhotoSelected(photoData);
              cleanup();
              onClose();
            }
          },
          "image/jpeg",
          0.8
        );
      };

      // Handle close
      const cleanup = () => {
        stream.getTracks().forEach((track) => track.stop());
        document.body.removeChild(video);
        document.body.removeChild(captureBtn);
        document.body.removeChild(closeBtn);
        setIsProcessing(false);
      };

      closeBtn.onclick = cleanup;
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(
        "CAMERA ERROR",
        "UNABLE TO ACCESS CAMERA. TRY SELECTING FROM GALLERY INSTEAD."
      );
      setIsProcessing(false);
    }
  };

  // Web-compatible gallery selection
  const pickFromGalleryWeb = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Prefer camera if available

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        setIsProcessing(true);
        const photoData = await processPhotoBlob(file);
        onPhotoSelected(photoData);
        setIsProcessing(false);
        onClose();
      }
    };

    input.click();
  };

  // Process photo blob into data URL
  const processPhotoBlob = async (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Create photo data object
        const photoData = {
          id: Date.now(),
          uri: reader.result, // Data URL for web
          filename: `gamepad_photo_${gameId}_${entryId}_${Date.now()}.jpg`,
          width: 800, // Estimated
          height: 600, // Estimated
          dateAdded: new Date().toISOString(),
        };
        resolve(photoData);
      };
      reader.readAsDataURL(blob);
    });
  };

  // Mobile-compatible functions (keep existing Expo logic)
  const takePhotoMobile = async () => {
    try {
      setIsProcessing(true);
      const ImagePicker = await import("expo-image-picker");

      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== "granted") {
        Alert.alert(
          "PERMISSION NEEDED",
          "CAMERA ACCESS IS REQUIRED TO TAKE PHOTOS."
        );
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndSavePhotoMobile(result.assets[0].uri);
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("ERROR", "FAILED TO TAKE PHOTO. PLEASE TRY AGAIN.");
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
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndSavePhotoMobile(result.assets[0].uri);
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("ERROR", "FAILED TO SELECT PHOTO. PLEASE TRY AGAIN.");
      setIsProcessing(false);
    }
  };

  const processAndSavePhotoMobile = async (uri) => {
    try {
      const ImageManipulator = await import("expo-image-manipulator");
      const FileSystem = await import("expo-file-system");

      // Compress and resize image
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: Math.min(800, screenWidth * 2) } }],
        {
          compress: 0.8,
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
      const filename = `gamepad_photo_${gameId}_${entryId}_${Date.now()}.jpg`;
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

      onPhotoSelected(photoData);
      setIsProcessing(false);
      onClose();
    } catch (error) {
      console.error("Photo processing error:", error);
      Alert.alert("ERROR", "FAILED TO SAVE PHOTO. PLEASE TRY AGAIN.");
      setIsProcessing(false);
    }
  };

  // Choose the right functions based on platform
  const takePhoto = Platform.OS === "web" ? takePhotoWeb : takePhotoMobile;
  const pickFromGallery =
    Platform.OS === "web" ? pickFromGalleryWeb : pickFromGalleryMobile;

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
                  {Platform.OS === "web"
                    ? "USE DEVICE CAMERA"
                    : "USE CAMERA TO CAPTURE MOMENT"}
                </Text>
              </Pressable>

              <Pressable style={styles.photoButton} onPress={pickFromGallery}>
                <Text style={styles.photoButtonIcon}>🖼️</Text>
                <Text style={styles.photoButtonText}>CHOOSE FROM GALLERY</Text>
                <Text style={styles.photoButtonSubtext}>
                  {Platform.OS === "web"
                    ? "SELECT IMAGE FILE"
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
