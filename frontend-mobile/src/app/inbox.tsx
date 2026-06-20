import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, Stack, Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import MapComponent from '@/components/Map';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

import { API_URL } from '@/constants/api';

type Tab = 'miSubasta' | 'notificaciones' | 'historial';

export default function InboxScreen() {
  const [activeTab, setActiveTab] = React.useState<Tab>('notificaciones');
  const isFocused = useIsFocused();
  const [isGuest, setIsGuest] = React.useState<boolean | null>(null);

  const [expandedNotifIds, setExpandedNotifIds] = React.useState<string[]>([]);
  const toggleNotif = (id: string) => {
    setExpandedNotifIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [activeBids, setActiveBids] = React.useState<any[]>([]);
  const [activeAuctions, setActiveAuctions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showInspectionResult, setShowInspectionResult] = React.useState(false);
  const [showOfferDetails, setShowOfferDetails] = React.useState(false);
  const [showPaymentSelection, setShowPaymentSelection] = React.useState(false);
  const [showInspectionRejected, setShowInspectionRejected] = React.useState(false);
  const [showInspectionRequest, setShowInspectionRequest] = React.useState(false);
  const [showShippingInstructions, setShowShippingInstructions] = React.useState(false);
  const [showBidWon, setShowBidWon] = React.useState(false);
  const [showDeliverySelection, setShowDeliverySelection] = React.useState(false);
  const [showWonInvoice, setShowWonInvoice] = React.useState(false);
  const [showDeliverySuccess, setShowDeliverySuccess] = React.useState(false);
  const [wonItemDetails, setWonItemDetails] = React.useState<any>(null);
  const [deliveryType, setDeliveryType] = React.useState<'envio' | 'retiro'>('envio');
  const [showInsuranceDetails, setShowInsuranceDetails] = React.useState(false);
  const [selectedProductInsurance, setSelectedProductInsurance] = React.useState<any>(null);

  const [loggedInUserId, setLoggedInUserId] = React.useState<number | null>(null);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = React.useState<any>(null);
  const [showProposalSuccess, setShowProposalSuccess] = React.useState(false);
  const [showProposalRejected, setShowProposalRejected] = React.useState(false);
  
  // Payment Methods Data
  const [paymentMethods, setPaymentMethods] = React.useState<any[]>([
    { id: 'pm_1', type: 'card', name: 'VISA **** **** **** 2345' },
    { id: 'pm_2', type: 'bank', name: 'Cuenta Bancaria Galicia' },
  ]);
  const [selectedPayment, setSelectedPayment] = React.useState('pm_1');

  const [selectedLocation, setSelectedLocation] = React.useState({
    latitude: -34.6037, // Default a Buenos Aires
    longitude: -58.3816,
  });
  const [selectedAddress, setSelectedAddress] = React.useState('');

  const checkUserStatusAndFetch = React.useCallback(async () => {
    try {
      setLoading(true);
      const isGuestStr = await AsyncStorage.getItem('isGuest');
      const userStr = await AsyncStorage.getItem('user');
      const guestVal = (isGuestStr === 'true' || isGuestStr === null) && !userStr;
      setIsGuest(guestVal);

      if (!guestVal) {
        let personaId = 1;
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.identificador) {
            personaId = Number(user.identificador);
          }
        }
        setLoggedInUserId(personaId);

        const [notifRes, bidsRes, auctionsRes] = await Promise.all([
          fetch(`${API_URL}/inbox/${personaId}/notificaciones`).catch(() => null),
          fetch(`${API_URL}/inbox/${personaId}/pujas-activas`).catch(() => null),
          fetch(`${API_URL}/inbox/${personaId}/mis-subastas`).catch(() => null)
        ]);

        if (notifRes && notifRes.ok) {
          const notifs = await notifRes.json();
          setNotifications(notifs);
          if (notifs.length > 0) {
            setExpandedNotifIds([notifs[0].id?.toString()]);
          }
        }

        if (bidsRes && bidsRes.ok) {
          const bids = await bidsRes.json();
          // Filter to show only one bid per auction (the winning one, or the most recent)
          const bidsByAuction = new Map<string, any>();
          bids.forEach((bid: any) => {
            const existing = bidsByAuction.get(bid.subastaTitle);
            if (!existing) {
              bidsByAuction.set(bid.subastaTitle, bid);
            } else {
              if (bid.estado === 'Ganando' && existing.estado !== 'Ganando') {
                bidsByAuction.set(bid.subastaTitle, bid);
              }
            }
          });
          setActiveBids(Array.from(bidsByAuction.values()));
        }

        if (auctionsRes && auctionsRes.ok) {
          setActiveAuctions(await auctionsRes.json());
        }

        const pmResponse = await fetch(`${API_URL}/personas/${personaId}/metodos-pago`).catch(() => null);
        if (pmResponse && pmResponse.ok) {
          const pmData = await pmResponse.json();
          const filtered = pmData.filter((item: any) => !item.chequeCertificado).map((item: any) => {
            if (item.tarjetaCredito) {
              const num = item.tarjetaCredito.numeroTarjeta || '';
              const last4 = num.length >= 4 ? num.slice(-4) : num;
              return {
                id: String(item.identificador),
                type: 'card',
                name: `Tarjeta **** **** **** ${last4}`,
              };
            } else if (item.cuentaBancaria) {
              return {
                id: String(item.identificador),
                type: 'bank',
                name: `Cuenta Bancaria ${item.cuentaBancaria.nombreBanco || ''} (${item.cuentaBancaria.cbuIban || ''})`,
              };
            }
            return null;
          }).filter((i: any) => i !== null);
          
          if (filtered.length > 0) {
            setPaymentMethods(filtered);
            setSelectedPayment(filtered[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching inbox data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isFocused) return;
    checkUserStatusAndFetch();
  }, [isFocused, checkUserStatusAndFetch]);

  const renderBidCard = (bid: typeof activeBids[0]) => (
    <TouchableOpacity
      key={bid.id}
      style={styles.bidCard}
      onPress={() => router.push(('/auction/' + bid.id) as any)}
    >
      <Image source={bid.image ? { uri: bid.image } : require('@/assets/images/rolling_stone_auction.png')} style={styles.bidImage} />
      <View style={styles.bidContent}>
        <Text style={styles.subastaTitle}>{bid.subastaTitle}</Text>
        <Text style={styles.lote}>Lote {bid.lote} / {bid.totalLotes}</Text>
        <Text style={styles.articuloTitle}>{bid.articuloTitle}</Text>
        <View style={styles.pujaInfo}>
          <Text style={styles.miPujaLabel}>Mi Puja:</Text>
          <Text style={styles.miPujaValue}>{bid.miPuja}</Text>
        </View>
        <View style={styles.pujaMaxInfo}>
          <Text style={styles.pujaMaxLabel}>Puja Máxima:</Text>
          <Text style={styles.pujaMaxValue}>{bid.pujaMaxima}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAuctionCard = (auction: typeof activeAuctions[0]) => (
    <View key={auction.id} style={styles.auctionCardContainer}>
      <TouchableOpacity
        style={styles.bidCard}
        onPress={() => router.push(('/auction/' + auction.id) as any)}
      >
        <Image source={auction.image ? { uri: auction.image } : require('@/assets/images/rolling_stone_auction.png')} style={styles.bidImage} />
        <View style={styles.bidContent}>
          <Text style={styles.subastaTitle}>{auction.subastaTitle}</Text>
          <Text style={styles.lote}>Lote {auction.lote} / {auction.totalLotes}</Text>
          <Text style={styles.ubicacion}>{auction.ubicacion}</Text>
          <Text style={styles.articuloTitle}>{auction.articuloTitle}</Text>
          <View style={styles.pujaMaxInfo}>
            <Text style={styles.pujaMaxLabel}>Puja Máxima:</Text>
            <Text style={styles.pujaMaxValue}>{auction.pujaMaxima}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Ver Seguro y Depósito Button */}
      <TouchableOpacity 
        style={styles.insuranceButton}
        onPress={async () => {
          try {
            const res = await fetch(`${API_URL}/productos/${auction.id}/seguro`);
            if (res.ok) {
              const data = await res.json();
              setSelectedProductInsurance(data);
              setShowInsuranceDetails(true);
            } else {
              alert("Este artículo no posee un seguro activo.");
            }
          } catch (err) {
            console.error("Error fetching insurance:", err);
            alert("No se pudo obtener la información del seguro.");
          }
        }}
      >
        <SymbolView 
          // @ts-ignore
          name={{ ios: 'shield.fill', android: 'shield', web: 'shield' }} 
          size={16} 
          tintColor="#051C2C" 
        />
        <Text style={styles.insuranceButtonText}>Ver Seguro y Depósito</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationCard = (notif: typeof notifications[0]) => {
    const isExpanded = expandedNotifIds.includes(notif.id);
    
    return (
      <View key={notif.id} style={styles.notifCard}>
        <TouchableOpacity 
          style={styles.notifHeader} 
          onPress={() => toggleNotif(notif.id)}
          activeOpacity={0.7}
        >
          <View style={styles.notifHeaderText}>
            <Text style={styles.notifTitle}>{notif.titulo || notif.title}</Text>
            <Text style={styles.notifTime}>{notif.tiempoFormateado}</Text>
          </View>
          <SymbolView
            tintColor="#051C2C"
            // @ts-ignore
            name={isExpanded ? { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' } : { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
            size={24}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.notifBody}>
            <View style={styles.notifDivider} />
            <Text style={styles.notifBodyText}>{notif.body}</Text>
            {notif.buttonText && (
              <TouchableOpacity 
                style={styles.notifButton}
                onPress={async () => {
                  const actionStr = notif.action || '';
                  const parts = actionStr.split(':');
                  const actionType = parts[0];
                  const requestId = parts[1];

                  if (requestId) {
                    setSelectedRequestId(requestId);
                    if (actionType !== 'show_bid_won') {
                      try {
                        const response = await fetch(`${API_URL}/solicitudes-items/${requestId}`, {
                          headers: {
                            'Autorizacion': String(loggedInUserId || 1),
                          }
                        });
                        if (response.ok) {
                          const data = await response.json();
                          setSelectedProposal(data);
                        } else {
                          console.error('Error fetching request details:', response.statusText);
                        }
                      } catch (err) {
                        console.error('Network error fetching request details:', err);
                      }
                    } else {
                      try {
                        const response = await fetch(`${API_URL}/inbox/won-item/${requestId}`);
                        if (response.ok) {
                          const data = await response.json();
                          setWonItemDetails(data);
                        } else {
                          console.error('Error fetching won item details:', response.statusText);
                        }
                      } catch (err) {
                        console.error('Network error fetching won item details:', err);
                      }
                    }
                  } else {
                    setSelectedRequestId(null);
                    setSelectedProposal(null);
                  }

                  if (actionType === 'show_inspection_result') {
                    setShowInspectionResult(true);
                  } else if (actionType === 'show_inspection_rejected') {
                    setShowInspectionRejected(true);
                  } else if (actionType === 'show_inspection_request') {
                    setShowInspectionRequest(true);
                  } else if (actionType === 'show_bid_won') {
                    setShowBidWon(true);
                  } else if (notif.route) {
                    router.push(notif.route);
                  }
                }}
              >
                <Text style={styles.notifButtonText}>{notif.buttonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Tabs.Screen options={{ headerShown: false }} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Image
            source={require('@/assets/images/SplashBidOwl.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.centeredContent}>
          <SymbolView
            tintColor="#8A8A8A"
            // @ts-ignore
            name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
            size={48}
          />
          <Text style={styles.lockTitle}>Acceso Restringido</Text>
          <Text style={styles.lockSubtitle}>
            El inbox solamente está disponible para usuarios registrados.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.loginButtonText}>Registrarse o Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Image
            source={require('@/assets/images/SplashBidOwl.png')}
            style={styles.logo}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'miSubasta' && styles.tabActive]}
            onPress={() => setActiveTab('miSubasta')}
          >
            <Text
              style={[styles.tabText, activeTab === 'miSubasta' && styles.tabTextActive]}
            >
              Mi Subasta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'notificaciones' && styles.tabActive]}
            onPress={() => setActiveTab('notificaciones')}
          >
            <Text
              style={[styles.tabText, activeTab === 'notificaciones' && styles.tabTextActive]}
            >
              Notificaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'historial' && styles.tabActive]}
            onPress={() => setActiveTab('historial')}
          >
            <Text style={[styles.tabText, activeTab === 'historial' && styles.tabTextActive]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'miSubasta' && (
          <View style={styles.contentContainer}>
            {activeAuctions.length > 0 ? (
              activeAuctions.map(renderAuctionCard)
            ) : (
              <View style={styles.emptyState}>
                <SymbolView
                  tintColor="#8A8A8A"
                  // @ts-ignore
                  name={{ ios: 'gavel', android: 'gavel', web: 'gavel' }}
                  size={48}
                />
                <Text style={styles.emptyTitle}>Sin subastas publicadas</Text>
                <Text style={styles.emptySubtitle}>Publica tu primera subasta</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'notificaciones' && (
          <View style={styles.contentContainer}>
            {notifications.map(renderNotificationCard)}
          </View>
        )}

        {activeTab === 'historial' && (
          <View style={styles.emptyState}>
            <SymbolView
              tintColor="#8A8A8A"
              // @ts-ignore
              name={{ ios: 'clock', android: 'history', web: 'history' }}
              size={48}
            />
            <Text style={styles.emptyTitle}>Sin historial</Text>
            <Text style={styles.emptySubtitle}>Tu historial de pujas aparecerá aquí</Text>
          </View>
        )}
      </ScrollView>

      {/* Inspection Request Modal (Intermediate) */}
      <Modal visible={showInspectionRequest} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInspectionRequest(false)} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Inspección de Articulo</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={40} tintColor="#2E8B57" weight="bold" />
            </View>
            <Text style={styles.modalTitle}>Tu solicitud fue{'\n'}aceptada, pero{'\n'}debemos inspeccionar.</Text>
            <Text style={styles.modalSubtitle}>
              Ahora necesitamos inspeccionar el artículo para verificar su estado y asegurarnos de que cumpla con los estándares antes de incluirlo en una subasta.
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setShowInspectionRequest(false);
              setShowShippingInstructions(true);
            }}>
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Inspection Result Modal (Oferta Aceptada) */}
      <Modal visible={showInspectionResult} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInspectionResult(false)} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Resultado de Inspección</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={40} tintColor="#2E8B57" weight="bold" />
            </View>
            <Text style={styles.modalTitle}>Su articulo ha logrado{'\n'}pasar la inspección.</Text>
            <Text style={styles.modalSubtitle}>
              Te invitamos a ver una propuesta con el valor base sugerido y las comisiones correspondientes para su inclusión en la subasta.
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setShowInspectionResult(false);
              setShowOfferDetails(true);
            }}>
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Offer Details Modal */}
      <Modal visible={showOfferDetails} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowOfferDetails(false);
              setShowInspectionResult(true);
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Oferta del Articulo</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.offerTitle}>Nosotros proponemos...</Text>
            <Text style={styles.offerSubtitle}>
              Definimos estas condiciones buscando un equilibrio justo que maximice las posibilidades de venta y genere un beneficio tanto para vos como para la subasta.
            </Text>
            
            <View style={styles.offerCard}>
              <View style={styles.offerRow}>
                <Text style={styles.offerLabel}>Nombre del Bien</Text>
                <Text style={styles.offerValue}>{selectedProposal?.nombre || 'Cargando...'}</Text>
              </View>
              <View style={styles.offerRow}>
                <Text style={styles.offerLabel}>Ubicación de Subasta</Text>
                <Text style={styles.offerValue}>{selectedProposal?.propuesta?.ubicacionSubasta || 'No especificada'}</Text>
              </View>
              <View style={styles.offerRow}>
                <Text style={styles.offerLabel}>Fecha Estimada</Text>
                <Text style={styles.offerValue}>
                  {selectedProposal?.propuesta?.fechaEstimada 
                    ? selectedProposal.propuesta.fechaEstimada.split('-').reverse().join(' / ')
                    : 'No especificada'}
                </Text>
              </View>
              <View style={styles.offerRow}>
                <Text style={styles.offerLabel}>Valor Base Propuesto</Text>
                <Text style={styles.offerValue}>
                  {selectedProposal?.propuesta?.valorBase != null 
                    ? `${Number(selectedProposal.propuesta.valorBase).toLocaleString('es-AR')} AR$` 
                    : 'No especificado'}
                </Text>
              </View>
              <View style={[styles.offerRow, { marginBottom: 0 }]}>
                <Text style={styles.offerLabel}>Comision Recibida</Text>
                <Text style={styles.offerValue}>
                  {selectedProposal?.propuesta?.comision != null 
                    ? `${selectedProposal.propuesta.comision}% de Valor Final de Venta` 
                    : 'No especificada'}
                </Text>
              </View>
            </View>

            <Text style={styles.offerDecisionTitle}>Usted tiene la ultima palabra en esta negociación.</Text>
          </ScrollView>
          
          <View style={styles.offerFooter}>
            <TouchableOpacity style={[styles.shippingButton, { flex: 1, marginRight: 8 }]} onPress={() => {
              setShowOfferDetails(false);
              setShowPaymentSelection(true);
            }}>
              <Text style={styles.shippingButtonText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rejectButton, { flex: 1, marginLeft: 8 }]} onPress={async () => {
              if (selectedRequestId) {
                try {
                  const response = await fetch(`${API_URL}/solicitudes-items/${selectedRequestId}/propuesta/rechazar`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Autorizacion': String(loggedInUserId || 1),
                    },
                    body: JSON.stringify({
                      costoDevolucion: 0,
                    }),
                  });
                  if (response.ok) {
                    setShowOfferDetails(false);
                    setShowProposalRejected(true);
                  } else {
                    console.error('Error rejecting proposal:', response.statusText);
                    setShowOfferDetails(false);
                  }
                } catch (err) {
                  console.error('Network error rejecting proposal:', err);
                  setShowOfferDetails(false);
                }
              } else {
                setShowOfferDetails(false);
              }
            }}>
              <Text style={styles.rejectButtonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Payment Selection Modal */}
      <Modal visible={showPaymentSelection} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowPaymentSelection(false);
              setShowOfferDetails(true);
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Oferta del Articulo</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.offerTitle}>Seleccione donde se{'\n'}depositara la comisión.</Text>
            
            <View style={styles.paymentOptionsContainer}>
              {paymentMethods.map(method => (
                <TouchableOpacity 
                  key={method.id}
                  style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionSelected]} 
                  onPress={() => setSelectedPayment(method.id)}
                >
                  <View style={styles.paymentOptionLeft}>
                    {method.type === 'card' ? (
                      // @ts-ignore
                      <SymbolView name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }} size={24} tintColor="#051C2C" style={styles.paymentIcon} />
                    ) : null}
                    <Text style={[styles.paymentOptionText, method.type !== 'card' && { marginLeft: 0 }]}>{method.name}</Text>
                  </View>
                  <View style={[styles.radioCircle, selectedPayment === method.id && styles.radioCircleSelected]}>
                    {selectedPayment === method.id && <View style={styles.radioInnerCircle} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.offerFooter}>
            <TouchableOpacity style={[styles.shippingButton, { flex: 1 }]} onPress={async () => {
              if (selectedRequestId) {
                try {
                  const response = await fetch(`${API_URL}/solicitudes-items/${selectedRequestId}/propuesta/aceptar`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Autorizacion': String(loggedInUserId || 1),
                    },
                    body: JSON.stringify({
                      idCuentaDeposito: selectedPayment,
                    }),
                  });
                  if (response.ok) {
                    setShowPaymentSelection(false);
                    setShowProposalSuccess(true);
                  } else {
                    console.error('Error accepting proposal:', response.statusText);
                    setShowPaymentSelection(false);
                  }
                } catch (err) {
                  console.error('Network error accepting proposal:', err);
                  setShowPaymentSelection(false);
                }
              } else {
                setShowPaymentSelection(false);
              }
            }}>
              <Text style={styles.shippingButtonText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Proposal Success Confirmation Modal (Image 2) */}
      <Modal visible={showProposalSuccess} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowProposalSuccess(false);
              checkUserStatusAndFetch();
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Oferta del Articulo</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={40} tintColor="#2E8B57" weight="bold" />
            </View>
            <Text style={styles.modalTitle}>Su articulo ya esta listo{'\n'}para ser subastado.</Text>
            <Text style={styles.modalSubtitle}>
              Tu artículo ya está listo para ser subastado. Serás notificado con el resultado y podrás seguir la subasta desde la sección Mis Artículos en la Inbox.
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setShowProposalSuccess(false);
              checkUserStatusAndFetch();
            }}>
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Proposal Rejected Confirmation Modal (Image 3) */}
      <Modal visible={showProposalRejected} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowProposalRejected(false);
              checkUserStatusAndFetch();
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Oferta del Articulo</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <Image
              source={require('@/assets/images/logosintexto.png')}
              style={{ width: 80, height: 80, resizeMode: 'contain', marginBottom: 32 }}
            />
            <Text style={styles.modalTitle}>Respetamos su{'\n'}decisión y su articulo{'\n'}sera devuelto.</Text>
            <Text style={styles.modalSubtitle}>
              Su artículo será devuelto por nuestro equipo, asegurando que el proceso se realice de forma clara y pueda continuar con confianza dentro de la plataforma.
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.shippingButton} onPress={() => {
              setShowProposalRejected(false);
              checkUserStatusAndFetch();
            }}>
              <Text style={styles.shippingButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Inspection Rejected Modal (Oferta Rechazada) */}
      <Modal visible={showInspectionRejected} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInspectionRejected(false)} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Resultado de Inspección</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { borderColor: '#D9534F' }]}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={40} tintColor="#D9534F" weight="bold" />
            </View>
            <Text style={styles.modalTitle}>Su articulo no ha{'\n'}pasado la inspección,{'\n'}y sera devuelto.</Text>
            <Text style={styles.modalSubtitle}>
              Será devuelto a la dirección indicada junto con el detalle de los motivos correspondientes.
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.shippingButton} onPress={() => {
              setShowInspectionRejected(false);
            }}>
              <Text style={styles.shippingButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 1. ¡Ha obtenido un nuevo objeto! Modal (Image 1) */}
      <Modal visible={showBidWon} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBidWon(false)} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Lote Obtenido</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#051C2C', marginHorizontal: 20, marginTop: 16, marginBottom: 8 }}>
              ¡Ha obtenido un nuevo objeto!
            </Text>
            <Text style={{ color: '#2E8B57', fontWeight: 'bold', fontSize: 18, marginHorizontal: 20, marginBottom: 16 }}>
              {wonItemDetails?.subastaTitle}
            </Text>
            
            <View style={[styles.offerCard, { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 20 }]}>
              <Image 
                source={require('@/assets/images/rolling_stone_auction.png')} 
                style={{ width: 80, height: 120, resizeMode: 'contain', marginRight: 16 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#8A8A8A', marginBottom: 4 }}>
                  Lote {wonItemDetails?.loteIndex} / {wonItemDetails?.totalLotes}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#051C2C', marginBottom: 8 }}>
                  {wonItemDetails?.itemTitle}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 16, color: '#2E8B57', fontWeight: 'bold' }}>Mi Puja: </Text>
                  <Text style={{ fontSize: 16, color: '#051C2C', fontWeight: 'bold' }}>
                    {wonItemDetails?.importe ? (Number(wonItemDetails.importe).toLocaleString('es-AR') + ' AR$') : ''}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#8A8A8A', textDecorationLine: 'underline' }}>
                  Su puja fue la puja maxima.
                </Text>
              </View>
            </View>

            <Text style={[styles.modalSubtitle, { textAlign: 'left', marginHorizontal: 20, marginTop: 24, color: '#555', lineHeight: 22 }]}>
              Te entregaremos la factura correspondiente para formalizar la operación. A continuación, podrás confirmar la modalidad de entrega.
            </Text>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setShowBidWon(false);
              setShowDeliverySelection(true);
            }}>
              <Text style={styles.modalButtonText}>Ver Factura y Envio</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 2. Elegí cómo querés recibir tu objeto Modal (Image 2) */}
      <Modal visible={showDeliverySelection} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowDeliverySelection(false);
              setShowBidWon(true);
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Factura de Puja</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#051C2C', marginHorizontal: 20, marginTop: 16 }}>
              Elegí cómo querés recibir tu objeto
            </Text>

            {/* Custom Tab Segment */}
            <View style={[styles.tabsContainer, { marginHorizontal: 20, marginTop: 24, marginBottom: 20 }]}>
              <TouchableOpacity
                style={[styles.tab, deliveryType === 'envio' && styles.tabActive]}
                onPress={() => setDeliveryType('envio')}
              >
                <Text style={[styles.tabText, deliveryType === 'envio' && styles.tabTextActive]}>
                  Envio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, deliveryType === 'retiro' && styles.tabActive]}
                onPress={() => setDeliveryType('retiro')}
              >
                <Text style={[styles.tabText, deliveryType === 'retiro' && styles.tabTextActive]}>
                  Retirarlo
                </Text>
              </TouchableOpacity>
            </View>

            {deliveryType === 'envio' ? (
              <View style={[styles.offerCard, { marginHorizontal: 20, padding: 16 }]}>
                <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Domicilio Legal</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C', marginBottom: 16 }}>
                  {wonItemDetails?.domicilio || 'No especificado'}
                </Text>
                <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Costo de Envio</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                  {wonItemDetails?.costoEnvio ? (Number(wonItemDetails.costoEnvio).toLocaleString('es-AR') + ' AR$') : '20.000 AR$'}
                </Text>
              </View>
            ) : (
              <View style={{ marginHorizontal: 20 }}>
                <View style={[styles.offerCard, { padding: 16, marginBottom: 12 }]}>
                  <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Retiro Personal</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#051C2C', marginBottom: 16 }}>
                    Depósito Central BidOwl Pilar
                  </Text>
                  <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Costo de Envio</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                    0 AR$
                  </Text>
                </View>
                
                {/* Warning Card */}
                <View style={[styles.warningCard, { padding: 16, marginBottom: 20 }]}>
                  <Text style={styles.warningText}>
                    ⚠️ Al retirar el bien personalmente, se perderá la cobertura del seguro contratado.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#ADFF2F', borderColor: '#ADFF2F' }]} 
              onPress={() => {
                setShowDeliverySelection(false);
                setShowWonInvoice(true);
              }}
            >
              <Text style={[styles.modalButtonText, { color: '#051C2C', fontWeight: 'bold' }]}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 3. Factura de Puja Realizada Modal (Image 3) */}
      <Modal visible={showWonInvoice} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowWonInvoice(false);
              setShowDeliverySelection(true);
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Factura de Puja</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.offerContent} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#051C2C', marginHorizontal: 20, marginTop: 16 }}>
              Factura de Puja Realizada.
            </Text>
            
            <View style={[styles.offerCard, { marginHorizontal: 20, padding: 16, marginTop: 24 }]}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Nombre del Bien</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                  {wonItemDetails?.itemTitle}
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Valor Base Propuesto</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                  {wonItemDetails?.importe ? (Number(wonItemDetails.importe).toLocaleString('es-AR') + ' AR$') : ''}
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Costo de Envio</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>
                  {deliveryType === 'envio' 
                    ? (wonItemDetails?.costoEnvio ? (Number(wonItemDetails.costoEnvio).toLocaleString('es-AR') + ' AR$') : '20.000 AR$')
                    : '0 AR$'
                  }
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 }} />

              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#8A8A8A', marginBottom: 4 }}>Total</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#051C2C' }}>
                  {(() => {
                    const base = wonItemDetails?.importe ? Number(wonItemDetails.importe) : 0;
                    const shipping = (deliveryType === 'envio' && wonItemDetails?.costoEnvio) ? Number(wonItemDetails.costoEnvio) : 0;
                    return (base + shipping).toLocaleString('es-AR') + ' AR$';
                  })()}
                </Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#ADFF2F', borderColor: '#ADFF2F' }]} 
              onPress={async () => {
                if (wonItemDetails && wonItemDetails.itemId) {
                  try {
                    const base = wonItemDetails.importe ? Number(wonItemDetails.importe) : 0;
                    const shipping = (deliveryType === 'envio' && wonItemDetails.costoEnvio) ? Number(wonItemDetails.costoEnvio) : 0;
                    
                    const response = await fetch(`${API_URL}/inbox/won-item/${wonItemDetails.itemId}/confirmar-entrega`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Autorizacion': String(loggedInUserId || 1),
                      },
                      body: JSON.stringify({
                        tipoEntrega: deliveryType,
                        costoEnvio: shipping,
                        total: base + shipping
                      }),
                    });
                    
                    if (response.ok) {
                      setShowWonInvoice(false);
                      setShowDeliverySuccess(true);
                    } else {
                      console.error('Error confirming delivery details:', response.statusText);
                      setShowWonInvoice(false);
                    }
                  } catch (err) {
                    console.error('Network error confirming delivery details:', err);
                    setShowWonInvoice(false);
                  }
                } else {
                  setShowWonInvoice(false);
                }
              }}
            >
              <Text style={[styles.modalButtonText, { color: '#051C2C', fontWeight: 'bold' }]}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 4. Envio del Articulo Success Modal (Image 4) */}
      <Modal visible={showDeliverySuccess} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowDeliverySuccess(false);
              checkUserStatusAndFetch();
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{deliveryType === 'envio' ? 'Envio del Articulo' : 'Retiro del Articulo'}</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={40} tintColor="#2E8B57" weight="bold" />
            </View>
            <Text style={[styles.modalTitle, { fontSize: 24 }]}>
              {deliveryType === 'envio' 
                ? 'Su articulo sera\nenviado a su domicilio\nen a lo largo de la\nsemana.'
                : 'Su articulo esta\nlisto para ser retirado\nen nuestro deposito.'
              }
            </Text>
            <Text style={styles.modalSubtitle}>
              {deliveryType === 'envio'
                ? 'Nuestro equipo se encargará de coordinar la logística para garantizar una entrega segura y en tiempo estimado.'
                : 'Podes pasar a buscarlo de lunes a viernes de 9 a 18 hs con tu DNI y el código de transacción de la subasta.'
              }
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setShowDeliverySuccess(false);
              checkUserStatusAndFetch();
            }}>
              <Text style={styles.modalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Shipping Instructions Modal (Map) */}
      <Modal visible={showShippingInstructions} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowShippingInstructions(false);
              setShowInspectionRequest(true);
            }} style={styles.modalBackButton}>
              {/* @ts-ignore */}
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }} size={24} tintColor="#051C2C" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Inspección de Articulo</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.shippingContent} showsVerticalScrollIndicator={false}>
            <View style={styles.mapContainer}>
              <MapComponent 
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                addressText={selectedAddress}
                onAddressChange={setSelectedAddress}
              />
            </View>
            <Text style={styles.shippingTitle}>Envia el articulo a la{'\n'}ubicación indicada{'\n'}para continuar.</Text>
            <Text style={styles.shippingSubtitle}>
              Una vez recibido, continuaremos con la inspección para avanzar con su inclusión en la subasta.
            </Text>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.shippingButton} onPress={async () => {
              console.log('Ubicación seleccionada:', selectedLocation, 'Dirección:', selectedAddress);
              if (selectedRequestId) {
                try {
                  const response = await fetch(`${API_URL}/solicitudes-items/${selectedRequestId}/acuerdo-envio`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Autorizacion': String(loggedInUserId || 1),
                    },
                    body: JSON.stringify({
                      aceptaTerminos: true,
                    }),
                  });
                  if (response.ok) {
                    checkUserStatusAndFetch();
                  } else {
                    console.error('Error accepting shipping agreement:', response.statusText);
                  }
                } catch (err) {
                  console.error('Network error accepting shipping agreement:', err);
                }
              }
              setShowShippingInstructions(false);
            }}>
              <Text style={styles.shippingButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Insurance Drawer Modal */}
      <Modal visible={showInsuranceDetails} animationType="slide" transparent={true} onRequestClose={() => setShowInsuranceDetails(false)}>
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Seguro y Depósito</Text>
              <TouchableOpacity onPress={() => setShowInsuranceDetails(false)} style={styles.drawerCloseButton}>
                {/* @ts-ignore */}
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={24} tintColor="#051C2C" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
              <View style={styles.insuranceDetailCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                  <SymbolView 
                    // @ts-ignore
                    name={{ ios: 'shield.fill', android: 'shield', web: 'shield' }} 
                    size={24} 
                    tintColor="#2E8B57" 
                  />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>Póliza Activa</Text>
                </View>

                <View style={styles.drawerRow}>
                  <Text style={styles.drawerLabel}>Compañía Aseguradora</Text>
                  <Text style={styles.drawerValue}>{selectedProductInsurance?.compania || 'La Segunda Cooperativa de Seguros'}</Text>
                </View>

                <View style={styles.drawerRow}>
                  <Text style={styles.drawerLabel}>Número de Póliza</Text>
                  <Text style={styles.drawerValue}>{selectedProductInsurance?.nroPoliza || 'N/A'}</Text>
                </View>

                <View style={styles.drawerRow}>
                  <Text style={styles.drawerLabel}>Cobertura Asegurada</Text>
                  <Text style={[styles.drawerValue, { color: '#2E8B57', fontSize: 18 }]}>
                    {selectedProductInsurance?.importe != null 
                      ? `${Number(selectedProductInsurance.importe).toLocaleString('es-AR')} AR$` 
                      : 'N/A'}
                  </Text>
                </View>

                <View style={[styles.drawerRow, { marginBottom: 0 }]}>
                  <Text style={styles.drawerLabel}>Póliza Combinada</Text>
                  <Text style={styles.drawerValue}>{selectedProductInsurance?.polizaCombinada === 'si' ? 'Sí' : 'No'}</Text>
                </View>
              </View>

              <View style={styles.insuranceDetailCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                  <SymbolView 
                    // @ts-ignore
                    name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} 
                    size={24} 
                    tintColor="#051C2C" 
                  />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#051C2C' }}>Ubicación Física</Text>
                </View>

                <View style={[styles.drawerRow, { marginBottom: 0 }]}>
                  <Text style={styles.drawerLabel}>Depósito de Custodia</Text>
                  <Text style={styles.drawerValue}>{selectedProductInsurance?.ubicacionDeposito || 'Depósito Central BidOwl Pilar, Estantería B4'}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <TouchableOpacity 
                style={styles.expandInsuranceButton}
                onPress={() => {
                  alert("¡Solicitud enviada! Nos contactaremos a la brevedad con la aseguradora para ampliar su cobertura.");
                  setShowInsuranceDetails(false);
                }}
              >
                <Text style={styles.expandInsuranceButtonText}>Aumentar Cobertura</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + 40,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#051C2C',
  },
  logo: {
    width: 90,
    height: 35,
    resizeMode: 'contain',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#051C2C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  tabTextActive: {
    color: '#051C2C',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#BEE757',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#051C2C',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 12,
  },
  bidCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bidImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  bidContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  subastaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E63946',
    marginBottom: 4,
  },
  lote: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BEE757',
    marginBottom: 2,
  },
  ubicacion: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8A8A',
    marginBottom: 2,
  },
  articuloTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#051C2C',
    marginBottom: 6,
  },
  pujaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  miPujaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  miPujaValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#051C2C',
  },
  pujaMaxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pujaMaxLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  pujaMaxValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BEE757',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#051C2C',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 8,
    textAlign: 'center',
  },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16,
    overflow: 'hidden',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  notifHeaderText: {
    flex: 1,
    paddingRight: 16,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  notifBody: {
    padding: 16,
    paddingTop: 0,
  },
  notifDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },
  notifBodyText: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 20,
    marginBottom: 16,
  },
  notifButton: {
    backgroundColor: '#2E8B57', // Darker green as per image
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  notifButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalBackButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 16,
    lineHeight: 34,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#8A8A8A',
    lineHeight: 24,
  },
  modalFooter: {
    padding: 24,
    paddingBottom: 40,
  },
  modalButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  shippingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 24,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  shippingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 16,
    lineHeight: 34,
  },
  shippingSubtitle: {
    fontSize: 16,
    color: '#8A8A8A',
    lineHeight: 24,
  },
  shippingButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shippingButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '700',
  },
  offerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#051C2C',
    marginBottom: 12,
  },
  offerSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 22,
    marginBottom: 24,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 20,
    marginBottom: 32,
  },
  offerRow: {
    marginBottom: 20,
  },
  offerLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 4,
  },
  offerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
  },
  offerDecisionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#051C2C',
    textAlign: 'center',
    marginBottom: 24,
  },
  offerFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  rejectButton: {
    backgroundColor: '#BA4A5A',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  paymentOptionsContainer: {
    marginTop: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16,
  },
  paymentOptionSelected: {
    borderColor: '#E5E5E5', // Keep border the same or highlight if desired
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    marginRight: 16,
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#051C2C',
    fontWeight: '500',
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#BEE757',
    borderWidth: 2,
  },
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#BEE757',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#051C2C',
    marginTop: 16,
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#051C2C',
    fontSize: 14,
    fontWeight: '700',
  },
  warningCard: {
    backgroundColor: '#FFF2E6',
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
  },
  warningText: {
    color: '#D45B00',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  auctionCardContainer: {
    marginBottom: 16,
  },
  insuranceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F2F6E6',
    borderWidth: 1,
    borderColor: '#BEE757',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: -4,
  },
  insuranceButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#051C2C',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#051C2C',
  },
  drawerCloseButton: {
    padding: 4,
  },
  drawerContent: {
    padding: 20,
  },
  insuranceDetailCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    marginBottom: 16,
  },
  drawerRow: {
    marginBottom: 16,
  },
  drawerLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 4,
  },
  drawerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#051C2C',
  },
  drawerFooter: {
    paddingHorizontal: 20,
  },
  expandInsuranceButton: {
    backgroundColor: '#BEE757',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  expandInsuranceButtonText: {
    color: '#051C2C',
    fontSize: 16,
    fontWeight: '700',
  },
});
