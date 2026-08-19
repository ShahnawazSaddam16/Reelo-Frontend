import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error, info);
  }

  handleReset = () => this.setState({ error: null, info: null });

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          <Text style={{ color: "#fff", fontSize: 18, marginBottom: 12 }}>An unexpected error occurred</Text>
          <Text style={{ color: "#fca5a5", marginBottom: 12 }}>{String(this.state.error)}</Text>
          <TouchableOpacity onPress={this.handleReset} style={{ backgroundColor: "#fff", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "#000" }}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
