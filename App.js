import React, { useRef, useState } from 'react';
import { SafeAreaView, View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const web = useRef(null);
  const [address, setAddress] = useState('https://www.google.com');
  const [url, setUrl] = useState('https://www.google.com');
  const [loading, setLoading] = useState(false);
  const navigate = () => {
    const value = address.trim();
    if (!value) return;
    const target = /^https?:\/\//i.test(value) ? value : (value.includes('.') && !value.includes(' ') ? 'https://' + value : 'https://www.google.com/search?q=' + encodeURIComponent(value));
    setUrl(target);
    setAddress(target);
  };
  return <SafeAreaView style={styles.root}>
    <StatusBar style="auto" />
    <View style={styles.toolbar}>
      <TouchableOpacity onPress={() => web.current?.goBack()} style={styles.button}><Text>‹</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => web.current?.goForward()} style={styles.button}><Text>›</Text></TouchableOpacity>
      <TextInput value={address} onChangeText={setAddress} onSubmitEditing={navigate} autoCapitalize="none" autoCorrect={false} keyboardType="url" returnKeyType="go" placeholder="Search or enter website" style={styles.input} />
      <TouchableOpacity onPress={navigate} style={styles.go}><Text style={styles.goText}>Go</Text></TouchableOpacity>
    </View>
    {loading && <ActivityIndicator style={styles.progress} />}
    <WebView ref={web} source={{ uri: url }} onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} onNavigationStateChange={s => { if (s.url) setAddress(s.url); }} javaScriptEnabled domStorageEnabled style={styles.web} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f6fb' },
  toolbar: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 6, backgroundColor: '#ffffff' },
  button: { paddingHorizontal: 8, paddingVertical: 10 },
  input: { flex: 1, backgroundColor: '#eef1f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  go: { backgroundColor: '#2347d9', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10 },
  goText: { color: '#fff', fontWeight: '600' },
  progress: { height: 3 },
  web: { flex: 1 }
});
