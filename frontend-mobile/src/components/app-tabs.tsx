import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import JoinAuctionBar from './JoinAuctionBar';

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

function CustomTabBar({ state, descriptors, navigation }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const activeColor = isDark ? '#FFFFFF' : '#051C2C';
  const inactiveColor = isDark ? '#8A9EAD' : '#7A7A7A';
  const backgroundColor = isDark ? '#0F212E' : '#FFFFFF';
  const borderColor = isDark ? '#1C3141' : '#ECECEC';

  const activeRoute = state.routes[state.index];
  const isAuctionDetail = activeRoute && activeRoute.name === 'auction/[id]';

  if (isAuctionDetail) {
    const auctionId = activeRoute.params?.id || '1';
    return (
      <JoinAuctionBar
        auctionId={auctionId}
        onBack={() => router.back()}
      />
    );
  }

  // Hide the bottom tab bar completely for all other auction screens (catalog, bidding, history)
  if (activeRoute && activeRoute.name.startsWith('auction')) {
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

        if (route.name.startsWith('auction') || ['_layout', '+not-found'].includes(route.name)) {
          return null;
        }

        const isFocused = state.index === index;

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
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 8,
  },
  iconContainer: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 11,
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
