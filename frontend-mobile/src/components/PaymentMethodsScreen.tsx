import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface PaymentMethodsScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

type MethodType = 'bank' | 'card' | 'check';

interface PaymentMethod {
  id: string;
  type: MethodType;
  title: string;
  subtitle: string;
}

export const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({ onBack, onComplete }) => {
  const [currentView, setCurrentView] = useState<'list' | 'select' | 'form_bank' | 'form_card' | 'form_check'>('list');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedType, setSelectedType] = useState<MethodType>('card');

  // Form states (simplified for UI demonstration)
  const [bankTab, setBankTab] = useState<'CBU' | 'IBAN'>('CBU');

  const addMethod = (method: Omit<PaymentMethod, 'id'>) => {
    setMethods([...methods, { ...method, id: Math.random().toString() }]);
    setCurrentView('list');
  };

  const removeMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
  };

  const renderHeader = (title: string, onBackPress: () => void, isCloseIcon = false) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Text style={styles.backText}>{isCloseIcon ? '✕' : '<'}</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderListView = () => {
    const hasMethods = methods.length > 0;
    return (
      <View style={styles.container}>
        {renderHeader('Metodos de Pago', onBack)}
        <ScrollView style={styles.content}>
          <Text style={styles.mainTitle}>Requeriras un metodo de pago para las pujas.</Text>
          <Text style={styles.subtitle}>
            Esto te permitirá participar en las subastas y validar tus ofertas de forma segura; sin un método de pago activo no podrás realizar pujas.
          </Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metodo de Pago</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setCurrentView('select')}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {!hasMethods ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tiene metodos de pagos registrados</Text>
            </View>
          ) : (
            methods.map(m => (
              <View key={m.id} style={styles.methodCard}>
                <View style={styles.methodIconBox}>
                  <Text style={styles.methodIconText}>
                    {m.type === 'card' ? '💳' : m.type === 'bank' ? '🏦' : '📄'}
                  </Text>
                </View>
                <Text style={styles.methodTitle}>{m.title}</Text>
                <TouchableOpacity onPress={() => removeMethod(m.id)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, !hasMethods && styles.disabledButton]}
            disabled={!hasMethods}
            onPress={onComplete}
          >
            <Text style={[styles.primaryButtonText, !hasMethods && styles.disabledButtonText]}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSelectView = () => (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', () => setCurrentView('list'), true)}
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>Elije que tipo de metodo de pago quiere utilizar.</Text>
        <Text style={styles.subtitle}>
          Podrás elegir cómo pagar tus compras y gestionar tus métodos de forma segura; sin uno activo no podrás participar en las pujas.
        </Text>

        {(['bank', 'check', 'card'] as MethodType[]).map((type) => {
          const labels = {
            bank: 'Cuenta Bancarias',
            check: 'Cheque Certificado',
            card: 'Tarjeta de Credito'
          };
          const isSelected = selectedType === type;
          return (
            <TouchableOpacity key={type} style={styles.radioRow} onPress={() => setSelectedType(type)}>
              <Text style={styles.radioLabel}>{labels[type]}</Text>
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <View style={styles.radioInnerCircle} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            if (selectedType === 'bank') setCurrentView('form_bank');
            if (selectedType === 'card') setCurrentView('form_card');
            if (selectedType === 'check') setCurrentView('form_check');
          }}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const InputField = ({ label, placeholder, value, flex = 1 }: any) => (
    <View style={[styles.inputContainer, { flex }]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        placeholderTextColor="#666"
      />
    </View>
  );

  const renderFileUpload = () => (
    <View style={styles.fileUploadSection}>
      <Text style={styles.fileLabel}>Comprobante</Text>
      <View style={styles.fileBoxes}>
        <TouchableOpacity style={styles.fileAddBox}>
          <Text style={styles.fileAddText}>+</Text>
        </TouchableOpacity>
        <View style={styles.fileCardBox}>
          <Text style={styles.fileCardText}>Comprobante.pdf</Text>
        </View>
      </View>
    </View>
  );

  const renderBankForm = () => (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', () => setCurrentView('select'), true)}
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>Agregar Cuenta Bancaria.</Text>
        <InputField label="Titular" placeholder="Juan Pérez" />
        <InputField label="Banco" placeholder="Banco Galicia" />
        <View style={styles.row}>
          <InputField label="País" placeholder="Argentina" />
          <View style={{ width: 15 }} />
          <InputField label="Moneda" placeholder="AR$" />
        </View>
        <InputField label="Número de Cuenta" placeholder="1234567890" />

        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tab, bankTab === 'CBU' && styles.activeTab]} onPress={() => setBankTab('CBU')}>
            <Text style={[styles.tabText, bankTab === 'CBU' && styles.activeTabText]}>CBU</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, bankTab === 'IBAN' && styles.activeTab]} onPress={() => setBankTab('IBAN')}>
            <Text style={[styles.tabText, bankTab === 'IBAN' && styles.activeTabText]}>IBAN</Text>
          </TouchableOpacity>
        </View>
        <InputField label={bankTab} placeholder="0720123456789012345678" />

        {renderFileUpload()}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => addMethod({ type: 'bank', title: 'Cuenta Bancaria Galicia', subtitle: '' })}>
          <Text style={styles.acceptButtonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCardForm = () => (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', () => setCurrentView('select'), true)}
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>Agregar Tarjeta.</Text>
        
        {/* Mock Card */}
        <View style={styles.mockCard}>
          <View style={styles.mockCardTop}>
            <View style={styles.chipIcon} />
            <Text style={styles.visaText}>VISA</Text>
          </View>
          <Text style={styles.cardNumber}>**** **** **** 2345</Text>
          <View style={styles.mockCardBottom}>
            <View>
              <Text style={styles.cardInfoLabel}>Card Holder name</Text>
              <Text style={styles.cardInfoValue}>Noman Manzoor</Text>
            </View>
            <View>
              <Text style={styles.cardInfoLabel}>Expiry Date</Text>
              <Text style={styles.cardInfoValue}>02 / 30</Text>
            </View>
          </View>
        </View>

        <InputField label="Numero de Tarjeta" placeholder="0123 4567 8901 2345" />
        <InputField label="Nombre de Dueño de Tarjeta" placeholder="Noman Manzoor" />
        <View style={styles.row}>
          <InputField label="Fecha Vencimiento" placeholder="02 / 30" />
          <View style={{ width: 15 }} />
          <InputField label="CVV" placeholder="892" />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => addMethod({ type: 'card', title: 'VISA **** **** **** 2345', subtitle: '' })}>
          <Text style={styles.acceptButtonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCheckForm = () => (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', () => setCurrentView('select'), true)}
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>Agregar Cheque Certificado.</Text>
        <InputField label="Titular" placeholder="Juan Pérez" />
        <InputField label="Banco Emisor" placeholder="Banco Nación" />
        <InputField label="Numero de Cheque" placeholder="00045821" />
        <InputField label="Monto Certificado" placeholder="1.500.000" />
        <View style={styles.row}>
          <InputField label="País" placeholder="Argentina" />
          <View style={{ width: 15 }} />
          <InputField label="Moneda" placeholder="AR$" />
        </View>

        {renderFileUpload()}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => addMethod({ type: 'check', title: 'Cheque Certificado 00045821', subtitle: '' })}>
          <Text style={styles.acceptButtonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  switch (currentView) {
    case 'select': return renderSelectView();
    case 'form_bank': return renderBankForm();
    case 'form_card': return renderCardForm();
    case 'form_check': return renderCheckForm();
    default: return renderListView();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
  },
  backText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
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
  subtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#bcf259',
    width: 40,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#333',
    fontSize: 14,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  methodIconBox: {
    backgroundColor: '#1E9658',
    borderRadius: 6,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodIconText: {
    color: 'white',
    fontSize: 14,
  },
  methodTitle: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#D9534F',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#1E9658',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButtonText: {
    color: '#666',
  },
  acceptButton: {
    backgroundColor: '#bcf259',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#001b2a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 20,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#bcf259',
  },
  radioInnerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#bcf259',
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
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
  fileUploadSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  fileLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileBoxes: {
    flexDirection: 'row',
  },
  fileAddBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileAddText: {
    fontSize: 30,
    color: '#333',
  },
  fileCardBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    width: '50%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileCardText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  mockCard: {
    backgroundColor: '#504DE4',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  mockCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chipIcon: {
    width: 40,
    height: 30,
    backgroundColor: '#F5C142',
    borderRadius: 5,
  },
  visaText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  cardNumber: {
    color: 'white',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 30,
  },
  mockCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginBottom: 5,
  },
  cardInfoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
