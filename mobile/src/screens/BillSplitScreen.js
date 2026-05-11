import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency } from '../utils/formatters';
import { useLang } from '../context/LangContext';
import { deductFromPocket } from '../services/mockData';

const TRANSLATIONS = {
  bm: {
    back: '←',
    headerTitle: 'Bahagi Bil',
    scanning: 'Mengimbas resit...',
    scanningDesc: 'AI sedang mengenali item bil kamu',
    itemsFoundSuffix: 'item dijumpai!',
    rescan: 'Ketik untuk imbas semula',
    scanTitle: 'Imbas Resit',
    scanDesc: 'Ketik untuk simulasi AI OCR — item bil akan diisi automatik',
    scanBadge: '✨ Ketik di sini untuk mula',
    billItems: '🧾 Item Bil',
    noItems: 'Tiada item lagi — imbas resit atau tambah manual di bawah',
    involved: 'Terlibat:',
    perPerson: '/org',
    itemPlaceholder: 'Nama item',
    perPersonTitle: '💰 Jumlah Per Orang',
    paymentStatus: 'Status Bayaran',
    paidSuffix: 'dah bayar',
    paidBadge: '✓ Dah bayar',
    unpaid: 'Belum',
    duitnow: 'Jana QR DuitNow',
    cutFromPocket: '🏦 Potong dari Pocket',
    cutModalTitle: 'Potong dari Pocket',
    cutModalBody: (amt) => `Jumlah ${amt} (belum bayar sahaja) akan dipotong dari Pocket bersama.`,
    confirm: 'Sahkan',
    cancel: 'Batal',
    siap: '✅ Siap',
    notAllPaid: '⚠️ Belum semua orang bayar. Tandakan semua sebagai dah bayar atau guna Potong dari Pocket.',
    billComplete: '🎉 Bil selesai! Semua orang dah bayar.',
    closeBill: '← Kembali ke Poket',
    duitnowModalTitle: 'QR DuitNow',
    duitnowModalDesc: (name, amt) => `${name} boleh imbas QR ini untuk bayar ${amt}`,
    duitnowClose: 'Tutup',
    payTo: 'Bayar kepada:',
    amount: 'Jumlah:',
    quitTitle: 'Keluar Bahagi Bil?',
    quitBody: 'Sesetengah orang belum bayar lagi. Adakah kamu pasti mahu keluar?',
    quitConfirm: 'Ya, Keluar',
    quitCancel: 'Batal',
  },
  en: {
    back: '←',
    headerTitle: 'Split Bill',
    scanning: 'Scanning receipt...',
    scanningDesc: 'AI is recognising your bill items',
    itemsFoundSuffix: 'items found!',
    rescan: 'Tap to scan again',
    scanTitle: 'Scan Receipt',
    scanDesc: 'Tap to simulate AI OCR — bill items will be filled automatically',
    scanBadge: '✨ Tap here to start',
    billItems: '🧾 Bill Items',
    noItems: 'No items yet — scan receipt or add manually below',
    involved: 'Involved:',
    perPerson: '/ea',
    itemPlaceholder: 'Item name',
    perPersonTitle: '💰 Amount Per Person',
    paymentStatus: 'Payment Status',
    paidSuffix: 'paid',
    paidBadge: '✓ Paid',
    unpaid: 'Unpaid',
    duitnow: 'Generate DuitNow QR',
    cutFromPocket: '🏦 Cut from Pocket',
    cutModalTitle: 'Cut from Pocket',
    cutModalBody: (amt) => `${amt} (unpaid members only) will be deducted from the shared Pocket.`,
    confirm: 'Confirm',
    cancel: 'Cancel',
    siap: '✅ Done',
    notAllPaid: '⚠️ Not everyone has paid yet. Mark all as paid or use Cut from Pocket.',
    billComplete: '🎉 Bill complete! Everyone has paid.',
    closeBill: '← Back to Pocket',
    duitnowModalTitle: 'DuitNow QR',
    duitnowModalDesc: (name, amt) => `${name} can scan this QR to pay ${amt}`,
    duitnowClose: 'Close',
    payTo: 'Pay to:',
    amount: 'Amount:',
    quitTitle: 'Leave Split Bill?',
    quitBody: 'Some payments are still pending. Are you sure you want to quit?',
    quitConfirm: 'Yes, Leave',
    quitCancel: 'Cancel',
  },
};

