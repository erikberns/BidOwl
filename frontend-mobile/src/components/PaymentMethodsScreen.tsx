import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { SymbolView } from 'expo-symbols';

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
  bankTitular?: string;
  bankBanco?: string;
  bankPais?: string;
  bankMoneda?: string;
  bankCbuIban?: string;
  bankTab?: 'CBU' | 'IBAN';
  bankFile?: any;
  bankFileUri?: string | null;
  cardNumero?: string;
  cardTitular?: string;
  cardVencimiento?: string;
  cardCvv?: string;
  checkTitular?: string;
  checkBanco?: string;
  checkNumero?: string;
  checkMonto?: string;
  checkPais?: string;
  checkMoneda?: string;
  checkFile?: any;
  checkFileUri?: string | null;
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

const PaymentLoadingContext = React.createContext({ isLoading: false, availablePaises: [] as any[] });

export const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({ userId, onBack, onComplete }) => {
  const [currentView, setCurrentView] = useState<'list' | 'select' | 'form_bank' | 'form_card' | 'form_check'>('list');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedType, setSelectedType] = useState<MethodType>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  const [bankFileError, setBankFileError] = useState('');
  const [checkFileError, setCheckFileError] = useState('');

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
    setBankFileError('');
    setCardNumeroError('');
    setCardTitularError('');
    setCardVencimientoError('');
    setCardCvvError('');
    setCheckTitularError('');
    setCheckBancoError('');
    setCheckNumeroError('');
    setCheckMontoError('');
    setCheckFileError('');
  }, [currentView]);

  const fileInputBankRef = useRef<any>(null);
  const fileInputCheckRef = useRef<any>(null);

  const handleSelectBankFile = async () => {
    if (Platform.OS === 'web') {
      if (fileInputBankRef.current) {
        fileInputBankRef.current.click();
      }
    } else {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permiso Requerido', 'Se necesita acceso a la galería para poder subir una foto.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setBankFileUri(asset.uri);
          setBankFile({
            uri: asset.uri,
            name: asset.fileName || 'comprobante-banco.jpg',
            type: asset.mimeType || 'image/jpeg',
          });
        }
      } catch (error: any) {
        console.error(error);
        showAlert('Error', 'No se pudo seleccionar el comprobante.');
      }
    }
  };

  const handleSelectCheckFile = async () => {
    if (Platform.OS === 'web') {
      if (fileInputCheckRef.current) {
        fileInputCheckRef.current.click();
      }
    } else {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permiso Requerido', 'Se necesita acceso a la galería para poder subir una foto.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setCheckFileUri(asset.uri);
          setCheckFile({
            uri: asset.uri,
            name: asset.fileName || 'comprobante-cheque.jpg',
            type: asset.mimeType || 'image/jpeg',
          });
        }
      } catch (error: any) {
        console.error(error);
        showAlert('Error', 'No se pudo seleccionar el comprobante.');
      }
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

  const handleRemoveFile = (type: 'bank' | 'check') => {
    if (type === 'bank') {
      setBankFile(null);
      setBankFileUri(null);
      setBankFileError('');
    } else {
      setCheckFile(null);
      setCheckFileUri(null);
      setCheckFileError('');
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
  const [isBankCurrencyDropdownOpen, setIsBankCurrencyDropdownOpen] = useState(false);
  const [isCheckCurrencyDropdownOpen, setIsCheckCurrencyDropdownOpen] = useState(false);
  const currencyOptions = [
    { value: 'Pesos', label: 'Pesos' },
    { value: 'Dólares', label: 'Dólares' }
  ];

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

  useEffect(() => {
    async function loadExistingMethods() {
      try {
        const finalUserId = await getFinalUserId();
        setIsLoading(true);
        console.log(`Cargando métodos de pago existentes para el usuario ${finalUserId} en la pantalla...`);
        const response = await fetch(`${API_URL}/personas/${finalUserId}/metodos-pago`);
        if (response.ok) {
          const data = await response.json();
          console.log('Métodos cargados para la pantalla:', data);
          const mapped: PaymentMethod[] = data.map((item: any) => {
            if (item.tarjetaCredito) {
              const last4 = item.tarjetaCredito.numeroTarjeta?.slice(-4) || '';
              return {
                id: String(item.identificador),
                type: 'card',
                title: `VISA **** **** **** ${last4}`,
                subtitle: `Vence: ${item.tarjetaCredito.fechaVencimiento || ''}`,
                cardNumero: item.tarjetaCredito.numeroTarjeta,
                cardTitular: item.tarjetaCredito.titularTarjeta,
                cardVencimiento: item.tarjetaCredito.fechaVencimiento,
                cardCvv: String(item.tarjetaCredito.cvv),
              };
            } else if (item.cuentaBancaria) {
              return {
                id: String(item.identificador),
                type: 'bank',
                title: `Cuenta Bancaria ${item.cuentaBancaria.nombreBanco || ''}`,
                subtitle: `CBU/IBAN: ${item.cuentaBancaria.cbuIban || ''}`,
                bankTitular: item.cuentaBancaria.titularCuenta,
                bankBanco: item.cuentaBancaria.nombreBanco,
                bankPais: item.cuentaBancaria.pais?.nombre || 'Argentina',
                bankMoneda: item.cuentaBancaria.moneda === 'pesos' ? 'Pesos' : 'Dólares',
                bankCbuIban: item.cuentaBancaria.cbuIban,
                bankTab: item.cuentaBancaria.cbuIban?.length === 22 ? 'CBU' : 'IBAN',
              };
            } else if (item.chequeCertificado) {
              return {
                id: String(item.identificador),
                type: 'check',
                title: `Cheque Certificado ${item.chequeCertificado.numeroCheque || ''}`,
                subtitle: `${item.chequeCertificado.bancoEmisor || ''} - Monto: ${item.chequeCertificado.monto || ''}`,
                checkTitular: item.chequeCertificado.titular,
                checkBanco: item.chequeCertificado.bancoEmisor,
                checkNumero: item.chequeCertificado.numeroCheque,
                checkMonto: String(item.chequeCertificado.monto),
                checkPais: item.chequeCertificado.pais?.nombre || 'Argentina',
                checkMoneda: item.chequeCertificado.moneda === 'pesos' ? 'Pesos' : 'Dólares',
              };
            }
            return null;
          }).filter(Boolean) as PaymentMethod[];
          setMethods(mapped);
        }
      } catch (error) {
        console.error('Error loading existing methods in PaymentMethodsScreen:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadExistingMethods();
  }, [userId]);

  const addMethod = (methodData: Omit<PaymentMethod, 'id'>, newId?: string) => {
    if (editingId) {
      setMethods(methods.map(m => m.id === editingId ? { ...m, ...methodData } : m));
      setEditingId(null);
    } else {
      setMethods([...methods, { ...methodData, id: newId || Math.random().toString() }]);
    }
    setCurrentView('list');
  };

  const removeMethod = async (id: string) => {
    const isSaved = /^\d+$/.test(id);
    if (isSaved) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/personas/metodo-pago/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Error al eliminar el método de pago.');
        }
      } catch (error: any) {
        console.error('Error deleting method:', error);
        showAlert('Error', error.message || 'No se pudo eliminar el método de pago.');
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    setMethods(methods.filter(m => m.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const clearFormFields = () => {
    setEditingId(null);

    setBankTitular('Jose Claudio Godio');
    setBankBanco('Banco Galicia');
    setBankPais('Argentina');
    setBankMoneda('Pesos');
    setBankCbuIban('0720123456789012345678');
    setBankTab('CBU');
    setBankFile(null);
    setBankFileUri(null);

    setCardNumero('4444555566662345');
    setCardTitular('Jose Claudio Godio');
    setCardVencimiento('12/30');
    setCardCvv('892');

    setCheckTitular('Jose Claudio Godio');
    setCheckBanco('Banco de la Nación Argentina');
    setCheckNumero('00045821');
    setCheckMonto('1500000');
    setCheckPais('Argentina');
    setCheckMoneda('Pesos');
    setCheckFile(null);
    setCheckFileUri(null);
  };

  const handleEditPress = (method: PaymentMethod) => {
    setEditingId(method.id);
    if (method.type === 'bank') {
      setBankTitular(method.bankTitular || '');
      setBankBanco(method.bankBanco || '');
      setBankPais(method.bankPais || 'Argentina');
      setBankMoneda(method.bankMoneda || 'Pesos');
      setBankCbuIban(method.bankCbuIban || '');
      setBankTab(method.bankTab || 'CBU');
      setBankFile(method.bankFile || null);
      setBankFileUri(method.bankFileUri || null);
      setCurrentView('form_bank');
    } else if (method.type === 'card') {
      setCardNumero(method.cardNumero || '');
      setCardTitular(method.cardTitular || '');
      setCardVencimiento(method.cardVencimiento || '');
      setCardCvv(method.cardCvv || '');
      setCurrentView('form_card');
    } else if (method.type === 'check') {
      setCheckTitular(method.checkTitular || '');
      setCheckBanco(method.checkBanco || '');
      setCheckNumero(method.checkNumero || '');
      setCheckMonto(method.checkMonto || '');
      setCheckPais(method.checkPais || 'Argentina');
      setCheckMoneda(method.checkMoneda || 'Pesos');
      setCheckFile(method.checkFile || null);
      setCheckFileUri(method.checkFileUri || null);
      setCurrentView('form_check');
    }
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
    setBankFileError('');

    let hasErrors = false;
    if (!bankTitular || !bankTitular.trim()) {
      setBankTitularError('El titular es obligatorio.');
      hasErrors = true;
    } else if (/\d/.test(bankTitular)) {
      setBankTitularError('El nombre del titular no puede contener números.');
      hasErrors = true;
    }

    if (!bankBanco || !bankBanco.trim()) {
      setBankBancoError('El banco es obligatorio.');
      hasErrors = true;
    }

    if (!bankCbuIban || !bankCbuIban.trim()) {
      setBankCbuIbanError('El número de cuenta es obligatorio.');
      hasErrors = true;
    } else {
      const cleanVal = bankCbuIban.trim().replace(/[\s-]/g, '');
      if (bankTab === 'CBU') {
        if (!/^\d+$/.test(cleanVal)) {
          setBankCbuIbanError('El CBU debe contener solo números.');
          hasErrors = true;
        } else if (cleanVal.length !== 22) {
          setBankCbuIbanError('El CBU debe tener exactamente 22 dígitos.');
          hasErrors = true;
        }
      } else if (bankTab === 'IBAN') {
        if (!/^[a-zA-Z0-9]+$/.test(cleanVal)) {
          setBankCbuIbanError('El IBAN debe contener solo caracteres alfanuméricos.');
          hasErrors = true;
        } else if (cleanVal.length < 15 || cleanVal.length > 34) {
          setBankCbuIbanError('El IBAN debe tener entre 15 y 34 caracteres.');
          hasErrors = true;
        }
      }

      if (!hasErrors) {
        // Validar duplicado local
        const isDuplicate = methods.some(m => {
          if (m.type !== 'bank' || !m.bankCbuIban) return false;
          return m.bankCbuIban.replace(/[\s-]/g, '').toLowerCase() === cleanVal.toLowerCase() && m.id !== editingId;
        });
        if (isDuplicate) {
          setBankCbuIbanError('Esta cuenta bancaria ya está registrada.');
          hasErrors = true;
        }
      }
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
      formData.append('moneda', bankMoneda.toLowerCase().includes('d') ? 'dolares' : 'pesos');

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
        bankTitular,
        bankBanco,
        bankPais,
        bankMoneda,
        bankCbuIban,
        bankTab,
        bankFile,
        bankFileUri,
      }, result.metodoPago ? String(result.metodoPago.identificador) : undefined);
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
    } else {
      const cleanNum = cardNumero.replace(/[\s-]/g, '');
      if (!/^\d+$/.test(cleanNum)) {
        setCardNumeroError('El número de tarjeta debe contener solo números.');
        hasErrors = true;
      } else if (cleanNum.length !== 16) {
        setCardNumeroError('El número de tarjeta debe tener exactamente 16 dígitos.');
        hasErrors = true;
      } else {
        // Validar duplicado local
        const isDuplicate = methods.some(m => {
          if (m.type !== 'card' || !m.cardNumero) return false;
          const existingClean = m.cardNumero.replace(/[\s-]/g, '');
          return existingClean === cleanNum && m.id !== editingId;
        });
        if (isDuplicate) {
          setCardNumeroError('Esta tarjeta ya está registrada en tus métodos de pago.');
          hasErrors = true;
        }
      }
    }

    if (!cardTitular || !cardTitular.trim()) {
      setCardTitularError('El titular de la tarjeta es obligatorio.');
      hasErrors = true;
    } else if (/\d/.test(cardTitular)) {
      setCardTitularError('El nombre del titular no puede contener números.');
      hasErrors = true;
    }

    if (!cardVencimiento || !cardVencimiento.trim()) {
      setCardVencimientoError('La fecha de vencimiento es obligatoria.');
      hasErrors = true;
    } else {
      const vencRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      if (!vencRegex.test(cardVencimiento.trim())) {
        setCardVencimientoError('El formato de vencimiento debe ser MM/YY.');
        hasErrors = true;
      }
    }

    if (!cardCvv || !cardCvv.trim()) {
      setCardCvvError('El CVV es obligatorio.');
      hasErrors = true;
    } else {
      const cleanCvv = cardCvv.trim();
      if (!/^\d+$/.test(cleanCvv)) {
        setCardCvvError('El CVV debe contener solo números.');
        hasErrors = true;
      } else if (cleanCvv.length !== 3) {
        setCardCvvError('El CVV debe tener exactamente 3 dígitos.');
        hasErrors = true;
      }
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
        cardNumero,
        cardTitular,
        cardVencimiento,
        cardCvv,
      }, result.metodoPago ? String(result.metodoPago.identificador) : undefined);
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
    setCheckFileError('');

    let hasErrors = false;

    if (!checkTitular || !checkTitular.trim()) {
      setCheckTitularError('El titular es obligatorio.');
      hasErrors = true;
    } else if (/\d/.test(checkTitular)) {
      setCheckTitularError('El nombre del titular no puede contener números.');
      hasErrors = true;
    }

    if (!checkBanco || !checkBanco.trim()) {
      setCheckBancoError('El banco emisor es obligatorio.');
      hasErrors = true;
    }

    if (!checkNumero || !checkNumero.trim()) {
      setCheckNumeroError('El número de cheque es obligatorio.');
      hasErrors = true;
    } else {
      const cleanNum = checkNumero.trim();
      if (!/^\d+$/.test(cleanNum)) {
        setCheckNumeroError('El número de cheque debe contener solo números.');
        hasErrors = true;
      } else if (cleanNum.length !== 8) {
        setCheckNumeroError('El número de cheque debe tener exactamente 8 dígitos.');
        hasErrors = true;
      } else {
        // Validar duplicado local
        const isDuplicate = methods.some(m => {
          if (m.type !== 'check' || !m.checkNumero) return false;
          return m.checkNumero.trim() === cleanNum && m.id !== editingId;
        });
        if (isDuplicate) {
          setCheckNumeroError('Este cheque certificado ya está registrado.');
          hasErrors = true;
        }
      }
    }

    if (!checkMonto || !checkMonto.trim()) {
      setCheckMontoError('El monto certificado es obligatorio.');
      hasErrors = true;
    } else {
      const parsedMonto = Number(checkMonto);
      if (isNaN(parsedMonto) || parsedMonto <= 0) {
        setCheckMontoError('El monto debe ser un valor numérico positivo.');
        hasErrors = true;
      }
    }

    if (!checkFile) {
      setCheckFileError('Debe subir una foto del comprobante.');
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
      formData.append('moneda', checkMoneda.toLowerCase().includes('d') ? 'dolares' : 'pesos');

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
        checkTitular,
        checkBanco,
        checkNumero,
        checkMonto,
        checkPais,
        checkMoneda,
        checkFile,
        checkFileUri,
      }, result.metodoPago ? String(result.metodoPago.identificador) : undefined);
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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                clearFormFields();
                setCurrentView('select');
              }}
              disabled={isLoading}
            >
              <Image
                source={require('../../assets/images/botton de agregar.png')}
                style={styles.addIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {!hasMethods ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tiene metodos de pagos registrados</Text>
            </View>
          ) : (
            methods.map(m => (
              <View key={m.id} style={styles.methodCard}>
                {/* Left edit pencil badge */}
                <TouchableOpacity onPress={() => handleEditPress(m)} style={styles.editButton}>
                  <Image
                    source={require('../../assets/images/editar.png')}
                    style={styles.buttonImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Card outline icon if card */}
                {m.type === 'card' && (
                  <SymbolView
                    tintColor="#051C2C"
                    // @ts-ignore
                    name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
                    size={24}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>{m.title}</Text>
                  {!!m.subtitle && <Text style={styles.methodSub}>{m.subtitle}</Text>}
                </View>

                <TouchableOpacity onPress={() => removeMethod(m.id)} style={styles.removeButton} disabled={isLoading}>
                  <Image
                    source={require('../../assets/images/borrar.png')}
                    style={styles.buttonImage}
                    resizeMode="contain"
                  />
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

  // InputField y CountryDropdownField se movieron al final del archivo para evitar pérdida de foco

  const renderFileUpload = (type: 'bank' | 'check') => {
    const fileUri = type === 'bank' ? bankFileUri : checkFileUri;
    const fileObj = type === 'bank' ? bankFile : checkFile;
    const selectHandler = type === 'bank' ? handleSelectBankFile : handleSelectCheckFile;
    const fileInputRef = type === 'bank' ? fileInputBankRef : fileInputCheckRef;
    const fileChangeHandler = type === 'bank' ? handleBankFileChange : handleCheckFileChange;
    const fileError = type === 'bank' ? bankFileError : checkFileError;

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
            style={[
              styles.fileAddBox,
              fileUri ? styles.fileAddBoxHasImage : null,
              !!fileError ? { borderColor: '#E30613', borderWidth: 1.5 } : null
            ]}
            onPress={selectHandler}
            disabled={isLoading}
          >
            {fileUri ? (
              <Image source={{ uri: fileUri }} style={styles.filePreviewImage} />
            ) : (
              <Text style={styles.fileAddText}>+</Text>
            )}
          </TouchableOpacity>

          <View style={styles.fileCardColumn}>
            <View style={[styles.fileCardBox, fileUri ? styles.fileCardBoxWithImage : null]}> 
              <Text style={styles.fileCardText} numberOfLines={2} ellipsizeMode="tail">
                {fileObj ? fileObj.name || 'Archivo seleccionado' : 'Sin archivo'}
              </Text>
            </View>
            {fileUri && type === 'check' && (
              <View style={styles.fileActionRow}>
                <TouchableOpacity
                  style={styles.fileActionButton}
                  onPress={selectHandler}
                  disabled={isLoading}
                >
                  <Text style={styles.fileActionButtonText}>Cambiar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fileActionButton, styles.fileActionButtonDelete]}
                  onPress={() => handleRemoveFile(type)}
                  disabled={isLoading}
                >
                  <Text style={styles.fileActionButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
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

  const renderContent = () => {
    switch (currentView) {
      case 'select': return renderSelectView();
      case 'form_bank': return renderBankForm();
      case 'form_card': return renderCardForm();
      case 'form_check': return renderCheckForm();
      default: return renderListView();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PaymentLoadingContext.Provider value={{ isLoading, availablePaises }}>
        {renderContent()}
      </PaymentLoadingContext.Provider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconImage: {
    width: 50,
    height: 32,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  editButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#051C2C',
  },
  methodSub: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonImage: {
    width: 25,
    height: 25,
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
  fileCardColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fileCardBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  fileCardBoxWithImage: {
    alignItems: 'flex-start',
  },
  fileActionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  fileActionButton: {
    backgroundColor: '#001b2a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  fileActionButtonDelete: {
    backgroundColor: '#E30613',
  },
  fileActionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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

const InputField = ({ label, placeholder, value, onChangeText, flex = 1, keyboardType, error, style, ...props }: any) => {
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

const CountryDropdownField = ({ label, value, onSelect, isOpen, setIsOpen, flex = 1, error }: any) => {
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

const CurrencyDropdownField = ({ label, value, onSelect, isOpen, setIsOpen, options, flex = 1, error }: any) => {
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

