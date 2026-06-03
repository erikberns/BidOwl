import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

interface PaymentMethodsScreenProps {
  userId?: number;
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

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    console.log(`[Alert] ${title}: ${message}`);
    alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

export const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({ userId, onBack, onComplete }) => {
  const [currentView, setCurrentView] = useState<'list' | 'select' | 'form_bank' | 'form_card' | 'form_check'>('list');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedType, setSelectedType] = useState<MethodType>('card');
  const [isLoading, setIsLoading] = useState(false);

  // Bank Form States
  const [bankTitular, setBankTitular] = useState('Jose Claudio Godio');
  const [bankBanco, setBankBanco] = useState('Banco Galicia');
  const [bankPais, setBankPais] = useState('Argentina');
  const [bankMoneda, setBankMoneda] = useState('Pesos');
  const [bankCbuIban, setBankCbuIban] = useState('0720123456789012345678');
  const [bankTab, setBankTab] = useState<'CBU' | 'IBAN'>('CBU');

  // Bank Form Error States
  const [bankTitularError, setBankTitularError] = useState('');
  const [bankBancoError, setBankBancoError] = useState('');
  const [bankCbuIbanError, setBankCbuIbanError] = useState('');

  // Card Form States
  const [cardNumero, setCardNumero] = useState('4444555566662345');
  const [cardTitular, setCardTitular] = useState('Jose Claudio Godio');
  const [cardVencimiento, setCardVencimiento] = useState('12/30');
  const [cardCvv, setCardCvv] = useState('892');

  // Card Form Error States
  const [cardNumeroError, setCardNumeroError] = useState('');
  const [cardTitularError, setCardTitularError] = useState('');
  const [cardVencimientoError, setCardVencimientoError] = useState('');
  const [cardCvvError, setCardCvvError] = useState('');

  // Check Form States
  const [checkTitular, setCheckTitular] = useState('Jose Claudio Godio');
  const [checkBanco, setCheckBanco] = useState('Banco de la Nación Argentina');
  const [checkNumero, setCheckNumero] = useState('00045821');
  const [checkMonto, setCheckMonto] = useState('1500000');
  const [checkPais, setCheckPais] = useState('Argentina');
  const [checkMoneda, setCheckMoneda] = useState('Pesos');

  // Check Form Error States
  const [checkTitularError, setCheckTitularError] = useState('');
  const [checkBancoError, setCheckBancoError] = useState('');
  const [checkNumeroError, setCheckNumeroError] = useState('');
  const [checkMontoError, setCheckMontoError] = useState('');

  // File upload states for bank and check receipts
  const [bankFileUri, setBankFileUri] = useState<string | null>(null);
  const [bankFile, setBankFile] = useState<any>(null);
  const [checkFileUri, setCheckFileUri] = useState<string | null>(null);
  const [checkFile, setCheckFile] = useState<any>(null);

  // Clear errors when switching views
  useEffect(() => {
    setBankTitularError('');
    setBankBancoError('');
    setBankCbuIbanError('');
    setCardNumeroError('');
    setCardTitularError('');
    setCardVencimientoError('');
    setCardCvvError('');
    setCheckTitularError('');
    setCheckBancoError('');
    setCheckNumeroError('');
    setCheckMontoError('');
  }, [currentView]);

  const fileInputBankRef = useRef<any>(null);
  const fileInputCheckRef = useRef<any>(null);

  const handleSelectBankFile = () => {
    if (Platform.OS === 'web') {
      if (fileInputBankRef.current) {
        fileInputBankRef.current.click();
      }
    } else {
      setBankFileUri('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=150');
      setBankFile({
        uri: 'mock-uri-bank',
        name: 'comprobante-banco.jpg',
        type: 'image/jpeg',
      });
    }
  };

  const handleSelectCheckFile = () => {
    if (Platform.OS === 'web') {
      if (fileInputCheckRef.current) {
        fileInputCheckRef.current.click();
      }
    } else {
      setCheckFileUri('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=150');
      setCheckFile({
        uri: 'mock-uri-check',
        name: 'comprobante-cheque.jpg',
        type: 'image/jpeg',
      });
    }
  };

