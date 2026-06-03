import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  headerRight?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  containerStyle,
  headerRight,
  style,
  ...props
}) => {
  const hasError = !!error;

  return (
    <View style={[styles.outerContainer, containerStyle]}>
      <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
        <View style={styles.inputHeader}>
          <Text style={styles.inputLabel}>{label}</Text>
          {headerRight}
        </View>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#999"
          {...props}
        />
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputWrapperError: {
    borderColor: '#E30613',
    borderWidth: 1.5,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999',
  },
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
    margin: 0,
  },
  errorText: {
    color: '#E30613',
    fontSize: 14,
    marginTop: 6,
    paddingLeft: 4,
  },
});
