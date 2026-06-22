import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { InputField } from './FormFields';

interface CreditCardFormProps {
  renderHeader: (title: string, onBackPress: () => void, isCloseIcon?: boolean) => React.ReactNode;
  onCancel: () => void;
  cardNumero: string;
  setCardNumero: (val: string) => void;
  cardNumeroError: string;
  setCardNumeroError: (val: string) => void;
  cardTitular: string;
  setCardTitular: (val: string) => void;
  cardTitularError: string;
  setCardTitularError: (val: string) => void;
  cardVencimiento: string;
  setCardVencimiento: (val: string) => void;
  cardVencimientoError: string;
  setCardVencimientoError: (val: string) => void;
  cardCvv: string;
  setCardCvv: (val: string) => void;
  cardCvvError: string;
  setCardCvvError: (val: string) => void;
  handleAddCard: () => void;
  isLoading: boolean;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({
  renderHeader,
  onCancel,
  cardNumero,
  setCardNumero,
  cardNumeroError,
  setCardNumeroError,
  cardTitular,
  setCardTitular,
  cardTitularError,
  setCardTitularError,
  cardVencimiento,
  setCardVencimiento,
  cardVencimientoError,
  setCardVencimientoError,
  cardCvv,
  setCardCvv,
  cardCvvError,
  setCardCvvError,
  handleAddCard,
  isLoading,
}) => {
  return (
    <View style={styles.container}>
      {renderHeader('Agregar Metodo de Pago', onCancel, true)}
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
    marginBottom: 24,
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
  row: {
    flexDirection: 'row',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  acceptButton: {
    backgroundColor: '#bcf259',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#001b2a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
