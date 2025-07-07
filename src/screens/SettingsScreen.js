import React, { useState, useRef, useEffect } from "react";
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
  const [isClearing, setIsClearing] = useState(false);
  const fileInputRef = useRef(null);

  // Function to handle setting changes
  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  // Simplified web alert function (since React Native Alert may not work perfectly on web)
  const showAlert = (title, message, buttons = [{ text: "OK" }]) => {
    if (Platform.OS === "web" && window.confirm) {
      // For simple confirmations on web
      if (buttons.length === 2) {
        const confirmed = window.confirm(`${title}\n\n${message}`);
        if (confirmed && buttons[1].onPress) {
          buttons[1].onPress();
        } else if (!confirmed && buttons[0].onPress) {
          buttons[0].onPress();
        }
      } else {
        window.alert(`${title}\n\n${message}`);
        if (buttons[0].onPress) buttons[0].onPress();
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  // SIMPLIFIED Export function - focus on core functionality
  const handleExportToEmail = async () => {
    console.log("🔄 EXPORT: Starting...");
    setIsExporting(true);

    try {
      // Get data with explicit error handling
      let gamesData, settingsData;

      try {
        gamesData = await AsyncStorage.getItem("@gamepad_notes_games");
        settingsData = await AsyncStorage.getItem("@gamepad_notes_settings");
        console.log("📊 EXPORT: Data retrieved", {
          gamesLength: gamesData?.length || 0,
          settingsLength: settingsData?.length || 0,
        });
      } catch (storageError) {
        console.error("❌ EXPORT: Storage error", storageError);
        throw new Error("Failed to read app data");
      }

      // Parse safely
      const games = gamesData ? JSON.parse(gamesData) : [];
      const settingsObj = settingsData ? JSON.parse(settingsData) : {};

      // Create backup
      const backup = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        appName: "GamePad Notes",
        platform: Platform.OS,
        games: games,
        settings: settingsObj,
        totalGames: games.length,
        totalEntries: games.reduce(
          (total, game) => total + (game.entries?.length || 0),
          0
        ),
      };

      console.log("📦 EXPORT: Backup created", backup);

      if (Platform.OS === "web") {
        // Simple web download
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `gamepad-notes-backup-${
          new Date().toISOString().split("T")[0]
        }.json`;

        // Force download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log("✅ EXPORT: Web download complete");
        showAlert("BACKUP DOWNLOADED", "Your backup file has been downloaded!");
      }

      setIsExporting(false);
    } catch (error) {
      console.error("❌ EXPORT: Error", error);
      setIsExporting(false);
      showAlert("EXPORT ERROR", `Failed to create backup: ${error.message}`);
    }
  };

  // SIMPLIFIED Import function with better web handling
  const handleImportBackup = async () => {
    console.log("🔄 IMPORT: Starting...");
    setIsImporting(true);

    try {
      if (Platform.OS === "web") {
        // Create and trigger file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = async (event) => {
          try {
            const file = event.target.files[0];
            if (!file) {
              console.log("❌ IMPORT: No file selected");
              setIsImporting(false);
              return;
            }

            console.log("📄 IMPORT: File selected", file.name);

            if (!file.name.endsWith(".json")) {
              showAlert("INVALID FILE", "Please select a .json backup file.");
              setIsImporting(false);
              return;
            }

            // Read file
            const fileContent = await file.text();
            console.log("📝 IMPORT: File read, length:", fileContent.length);

            // Parse and validate
            let backup;
            try {
              backup = JSON.parse(fileContent);
            } catch (parseError) {
              console.error("❌ IMPORT: Parse error", parseError);
              showAlert("IMPORT ERROR", "Invalid JSON file format.");
              setIsImporting(false);
              return;
            }

            if (!backup.games || !Array.isArray(backup.games)) {
              console.error("❌ IMPORT: Invalid backup structure");
              showAlert(
                "IMPORT ERROR",
                "Invalid backup file - missing games data."
              );
              setIsImporting(false);
              return;
            }

            console.log("✅ IMPORT: Backup validated", {
              totalGames: backup.games.length,
              totalEntries: backup.games.reduce(
                (t, g) => t + (g.entries?.length || 0),
                0
              ),
            });

            // Show confirmation
            const confirmed = window.confirm(
              `RESTORE BACKUP?\n\n` +
                `Games: ${backup.games.length}\n` +
                `Entries: ${backup.games.reduce(
                  (t, g) => t + (g.entries?.length || 0),
                  0
                )}\n\n` +
                `This will replace ALL current data!\n\n` +
                `Click OK to continue, Cancel to abort.`
            );

            if (!confirmed) {
              console.log("❌ IMPORT: User cancelled");
              setIsImporting(false);
              return;
            }

            // Perform import
            console.log("🔄 IMPORT: Starting data restore...");

            // Clear existing data
            try {
              await AsyncStorage.removeItem("@gamepad_notes_games");
              await AsyncStorage.removeItem("@gamepad_notes_settings");
              console.log("🗑️ IMPORT: Cleared existing data");
            } catch (clearError) {
              console.error("⚠️ IMPORT: Clear error", clearError);
              // Continue anyway
            }

            // Save new data
            try {
              await AsyncStorage.setItem(
                "@gamepad_notes_games",
                JSON.stringify(backup.games)
              );
              console.log("💾 IMPORT: Saved games data");

              if (backup.settings && Object.keys(backup.settings).length > 0) {
                await AsyncStorage.setItem(
                  "@gamepad_notes_settings",
                  JSON.stringify(backup.settings)
                );
                console.log("💾 IMPORT: Saved settings data");
              }
            } catch (saveError) {
              console.error("❌ IMPORT: Save error", saveError);
              throw new Error("Failed to save imported data");
            }

            console.log("🎉 IMPORT: Success!");

            showAlert(
              "IMPORT SUCCESS",
              "Data restored! The app will refresh.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Force refresh
                    window.location.reload();
                  },
                },
              ]
            );

            setIsImporting(false);
          } catch (error) {
            console.error("❌ IMPORT: Process error", error);
            showAlert("IMPORT ERROR", `Failed to import: ${error.message}`);
            setIsImporting(false);
          }
        };

        // Trigger file selection
        input.click();
      } else {
        // Mobile import would go here
        console.log("📱 Mobile import not implemented yet");
        showAlert("INFO", "Import feature is currently web-only.");
        setIsImporting(false);
      }
    } catch (error) {
      console.error("❌ IMPORT: Setup error", error);
      showAlert("IMPORT ERROR", `Failed to start import: ${error.message}`);
      setIsImporting(false);
    }
  };

  // SIMPLIFIED Delete function with direct approach
  const handleClearAllData = () => {
    console.log("🔄 DELETE: User requested clear");

    const confirmed = window.confirm(
      "CLEAR ALL DATA\n\n" +
        "Are you sure you want to delete ALL games and notes?\n\n" +
        "THIS CANNOT BE UNDONE!\n\n" +
        "Click OK to delete everything, Cancel to abort."
    );

    if (!confirmed) {
      console.log("❌ DELETE: User cancelled");
      return;
    }

    performDataClear();
  };

  const performDataClear = async () => {
    console.log("🔄 DELETE: Starting clear process...");
    setIsClearing(true);

    try {
      // Simple approach - just remove the main keys
      const keysToRemove = ["@gamepad_notes_games", "@gamepad_notes_settings"];

      console.log("🗑️ DELETE: Removing keys", keysToRemove);

      // Remove each key individually for better error handling
      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`✅ DELETE: Removed ${key}`);
        } catch (keyError) {
          console.error(`❌ DELETE: Failed to remove ${key}`, keyError);
        }
      }

      // Verify deletion
      try {
        const checkGames = await AsyncStorage.getItem("@gamepad_notes_games");
        const checkSettings = await AsyncStorage.getItem(
          "@gamepad_notes_settings"
        );
        console.log("🔍 DELETE: Verification", {
          gamesRemoved: checkGames === null,
          settingsRemoved: checkSettings === null,
        });
      } catch (verifyError) {
        console.error("⚠️ DELETE: Verification error", verifyError);
      }

      setIsClearing(false);
      console.log("🎉 DELETE: Clear completed");

      showAlert("SUCCESS", "All data has been cleared! The app will refresh.", [
        {
          text: "OK",
          onPress: () => {
            // Force refresh to show empty state
            window.location.reload();
          },
        },
      ]);
    } catch (error) {
      console.error("❌ DELETE: Clear error", error);
      setIsClearing(false);
      showAlert("ERROR", `Failed to clear data: ${error.message}`);
    }
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

        {/* Data Management Section - SIMPLIFIED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 DATA BACKUP & RESTORE</Text>

          <View style={styles.backupCard}>
            <Text style={styles.backupCardTitle}>📧 EMAIL BACKUP SYSTEM</Text>
            <Text style={styles.backupCardDescription}>
              CREATE AND RESTORE BACKUPS OF YOUR GAMING NOTES. WORKS BEST ON
              DESKTOP BROWSERS.
            </Text>

            <Pressable
              style={[
                styles.actionButton,
                styles.primaryButton,
                isExporting && styles.actionButtonDisabled,
              ]}
              onPress={handleExportToEmail}
              disabled={isExporting || isImporting || isClearing}
            >
              <Text style={styles.actionButtonText}>
                {isExporting ? "📤 CREATING..." : "📤 CREATE BACKUP"}
              </Text>
              <Text style={styles.actionButtonSubtext}>
                DOWNLOAD BACKUP FILE
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.successButton,
                isImporting && styles.actionButtonDisabled,
              ]}
              onPress={handleImportBackup}
              disabled={isImporting || isExporting || isClearing}
            >
              <Text style={styles.actionButtonText}>
                {isImporting ? "📥 IMPORTING..." : "📥 RESTORE FROM BACKUP"}
              </Text>
              <Text style={styles.actionButtonSubtext}>
                SELECT BACKUP FILE TO RESTORE
              </Text>
            </Pressable>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningCardTitle}>⚠️ DANGER ZONE</Text>
            <Pressable
              style={[
                styles.actionButton,
                styles.dangerButton,
                isClearing && styles.actionButtonDisabled,
              ]}
              onPress={handleClearAllData}
              disabled={isClearing || isExporting || isImporting}
            >
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                {isClearing ? "🗑️ CLEARING..." : "🗑️ CLEAR ALL DATA"}
              </Text>
              <Text
                style={[styles.actionButtonSubtext, styles.dangerButtonText]}
              >
                DELETE ALL GAMES AND NOTES
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Debug Section - TEMPORARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🐛 DEBUG INFO</Text>

          <Pressable
            style={styles.actionButton}
            onPress={async () => {
              console.log("🔍 DEBUG: Checking storage...");
              try {
                const games = await AsyncStorage.getItem(
                  "@gamepad_notes_games"
                );
                const settings = await AsyncStorage.getItem(
                  "@gamepad_notes_settings"
                );
                const allKeys = await AsyncStorage.getAllKeys();

                console.log("📊 Storage Status:", {
                  gamesData: games ? `${games.length} chars` : "null",
                  settingsData: settings ? `${settings.length} chars` : "null",
                  allKeys: allKeys,
                  platform: Platform.OS,
                  userAgent:
                    typeof navigator !== "undefined"
                      ? navigator.userAgent
                      : "unknown",
                });

                showAlert(
                  "DEBUG INFO",
                  `Check browser console for storage details`
                );
              } catch (error) {
                console.error("❌ DEBUG: Error", error);
                showAlert("DEBUG ERROR", error.message);
              }
            }}
          >
            <Text style={styles.actionButtonText}>🔍 CHECK STORAGE</Text>
            <Text style={styles.actionButtonSubtext}>
              DEBUG STORAGE STATE (CHECK CONSOLE)
            </Text>
          </Pressable>
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
            <Text style={styles.aboutVersion}>VERSION 1.0.0 PWA - DEBUG</Text>

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

// Styles (same as before but with debug section)
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
    actionButtonDisabled: {
      opacity: 0.6,
      borderColor: "#ccc",
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
