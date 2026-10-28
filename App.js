import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';

const BOOKMARKS_KEY = '@lantern/bookmarks-v1';
const SETTINGS_KEY = '@lantern/settings-v1';
const BACKGROUND_KEY = '@lantern/background-v1';
const BIBLES_KEY = '@lantern/api-bibles-v1';
const MAX_BACKGROUND_CHARS = 1500000;
const DEFAULT_SETTINGS = {
  searchEngine: 'DuckDuckGo',
  preferHttps: true,
  javaScriptEnabled: true,
  allowPopups: false,
  privateBrowsing: false,
  showDailyVerse: true,
  quickPaths: { DuckDuckGo: false, YouTube: false, Wikipedia: false, 'Bible Gateway': false },
  verseTranslation: 'web',
  bibleKey: '',
};
const SEARCH_ENGINES = {
  DuckDuckGo: 'https://duckduckgo.com/?q=',
  Google: 'https://www.google.com/search?q=',
  Bing: 'https://www.bing.com/search?q=',
};
const QUICK_LINKS = [
  { title: 'DuckDuckGo', subtitle: 'Private search', url: 'https://duckduckgo.com', mark: 'D', color: '#de5833' },
  { title: 'YouTube', subtitle: 'Watch', url: 'https://www.youtube.com', mark: '▶', color: '#ff4d4d' },
  { title: 'Wikipedia', subtitle: 'Explore', url: 'https://www.wikipedia.org', mark: 'W', color: '#7b91bd' },
  { title: 'Bible Gateway', subtitle: 'Read', url: 'https://www.biblegateway.com', mark: '✦', color: '#efb35f' },
];

const DAILY_VERSES = [
  {
    "reference": "Psalm 91:1–2",
    "text": "He who dwells in the secret place of the Most High\nwill rest in the shadow of the Almighty.\n\nI will say of Yahweh, “He is my refuge and my fortress;\nmy God, in whom I trust.”"
  },
  {
    "reference": "Psalm 23:1",
    "text": "Yahweh is my shepherd;\nI shall lack nothing."
  },
  {
    "reference": "Psalm 46:1",
    "text": "God is our refuge and strength,\na very present help in trouble."
  },
  {
    "reference": "Psalm 121:1–2",
    "text": "I will lift up my eyes to the hills.\nWhere does my help come from?\nMy help comes from Yahweh,\nwho made heaven and earth."
  },
  {
    "reference": "Proverbs 3:5–6",
    "text": "Trust in Yahweh with all your heart,\nand don’t lean on your own understanding.\nIn all your ways acknowledge him,\nand he will make your paths straight."
  },
  {
    "reference": "Isaiah 41:10",
    "text": "Don’t you be afraid, for I am with you.\nDon’t be dismayed, for I am your God.\nI will strengthen you.\nYes, I will help you.\nYes, I will uphold you with the right hand of my righteousness."
  },
  {
    "reference": "Matthew 6:34",
    "text": "Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself. Each day’s own evil is sufficient."
  },
  {
    "reference": "Matthew 11:28",
    "text": "Come to me, all you who labor and are heavily burdened, and I will give you rest."
  },
  {
    "reference": "John 14:27",
    "text": "Peace I leave with you. My peace I give to you; not as the world gives, I give to you. Don’t let your heart be troubled, neither let it be fearful."
  },
  {
    "reference": "Romans 8:28",
    "text": "We know that all things work together for good for those who love God, for those who are called according to his purpose."
  },
  {
    "reference": "Philippians 4:6–7",
    "text": "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus."
  },
  {
    "reference": "Joshua 1:9",
    "text": "Haven’t I commanded you? Be strong and courageous. Don’t be afraid. Don’t be dismayed, for Yahweh your God is with you wherever you go."
  },
  {
    "reference": "1 Peter 5:7",
    "text": "Casting all your worries on him, because he cares for you."
  }
];

const KJV_TEXT = {
  'Psalm 91:1–2': 'He that dwelleth in the secret place of the most High\nshall abide under the shadow of the Almighty.\n\nI will say of the LORD, He is my refuge and my fortress:\nmy God; in him will I trust.',
  'Psalm 23:1': 'The LORD is my shepherd;\nI shall not want.',
  'Psalm 46:1': 'God is our refuge and strength,\na very present help in trouble.',
  'Psalm 121:1–2': 'I will lift up mine eyes unto the hills,\nfrom whence cometh my help.\nMy help cometh from the LORD,\nwhich made heaven and earth.',
  'Proverbs 3:5–6': 'Trust in the LORD with all thine heart;\nand lean not unto thine own understanding.\nIn all thy ways acknowledge him,\nand he shall direct thy paths.',
  'Isaiah 41:10': 'Fear thou not; for I am with thee:\nbe not dismayed; for I am thy God:\nI will strengthen thee; yea, I will help thee;\nyea, I will uphold thee with the right hand of my righteousness.',
  'Matthew 6:34': 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.',
  'Matthew 11:28': 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
  'John 14:27': 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
  'Romans 8:28': 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
  'Philippians 4:6–7': 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
  'Joshua 1:9': 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
  '1 Peter 5:7': 'Casting all your care upon him; for he careth for you.',
};

const TRANSLATIONS = [
  { id: 'web', label: 'WEB' },
  { id: 'kjv', label: 'KJV' },
  { id: 'bbe', label: 'BBE' },
  { id: 'oeb-us', label: 'OEB' },
  { id: 'oeb-cw', label: 'OEB-CW' },
  { id: 'webbe', label: 'WEBBE' },
  { id: 'clementine', label: 'Latin' },
  { id: 'almeida', label: 'Almeida' },
  { id: 'rccv', label: 'Romanian' },
];
const OSIS = {
  'Psalm 91:1–2': 'PSA.91.1-PSA.91.2',
  'Psalm 23:1': 'PSA.23.1',
  'Psalm 46:1': 'PSA.46.1',
  'Psalm 121:1–2': 'PSA.121.1-PSA.121.2',
  'Proverbs 3:5–6': 'PRO.3.5-PRO.3.6',
  'Isaiah 41:10': 'ISA.41.10',
  'Matthew 6:34': 'MAT.6.34',
  'Matthew 11:28': 'MAT.11.28',
  'John 14:27': 'JHN.14.27',
  'Romans 8:28': 'ROM.8.28',
  'Philippians 4:6–7': 'PHP.4.6-PHP.4.7',
  'Joshua 1:9': 'JOS.1.9',
  '1 Peter 5:7': '1PE.5.7',
};

