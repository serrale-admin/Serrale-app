import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface EmptyStateProps {
  title?: string;
  message?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Nothing here yet",
  message = "Check back later or try a different filter.",
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    color: "#1a1a1a",
    textAlign: "center",
  },
  message: {
    color: "#999",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
});

export default EmptyState;
