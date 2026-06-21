import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { InputField, CountryDropdownField, CurrencyDropdownField } from './FormFields';

interface CertifiedChequeFormProps {
  renderHeader: (title: string, onBackPress: () => void, isCloseIcon?: boolean) => React.ReactNode;
  onCancel: () => void;
  checkTitular: string;
  setCheckTitular: (val: string) => void;
  checkTitularError: string;
  setCheckTitularError: (val: string) => void;
  checkBanco: string;
  setCheckBanco: (val: string) => void;
  checkBancoError: string;
  setCheckBancoError: (val: string) => void;
  checkNumero: string;
  setCheckNumero: (val: string) => void;
  checkNumeroError: string;
  setCheckNumeroError: (val: string) => void;
  checkMonto: string;
  setCheckMonto: (val: string) => void;
  checkMontoError: string;
  setCheckMontoError: (val: string) => void;
  checkPais: string;
  setCheckPais: (val: string) => void;
  isCheckDropdownOpen: boolean;
  setIsCheckDropdownOpen: (val: boolean) => void;
  checkMoneda: string;
  setCheckMoneda: (val: string) => void;
  isCheckCurrencyDropdownOpen: boolean;
  setIsCheckCurrencyDropdownOpen: (val: boolean) => void;
  currencyOptions: any[];
  handleAddCheck: () => void;
  isLoading: boolean;
  renderFileUpload: (type: 'bank' | 'check') => React.ReactNode;
}

export const CertifiedChequeForm: React.FC<CertifiedChequeFormProps> = ({
  renderHeader,
  onCancel,
  checkTitular,
  setCheckTitular,
  checkTitularError,
  setCheckTitularError,
  checkBanco,
  setCheckBanco,
  checkBancoError,
  setCheckBancoError,
  checkNumero,
  setCheckNumero,
  checkNumeroError,
  setCheckNumeroError,
  checkMonto,
  setCheckMonto,
  checkMontoError,
  setCheckMontoError,
  checkPais,
  setCheckPais,
  isCheckDropdownOpen,
  setIsCheckDropdownOpen,
  checkMoneda,
  setCheckMoneda,
  isCheckCurrencyDropdownOpen,
  setIsCheckCurrencyDropdownOpen,
  currencyOptions,
  handleAddCheck,
  isLoading,
  renderFileUpload,
}) => {
  return (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', onCancel, true)}
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>Agregar Cheque Certificado.</Text>
        <InputField
          label="Titular"
          placeholder="Juan Pérez"
          value={checkTitular}
          onChangeText={(val: string) => {
            setCheckTitular(val);
            if (checkTitularError) setCheckTitularError('');
          }}
          error={checkTitularError}
        />
        <InputField
          label="Banco Emisor"
          placeholder="Banco Nación"
          value={checkBanco}
          onChangeText={(val: string) => {
            setCheckBanco(val);
            if (checkBancoError) setCheckBancoError('');
          }}
          error={checkBancoError}
        />
        <InputField
          label="Numero de Cheque"
          placeholder="00045821"
          value={checkNumero}
          onChangeText={(val: string) => {
            setCheckNumero(val);
            if (checkNumeroError) setCheckNumeroError('');
          }}
          error={checkNumeroError}
        />
        <InputField
          label="Monto Certificado"
          placeholder="1.500.000"
          value={checkMonto}
          onChangeText={(val: string) => {
            setCheckMonto(val);
            if (checkMontoError) setCheckMontoError('');
          }}
          keyboardType="numeric"
          error={checkMontoError}
        />
        <View style={[styles.row, { zIndex: isCheckDropdownOpen || isCheckCurrencyDropdownOpen ? 1000 : 1, position: 'relative' }]}> 
          <CountryDropdownField label="País" value={checkPais} onSelect={setCheckPais} isOpen={isCheckDropdownOpen} setIsOpen={setIsCheckDropdownOpen} />
          <View style={{ width: 15 }} />
          <CurrencyDropdownField
            label="Moneda"
            value={checkMoneda}
            onSelect={setCheckMoneda}
            isOpen={isCheckCurrencyDropdownOpen}
            setIsOpen={setIsCheckCurrencyDropdownOpen}
            options={currencyOptions}
          />
        </View>

        {renderFileUpload('check')}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAddCheck} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#001b2a" />
          ) : (
            <Text style={styles.acceptButtonText}>Aceptar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001b2a',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  acceptButton: {
    backgroundColor: '#bcf259',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  acceptButtonText: {
    color: '#001b2a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