const OCR_ITEMS = [
  { id: 'ocr_1', name: 'Nasi Goreng Spesial', price: 12.50, qty: 2 },
  { id: 'ocr_2', name: 'Ayam Masak Merah', price: 18.00, qty: 1 },
  { id: 'ocr_3', name: 'Teh Tarik', price: 3.50, qty: 4 },
  { id: 'ocr_4', name: 'Roti Canai Telur', price: 2.50, qty: 3 },
  { id: 'ocr_5', name: 'Milo Ais', price: 4.00, qty: 2 },
];

const PAYERS = [
  { id: 'p1', name: 'Azri', initials: 'AZ', colour: '#7C5CF5', paid: false },
  { id: 'p2', name: 'Siti', initials: 'ST', colour: '#00B4D8', paid: false },
  { id: 'p3', name: 'Hafiz', initials: 'HF', colour: '#FFB703', paid: false },
  { id: 'p4', name: 'Nur', initials: 'NR', colour: '#2DC653', paid: false },
  { id: 'p5', name: 'Danial', initials: 'DN', colour: '#E63946', paid: false },
];

const ALL_PAYER_IDS = PAYERS.map((p) => p.id);

function makeItem(id, name, price, qty) {
  return { id, name, price, qty, involvedPayers: [...ALL_PAYER_IDS] };
}