async function loadVerse(id, reference, apiKey) {
  const cacheKey = '@lantern/verse/' + id + '/' + reference;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch (_) {}
  let text = '';
  try {
    if (id.indexOf('api:') === 0) {
      const osis = OSIS[reference];
      if (!apiKey || !osis) return '';
      const res = await fetch(
        'https://api.scripture.api.bible/v1/bibles/' + id.slice(4) + '/passages/' + osis +
          '?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false',
        { headers: { 'api-key': apiKey } }
      );
      if (!res.ok) return '';
      const json = await res.json();
      text = String((json.data && json.data.content) || '').replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
    } else {
      const res = await fetch('https://bible-api.com/' + reference.replace('–', '-').replace(/ /g, '+') + '?translation=' + id);
      if (!res.ok) return '';
      const json = await res.json();
      text = String(json.text || '').trim();
    }
  } catch (_) {
    return '';
  }
  if (text) {
    try { await AsyncStorage.setItem(cacheKey, text); } catch (_) {}
  }
  return text;
}

function makeTarget(value, engine, preferHttps) {
  const input = value.trim();
  if (!input) return null;
  if (/^![a-z0-9]+(?:\s|$)/i.test(input)) {
    return SEARCH_ENGINES.DuckDuckGo + encodeURIComponent(input);
  }
  if (/^https?:\/\//i.test(input)) {
    if (preferHttps && /^http:\/\//i.test(input)) {
      return input.replace(/^http:\/\//i, 'https://');
    }
    return input;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(input)) return null;
  if (input.includes('.') && !/\s/.test(input)) return 'https://' + input;
  return (SEARCH_ENGINES[engine] || SEARCH_ENGINES.DuckDuckGo) + encodeURIComponent(input);
}

function IconButton({ label, glyph, onPress, secondary = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, secondary && styles.iconButtonSecondary, pressed && styles.pressed]}
    >
      <Text style={[styles.iconGlyph, secondary && styles.iconGlyphSecondary]}>{glyph}</Text>
    </Pressable>
  );
}

function SettingRow({ title, detail, value, onValueChange }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDetail}>{detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#39445b', true: '#d99e4f' }}
        thumbColor={value ? '#fff3d8' : '#d0d5df'}
        accessibilityLabel={title}
      />
    </View>
  );
}

