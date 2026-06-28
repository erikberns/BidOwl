// Define la barra de navegacion principal para dispositivos moviles.
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Descubrir' }} />
      <Tabs.Screen name="publish" options={{ title: 'Publicar' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="inspection-result" options={{ href: null }} />
    </Tabs>
  );
}

// Fallback Unicode icons for Android/Web where SF Symbols are not natively available
const WEB_ICONS: Record<string, string> = {
  index: '🏠',
  explore: '🧭',
  publish: '＋',
  inbox: '✉️',
  profile: '👤',
};

const TAB_ICONS: Record<string, { active: any; inactive: any }> = {
  index: {
    active: require('../../assets/images/homeActivado.png'),
    inactive: require('../../assets/images/homeNoActivado.png'),
  },
  explore: {
    active: require('../../assets/images/descubrirActivado.png'),
    inactive: require('../../assets/images/descubrirNoActivado.png'),
  },
  inbox: {
    active: require('../../assets/images/inboxActivado.png'),
    inactive: require('../../assets/images/InboxNoActivado.png'),
  },
  profile: {
    active: require('../../assets/images/perfilActivado.png'),
    inactive: require('../../assets/images/perfilNoActivado.png'),
  },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isGuest, setIsGuest] = React.useState<boolean>(true);

  const activeColor = '#051C2C';
  const inactiveColor = '#7A7A7A';
  const backgroundColor = '#FFFFFF';
  const borderColor = '#ECECEC';

  const activeRoute = state.routes[state.index];
  const activeDescriptor = descriptors[activeRoute?.key];
  const activeOptions = activeDescriptor?.options;

  React.useEffect(() => {
    async function loadGuest() {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const isGuestStr = await AsyncStorage.getItem('isGuest');
        setIsGuest((isGuestStr === 'true' || isGuestStr === null) && !userStr);
      } catch {
        setIsGuest(true);
      }
    }
    loadGuest();
  }, [state.index]);

  if (activeOptions?.tabBarStyle?.display === 'none') {
    return null;
  }

  // Hide the bottom tab bar completely for all other auction screens (catalog, bidding, history)
  if (activeRoute && (activeRoute.name.startsWith('auction') || activeRoute.name.includes('inspection-result'))) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        borderTopColor: borderColor,
        paddingBottom: Math.max(insets.bottom, 8)
      }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;

        if (options.href === null || route.name.startsWith('auction') || ['_layout', '+not-found'].includes(route.name) || route.name.includes('inspection-result')) {
          return null;
        }

        if (route.name === 'publish' && isGuest) {
          return null;
        }

        const isFocused = state.index === index;
        const iconSource = TAB_ICONS[route.name]?.[isFocused ? 'active' : 'inactive'];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Determine symbol name based on route and focus state
        let symbolOptions = { ios: 'questionmark', android: 'help' };
        if (route.name === 'index') {
          symbolOptions = { ios: isFocused ? 'house.fill' : 'house', android: 'home' };
        } else if (route.name === 'explore') {
          symbolOptions = { ios: isFocused ? 'safari.fill' : 'safari', android: 'explore' };
        } else if (route.name === 'publish') {
          symbolOptions = { ios: 'plus', android: 'add' };
        } else if (route.name === 'inbox') {
          symbolOptions = { ios: isFocused ? 'envelope.fill' : 'envelope', android: 'mail' };
        } else if (route.name === 'profile') {
          symbolOptions = { ios: isFocused ? 'person.fill' : 'person', android: 'person' };
        }

        const fallbackChar = WEB_ICONS[route.name] || '?';

        if (route.name === 'publish') {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.publishButtonOuter}
              activeOpacity={0.8}
            >
              <View style={styles.publishCircle}>
                <SymbolView
                  // @ts-ignore
                  name={symbolOptions}
                  tintColor="#FFFFFF"
                  size={24}
                  fallback={
                    <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>{fallbackChar}</Text>
                  }
                />
              </View>
              <Text style={[styles.labelText, { color: inactiveColor }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {iconSource ? (
                <Image
                  source={iconSource}
                  style={styles.tabIconImage}
                  resizeMode="contain"
                />
              ) : (
                <SymbolView
                  // @ts-ignore
                  name={symbolOptions}
                  tintColor={isFocused ? activeColor : inactiveColor}
                  size={22}
                  fallback={
                    <Text style={{
                      fontSize: 18,
                      color: isFocused ? activeColor : inactiveColor
                    }}>
                      {fallbackChar}
                    </Text>
                  }
                />
              )}
            </View>
            <Text style={[
              styles.labelText,
              {
                color: isFocused ? activeColor : inactiveColor,
                fontWeight: isFocused ? '600' : '400'
              }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 0,
  },
  iconContainer: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabIconImage: {
    width: 24,
    height: 24,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  publishButtonOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -24,
    paddingBottom: 8,
  },
  publishCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B5F639',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B5F639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 4,
  }
});
