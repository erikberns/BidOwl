import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { InputField, CountryDropdownField, CurrencyDropdownField } from './FormFields';

interface BankAccountFormProps {
  renderHeader: (title: string, onBackPress: () => void, isCloseIcon?: boolean) => React.ReactNode;
  onCancel: () => void;
  bankTitular: string;
  setBankTitular: (val: string) => void;
  bankTitularError: string;
  setBankTitularError: (val: string) => void;
  bankBanco: string;
  setBankBanco: (val: string) => void;
  bankBancoError: string;
  setBankBancoError: (val: string) => void;
  bankPais: string;
  setBankPais: (val: string) => void;
  isBankDropdownOpen: boolean;
  setIsBankDropdownOpen: (val: boolean) => void;
  bankMoneda: string;
  setBankMoneda: (val: string) => void;
  isBankCurrencyDropdownOpen: boolean;
  setIsBankCurrencyDropdownOpen: (val: boolean) => void;
  bankNumeroCuenta: string;
  setBankNumeroCuenta: (val: string) => void;
  bankNumeroCuentaError: string;
  setBankNumeroCuentaError: (val: string) => void;
  bankCbuIban: string;
  setBankCbuIban: (val: string) => void;
  bankCbuIbanError: string;
  setBankCbuIbanError: (val: string) => void;
  bankTab: 'CBU' | 'IBAN';
  setBankTab: (val: 'CBU' | 'IBAN') => void;
  currencyOptions: any[];
  handleAddBank: () => void;
  isLoading: boolean;
}

export const BankAccountForm: React.FC<BankAccountFormProps> = ({
  renderHeader,
  onCancel,
  bankTitular,
  setBankTitular,
  bankTitularError,
  setBankTitularError,
  bankBanco,
  setBankBanco,
  bankBancoError,
  setBankBancoError,
  bankPais,
  setBankPais,
  isBankDropdownOpen,
  setIsBankDropdownOpen,
  bankMoneda,
  setBankMoneda,
  isBankCurrencyDropdownOpen,
  setIsBankCurrencyDropdownOpen,
  bankNumeroCuenta,
  setBankNumeroCuenta,
  bankNumeroCuentaError,
  setBankNumeroCuentaError,
  bankCbuIban,
  setBankCbuIban,
  bankCbuIbanError,
  setBankCbuIbanError,
  bankTab,
  setBankTab,
  currencyOptions,
  handleAddBank,
  isLoading,
}) => {
  return (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', onCancel, true)}
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>Agregar Cuenta Bancaria.</Text>
        <InputField
          label="Titular"
          placeholder="Juan Pérez"
          value={bankTitular}
          onChangeText={(val: string) => {
            setBankTitular(val);
            if (bankTitularError) setBankTitularError('');
          }}
          error={bankTitularError}
        />
        <InputField
          label="Banco"
          placeholder="Banco Galicia"
          value={bankBanco}
          onChangeText={(val: string) => {
            setBankBanco(val);
            if (bankBancoError) setBankBancoError('');
          }}
          error={bankBancoError}
        />
        <View style={[styles.row, { zIndex: isBankDropdownOpen || isBankCurrencyDropdownOpen ? 1000 : 1, position: 'relative' }]}> 
          <CountryDropdownField label="País" value={bankPais} onSelect={setBankPais} isOpen={isBankDropdownOpen} setIsOpen={setIsBankDropdownOpen} />
          <View style={{ width: 15 }} />
          <CurrencyDropdownField
            label="Moneda"
            value={bankMoneda}
            onSelect={setBankMoneda}
            isOpen={isBankCurrencyDropdownOpen}
            setIsOpen={setIsBankCurrencyDropdownOpen}
            options={currencyOptions}
          />
        </View>
        <InputField
          label="Número de Cuenta"
          placeholder="1234567890"
          value={bankNumeroCuenta}
          onChangeText={(val: string) => {
            setBankNumeroCuenta(val);
            if (bankNumeroCuentaError) setBankNumeroCuentaError('');
          }}
          error={bankNumeroCuentaError}
        />

        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tab, bankTab === 'CBU' && styles.activeTab]} onPress={() => setBankTab('CBU')} disabled={isLoading}>
            <Text style={[styles.tabText, bankTab === 'CBU' && styles.activeTabText]}>CBU</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, bankTab === 'IBAN' && styles.activeTab]} onPress={() => setBankTab('IBAN')} disabled={isLoading}>
            <Text style={[styles.tabText, bankTab === 'IBAN' && styles.activeTabText]}>IBAN</Text>
          </TouchableOpacity>
        </View>
        <InputField
          label={bankTab}
          placeholder="0720123456789012345678"
          value={bankCbuIban}
          onChangeText={(val: string) => {
            setBankCbuIban(val);
            if (bankCbuIbanError) setBankCbuIbanError('');
          }}
          error={bankCbuIbanError}
        />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAddBank} disabled={isLoading}>
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
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: '#001b2a',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#001b2a',
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
