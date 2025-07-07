import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../ThemeContext";

const SettingsScreen = ({ navigation }) => {
  const { theme, settings, updateSettings, getTextSize } = useTheme();
  const [showAbout, setShowAbout] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Create hidden file input for web import
  React.useEffect(() => {
    if (Platform.OS === "web" && !fileInputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
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

  // Function to handle setting changes
  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  // Export data to email
  const handleExportToEmail = async () => {
    try {
      setIsExporting(true);

      // Get all game data and settings
      const gamesData = await AsyncStorage.getItem("@gamepad_notes_games");
      const settingsData = await AsyncStorage.getItem(
        "@gamepad_notes_settings"
      );

      // Create backup object
      const backup = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        appName: "GamePad Notes",
        platform: Platform.OS,
        games: JSON.parse(gamesData || "[]"),
        settings: JSON.parse(settingsData || "{}"),
        totalGames: JSON.parse(gamesData || "[]").length,
        totalEntries: JSON.parse(gamesData || "[]").reduce(
          (total, game) => total + game.entries.length,
          0
        ),
      };

      if (Platform.OS === "web") {
        // Web: Download backup file
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        // Create download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `gamepad-notes-backup-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);

        Alert.alert(
          "BACKUP DOWNLOADED",
          "YOUR BACKUP FILE HAS BEEN DOWNLOADED! EMAIL IT TO YOURSELF FOR SAFEKEEPING.",
          [{ text: "OK" }]
        );
      } else {
        // Mobile: Use native sharing if available
        try {
          const Sharing = await import("expo-sharing");
          const FileSystem = await import("expo-file-system");

          // Create filename with date
          const date = new Date().toISOString().split("T")[0];
          const filename = `gamepad-notes-backup-${date}.json`;
          const fileUri = `${FileSystem.documentDirectory}${filename}`;

          // Save backup file
          await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(backup, null, 2)
          );

          // Check if sharing is available
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              dialogTitle: "Email Your GamePad Notes Backup",
              mimeType: "application/json",
            });
          } else {
            // Fallback to email
            const subject = encodeURIComponent("GamePad Notes Backup");
            const body = encodeURIComponent(
              `Your GamePad Notes backup is ready.\n\n` +
                `Backup Date: ${new Date().toLocaleDateString()}\n` +
                `Games: ${backup.totalGames}\n` +
                `Total Entries: ${backup.totalEntries}\n\n` +
                `To restore: Download this file and use "Import Backup" in GamePad Notes settings.`
            );

            const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
            await Linking.openURL(mailtoUrl);
          }
        } catch (error) {
          console.error("Mobile sharing error:", error);
          Alert.alert(
            "EXPORT ERROR",
            "FAILED TO SHARE BACKUP FILE. PLEASE TRY AGAIN."
          );
        }
      }

      setIsExporting(false);
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("EXPORT ERROR", "FAILED TO CREATE BACKUP. PLEASE TRY AGAIN.");
      setIsExporting(false);
    }
  };

  // Import data from file
  const handleImportBackup = async () => {
    setIsImporting(true);

    try {
      if (Platform.OS === "web") {
        // Web import
        if (!fileInputRef.current) {
          setIsImporting(false);
          return;
        }

        fileInputRef.current.onchange = async (event) => {
          try {
            const file = event.target.files[0];
            if (file) {
              const fileContent = await file.text();
              await processBackupData(fileContent);
            }
          } catch (error) {
            console.error("Web import error:", error);
            Alert.alert("IMPORT ERROR", "FAILED TO READ BACKUP FILE.");
          } finally {
            setIsImporting(false);
          }
        };

        fileInputRef.current.click();
      } else {
        // Mobile import
        const DocumentPicker = await import("expo-document-picker");

        const result = await DocumentPicker.getDocumentAsync({
          type: "application/json",
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const FileSystem = await import("expo-file-system");
          const fileContent = await FileSystem.readAsStringAsync(
            result.assets[0].uri
          );
          await processBackupData(fileContent);
        }
        setIsImporting(false);
      }
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert("IMPORT ERROR", "FAILED TO IMPORT BACKUP FILE.");
      setIsImporting(false);
    }
  };

  // Process backup data
  const processBackupData = async (fileContent) => {
    try {
      console.log("Processing backup data...");
      const backup = JSON.parse(fileContent);

      // Validate backup structure
      if (!backup.games || !Array.isArray(backup.games)) {
        throw new Error("Invalid backup file format - missing games array");
      }

      console.log("Backup validated, showing confirmation...");

      // Show confirmation with backup details
      Alert.alert(
        "IMPORT BACKUP",
        `RESTORE BACKUP FROM ${new Date(
          backup.exportDate
        ).toLocaleDateString()}?\n\n` +
          `🎮 GAMES: ${backup.totalGames || backup.games.length}\n` +
          `📝 ENTRIES: ${
            backup.totalEntries ||
            backup.games.reduce((total, game) => total + game.entries.length, 0)
          }\n\n` +
          `⚠️ THIS WILL REPLACE ALL CURRENT DATA!`,
        [
          { text: "CANCEL", style: "cancel" },
          {
            text: "RESTORE",
            style: "destructive",
            onPress: async () => {
              try {
                console.log("User confirmed, starting restore...");

                // Clear existing data first
                await AsyncStorage.multiRemove([
                  "@gamepad_notes_games",
                  "@gamepad_notes_settings",
                ]);

                console.log("Cleared existing data");

                // Save imported games data
                await AsyncStorage.setItem(
                  "@gamepad_notes_games",
                  JSON.stringify(backup.games)
                );

                console.log("Saved games data");

                // Import settings if available
                if (
                  backup.settings &&
                  Object.keys(backup.settings).length > 0
                ) {
                  await AsyncStorage.setItem(
                    "@gamepad_notes_settings",
                    JSON.stringify(backup.settings)
                  );
                  console.log("Saved settings data");
                }

                console.log("Import completed successfully");

                Alert.alert(
                  "IMPORT SUCCESS",
                  "YOUR DATA HAS BEEN RESTORED! THE APP WILL REFRESH TO SHOW YOUR IMPORTED GAMES.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Force app refresh by navigating to Home
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Home" }],
                        });
                      },
                    },
                  ]
                );
              } catch (error) {
                console.error("Restore error:", error);
                Alert.alert(
                  "IMPORT ERROR",
                  `FAILED TO RESTORE DATA: ${error.message}`
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Parse error:", error);
      Alert.alert("IMPORT ERROR", `INVALID BACKUP FILE: ${error.message}`);
      throw error;
    }
  };

  // Clear all data - Fixed version
  const handleClearAllData = () => {
    Alert.alert(
      "CLEAR ALL DATA",
      "ARE YOU SURE YOU WANT TO DELETE ALL GAMES AND NOTES? THIS CANNOT BE UNDONE!",
      [
        { text: "CANCEL", style: "cancel" },
        {
          text: "DELETE ALL",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Starting data clear...");

              // Get all AsyncStorage keys first
              const keys = await AsyncStorage.getAllKeys();
              console.log("All keys:", keys);

              // Filter for GamePad Notes keys
              const gamepadKeys = keys.filter(
                (key) =>
                  key.includes("gamepad") || key.includes("@gamepad_notes")
              );

              console.log("GamePad keys to remove:", gamepadKeys);

              if (gamepadKeys.length > 0) {
                await AsyncStorage.multiRemove(gamepadKeys);
              } else {
                // Fallback - remove specific keys
                await AsyncStorage.multiRemove([
                  "@gamepad_notes_games",
                  "@gamepad_notes_settings",
                ]);
              }

              console.log("Data cleared successfully");

              Alert.alert("SUCCESS", "ALL DATA HAS BEEN CLEARED.", [
                {
                  text: "OK",
                  onPress: () => {
                    // Force app refresh
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Home" }],
                    });
                  },
                },
              ]);
            } catch (error) {
              console.error("Clear data error:", error);
              Alert.alert("ERROR", `FAILED TO CLEAR DATA: ${error.message}`);
            }
          },
        },
      ]
    );
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
          <Text style={styles.backButtonText}>← BACK</Text>
        </Pressable>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 APPEARANCE</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>DARK MODE</Text>
              <Text style={styles.settingDescription}>
                SWITCH BETWEEN LIGHT AND DARK THEMES
              </Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => handleSettingChange("darkMode", value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.darkMode ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>TEXT SIZE</Text>
              <Text style={styles.settingDescription}>
                ADJUST TEXT SIZE FOR BETTER READABILITY
              </Text>
            </View>
          </View>

          <View style={styles.textSizeOptions}>
            {["small", "medium", "large"].map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.textSizeButton,
                  settings.textSize === size && styles.textSizeButtonSelected,
                ]}
                onPress={() => handleSettingChange("textSize", size)}
              >
                <Text
                  style={[
                    styles.textSizeButtonText,
                    settings.textSize === size &&
                      styles.textSizeButtonTextSelected,
                  ]}
                >
                  {size.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Behavior Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ BEHAVIOR</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>CONFIRM DELETES</Text>
              <Text style={styles.settingDescription}>
                SHOW CONFIRMATION BEFORE DELETING ITEMS
              </Text>
            </View>
            <Switch
              value={settings.showConfirmDeletes}
              onValueChange={(value) =>
                handleSettingChange("showConfirmDeletes", value)
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.showConfirmDeletes ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>AUTO SAVE</Text>
              <Text style={styles.settingDescription}>
                AUTOMATICALLY SAVE CHANGES AS YOU TYPE
              </Text>
            </View>
            <Switch
              value={settings.autoSave}
              onValueChange={(value) => handleSettingChange("autoSave", value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.autoSave ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Data Management Section - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 DATA BACKUP & RESTORE</Text>

          <View style={styles.backupCard}>
            <Text style={styles.backupCardTitle}>📧 EMAIL BACKUP SYSTEM</Text>
            <Text style={styles.backupCardDescription}>
              SECURE YOUR GAMING NOTES BY CREATING A BACKUP FILE YOU CAN EMAIL
              TO YOURSELF FOR SAFEKEEPING
            </Text>

            <Pressable
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleExportToEmail}
              disabled={isExporting}
            >
              <Text style={styles.actionButtonText}>
                {isExporting ? "📤 CREATING..." : "📤 CREATE BACKUP"}
              </Text>
              <Text style={styles.actionButtonSubtext}>
                {Platform.OS === "web"
                  ? "DOWNLOAD BACKUP FILE TO EMAIL"
                  : "SHARE BACKUP VIA EMAIL OR MESSAGES"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.successButton]}
              onPress={handleImportBackup}
              disabled={isImporting}
            >
              <Text style={styles.actionButtonText}>
                {isImporting ? "📥 IMPORTING..." : "📥 RESTORE FROM BACKUP"}
              </Text>
              <Text style={styles.actionButtonSubtext}>
                SELECT BACKUP FILE TO RESTORE DATA
              </Text>
            </Pressable>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningCardTitle}>⚠️ DANGER ZONE</Text>
            <Pressable
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleClearAllData}
            >
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                🗑️ CLEAR ALL DATA
              </Text>
              <Text
                style={[styles.actionButtonSubtext, styles.dangerButtonText]}
              >
                DELETE ALL GAMES AND NOTES
              </Text>
            </Pressable>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ ABOUT</Text>

          <Pressable
            style={styles.actionButton}
            onPress={() => setShowAbout(true)}
          >
            <Text style={styles.actionButtonText}>📱 ABOUT GAMEPAD NOTES</Text>
            <Text style={styles.actionButtonSubtext}>
              VERSION INFO AND CREDITS
            </Text>
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* About Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAbout}
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.aboutModal}>
            <Text style={styles.aboutTitle}>🎮 GAMEPAD NOTES</Text>
            <Text style={styles.aboutVersion}>VERSION 1.0.0 PWA</Text>

            <Text style={styles.aboutDescription}>
              A PROGRESSIVE WEB APP FOR VIDEO GAME NOTES. INSTALL TO YOUR HOME
              SCREEN FOR THE BEST EXPERIENCE!
            </Text>

            <View style={styles.aboutFeatures}>
              <Text style={styles.aboutFeaturesTitle}>FEATURES:</Text>
              <Text style={styles.aboutFeature}>
                🎯 GAME LIBRARY MANAGEMENT
              </Text>
              <Text style={styles.aboutFeature}>📝 DAILY GAMING ENTRIES</Text>
              <Text style={styles.aboutFeature}>📷 PHOTO ATTACHMENTS</Text>
              <Text style={styles.aboutFeature}>🎨 CUSTOM GAME COVERS</Text>
              <Text style={styles.aboutFeature}>📧 EMAIL BACKUP SYSTEM</Text>
              <Text style={styles.aboutFeature}>💾 OFFLINE FUNCTIONALITY</Text>
              <Text style={styles.aboutFeature}>🌙 DARK MODE SUPPORT</Text>
              <Text style={styles.aboutFeature}>📱 INSTALL TO HOME SCREEN</Text>
            </View>

            <Text style={styles.aboutCredit}>
              CREATED WITH ❤️ BY DAVON HENSON
            </Text>

            <Pressable
              style={styles.aboutCloseButton}
              onPress={() => setShowAbout(false)}
            >
              <Text style={styles.aboutCloseButtonText}>CLOSE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Enhanced styles with new backup components
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
    },
    backButtonText: {
      color: "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
    headerTitle: {
      fontSize: getTextSize(16),
      color: theme.text,
      fontFamily: "monospace",
    },
    placeholder: {
      width: 80,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
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
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.cardBackground,
      padding: 15,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    settingInfo: {
      flex: 1,
      marginRight: 15,
    },
    settingLabel: {
      fontSize: getTextSize(12),
      color: theme.text,
      marginBottom: 4,
      fontFamily: "monospace",
    },
    settingDescription: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      lineHeight: 14,
      fontFamily: "monospace",
    },
    textSizeOptions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 10,
    },
    textSizeButton: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 4,
      paddingVertical: 12,
      alignItems: "center",
    },
    textSizeButtonSelected: {
      borderColor: theme.buttonSuccess,
      backgroundColor: theme.isDark ? "#0A3A2A" : "#E8F5E8",
    },
    textSizeButtonText: {
      fontSize: getTextSize(12),
      color: theme.secondaryText,
      fontFamily: "monospace",
    },
    textSizeButtonTextSelected: {
      color: theme.text,
    },
    // Enhanced backup section styles
    backupCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 2,
      borderColor: theme.buttonPrimary,
      borderRadius: 12,
      padding: 20,
      marginBottom: 15,
    },
    backupCardTitle: {
      fontSize: getTextSize(14),
      color: theme.text,
      fontFamily: "monospace",
      marginBottom: 8,
    },
    backupCardDescription: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      fontFamily: "monospace",
      lineHeight: 14,
      marginBottom: 20,
    },
    warningCard: {
      backgroundColor: theme.isDark ? "#2d1a1a" : "#fff5f5",
      borderWidth: 2,
      borderColor: theme.buttonDanger,
      borderRadius: 12,
      padding: 20,
    },
    warningCardTitle: {
      fontSize: getTextSize(12),
      color: theme.buttonDanger,
      fontFamily: "monospace",
      marginBottom: 15,
    },
    actionButton: {
      backgroundColor: theme.cardBackground,
      padding: 18,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    primaryButton: {
      backgroundColor: theme.isDark ? "#1a3a35" : "#e8f5f3",
      borderColor: theme.buttonPrimary,
    },
    successButton: {
      backgroundColor: theme.isDark ? "#1a3a2a" : "#e8f5e8",
      borderColor: theme.buttonSuccess,
    },
    dangerButton: {
      borderColor: theme.buttonDanger,
      backgroundColor: "transparent",
    },
    actionButtonText: {
      fontSize: getTextSize(12),
      color: theme.text,
      marginBottom: 4,
      fontFamily: "monospace",
    },
    actionButtonSubtext: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      fontFamily: "monospace",
    },
    dangerButtonText: {
      color: theme.buttonDanger,
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
    aboutModal: {
      backgroundColor: theme.cardBackground,
      padding: 25,
      borderRadius: 8,
      maxWidth: 400,
      width: "100%",
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    aboutTitle: {
      fontSize: getTextSize(18),
      textAlign: "center",
      color: theme.text,
      marginBottom: 5,
      fontFamily: "monospace",
    },
    aboutVersion: {
      fontSize: getTextSize(12),
      textAlign: "center",
      color: theme.secondaryText,
      marginBottom: 20,
      fontFamily: "monospace",
    },
    aboutDescription: {
      fontSize: getTextSize(11),
      color: theme.text,
      lineHeight: 16,
      marginBottom: 20,
      textAlign: "center",
      fontFamily: "monospace",
    },
    aboutFeatures: {
      marginBottom: 20,
    },
    aboutFeaturesTitle: {
      fontSize: getTextSize(12),
      color: theme.text,
      marginBottom: 10,
      fontFamily: "monospace",
    },
    aboutFeature: {
      fontSize: getTextSize(10),
      color: theme.secondaryText,
      marginBottom: 6,
      lineHeight: 14,
      fontFamily: "monospace",
    },
    aboutCredit: {
      fontSize: getTextSize(11),
      textAlign: "center",
      color: theme.secondaryText,
      marginBottom: 25,
      fontFamily: "monospace",
    },
    aboutCloseButton: {
      backgroundColor: theme.buttonPrimary,
      paddingVertical: 12,
      borderRadius: 4,
      alignItems: "center",
    },
    aboutCloseButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(12),
      fontFamily: "monospace",
    },
  });

export default SettingsScreen;
