import React, { useRef, useState } from 'react';
import { SafeAreaView, View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

const VERSE_IMAGE = 'https://dailyverses.net/images/en/niv/xl/psalms-91-1-2.jpg';

export default function App() {
  const web = useRef(null);
  const [address, setAddress] = useState('https://www.google.com');
  const [url, setUrl] = useState('https://www.google.com');
  const [loading, setLoading] = useState(false);

  const navigate = () => {
    const value = address.trim();
    if (!value) return;
    const target = /^https?:\/\//i.test(value)
      ? value
      : (value.includes('.') && !value.includes(' ')
          ? 'https://' + value
          : 'https://www.google.com/search?q=' + encodeURIComponent(value));
    setUrl(target);
    setAddress(target);
  };

  const openVerse = () => {
    setUrl(VERSE_IMAGE);
    setAddress(VERSE_IMAGE);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="auto" />
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => web.current?.goBack()} style={styles.button} accessibilityLabel="Go back">
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => web.current?.goForward()} style={styles.button} accessibilityLabel="Go forward">
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
        <TextInput
          value={address}
          onChangeText={setAddress}
          onSubmitEditing={navigate}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          placeholder="Search or enter website"
          style={styles.input}
        />
        <TouchableOpacity onPress={navigate} style={styles.go}>
          <Text style={styles.goText}>Go</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.verseCard} onPress={openVerse} activeOpacity={0.85} accessibilityLabel="Open Psalm 91 verses 1 and 2">
        <View style={styles.verseHeading}>
          <Text style={styles.verseTitle}>Daily Bible Verse</Text>
          <Text style={styles.verseReference}>PSALM 91:1–2</Text>
        </View>
        <Image source={{ uri: VERSE_IMAGE }} style={styles.verseImage} resizeMode="contain" />
        <Text style={styles.verseHint}>Tap the verse to open it in the browser</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={styles.progress} />}
      <WebView
        ref={web}
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={s => { if (s.url) setAddress(s.url); }}
        javaScriptEnabled
        domStorageEnabled
        style={styles.web}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#101426' },
  toolbar: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 6, backgroundColor: '#ffffff' },
  button: { paddingHorizontal: 8, paddingVertical: 10 },
  navText: { color: '#202941', fontSize: 24 },
  input: { flex: 1, backgroundColor: '#eef1f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#111827' },
  go: { backgroundColor: '#2347d9', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10 },
  goText: { color: '#fff', fontWeight: '600' },
  verseCard: { backgroundColor: '#202941', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8, alignItems: 'center' },
  verseHeading: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, paddingBottom: 6 },
  verseTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  verseReference: { color: '#ffbf69', fontSize: 12, fontWeight: '700' },
  verseImage: { width: '100%', height: 112, backgroundColor: '#101426', borderRadius: 8 },
  verseHint: { color: '#b8c0d4', fontSize: 11, marginTop: 6 },
  progress: { height: 3 },
  web: { flex: 1, backgroundColor: '#ffffff' }
});