// Simple QR grid simulation (5×5 blocks to look like a QR code)
function FakeQR({ size = 140, colour = COLORS.primary }) {
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,0,1,1,0,1,1],
    [0,1,0,0,1,0,0,0,1,1,0,1,0,0,1,0,0],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,1,0,1,1],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,1,1],
  ];
  const cellSize = size / cells.length;
  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff', padding: 4 }}>
      {cells.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? colour : '#fff',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function BillSplitScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const [items, setItems] = useState([]);
  const [payers, setPayers] = useState(PAYERS);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [showCutModal, setShowCutModal] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [billDone, setBillDone] = useState(false);
  const [doneError, setDoneError] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPayer, setQrPayer] = useState(null);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const paidCount = payers.filter((p) => p.paid).length;
  const allPaid = paidCount === payers.length;

  const perPersonShare = useMemo(() => {
    const shares = {};
    payers.forEach((p) => { shares[p.id] = 0; });
    items.forEach((item) => {
      const involved = item.involvedPayers.length > 0 ? item.involvedPayers : ALL_PAYER_IDS;
      const perHead = (item.price * item.qty) / involved.length;
      involved.forEach((pid) => {
        if (pid in shares) shares[pid] += perHead;
      });
    });
    return shares;
  }, [items, payers]);

  const unpaidTotal = useMemo(() => {
    return payers
      .filter((p) => !p.paid)
      .reduce((sum, p) => sum + (perPersonShare[p.id] || 0), 0);
  }, [payers, perPersonShare]);

  const adjustQty = (id, delta) =>
    setItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item)
    );

  const removeItem = (id) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const togglePayerForItem = (itemId, payerId) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const already = item.involvedPayers.includes(payerId);
        const next = already
          ? item.involvedPayers.filter((id) => id !== payerId)
          : [...item.involvedPayers, payerId];
        return { ...item, involvedPayers: next.length > 0 ? next : item.involvedPayers };
      })
    );
  };

  const addItem = () => {
    if (!newItemName || !newItemPrice) return;
    setItems((prev) => [...prev, makeItem(`item_${Date.now()}`, newItemName, parseFloat(newItemPrice), 1)]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const togglePaid = (id) => {
    setPayers((prev) => prev.map((p) => p.id === id ? { ...p, paid: !p.paid } : p));
    setDoneError(false);
    setBillDone(false);
  };

  const handleCutFromPocket = () => {
    if (unpaidTotal > 0) deductFromPocket('pocket_001', unpaidTotal);
    setPayers((prev) => prev.map((p) => p.paid ? p : { ...p, paid: true }));
    setShowCutModal(false);
    setBillDone(true);
    setDoneError(false);
  };

  const handleGoBack = () => {
    if (!allPaid && items.length > 0) {
      setShowQuitConfirm(true);
    } else {
      navigation.goBack();
    }
  };

  const handleSiap = () => {
    if (!allPaid) {
      setDoneError(true);
      setBillDone(false);
      return;
    }
    setDoneError(false);
    setBillDone(true);
  };

  const openQR = (payer) => {
    setQrPayer(payer);
    setShowQRModal(true);
  };

  const startOCR = () => {
    if (ocrScanning) return;
    setOcrDone(false);
    setOcrScanning(true);
    setItems([]);
    setBillDone(false);
    setDoneError(false);
    setTimeout(() => {
      setItems(OCR_ITEMS.map((item) => makeItem(item.id, item.name, item.price, item.qty)));
      setOcrScanning(false);
      setOcrDone(true);
    }, 2200);
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── OCR Scan card ── */}
        <TouchableOpacity
          style={[styles.cameraCard, ocrDone && styles.cameraCardDone]}
          activeOpacity={0.8}
          onPress={startOCR}
          disabled={ocrScanning}
        >
          {ocrScanning ? (
            <>
              <ActivityIndicator color={COLORS.primary} size="large" style={{ marginBottom: 10 }} />
              <Text style={styles.cameraTitle}>{t.scanning}</Text>
              <Text style={styles.cameraDesc}>{t.scanningDesc}</Text>
            </>
          ) : ocrDone ? (
            <>
              <Text style={styles.cameraIcon}>✅</Text>
              <Text style={styles.cameraTitle}>{items.length} {t.itemsFoundSuffix}</Text>
              <Text style={[styles.cameraDesc, { color: COLORS.success }]}>{t.rescan}</Text>
            </>
          ) : (
            <>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraTitle}>{t.scanTitle}</Text>
              <Text style={styles.cameraDesc}>{t.scanDesc}</Text>
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraBadgeText}>{t.scanBadge}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* ── Bill items ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.billItems}</Text>

          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsText}>{t.noItems}</Text>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.billItemBlock}>
                <View style={styles.billItemRow}>
                  <View style={styles.billItemLeft}>
                    <Text style={styles.billItemName}>{item.name}</Text>
                    <Text style={styles.billItemPrice}>
                      {formatCurrency(item.price)} × {item.qty} = {formatCurrency(item.price * item.qty)}
                    </Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => adjustQty(item.id, -1)}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => adjustQty(item.id, 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.payerChipsRow}>
                  <Text style={styles.payerChipsLabel}>{t.involved}</Text>
                  {payers.map((p) => {
                    const selected = item.involvedPayers.includes(p.id);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => togglePayerForItem(item.id, p.id)}
                        style={[
                          styles.payerChip,
                          {
                            backgroundColor: selected ? p.colour : COLORS.background,
                            borderColor: p.colour,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.payerChipText, { color: selected ? '#fff' : p.colour }]}>
                          {p.initials}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <Text style={styles.perHeadLabel}>
                    {formatCurrency((item.price * item.qty) / item.involvedPayers.length)}{t.perPerson}
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.addItemRow}>
            <TextInput
              style={[styles.addItemInput, { flex: 2 }]}
              placeholder={t.itemPlaceholder}
              placeholderTextColor={COLORS.textLight}
              value={newItemName}
              onChangeText={setNewItemName}
              returnKeyType="next"
            />
            <TextInput
              style={[styles.addItemInput, { flex: 1, marginHorizontal: 6 }]}
              placeholder="RM"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              returnKeyType="done"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
            />
            <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
              <Text style={styles.addItemBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Per-person summary ── */}
        {items.length > 0 && (
          <View style={styles.splitCard}>
            <View style={styles.splitCardHeader}>
              <Text style={styles.splitCardTitle}>{t.perPersonTitle}</Text>
              <Text style={styles.splitCardTotal}>{formatCurrency(totalAmount)}</Text>
            </View>
            {payers.map((p) => (
              <View key={p.id} style={styles.perPersonRow}>
                <View style={[styles.miniAvatar, { backgroundColor: p.colour }]}>
                  <Text style={styles.miniAvatarText}>{p.initials}</Text>
                </View>
                <Text style={styles.perPersonName}>{p.name}</Text>
                <Text style={styles.perPersonAmt}>{formatCurrency(perPersonShare[p.id] || 0)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Payment status ── */}
        {items.length > 0 && (
          <View style={styles.card}>
            <View style={styles.paymentStatusHeader}>
              <Text style={styles.cardTitle}>{t.paymentStatus}</Text>
              <Text style={styles.paymentCount}>
                <Text style={{ color: COLORS.success, fontWeight: '800' }}>{paidCount}</Text>
                /{payers.length} {t.paidSuffix}
              </Text>
            </View>

            {payers.map((payer) => (
              <TouchableOpacity
                key={payer.id}
                style={styles.payerRow}
                onPress={() => togglePaid(payer.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.payerAvatar, { backgroundColor: payer.colour }]}>
                  <Text style={styles.payerInitials}>{payer.initials}</Text>
                </View>
                <Text style={styles.payerName}>{payer.name}</Text>
                <Text style={styles.payerAmount}>{formatCurrency(perPersonShare[payer.id] || 0)}</Text>
                <View style={[styles.payerStatus, { backgroundColor: payer.paid ? COLORS.success + '20' : COLORS.danger + '15' }]}>
                  <Text style={[styles.payerStatusText, { color: payer.paid ? COLORS.success : COLORS.danger }]}>
                    {payer.paid ? t.paidBadge : t.unpaid}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Generate DuitNow QR — shows QR for each unpaid person */}
            <TouchableOpacity
              style={styles.duitnowBtn}
              activeOpacity={0.85}
              onPress={() => {
                const firstUnpaid = payers.find((p) => !p.paid);
                if (firstUnpaid) openQR(firstUnpaid);
              }}
            >
              <Text style={styles.duitnowIcon}>📱</Text>
              <Text style={styles.duitnowText}>{t.duitnow}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cutPocketBtn}
              onPress={() => setShowCutModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.cutPocketText}>{t.cutFromPocket}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Siap / Done button ── */}
        {items.length > 0 && (
          <View style={styles.siapSection}>
            {doneError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{t.notAllPaid}</Text>
              </View>
            )}
            {billDone ? (
              <>
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>{t.billComplete}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBillBtn}
                  onPress={() => navigation.navigate('Pocket')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.closeBillBtnText}>{t.closeBill}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.siapBtn}
                onPress={handleSiap}
                activeOpacity={0.85}
              >
                <Text style={styles.siapBtnText}>{t.siap}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Cut from Pocket Modal ── */}
      <Modal visible={showCutModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.cutModalTitle}</Text>
            <Text style={styles.modalBody}>{t.cutModalBody(formatCurrency(unpaidTotal))}</Text>
            <Text style={styles.modalTotal}>{formatCurrency(unpaidTotal)}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setShowCutModal(false)}>
                <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimary} onPress={handleCutFromPocket}>
                <Text style={styles.modalPrimaryText}>{t.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Quit Confirmation Modal ── */}
      <Modal visible={showQuitConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderRadius: 20, margin: 24 }]}>
            <Text style={styles.modalTitle}>{t.quitTitle}</Text>
            <Text style={styles.modalBody}>{t.quitBody}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setShowQuitConfirm(false)}>
                <Text style={styles.modalSecondaryText}>{t.quitCancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalPrimary, { backgroundColor: COLORS.danger }]} onPress={() => { setShowQuitConfirm(false); navigation.goBack(); }}>
                <Text style={styles.modalPrimaryText}>{t.quitConfirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── DuitNow QR Modal ── */}
      <Modal visible={showQRModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.modalTitle}>{t.duitnowModalTitle}</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Text style={styles.qrClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {qrPayer && (
              <>
                <View style={styles.qrPayerRow}>
                  <View style={[styles.qrAvatar, { backgroundColor: qrPayer.colour }]}>
                    <Text style={styles.qrAvatarText}>{qrPayer.initials}</Text>
                  </View>
                  <View style={styles.qrPayerInfo}>
                    <Text style={styles.qrPayTo}>{t.payTo}</Text>
                    <Text style={styles.qrPayerName}>Azri (Pemilik Pocket)</Text>
                  </View>
                </View>

                <View style={styles.qrContainer}>
                  <FakeQR size={160} colour={COLORS.primary} />
                </View>

                <View style={styles.qrAmtRow}>
                  <Text style={styles.qrAmtLabel}>{t.amount}</Text>
                  <Text style={styles.qrAmtValue}>{formatCurrency(perPersonShare[qrPayer.id] || 0)}</Text>
                </View>

                <Text style={styles.qrDesc}>
                  {t.duitnowModalDesc(qrPayer.name, formatCurrency(perPersonShare[qrPayer.id] || 0))}
                </Text>

                {/* Cycle through unpaid payers */}
                {payers.filter((p) => !p.paid && p.id !== qrPayer.id).length > 0 && (
                  <View style={styles.qrOthersRow}>
                    {payers.filter((p) => !p.paid && p.id !== qrPayer.id).map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setQrPayer(p)}
                        style={[styles.qrOtherChip, { borderColor: p.colour }]}
                      >
                        <View style={[styles.qrOtherDot, { backgroundColor: p.colour }]} />
                        <Text style={[styles.qrOtherName, { color: p.colour }]}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.qrCloseBtn}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.qrCloseBtnText}>{t.duitnowClose}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 18, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  placeholder: { width: 60 },

  cameraCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 20, alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed',
  },
  cameraCardDone: { borderStyle: 'solid', borderColor: COLORS.success },
  cameraIcon: { fontSize: 36, marginBottom: 8 },
  cameraTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  cameraDesc: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 10 },
  cameraBadge: { backgroundColor: COLORS.primary + '25', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  cameraBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },

  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },

  emptyItems: { paddingVertical: 20, alignItems: 'center' },
  emptyItemsText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },

  billItemBlock: {
    borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 10, marginBottom: 10,
  },
  billItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  billItemLeft: { flex: 1, paddingRight: 8 },
  billItemName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  billItemPrice: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  qtyBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  qtyValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, minWidth: 18, textAlign: 'center' },
  removeBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.danger + '15', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 12, color: COLORS.danger, fontWeight: '700' },

  payerChipsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  payerChipsLabel: { fontSize: 11, color: COLORS.textLight, marginRight: 2 },
  payerChip: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', borderWidth: 2,
  },
  payerChipText: { fontSize: 10, fontWeight: '800' },
  perHeadLabel: { fontSize: 11, color: COLORS.accent, fontWeight: '700', marginLeft: 4 },

  addItemRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  addItemInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  addItemBtn: { backgroundColor: COLORS.accent, borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addItemBtnText: { fontSize: 20, color: '#fff', fontWeight: '800' },

  splitCard: {
    backgroundColor: COLORS.primary, marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 16,
  },
  splitCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  splitCardTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  splitCardTotal: { fontSize: 16, fontWeight: '900', color: '#fff' },
  perPersonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  miniAvatarText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  perPersonName: { flex: 1, fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  perPersonAmt: { fontSize: 14, fontWeight: '800', color: '#fff' },

  paymentStatusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  paymentCount: { fontSize: 13, color: COLORS.textSecondary },
  payerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  payerAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  payerInitials: { fontSize: 11, fontWeight: '800', color: '#fff' },
  payerName: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  payerAmount: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginRight: 8 },
  payerStatus: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  payerStatusText: { fontSize: 11, fontWeight: '700' },

  duitnowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, marginTop: 14,
    borderRadius: 12, paddingVertical: 12, gap: 8,
  },
  duitnowIcon: { fontSize: 18 },
  duitnowText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  cutPocketBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary + '18', marginTop: 10,
    borderRadius: 12, paddingVertical: 12,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  cutPocketText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  siapSection: {
    marginHorizontal: 16, marginTop: 14, marginBottom: 4,
  },
  errorBanner: {
    backgroundColor: COLORS.danger + '15', borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: COLORS.danger, marginBottom: 10,
  },
  errorText: { fontSize: 13, color: COLORS.danger, fontWeight: '600', lineHeight: 19 },
  successBanner: {
    backgroundColor: COLORS.success + '18', borderRadius: 12, padding: 16,
    borderWidth: 1.5, borderColor: COLORS.success, alignItems: 'center', marginBottom: 10,
  },
  successText: { fontSize: 15, color: COLORS.success, fontWeight: '800' },
  siapBtn: {
    backgroundColor: COLORS.success, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  siapBtnText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  closeBillBtn: {
    backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  closeBillBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  modalBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 12 },
  modalTotal: { fontSize: 26, fontWeight: '900', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalSecondary: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.textSecondary,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  modalSecondaryText: { color: COLORS.textPrimary, fontWeight: '700' },
  modalPrimary: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalPrimaryText: { color: '#fff', fontWeight: '800' },

  // QR Modal
  qrModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  qrClose: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
  qrPayerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  qrAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  qrAvatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  qrPayerInfo: {},
  qrPayTo: { fontSize: 11, color: COLORS.textLight },
  qrPayerName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  qrContainer: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.primary, borderRadius: 16,
    padding: 8, marginBottom: 16, alignSelf: 'center',
  },
  qrAmtRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  qrAmtLabel: { fontSize: 13, color: COLORS.textSecondary },
  qrAmtValue: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  qrDesc: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 12, lineHeight: 18 },
  qrOthersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, justifyContent: 'center' },
  qrOtherChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  qrOtherDot: { width: 8, height: 8, borderRadius: 4 },
  qrOtherName: { fontSize: 12, fontWeight: '700' },
  qrCloseBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  qrCloseBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  bottomPad: { height: 100 },
});
