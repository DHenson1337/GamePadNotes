import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../App";

const SettingsScreen = ({ navigation }) => {
  const { theme, settings, updateSettings, getTextSize } = useTheme();
  const [showAbout, setShowAbout] = useState(false);

  // Function to handle setting changes
  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  // Handle data export (future feature)
  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Data export feature coming soon! This will allow you to backup your game notes.",
      [{ text: "OK" }]
    );
  };

  // Handle data import (future feature)
  const handleImportData = () => {
    Alert.alert(
      "Import Data",
      "Data import feature coming soon! This will allow you to restore your game notes from a backup.",
      [{ text: "OK" }]
    );
  };

  // Clear all data
  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete ALL games and notes? This cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("@gamepad_notes_games");
              Alert.alert("Success", "All data has been cleared.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed to clear data.");
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
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Appearance</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch between light and dark themes
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
              <Text style={styles.settingLabel}>Text Size</Text>
              <Text style={styles.settingDescription}>
                Adjust text size for better readability
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
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Behavior Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Behavior</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Confirm Deletes</Text>
              <Text style={styles.settingDescription}>
                Show confirmation before deleting items
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
              <Text style={styles.settingLabel}>Auto Save</Text>
              <Text style={styles.settingDescription}>
                Automatically save changes as you type
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

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Data Management</Text>

          <Pressable style={styles.actionButton} onPress={handleExportData}>
            <Text style={styles.actionButtonText}>📤 Export Data</Text>
            <Text style={styles.actionButtonSubtext}>Backup your notes</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleImportData}>
            <Text style={styles.actionButtonText}>📥 Import Data</Text>
            <Text style={styles.actionButtonSubtext}>Restore from backup</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearAllData}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              🗑️ Clear All Data
            </Text>
            <Text style={[styles.actionButtonSubtext, styles.dangerButtonText]}>
              Delete all games and notes
            </Text>
          </Pressable>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>

          <Pressable
            style={styles.actionButton}
            onPress={() => setShowAbout(true)}
          >
            <Text style={styles.actionButtonText}>📱 About GamePad Notes</Text>
            <Text style={styles.actionButtonSubtext}>
              Version info and credits
            </Text>
          </Pressable>
        </View>
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
            <Text style={styles.aboutTitle}>🎮 GamePad Notes</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>

            <Text style={styles.aboutDescription}>
              A mobile notepad app designed specifically for video game notes.
              Keep track of your gaming progress, strategies, and memorable
              moments.
            </Text>

            <View style={styles.aboutFeatures}>
              <Text style={styles.aboutFeaturesTitle}>Features:</Text>
              <Text style={styles.aboutFeature}>
                🎯 Game library management
              </Text>
              <Text style={styles.aboutFeature}>📝 Daily gaming entries</Text>
              <Text style={styles.aboutFeature}>🎨 Custom game icons</Text>
              <Text style={styles.aboutFeature}>💾 Data persistence</Text>
              <Text style={styles.aboutFeature}>
                📱 Touch-optimized interface
              </Text>
              <Text style={styles.aboutFeature}>🌙 Dark mode support</Text>
            </View>

            <Text style={styles.aboutCredit}>
              Created with ❤️ by Davon Henson
            </Text>

            <Pressable
              style={styles.aboutCloseButton}
              onPress={() => setShowAbout(false)}
            >
              <Text style={styles.aboutCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Dynamic styles based on theme and text size
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
      fontSize: getTextSize(22),
      fontWeight: "bold",
      color: theme.text,
    },
    placeholder: {
      width: 80,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: getTextSize(20),
      fontWeight: "bold",
      marginBottom: 15,
      color: theme.text,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.cardBackground,
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    settingInfo: {
      flex: 1,
      marginRight: 15,
    },
    settingLabel: {
      fontSize: getTextSize(16),
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: getTextSize(14),
      color: theme.secondaryText,
      lineHeight: 18,
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
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    textSizeButtonSelected: {
      borderColor: theme.buttonSuccess,
      backgroundColor: theme.isDark ? "#0A3A2A" : "#E8F5E8",
    },
    textSizeButtonText: {
      fontSize: getTextSize(16),
      color: theme.secondaryText,
    },
    textSizeButtonTextSelected: {
      color: theme.text,
      fontWeight: "600",
    },
    actionButton: {
      backgroundColor: theme.cardBackground,
      padding: 18,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    actionButtonText: {
      fontSize: getTextSize(16),
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    actionButtonSubtext: {
      fontSize: getTextSize(14),
      color: theme.secondaryText,
    },
    dangerButton: {
      borderColor: theme.buttonDanger,
      backgroundColor: theme.isDark ? "#2d1a1a" : "#fff5f5",
    },
    dangerButtonText: {
      color: theme.buttonDanger,
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
      borderRadius: 12,
      maxWidth: 400,
      width: "100%",
    },
    aboutTitle: {
      fontSize: getTextSize(24),
      fontWeight: "bold",
      textAlign: "center",
      color: theme.text,
      marginBottom: 5,
    },
    aboutVersion: {
      fontSize: getTextSize(16),
      textAlign: "center",
      color: theme.secondaryText,
      marginBottom: 20,
    },
    aboutDescription: {
      fontSize: getTextSize(16),
      color: theme.text,
      lineHeight: 22,
      marginBottom: 20,
      textAlign: "center",
    },
    aboutFeatures: {
      marginBottom: 20,
    },
    aboutFeaturesTitle: {
      fontSize: getTextSize(16),
      fontWeight: "600",
      color: theme.text,
      marginBottom: 10,
    },
    aboutFeature: {
      fontSize: getTextSize(15),
      color: theme.secondaryText,
      marginBottom: 6,
      lineHeight: 20,
    },
    aboutCredit: {
      fontSize: getTextSize(16),
      textAlign: "center",
      color: theme.secondaryText,
      fontStyle: "italic",
      marginBottom: 25,
    },
    aboutCloseButton: {
      backgroundColor: theme.buttonPrimary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    aboutCloseButtonText: {
      color: theme.isDark ? theme.background : "white",
      fontSize: getTextSize(16),
      fontWeight: "bold",
    },
  });

export default SettingsScreen;
