import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import * as api from '../api';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';
import { useAppStore } from '../store/appStore';
import { useContactStore } from '../store/contactStore';
import BottomSheet from './BottomSheet';

const waDigits = (phone: string) => phone.replace(/[^0-9]/g, '');

/** Global Call / WhatsApp confirmation sheets, driven by the contact store. */
export default function ContactSheets() {
  const { mode, provider, close } = useContactStore();
  const showToast = useAppStore((s) => s.showToast);
  const verifyToken = useAppStore((s) => s.verifyToken);
  const user = useAppStore((s) => s.user);

  const logLead = () => {
    if (!provider) return;
    api.createProviderLead({ providerId: provider.id, verifyToken, fullName: user?.name, phone: user?.phone }).catch(() => {});
  };

  const onCall = () => {
    if (!provider) return;
    logLead();
    Linking.openURL(`tel:${provider.phone}`).catch(() => {});
    close();
    showToast(`Calling ${provider.name}…`, 'ph-phone-call');
  };

  const onWhatsapp = () => {
    if (!provider) return;
    logLead();
    const msg = `Hello, I found your service on SERRALE. I need help with ${provider.service.toLowerCase()}. Are you available?`;
    const url = `whatsapp://send?phone=${waDigits(provider.phone)}&text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {});
    close();
    showToast('Opening WhatsApp…', 'ph-whatsapp-logo');
  };

  const waMessage = provider
    ? `Hello, I found your service on SERRALE. I need help with ${provider.service.toLowerCase()}. Are you available?`
    : '';

  return (
    <>
      <BottomSheet visible={mode === 'call'} onClose={close} contentStyle={styles.pad}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: colors.green800 }]}>
            <Icon name="ph-phone-call" size={24} color="#fff" weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Call {provider?.name}?</Text>
            <Text style={styles.sub}>{provider?.phone}</Text>
          </View>
        </View>
        <Pressable style={[styles.primary, { backgroundColor: colors.green800 }]} onPress={onCall}>
          <Icon name="ph-phone-call" size={18} color="#fff" weight="fill" />
          <Text style={styles.primaryText}>Call now</Text>
        </Pressable>
        <Pressable style={styles.cancel} onPress={close}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </BottomSheet>

      <BottomSheet visible={mode === 'wa'} onClose={close} contentStyle={styles.pad}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: colors.soft }]}>
            <Icon name="ph-whatsapp-logo" size={26} color={colors.whatsapp} weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Message {provider?.name}</Text>
            <Text style={styles.sub}>on WhatsApp</Text>
          </View>
        </View>
        <View style={styles.quote}>
          <Text style={styles.quoteText}>{waMessage}</Text>
        </View>
        <Pressable style={[styles.primary, { backgroundColor: colors.whatsapp }]} onPress={onWhatsapp}>
          <Icon name="ph-whatsapp-logo" size={19} color="#fff" weight="fill" />
          <Text style={styles.primaryText}>Open WhatsApp</Text>
        </Pressable>
        <Pressable style={styles.cancel} onPress={close}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  iconBox: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  sub: { fontSize: 13, fontFamily: fonts.regular, color: colors.muted, marginTop: 2 },
  quote: {
    marginTop: 16,
    backgroundColor: '#F3F7F2',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    padding: 13,
  },
  quoteText: { fontSize: 13, color: '#3c4a43', lineHeight: 20, fontFamily: fonts.regular },
  primary: {
    height: 50,
    marginTop: 16,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#fff', fontSize: 15, fontFamily: fonts.bold },
  cancel: { height: 48, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: colors.muted, fontSize: 14, fontFamily: fonts.semibold },
});
