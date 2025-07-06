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
import { useTheme } from "../../ThemeContext"; // ONLY ONE IMPORT!

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
      "EXPORT DATA",
      "DATA EXPORT FEATURE COMING SOON! THIS WILL ALLOW YOU TO BACKUP YOUR GAME NOTES.",
      [{ text: "OK" }]
    );
  };

  // Handle data import (future feature)
  const handleImportData = () => {
    Alert.alert(
      "IMPORT DATA",
      "DATA IMPORT FEATURE COMING SOON! THIS WILL ALLOW YOU TO RESTORE YOUR GAME NOTES FROM A BACKUP.",
      [{ text: "OK" }]
    );
  };

  // Clear all data
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
              await AsyncStorage.removeItem("@gamepad_notes_games");
              Alert.alert("SUCCESS", "ALL DATA HAS BEEN CLEARED.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert("ERROR", "FAILED TO CLEAR DATA.");
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 DATA MANAGEMENT</Text>

          <Pressable style={styles.actionButton} onPress={handleExportData}>
            <Text style={styles.actionButtonText}>📤 EXPORT DATA</Text>
            <Text style={styles.actionButtonSubtext}>BACKUP YOUR NOTES</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleImportData}>
            <Text style={styles.actionButtonText}>📥 IMPORT DATA</Text>
            <Text style={styles.actionButtonSubtext}>RESTORE FROM BACKUP</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearAllData}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              🗑️ CLEAR ALL DATA
            </Text>
            <Text style={[styles.actionButtonSubtext, styles.dangerButtonText]}>
              DELETE ALL GAMES AND NOTES
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
            <Text style={styles.aboutVersion}>VERSION 1.0.0</Text>

            <Text style={styles.aboutDescription}>
              A MOBILE NOTEPAD APP DESIGNED SPECIFICALLY FOR VIDEO GAME NOTES.
              KEEP TRACK OF YOUR GAMING PROGRESS, STRATEGIES, AND MEMORABLE
              MOMENTS.
            </Text>

            <View style={styles.aboutFeatures}>
              <Text style={styles.aboutFeaturesTitle}>FEATURES:</Text>
              <Text style={styles.aboutFeature}>
                🎯 GAME LIBRARY MANAGEMENT
              </Text>
              <Text style={styles.aboutFeature}>📝 DAILY GAMING ENTRIES</Text>
              <Text style={styles.aboutFeature}>🎨 CUSTOM GAME ICONS</Text>
              <Text style={styles.aboutFeature}>💾 DATA PERSISTENCE</Text>
              <Text style={styles.aboutFeature}>
                📱 TOUCH-OPTIMIZED INTERFACE
              </Text>
              <Text style={styles.aboutFeature}>🌙 DARK MODE SUPPORT</Text>
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
    content: {
      flex: 1,
      padding: 20,
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
    actionButton: {
      backgroundColor: theme.cardBackground,
      padding: 18,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.borderColor,
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
