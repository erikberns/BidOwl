// Provee campos reutilizables para los formularios de medios de pago.
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export const PaymentLoadingContext = React.createContext({ isLoading: false, availablePaises: [] as any[] });

export const InputField = ({ label, placeholder, value, onChangeText, flex = 1, keyboardType, error, style, ...props }: any) => {
  const { isLoading } = React.useContext(PaymentLoadingContext);
  const hasError = !!error;
  return (
    <View style={{ flex, width: '100%' }}>
      <View style={[styles.inputContainer, hasError && styles.inputContainerError]}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={[styles.input, style]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#666"
          keyboardType={keyboardType}
          editable={!isLoading}
          {...props}
        />
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const CountryDropdownField = ({ label, value, onSelect, isOpen, setIsOpen, flex = 1, error }: any) => {
  const { isLoading, availablePaises } = React.useContext(PaymentLoadingContext);
  const hasError = !!error;
  return (
    <View style={{ flex, zIndex: isOpen ? 1000 : 1, overflow: 'visible', width: '100%' }}>
      <View style={[styles.inputContainer, hasError && styles.inputContainerError, { overflow: 'visible' }]}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
          style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
          onPress={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <Text style={{ fontSize: 16, color: '#000' }}>{value}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownMenu}>
            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150, backgroundColor: '#ffffff' }}>
              {availablePaises.map((item) => (
                <TouchableOpacity
                  key={item.numero}
                  style={[styles.dropdownItem, { backgroundColor: '#ffffff' }]}
                  onPress={() => {
                    onSelect(item.nombre);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const CurrencyDropdownField = ({ label, value, onSelect, isOpen, setIsOpen, options, flex = 1, error }: any) => {
  const { isLoading } = React.useContext(PaymentLoadingContext);
  const hasError = !!error;
  return (
    <View style={{ flex, zIndex: isOpen ? 1000 : 1, overflow: 'visible', width: '100%' }}>
      <View style={[styles.inputContainer, hasError && styles.inputContainerError, { overflow: 'visible' }]}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
          style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
          onPress={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <Text style={{ fontSize: 16, color: '#000' }}>{value}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownMenu}>
            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150, backgroundColor: '#ffffff' }}>
              {options.map((item: any) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.dropdownItem, { backgroundColor: '#ffffff' }]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  inputContainerError: {
    borderColor: '#E30613',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#E30613',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
    paddingLeft: 4,
  },
  inputLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
  },
  input: {
    fontSize: 16,
    color: '#222',
    padding: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 160,
    zIndex: 9999,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
});