export default function App() {
  const web = useRef(null);
  const [address, setAddress] = useState('');
  const [url, setUrl] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [background, setBackground] = useState(null);
  const [webKey, setWebKey] = useState(0);
  const [apiBibles, setApiBibles] = useState([]);
  const [remote, setRemote] = useState({ key: '', text: '', failed: false, loading: false });
  const [bookmarksVisible, setBookmarksVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [bookmarkName, setBookmarkName] = useState('');
  const [today, setToday] = useState(() => new Date());
  const [bookmarkUrl, setBookmarkUrl] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(BOOKMARKS_KEY),
      AsyncStorage.getItem(SETTINGS_KEY),
      AsyncStorage.getItem(BACKGROUND_KEY),
      AsyncStorage.getItem(BIBLES_KEY),
    ])
      .then(([savedBookmarks, savedSettings, savedBackground, savedBibles]) => {
        if (!active) return;
        if (savedBibles) {
          try { setApiBibles(JSON.parse(savedBibles)); } catch (_) {}
        }
        if (savedBookmarks) {
          try { setBookmarks(JSON.parse(savedBookmarks)); } catch (_) { setBookmarks([]); }
        }
        let oldBackground = null;
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            oldBackground = parsed.backgroundImage || null;
            delete parsed.backgroundImage;
            const legacy = { WEB: 'web', KJV: 'kjv' };
            const saved = parsed.verseTranslation;
            if (legacy[saved]) parsed.verseTranslation = legacy[saved];
            else if (saved && !TRANSLATIONS.some((item) => item.id === saved) && String(saved).indexOf('api:') !== 0) parsed.verseTranslation = 'web';
            setSettings({ ...DEFAULT_SETTINGS, ...parsed, quickPaths: { ...DEFAULT_SETTINGS.quickPaths, ...(parsed.quickPaths || {}) } });
          } catch (_) {}
        }
        if (savedBackground) {
          setBackground(savedBackground);
        } else if (oldBackground && oldBackground.length <= MAX_BACKGROUND_CHARS) {
          setBackground(oldBackground);
          AsyncStorage.setItem(BACKGROUND_KEY, oldBackground).catch(() => {});
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const open = (link) => {
      if (link && /^https?:\/\//i.test(link)) {
        setAddress(link);
        setUrl(link);
        setPageTitle('');
      }
    };
    Linking.getInitialURL().then(open).catch(() => {});
    const sub = Linking.addEventListener('url', (event) => open(event.url));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const timer = setTimeout(() => setToday(new Date()), Math.max(1000, nextMidnight.getTime() - now.getTime()));
    return () => clearTimeout(timer);
  }, [today]);

  const dayOfYear = Math.floor(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(today.getFullYear(), 0, 1)) / 86400000
  );
  const dailyVerse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
  const tr = settings.verseTranslation || 'web';
  const trKey = tr + '|' + dailyVerse.reference;
  const trMeta = TRANSLATIONS.find((item) => item.id === tr) || apiBibles.find((item) => item.id === tr);
  const trLabel = trMeta ? trMeta.label : 'WEB';
  const showKjv = tr === 'kjv' && !!KJV_TEXT[dailyVerse.reference];
  const remoteReady = tr !== 'web' && tr !== 'kjv' && remote.key === trKey && !!remote.text;
  const verseText = showKjv ? KJV_TEXT[dailyVerse.reference] : remoteReady ? remote.text : dailyVerse.text;
  const verseVersion = showKjv ? 'KJV' : remoteReady ? trLabel : 'WEB';
  const verseNote = remote.key === trKey && remote.loading
    ? 'Loading ' + trLabel + '…'
    : remote.key === trKey && remote.failed
      ? 'Couldn’t load ' + trLabel + '. Showing WEB.'
      : '';
  const linkVersion = tr === 'web' ? 'WEB' : tr === 'kjv' ? 'KJV' : tr.indexOf('api:') === 0 && trMeta ? (trMeta.label === 'NASB' ? 'NASB1995' : trMeta.label) : '';

  useEffect(() => {
    if (tr === 'web' || tr === 'kjv') {
      setRemote({ key: trKey, text: '', failed: false, loading: false });
      return undefined;
    }
    let active = true;
    setRemote({ key: trKey, text: '', failed: false, loading: true });
    loadVerse(tr, dailyVerse.reference, settings.bibleKey).then((text) => {
      if (active) setRemote({ key: trKey, text, failed: !text, loading: false });
    });
    return () => { active = false; };
  }, [tr, dailyVerse.reference, settings.bibleKey]);

  const updateBookmarks = async (next) => {
    setBookmarks(next);
    try { await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next)); } catch (_) {}
  };

  const moveBookmark = async (index, offset) => {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= bookmarks.length) return;
    const next = [...bookmarks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    await updateBookmarks(next);
  };

  const updateSetting = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (_) {}
  };

  const saveBackground = async (value) => {
    try {
      if (value) await AsyncStorage.setItem(BACKGROUND_KEY, value);
      else await AsyncStorage.removeItem(BACKGROUND_KEY);
      setBackground(value);
    } catch (_) {
      Alert.alert('Could not save the background', 'The photo may be too large. Try a different photo.');
    }
  };

  const navigate = (value = address) => {
    const target = makeTarget(value, settings.searchEngine, settings.preferHttps);
    if (!target) {
      Alert.alert('Can’t open that address', 'Enter a web address or a search term.');
      return;
    }
    setAddress(target);
    setUrl(target);
    setPageTitle('');
  };

  const guardRequest = (request) => {
    const next = request.url;
    if (next === 'about:blank') return true;
    if (!/^https?:\/\//i.test(next)) return false;
    if (settings.preferHttps && /^http:\/\//i.test(next)) {
      if (request.isTopFrame !== false) {
        const upgraded = next.replace(/^http:\/\//i, 'https://');
        setAddress(upgraded);
        setUrl(upgraded);
      }
      return false;
    }
    return true;
  };

  const loadApiBibles = async () => {
    const key = (settings.bibleKey || '').trim();
    if (!key) {
      Alert.alert('Add your API.Bible key first', 'Paste the key from your free API.Bible account into the box above.');
      return;
    }
    try {
      const res = await fetch('https://api.scripture.api.bible/v1/bibles?language=eng', { headers: { 'api-key': key } });
      if (!res.ok) throw new Error('bad status');
      const json = await res.json();
      const list = (json.data || [])
        .map((bible) => ({ id: 'api:' + bible.id, label: bible.abbreviationLocal || bible.abbreviation || bible.name }))
        .slice(0, 60);
      setApiBibles(list);
      await AsyncStorage.setItem(BIBLES_KEY, JSON.stringify(list));
      Alert.alert('Versions loaded', list.length + ' versions are available with your key.');
    } catch (_) {
      Alert.alert('Could not load versions', 'Check your API.Bible key and your connection.');
    }
  };

  const clearApiBibles = async () => {
    setApiBibles([]);
    try { await AsyncStorage.removeItem(BIBLES_KEY); } catch (_) {}
    if (String(settings.verseTranslation).indexOf('api:') === 0) updateSetting('verseTranslation', 'web');
  };

  const goHome = () => {
    setUrl(null);
    setAddress('');
    setPageTitle('');
    setLoading(false);
  };

  const openBookmarkEditor = (bookmark = null) => {
    setEditingId(bookmark ? bookmark.id : null);
    setBookmarkName(bookmark ? bookmark.name : (pageTitle || 'Saved page'));
    setBookmarkUrl(bookmark ? bookmark.url : (url || ''));
    setBookmarksVisible(false);
    setEditorVisible(true);
  };

  const saveBookmark = async () => {
    const target = makeTarget(bookmarkUrl, settings.searchEngine, settings.preferHttps);
    const name = bookmarkName.trim();
    if (!name || !target) {
      Alert.alert('Add a name and web address', 'Both fields are needed to save a page.');
      return;
    }
    const item = { id: editingId || String(Date.now()), name, url: target };
    const next = editingId
      ? bookmarks.map((bookmark) => bookmark.id === editingId ? item : bookmark)
      : [item, ...bookmarks];
    await updateBookmarks(next);
    setEditorVisible(false);
  };

  const deleteBookmark = (bookmark) => {
    Alert.alert('Remove saved page?', '“' + bookmark.name + '” will be removed from Lantern.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await updateBookmarks(bookmarks.filter((item) => item.id !== bookmark.id));
          setEditorVisible(false);
        },
      },
    ]);
  };

  const openSavedPage = (bookmark) => {
    setBookmarksVisible(false);
    setAddress(bookmark.url);
    setUrl(bookmark.url);
    setPageTitle(bookmark.name);
  };

  const chooseBackground = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Allow Lantern to choose a photo for your home background.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        base64: true,
        quality: 0.4,
      });
      const image = result.assets && result.assets[0];
      if (!result.canceled && image?.base64) {
        const data = 'data:image/jpeg;base64,' + image.base64;
        if (data.length > MAX_BACKGROUND_CHARS) {
          Alert.alert('That photo is too large', 'Choose a smaller photo or crop it more tightly.');
          return;
        }
        await saveBackground(data);
      }
    } catch (_) {
      Alert.alert('Could not set background', 'Please choose another photo and try again.');
    }
  };

  const clearBrowserData = () => {
    const message = Platform.OS === 'android'
      ? 'This clears cached website files and the current browser history. Your saved pages stay in Lantern.'
      : 'This closes the current page and its history. To avoid keeping cookies and site data on iPhone, turn on Private browsing. Your saved pages stay in Lantern.';
    Alert.alert('Clear browsing history?', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          const view = web.current;
          if (view && typeof view.clearCache === 'function') view.clearCache(true);
          if (view && typeof view.clearHistory === 'function') view.clearHistory();
          setWebKey((key) => key + 1);
          setAddress('');
          setUrl(null);
        },
      },
    ]);
  };

  const renderHome = () => (
    <ScrollView style={styles.homeScroll} contentContainerStyle={styles.homeContent} keyboardShouldPersistTaps="handled">
      <View style={styles.welcomeBlock}>
        <Text style={styles.eyebrow}>YOUR SPACE ON THE WEB</Text>
        <Text style={styles.welcomeTitle}>A little light{ '\n' }for the way ahead.</Text>
        <Text style={styles.welcomeBody}>Search, read, and explore at your own pace.</Text>
      </View>

      {settings.showDailyVerse && (
        <View style={styles.verseCard}>
          <View style={styles.verseTopline}>
            <View style={styles.verseLabelWrap}>
              <Text style={styles.verseSpark}>✦</Text>
              <Text style={styles.verseLabel}>TODAY’S VERSE</Text>
            </View>
            <Text style={styles.verseReference}>{dailyVerse.reference.toUpperCase()} · {verseVersion}</Text>
          </View>
          <Text style={styles.verseText}>{verseText}</Text>
          {verseNote ? <Text style={styles.verseNote}>{verseNote}</Text> : null}
          <Pressable
            onPress={() => navigate('https://www.biblegateway.com/passage/?search=' + encodeURIComponent(dailyVerse.reference) + (linkVersion ? '&version=' + linkVersion : ''))}
            style={({ pressed }) => [styles.verseSourceButton, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={'Read ' + dailyVerse.reference + ' in ' + trLabel + ' on BibleGateway'}
          >
            <Text style={styles.verseSourceText}>Read in {trLabel} on BibleGateway ↗</Text>
          </Pressable>
        </View>
      )}

      {QUICK_LINKS.some((item) => settings.quickPaths && settings.quickPaths[item.title]) && (
        <>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Quick paths</Text>
            <Text style={styles.sectionHint}>A few good places to begin</Text>
          </View>
          <View style={styles.quickGrid}>
            {QUICK_LINKS.filter((item) => settings.quickPaths && settings.quickPaths[item.title]).map((item) => (
              <Pressable key={item.title} onPress={() => navigate(item.url)} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
                <View style={[styles.quickMark, { backgroundColor: item.color + '24' }]}>
                  <Text style={[styles.quickMarkText, { color: item.color }]}>{item.mark}</Text>
                </View>
                <View style={styles.quickCopy}>
                  <Text style={styles.quickTitle}>{item.title}</Text>
                  <Text style={styles.quickSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.quickArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Your bookmarks</Text>
        <View style={styles.homeBookmarkActions}>
          <Pressable onPress={() => openBookmarkEditor()}><Text style={styles.seeAll}>＋ Add</Text></Pressable>
          <Pressable onPress={() => setBookmarksVisible(true)}><Text style={styles.seeAll}>Manage</Text></Pressable>
        </View>
      </View>
      {bookmarks.length === 0 && (
        <Pressable onPress={() => openBookmarkEditor()} style={styles.bookmarkEmptyHome}>
          <Text style={styles.bookmarkEmptyText}>＋ Add a bookmark to your start page</Text>
        </Pressable>
      )}
      {bookmarks.map((item) => (
        <Pressable key={item.id} onPress={() => openSavedPage(item)} style={styles.savedHomeRow}>
          <Text style={styles.savedHomeMark}>↗</Text>
          <View style={styles.savedHomeCopy}>
            <Text numberOfLines={1} style={styles.savedHomeTitle}>{item.name}</Text>
            <Text numberOfLines={1} style={styles.savedHomeUrl}>{item.url.replace(/^https?:\/\//, '')}</Text>
          </View>
          <Text style={styles.quickArrow}>›</Text>
        </Pressable>
      ))}
      <Text style={styles.footerNote}>SEARCH POWERED BY {settings.searchEngine.toUpperCase()}</Text>
    </ScrollView>
  );

  return (
    <ImageBackground
      source={background ? { uri: background } : undefined}
      style={styles.root}
      imageStyle={styles.backgroundImageStyle}
      resizeMode="cover"
    >
    <SafeAreaView style={[styles.safeRoot, Platform.OS === 'android' && { paddingTop: NativeStatusBar.currentHeight || 0 }]}>
      <NativeStatusBar barStyle="light-content" backgroundColor="#0b1220" />
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('./assets/icon.png')} style={styles.brandIcon} />
          <View>
            <Text style={styles.brandName}>Lantern</Text>
            <Text style={styles.brandTagline}>Browse with a little more calm</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setBookmarksVisible(true)} style={styles.headerAction}>
            <Text style={styles.headerActionGlyph}>▤</Text>
            <Text style={styles.headerActionText}>Saved</Text>
          </Pressable>
          <Pressable onPress={() => setSettingsVisible(true)} style={styles.headerAction}>
            <Text style={styles.headerActionGlyph}>⚙</Text>
            <Text style={styles.headerActionText}>Settings</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={address}
          onChangeText={setAddress}
          onSubmitEditing={() => navigate()}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={Platform.OS === 'ios' ? 'web-search' : 'default'}
          returnKeyType="search"
          selectTextOnFocus
          placeholder="Search or try !w / !yt"
          placeholderTextColor="#8995aa"
          style={styles.addressInput}
          accessibilityLabel="Search or enter a website"
        />
        <Pressable onPress={() => navigate()} style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}>
          <Text style={styles.searchButtonText}>Go</Text>
        </Pressable>
      </View>

      <View style={styles.navRow}>
        <IconButton label="Go back" glyph="‹" onPress={() => web.current?.goBack()} secondary />
        <IconButton label="Go forward" glyph="›" onPress={() => web.current?.goForward()} secondary />
        <IconButton label="Home" glyph="⌂" onPress={goHome} secondary />
        {url ? (
          <Pressable onPress={() => openBookmarkEditor()} style={({ pressed }) => [styles.saveCurrentButton, pressed && styles.pressed]}>
            <Text style={styles.saveCurrentGlyph}>＋</Text>
            <Text style={styles.saveCurrentText}>Save page</Text>
          </Pressable>
        ) : (
          <View style={styles.searchHint}><Text style={styles.searchHintText}>Search with {settings.searchEngine}</Text></View>
        )}
      </View>

      {loading && <ActivityIndicator color="#e5ad62" style={styles.progress} />}
      {url ? (
        <WebView
          key={webKey + (settings.privateBrowsing ? '-p' : '-n')}
          ref={web}
          source={{ uri: url }}
          incognito={settings.privateBrowsing}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(state) => {
            if (state.url) setAddress(state.url);
            if (state.title) setPageTitle(state.title);
          }}
          onShouldStartLoadWithRequest={guardRequest}
          javaScriptEnabled={settings.javaScriptEnabled}
          domStorageEnabled
          javaScriptCanOpenWindowsAutomatically={settings.allowPopups}
          setSupportMultipleWindows={settings.allowPopups}
          allowFileAccess={false}
          allowUniversalAccessFromFileURLs={false}
          mixedContentMode={settings.preferHttps ? 'never' : 'compatibility'}
          thirdPartyCookiesEnabled={false}
          sharedCookiesEnabled={false}
          allowsBackForwardNavigationGestures
          style={styles.web}
        />
      ) : renderHome()}

      <Modal visible={bookmarksVisible} animationType="slide" transparent onRequestClose={() => setBookmarksVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBookmarksVisible(false)} accessibilityLabel="Close saved pages" />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Saved pages</Text>
                <Text style={styles.sheetSubtitle}>Keep your favorite places close.</Text>
              </View>
              <IconButton label="Close saved pages" glyph="×" onPress={() => setBookmarksVisible(false)} secondary />
            </View>
            <Pressable onPress={() => openBookmarkEditor()} style={({ pressed }) => [styles.addBookmarkButton, pressed && styles.pressed]}>
              <Text style={styles.addBookmarkGlyph}>＋</Text>
              <Text style={styles.addBookmarkText}>Add a saved page</Text>
            </Pressable>
            <ScrollView style={styles.listScroll} keyboardShouldPersistTaps="handled">
              {bookmarks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyGlyph}>✦</Text>
                  <Text style={styles.emptyTitle}>Nothing saved yet</Text>
                  <Text style={styles.emptyText}>Save the page you’re on, or add a web address to get started.</Text>
                </View>
              ) : bookmarks.map((item, index) => (
                <View key={item.id} style={styles.bookmarkRow}>
                  <Pressable onPress={() => openSavedPage(item)} style={styles.bookmarkMain}>
                    <Text style={styles.bookmarkMark}>↗</Text>
                    <View style={styles.bookmarkCopy}>
                      <Text numberOfLines={1} style={styles.bookmarkTitle}>{item.name}</Text>
                      <Text numberOfLines={1} style={styles.bookmarkUrl}>{item.url.replace(/^https?:\/\//, '')}</Text>
                    </View>
                  </Pressable>
                  <View style={styles.bookmarkOrderActions}>
                    <Pressable onPress={() => moveBookmark(index, -1)} style={styles.orderButton} accessibilityLabel={'Move ' + item.name + ' up'}>
                      <Text style={styles.orderButtonText}>↑</Text>
                    </Pressable>
                    <Pressable onPress={() => moveBookmark(index, 1)} style={styles.orderButton} accessibilityLabel={'Move ' + item.name + ' down'}>
                      <Text style={styles.orderButtonText}>↓</Text>
                    </Pressable>
                    <Pressable onPress={() => openBookmarkEditor(item)} style={styles.editButton} accessibilityRole="button" accessibilityLabel={'Edit ' + item.name}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.sheetFootnote}>You can edit the title and address any time.</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={editorVisible} animationType="slide" transparent onRequestClose={() => setEditorVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditorVisible(false)} accessibilityLabel="Close bookmark editor" />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetKeyboard}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>{editingId ? 'Edit saved page' : 'Add saved page'}</Text>
                  <Text style={styles.sheetSubtitle}>Give this place a name you’ll remember.</Text>
                </View>
                <IconButton label="Close editor" glyph="×" onPress={() => setEditorVisible(false)} secondary />
              </View>
              <Text style={styles.fieldLabel}>NAME</Text>
              <TextInput value={bookmarkName} onChangeText={setBookmarkName} placeholder="My favorite site" placeholderTextColor="#7e8ba1" style={styles.fieldInput} />
              <Text style={styles.fieldLabel}>WEB ADDRESS</Text>
              <TextInput value={bookmarkUrl} onChangeText={setBookmarkUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://example.com" placeholderTextColor="#7e8ba1" style={styles.fieldInput} />
              <Pressable onPress={saveBookmark} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>{editingId ? 'Save changes' : 'Save page'}</Text>
              </Pressable>
              {editingId && (
                <Pressable onPress={() => deleteBookmark({ id: editingId, name: bookmarkName })} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Remove saved page</Text>
                </Pressable>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={settingsVisible} animationType="slide" transparent onRequestClose={() => setSettingsVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSettingsVisible(false)} accessibilityLabel="Close settings" />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Settings & safety</Text>
                <Text style={styles.sheetSubtitle}>Your browser, your comfort.</Text>
              </View>
              <IconButton label="Close settings" glyph="×" onPress={() => setSettingsVisible(false)} secondary />
            </View>
            <ScrollView style={styles.settingsScroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.settingsSectionTitle}>Home screen</Text>
              <Text style={styles.settingsIntro}>Choose what appears when Lantern opens.</Text>
              <View style={styles.settingsCard}>
                <SettingRow
                  title="Daily Bible verse"
                  detail="Show or hide the verse on your Lantern home screen."
                  value={settings.showDailyVerse}
                  onValueChange={(value) => updateSetting('showDailyVerse', value)}
                />
              </View>

              <Text style={styles.settingsSectionTitle}>Quick paths</Text>
              <Text style={styles.settingsIntro}>Turn each shortcut on or off. All are hidden by default.</Text>
              <View style={styles.settingsCard}>
                {QUICK_LINKS.map((item, index) => (
                  <React.Fragment key={item.title}>
                    {index > 0 && <View style={styles.settingDivider} />}
                    <SettingRow
                      title={item.title}
                      detail={'Show ' + item.title + ' on the Lantern home screen.'}
                      value={!!(settings.quickPaths && settings.quickPaths[item.title])}
                      onValueChange={(value) => updateSetting('quickPaths', { ...(settings.quickPaths || DEFAULT_SETTINGS.quickPaths), [item.title]: value })}
                    />
                  </React.Fragment>
                ))}
              </View>

              <Text style={styles.settingsSectionTitle}>Home background</Text>
              <Text style={styles.settingsIntro}>Choose a photo from your library for Lantern’s home screen.</Text>
              <View style={styles.backgroundActions}>
                <Pressable onPress={chooseBackground} style={({ pressed }) => [styles.backgroundAction, pressed && styles.pressed]}>
                  <Text style={styles.backgroundActionText}>Choose photo</Text>
                </Pressable>
                <Pressable onPress={() => saveBackground(null)} style={({ pressed }) => [styles.backgroundAction, pressed && styles.pressed]}>
                  <Text style={styles.backgroundActionText}>Reset</Text>
                </Pressable>
              </View>

              <Text style={styles.settingsSectionTitle}>Bible translation</Text>
              <Text style={styles.settingsIntro}>The verse on your home screen changes to the translation you pick. These are public-domain texts that load from bible-api.com. KJV and WEB also work offline.</Text>
              <View style={styles.transWrap}>
                {[...TRANSLATIONS, ...apiBibles].map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => updateSetting('verseTranslation', item.id)}
                    style={[styles.transOption, settings.verseTranslation === item.id && styles.engineOptionSelected]}
                  >
                    <Text style={[styles.engineOptionText, settings.verseTranslation === item.id && styles.engineOptionTextSelected]}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.settingsIntro}>Licensed versions such as NIV, NASB and ESV can’t be bundled in an app. If you have a free API.Bible key, paste it here to load the versions your key is licensed for.</Text>
              <TextInput
                value={settings.bibleKey}
                onChangeText={(value) => updateSetting('bibleKey', value.trim())}
                placeholder="API.Bible key (optional)"
                placeholderTextColor="#7e8ba1"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.fieldInput}
              />
              <View style={[styles.backgroundActions, { marginTop: 10 }]}>
                <Pressable onPress={loadApiBibles} style={({ pressed }) => [styles.backgroundAction, pressed && styles.pressed]}>
                  <Text style={styles.backgroundActionText}>Load my versions</Text>
                </Pressable>
                <Pressable onPress={clearApiBibles} style={({ pressed }) => [styles.backgroundAction, pressed && styles.pressed]}>
                  <Text style={styles.backgroundActionText}>Remove versions</Text>
                </Pressable>
              </View>

              <Text style={styles.settingsSectionTitle}>Search</Text>
              <Text style={styles.settingsIntro}>Choose where Lantern sends search terms. Bang shortcuts like !w and !yt use DuckDuckGo.</Text>
              <View style={styles.engineOptions}>
                {Object.keys(SEARCH_ENGINES).map((engine) => (
                  <Pressable
                    key={engine}
                    onPress={() => updateSetting('searchEngine', engine)}
                    style={[styles.engineOption, settings.searchEngine === engine && styles.engineOptionSelected]}
                  >
                    <Text style={[styles.engineOptionText, settings.searchEngine === engine && styles.engineOptionTextSelected]}>{engine}</Text>
                    {settings.searchEngine === engine && <Text style={styles.engineCheck}>✓</Text>}
                  </Pressable>
                ))}
              </View>

              <Text style={styles.settingsSectionTitle}>Security</Text>
              <View style={styles.settingsCard}>
                <SettingRow title="Prefer secure connections" detail="Upgrade http links to https, including links you tap, and block insecure mixed content." value={settings.preferHttps} onValueChange={(value) => updateSetting('preferHttps', value)} />
                <View style={styles.settingDivider} />
                <SettingRow title="JavaScript" detail="Many sites need this to work. Turn it off for a stricter, simpler session." value={settings.javaScriptEnabled} onValueChange={(value) => updateSetting('javaScriptEnabled', value)} />
                <View style={styles.settingDivider} />
                <SettingRow title="Allow pop-up windows" detail="Keep pop-ups blocked unless a site you trust needs them." value={settings.allowPopups} onValueChange={(value) => updateSetting('allowPopups', value)} />
                <View style={styles.settingDivider} />
                <SettingRow title="Private browsing" detail="Don’t keep cookies or site data after you close Lantern." value={settings.privateBrowsing} onValueChange={(value) => updateSetting('privateBrowsing', value)} />
              </View>

              <View style={styles.privacyNote}>
                <Text style={styles.privacyNoteMark}>✦</Text>
                <View style={styles.privacyNoteCopy}>
                  <Text style={styles.privacyNoteTitle}>Built for a little more privacy</Text>
                  <Text style={styles.privacyNoteBody}>
                    {Platform.OS === 'android'
                      ? 'Lantern blocks local-file access and third-party cookies. Search stays with your selected provider.'
                      : 'Lantern blocks local-file access. On iPhone, turn on Private browsing to avoid keeping cookies and site data. Search stays with your selected provider.'}
                  </Text>
                </View>
              </View>

              <Text style={styles.settingsSectionTitle}>Browsing data</Text>
              <Text style={styles.settingsIntro}>
                {Platform.OS === 'android'
                  ? 'Clear cached site files and the current browser history. Saved pages are kept.'
                  : 'Close the current page and clear its history. Saved pages are kept.'}
              </Text>
              <Pressable onPress={clearBrowserData} style={({ pressed }) => [styles.clearDataButton, pressed && styles.pressed]}>
                <Text style={styles.clearDataGlyph}>⌫</Text>
                <Text style={styles.clearDataText}>{Platform.OS === 'android' ? 'Clear cache and history' : 'Clear history'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1220' },
  backgroundImageStyle: { opacity: 0.28 },
  safeRoot: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  brandIcon: { width: 42, height: 42, borderRadius: 12 },
  brandName: { color: '#f7f4ee', fontSize: 21, fontWeight: '800', letterSpacing: 0.2 },
  brandTagline: { color: '#8995aa', fontSize: 12, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerAction: { alignItems: 'center', justifyContent: 'center', minWidth: 48, paddingHorizontal: 5, paddingVertical: 4 },
  headerActionGlyph: { color: '#e6b366', fontSize: 19, height: 22 },
  headerActionText: { color: '#bac4d5', fontSize: 11, fontWeight: '600' },
  searchRow: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#172238', borderColor: '#293752', borderWidth: 1, borderRadius: 16, padding: 5, gap: 5, alignItems: 'center' },
  addressInput: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 11, color: '#f3f5f8', fontSize: 15 },
  searchButton: { backgroundColor: '#e6ad60', borderRadius: 12, paddingHorizontal: 17, paddingVertical: 11, minWidth: 58, alignItems: 'center' },
  searchButtonText: { color: '#192235', fontWeight: '800', fontSize: 14 },
  navRow: { minHeight: 50, paddingHorizontal: 18, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#e4ac5e', alignItems: 'center', justifyContent: 'center' },
  iconButtonSecondary: { backgroundColor: '#172238', borderWidth: 1, borderColor: '#293752' },
  iconGlyph: { color: '#172238', fontSize: 25, lineHeight: 29, fontWeight: '500' },
  iconGlyphSecondary: { color: '#e4ac5e' },
  saveCurrentButton: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#394862', borderRadius: 13, paddingHorizontal: 12, paddingVertical: 9, gap: 5 },
  saveCurrentGlyph: { color: '#e4ac5e', fontSize: 18, lineHeight: 20 },
  saveCurrentText: { color: '#dbe2ed', fontSize: 13, fontWeight: '700' },
  searchHint: { flex: 1, alignItems: 'flex-end', paddingRight: 1 },
  searchHintText: { color: '#8190a8', fontSize: 12 },
  progress: { height: 3 },
  homeScroll: { flex: 1 },
  homeContent: { paddingHorizontal: 18, paddingBottom: 30 },
  welcomeBlock: { paddingTop: 14, paddingBottom: 16 },
  eyebrow: { color: '#e7b366', fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 9 },
  welcomeTitle: { color: '#f7f4ee', fontSize: 31, fontWeight: '700', letterSpacing: -0.7, lineHeight: 37 },
  welcomeBody: { color: '#9aa7bb', fontSize: 14, marginTop: 8 },
  verseCard: { backgroundColor: '#172238', borderColor: '#293752', borderWidth: 1, borderRadius: 20, padding: 13, marginTop: 2 },
  verseTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, paddingBottom: 9 },
  verseLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verseSpark: { color: '#e8b76d', fontSize: 15 },
  verseLabel: { color: '#f4e7cf', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  verseReference: { color: '#e8b76d', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  verseText: { color: '#f4f0e7', fontSize: 15, lineHeight: 22, paddingHorizontal: 5, paddingVertical: 8 },
  verseSourceButton: { alignSelf: 'flex-start', marginTop: 5, paddingHorizontal: 5, paddingVertical: 6 },
  verseSourceText: { color: '#e8b76d', fontSize: 13, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 21, marginBottom: 10 },
  sectionTitle: { color: '#f2f3f5', fontSize: 16, fontWeight: '700' },
  sectionHint: { color: '#8190a8', fontSize: 12 },
  seeAll: { color: '#e8b76d', fontWeight: '700', fontSize: 13 },
  homeBookmarkActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookmarkEmptyHome: { borderWidth: 1, borderColor: '#293752', borderStyle: 'dashed', borderRadius: 14, padding: 14, marginBottom: 8 },
  bookmarkEmptyText: { color: '#aab6c9', fontSize: 12, textAlign: 'center' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quickCard: { width: '48%', minHeight: 72, flexDirection: 'row', alignItems: 'center', backgroundColor: '#121c2f', borderWidth: 1, borderColor: '#202d43', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 9, gap: 8 },
  quickMark: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  quickMarkText: { fontWeight: '800', fontSize: 16 },
  quickCopy: { flex: 1, minWidth: 0 },
  quickTitle: { color: '#e9edf4', fontSize: 13, fontWeight: '700' },
  quickSubtitle: { color: '#7f8ca2', fontSize: 12, marginTop: 3 },
  quickArrow: { color: '#75849d', fontSize: 19 },
  savedHomeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 13, padding: 10, marginBottom: 7, backgroundColor: '#121c2f' },
  savedHomeMark: { width: 30, height: 30, borderRadius: 10, textAlign: 'center', textAlignVertical: 'center', color: '#e8b76d', backgroundColor: '#26334b', overflow: 'hidden', fontSize: 16 },
  savedHomeCopy: { flex: 1 },
  savedHomeTitle: { color: '#e8edf5', fontSize: 13, fontWeight: '700' },
  savedHomeUrl: { color: '#8090a6', fontSize: 12, marginTop: 2 },
  footerNote: { color: '#64738a', fontSize: 11, letterSpacing: 1.1, textAlign: 'center', marginTop: 20 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(3,8,17,0.7)', justifyContent: 'flex-end' },
  sheetKeyboard: { width: '100%' },
  sheet: { backgroundColor: '#111b2c', borderColor: '#28364d', borderWidth: 1, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 20, paddingTop: 11, paddingBottom: 28, maxHeight: '88%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#43516a', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  sheetTitle: { color: '#f5f4f0', fontSize: 21, fontWeight: '700' },
  sheetSubtitle: { color: '#93a0b5', fontSize: 12, marginTop: 4 },
  addBookmarkButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 13, backgroundColor: '#26354d', padding: 13, marginBottom: 10 },
  addBookmarkGlyph: { color: '#e8b76d', fontSize: 20, lineHeight: 22 },
  addBookmarkText: { color: '#f0e9dd', fontSize: 13, fontWeight: '700' },
  listScroll: { flexGrow: 0, maxHeight: 380 },
  bookmarkRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#263248', paddingVertical: 11 },
  bookmarkMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bookmarkMark: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#202d43', color: '#e8b76d', textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden', fontSize: 16 },
  bookmarkCopy: { flex: 1, minWidth: 0 },
  bookmarkTitle: { color: '#edf0f4', fontSize: 13, fontWeight: '700' },
  bookmarkUrl: { color: '#8795aa', fontSize: 12, marginTop: 3 },
  bookmarkOrderActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  orderButton: { minWidth: 28, minHeight: 34, alignItems: 'center', justifyContent: 'center' },
  orderButtonText: { color: '#aab6c9', fontSize: 16, fontWeight: '700' },
  editButton: { paddingVertical: 8, paddingHorizontal: 9 },
  editButtonText: { color: '#e8b76d', fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 34 },
  emptyGlyph: { color: '#e8b76d', fontSize: 26, marginBottom: 7 },
  emptyTitle: { color: '#edf0f4', fontSize: 15, fontWeight: '700' },
  emptyText: { color: '#93a0b5', fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  sheetFootnote: { color: '#708099', fontSize: 12, textAlign: 'center', marginTop: 11 },
  fieldLabel: { color: '#9eabc0', fontSize: 11, letterSpacing: 1.1, fontWeight: '800', marginTop: 8, marginBottom: 7 },
  fieldInput: { backgroundColor: '#172238', color: '#f2f4f7', borderColor: '#30405a', borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 13, fontSize: 14 },
  primaryButton: { marginTop: 18, backgroundColor: '#e6ad60', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#1a2435', fontSize: 14, fontWeight: '800' },
  removeButton: { alignItems: 'center', paddingVertical: 14 },
  removeButtonText: { color: '#e58c87', fontSize: 13, fontWeight: '700' },
  settingsScroll: { flexGrow: 0, maxHeight: 580 },
  settingsSectionTitle: { color: '#e8b76d', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 7, marginBottom: 7 },
  settingsIntro: { color: '#92a0b6', fontSize: 12, lineHeight: 18, marginBottom: 10 },
  backgroundActions: { flexDirection: 'row', gap: 8, marginBottom: 17 },
  backgroundAction: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#172238', borderColor: '#293752', borderWidth: 1 },
  backgroundActionText: { color: '#e8edf4', fontSize: 13, fontWeight: '700' },
  engineOptions: { flexDirection: 'row', gap: 7, marginBottom: 17 },
  engineOption: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#172238', borderColor: '#293752', borderWidth: 1, paddingHorizontal: 4, gap: 4 },
  engineOptionSelected: { borderColor: '#e6ad60', backgroundColor: '#392f28' },
  engineOptionText: { color: '#9ba8bc', fontSize: 12, fontWeight: '700' },
  engineOptionTextSelected: { color: '#ffe3b1' },
  transWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 17 },
  transOption: { minHeight: 38, justifyContent: 'center', borderRadius: 12, backgroundColor: '#172238', borderColor: '#293752', borderWidth: 1, paddingHorizontal: 12 },
  verseNote: { color: '#8190a8', fontSize: 12, paddingHorizontal: 5, paddingBottom: 4 },
  engineCheck: { color: '#e6ad60', fontSize: 12, fontWeight: '800' },
  settingsCard: { backgroundColor: '#172238', borderColor: '#293752', borderWidth: 1, borderRadius: 16, paddingHorizontal: 13, marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingVertical: 10, gap: 10 },
  settingCopy: { flex: 1 },
  settingTitle: { color: '#e7ebf1', fontSize: 14, fontWeight: '700' },
  settingDetail: { color: '#8694aa', fontSize: 12, lineHeight: 17, marginTop: 4 },
  settingDivider: { height: 1, backgroundColor: '#2b3850' },
  privacyNote: { flexDirection: 'row', gap: 11, backgroundColor: '#142b2e', borderColor: '#244849', borderWidth: 1, borderRadius: 15, padding: 13, marginBottom: 17 },
  privacyNoteMark: { color: '#80c4a5', fontSize: 18 },
  privacyNoteCopy: { flex: 1 },
  privacyNoteTitle: { color: '#d9f0e4', fontSize: 13, fontWeight: '700' },
  privacyNoteBody: { color: '#98b9aa', fontSize: 12, lineHeight: 18, marginTop: 4 },
  clearDataButton: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 13, borderColor: '#553b43', borderWidth: 1, backgroundColor: '#2b202b', padding: 13, marginBottom: 12 },
  clearDataGlyph: { color: '#e58c87', fontSize: 16 },
  clearDataText: { color: '#ecc4bf', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.72 },
  web: { flex: 1, backgroundColor: '#ffffff' },
});