  const handleBankFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setBankFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBankFileUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setCheckFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCheckFileUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [availablePaises, setAvailablePaises] = useState<any[]>([
    { numero: 54, nombre: 'Argentina' },
    { numero: 598, nombre: 'Uruguay' },
    { numero: 55, nombre: 'Brasil' },
    { numero: 56, nombre: 'Chile' }
  ]);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [isCheckDropdownOpen, setIsCheckDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadPaises() {
      try {
        console.log('Cargando países desde:', `${API_URL}/personas/paises`);
        const response = await fetch(`${API_URL}/personas/paises`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAvailablePaises(data);
          }
        }
      } catch (error) {
        console.error('Error cargando países:', error);
      }
    }
    loadPaises();
  }, []);

  const addMethod = (method: Omit<PaymentMethod, 'id'>) => {
    setMethods([...methods, { ...method, id: Math.random().toString() }]);
    setCurrentView('list');
  };

  const removeMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
  };

  const getFinalUserId = async (): Promise<number> => {
    if (userId) return userId;
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      return userObj.identificador;
    }
    throw new Error('No se encontró el identificador del usuario para guardar el método de pago.');
  };

  const handleAddBank = async () => {
    setBankTitularError('');
    setBankBancoError('');
    setBankCbuIbanError('');

    let hasErrors = false;
    if (!bankTitular || !bankTitular.trim()) {
      setBankTitularError('El titular es obligatorio.');
      hasErrors = true;
    }
    if (!bankBanco || !bankBanco.trim()) {
      setBankBancoError('El banco es obligatorio.');
      hasErrors = true;
    }
    if (!bankCbuIban || !bankCbuIban.trim()) {
      setBankCbuIbanError('El número de cuenta es obligatorio.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    setIsLoading(true);
    try {
      const finalUserId = await getFinalUserId();
      const selectedPaisObj = availablePaises.find(p => p.nombre.toLowerCase() === bankPais.toLowerCase());
      const paisId = selectedPaisObj ? selectedPaisObj.numero : 54;
      
      const formData = new FormData();
      formData.append('titularCuenta', bankTitular);
      formData.append('nombreBanco', bankBanco);
      formData.append('paisId', paisId.toString());
      formData.append('cbuIban', bankCbuIban);
      formData.append('moneda', bankMoneda.toLowerCase() === 'ar$' ? 'pesos' : bankMoneda.toLowerCase());

      if (bankFile) {
        if (Platform.OS === 'web') {
          formData.append('comprobante', bankFile);
        } else {
          formData.append('comprobante', {
            uri: bankFile.uri,
            name: bankFile.name,
            type: bankFile.type,
          } as any);
        }
      }

      console.log(`Registrando cuenta bancaria para usuario ${finalUserId}...`);
      const response = await fetch(`${API_URL}/personas/${finalUserId}/metodo-pago/cuenta`, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar la cuenta bancaria.');
      }

      showAlert('Éxito', 'Cuenta bancaria registrada con éxito.');
      addMethod({
        type: 'bank',
        title: `Cuenta Bancaria ${bankBanco}`,
        subtitle: `CBU/IBAN: ${bankCbuIban}`,
      });
      // Clear form & file
      setBankFile(null);
      setBankFileUri(null);
    } catch (error: any) {
      console.error('Error al registrar cuenta bancaria:', error);
      showAlert('Error', error.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    setCardNumeroError('');
    setCardTitularError('');
    setCardVencimientoError('');
    setCardCvvError('');

    let hasErrors = false;
    if (!cardNumero || !cardNumero.trim()) {
      setCardNumeroError('El número de tarjeta es obligatorio.');
      hasErrors = true;
    }
    if (!cardTitular || !cardTitular.trim()) {
      setCardTitularError('El titular de la tarjeta es obligatorio.');
      hasErrors = true;
    }
    if (!cardVencimiento || !cardVencimiento.trim()) {
      setCardVencimientoError('La fecha de vencimiento es obligatoria.');
      hasErrors = true;
    }
    if (!cardCvv || !cardCvv.trim()) {
      setCardCvvError('El CVV es obligatorio.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    setIsLoading(true);
    try {
      const finalUserId = await getFinalUserId();
      console.log(`Registrando tarjeta para usuario ${finalUserId}...`);
      const response = await fetch(`${API_URL}/personas/${finalUserId}/metodo-pago/tarjeta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeroTarjeta: cardNumero.replace(/\s/g, ''),
          titularTarjeta: cardTitular,
          fechaVencimiento: cardVencimiento,
          cvv: parseInt(cardCvv) || 0,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar la tarjeta de crédito.');
      }

      addMethod({
        type: 'card',
        title: `VISA **** **** **** ${cardNumero.slice(-4)}`,
        subtitle: `Vence: ${cardVencimiento}`,
      });
    } catch (error: any) {
      console.error('Error al registrar tarjeta:', error);
      showAlert('Error', error.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCheck = async () => {
    setCheckTitularError('');
    setCheckBancoError('');
    setCheckNumeroError('');
    setCheckMontoError('');

    let hasErrors = false;
    if (!checkTitular || !checkTitular.trim()) {
      setCheckTitularError('El titular es obligatorio.');
      hasErrors = true;
    }
    if (!checkBanco || !checkBanco.trim()) {
      setCheckBancoError('El banco emisor es obligatorio.');
      hasErrors = true;
    }
    if (!checkNumero || !checkNumero.trim()) {
      setCheckNumeroError('El número de cheque es obligatorio.');
      hasErrors = true;
    }
    if (!checkMonto || !checkMonto.trim()) {
      setCheckMontoError('El monto certificado es obligatorio.');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    setIsLoading(true);
    try {
      const finalUserId = await getFinalUserId();
      const selectedPaisObj = availablePaises.find(p => p.nombre.toLowerCase() === checkPais.toLowerCase());
      const paisId = selectedPaisObj ? selectedPaisObj.numero : 54;
      
      const formData = new FormData();
      formData.append('titular', checkTitular);
      formData.append('bancoEmisor', checkBanco);
      formData.append('numeroCheque', checkNumero);
      formData.append('monto', checkMonto);
      formData.append('paisId', paisId.toString());
      formData.append('moneda', checkMoneda.toLowerCase() === 'ar$' ? 'pesos' : checkMoneda.toLowerCase());

      if (checkFile) {
        if (Platform.OS === 'web') {
          formData.append('comprobante', checkFile);
        } else {
          formData.append('comprobante', {
            uri: checkFile.uri,
            name: checkFile.name,
            type: checkFile.type,
          } as any);
        }
      }

      console.log(`Registrando cheque para usuario ${finalUserId}...`);
      const response = await fetch(`${API_URL}/personas/${finalUserId}/metodo-pago/cheque`, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar el cheque.');
      }

      showAlert('Éxito', 'Cheque certificado registrado con éxito.');
      addMethod({
        type: 'check',
        title: `Cheque Certificado ${checkNumero}`,
        subtitle: `${checkBanco} - Monto: ${checkMonto}`,
      });
      // Clear form & file
      setCheckFile(null);
      setCheckFileUri(null);
    } catch (error: any) {
      console.error('Error al registrar cheque:', error);
      showAlert('Error', error.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = (title: string, onBackPress: () => void, isCloseIcon = false) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton} disabled={isLoading}>
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
            <TouchableOpacity style={styles.addButton} onPress={() => setCurrentView('select')} disabled={isLoading}>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>{m.title}</Text>
                  <Text style={styles.methodSub}>{m.subtitle}</Text>
                </View>
                <TouchableOpacity onPress={() => removeMethod(m.id)} style={styles.removeButton} disabled={isLoading}>
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, !hasMethods && styles.disabledButton]}
            disabled={!hasMethods || isLoading}
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
            <TouchableOpacity key={type} style={styles.radioRow} onPress={() => setSelectedType(type)} disabled={isLoading}>
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
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const InputField = ({ label, placeholder, value, onChangeText, flex = 1, keyboardType, error, style, ...props }: any) => {
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

  const CountryDropdownField = ({ label, value, onSelect, isOpen, setIsOpen, flex = 1, error }: any) => {
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

  const renderFileUpload = (type: 'bank' | 'check') => {
    const fileUri = type === 'bank' ? bankFileUri : checkFileUri;
    const fileObj = type === 'bank' ? bankFile : checkFile;
    const selectHandler = type === 'bank' ? handleSelectBankFile : handleSelectCheckFile;
    const fileInputRef = type === 'bank' ? fileInputBankRef : fileInputCheckRef;
    const fileChangeHandler = type === 'bank' ? handleBankFileChange : handleCheckFileChange;

    return (
      <View style={styles.fileUploadSection}>
        <Text style={styles.fileLabel}>Comprobante</Text>
        
        {Platform.OS === 'web' && (
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={fileChangeHandler}
          />
        )}

        <View style={styles.fileBoxes}>
          <TouchableOpacity 
            style={[styles.fileAddBox, fileUri ? styles.fileAddBoxHasImage : null]} 
            onPress={selectHandler}
            disabled={isLoading}
          >
            {fileUri ? (
              <Image source={{ uri: fileUri }} style={styles.filePreviewImage} />
            ) : (
              <Text style={styles.fileAddText}>+</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.fileCardBox}>
            <Text style={styles.fileCardText}>
              {fileObj ? fileObj.name || 'Comprobante seleccionado' : 'Sin archivo'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBankForm = () => (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', () => setCurrentView('select'), true)}
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
        <View style={[styles.row, { zIndex: isBankDropdownOpen ? 1000 : 1, position: 'relative' }]}>
          <CountryDropdownField label="País" value={bankPais} onSelect={setBankPais} isOpen={isBankDropdownOpen} setIsOpen={setIsBankDropdownOpen} />
          <View style={{ width: 15 }} />
          <InputField label="Moneda" placeholder="AR$" value={bankMoneda} onChangeText={setBankMoneda} />
        </View>
        <InputField 
          label="Número de Cuenta" 
          placeholder="1234567890" 
          value={bankCbuIban} 
          onChangeText={(val: string) => {
            setBankCbuIban(val);
            if (bankCbuIbanError) setBankCbuIbanError('');
          }} 
          error={bankCbuIbanError}
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

        {renderFileUpload('bank')}
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
          <Text style={styles.cardNumber}>
            {cardNumero ? cardNumero.replace(/(\d{4})/g, '$1 ').trim() : '**** **** **** ****'}
          </Text>
          <View style={styles.mockCardBottom}>
            <View>
              <Text style={styles.cardInfoLabel}>Card Holder name</Text>
              <Text style={styles.cardInfoValue}>{cardTitular || 'Noman Manzoor'}</Text>
            </View>
            <View>
              <Text style={styles.cardInfoLabel}>Expiry Date</Text>
              <Text style={styles.cardInfoValue}>{cardVencimiento || '02 / 30'}</Text>
            </View>
          </View>
        </View>

        <InputField 
          label="Numero de Tarjeta" 
          placeholder="0123 4567 8901 2345" 
          value={cardNumero} 
          onChangeText={(val: string) => {
            setCardNumero(val);
            if (cardNumeroError) setCardNumeroError('');
          }} 
          keyboardType="numeric" 
          error={cardNumeroError}
        />
        <InputField 
          label="Nombre de Dueño de Tarjeta" 
          placeholder="Noman Manzoor" 
          value={cardTitular} 
          onChangeText={(val: string) => {
            setCardTitular(val);
            if (cardTitularError) setCardTitularError('');
          }} 
          error={cardTitularError}
        />
        <View style={styles.row}>
          <InputField 
            label="Fecha Vencimiento" 
            placeholder="02 / 30" 
            value={cardVencimiento} 
            onChangeText={(val: string) => {
              setCardVencimiento(val);
              if (cardVencimientoError) setCardVencimientoError('');
            }} 
            error={cardVencimientoError}
          />
          <View style={{ width: 15 }} />
          <InputField 
            label="CVV" 
            placeholder="892" 
            value={cardCvv} 
            onChangeText={(val: string) => {
              setCardCvv(val);
              if (cardCvvError) setCardCvvError('');
            }} 
            keyboardType="numeric" 
            error={cardCvvError}
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAddCard} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#001b2a" />
          ) : (
            <Text style={styles.acceptButtonText}>Aceptar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCheckForm = () => (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', () => setCurrentView('select'), true)}
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
        <View style={[styles.row, { zIndex: isCheckDropdownOpen ? 1000 : 1, position: 'relative' }]}>
          <CountryDropdownField label="País" value={checkPais} onSelect={setCheckPais} isOpen={isCheckDropdownOpen} setIsOpen={setIsCheckDropdownOpen} />
          <View style={{ width: 15 }} />
          <InputField label="Moneda" placeholder="AR$" value={checkMoneda} onChangeText={setCheckMoneda} />
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  methodSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
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
    justifyContent: 'center',
    minHeight: 58,
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
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 8,
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
  fileAddBoxHasImage: {
    borderColor: '#2A8E5D',
  },
  filePreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
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
