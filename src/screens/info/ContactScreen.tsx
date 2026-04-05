import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import emailjs from '@emailjs/react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const EMAILJS_SERVICE_ID = 'service_zkcwuvo';
const EMAILJS_TEMPLATE_ID = 'template_gqd3pdy';
const EMAILJS_PUBLIC_KEY = 'Qs0QubXnQxIObPD6H';

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const contactInfo = [
  { label: 'EMAIL', value: 'developer@carbon27.ai' },
  { label: 'PHONE', value: '+91 9945145049' },
  { label: 'LOCATION', value: '1526, B 40, Viveka Nagar, Bengaluru, 560047' },
];

const whyContact = [
  'Questions about your carbon score',
  'Partnership opportunities',
  'Corporate ESG solutions',
  'Feedback and suggestions',
  'Media inquiries',
];

export function ContactScreen(props: any) {
  const { navigation } = props;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email.');
      return;
    }
    if (!message.trim()) {
      setError('Message is required.');
      return;
    }
    setLoading(true);
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' }}
      >
        <Text style={[TYPOGRAPHY.body, { color: COLORS.gold }]}>‹ Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 60 }}>
        <Text style={[TYPOGRAPHY.hero, { color: COLORS.textPrimary, marginBottom: 8 }]}>Get in Touch</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: 8, lineHeight: 22 }]}>
          Have questions or feedback? We'd love to hear from you!
        </Text>

        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginTop: 24, marginBottom: 12 }]}>SEND US A MESSAGE</Text>
        <Card style={{ marginBottom: 24 }}>
          <Input label="NAME" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
          <Input label="EMAIL" value={email} onChangeText={setEmail} placeholder="your.email@example.com" keyboardType="email-address" />
          <Input label="SUBJECT" value={subject} onChangeText={setSubject} placeholder="What's this about?" />
          <View style={{ marginBottom: 18 }}>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: 8 }]}>MESSAGE</Text>
            <View
              style={{
                backgroundColor: COLORS.bgSecondary,
                borderBottomWidth: 0.5,
                borderBottomColor: COLORS.border,
                paddingHorizontal: 14,
                paddingVertical: 12,
                minHeight: 120,
              }}
            >
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Tell us what's on your mind..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                autoCapitalize="sentences"
                style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, lineHeight: 22, minHeight: 100 }]}
              />
            </View>
          </View>
          {error ? <Text style={[TYPOGRAPHY.body, { color: COLORS.error, marginBottom: 8, lineHeight: 22 }]}>{error}</Text> : null}
          <Button
            title={loading ? 'SENDING…' : submitted ? 'MESSAGE SENT!' : 'SEND MESSAGE'}
            onPress={onSubmit}
            disabled={loading || submitted}
          />
        </Card>

        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginTop: 24, marginBottom: 12 }]}>CONTACT INFORMATION</Text>
        <Card style={{ marginBottom: 24, paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' }}>
          {contactInfo.map((c, i) => (
            <View
              key={c.label}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: i < contactInfo.length - 1 ? 0.5 : 0,
                borderBottomColor: COLORS.border,
              }}
            >
              <Text style={[TYPOGRAPHY.label, { color: COLORS.sage, marginBottom: 6 }]}>{c.label}</Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, lineHeight: 22 }]}>{c.value}</Text>
            </View>
          ))}
        </Card>

        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginTop: 24, marginBottom: 12 }]}>WHY CONTACT US?</Text>
        <Card>
          {whyContact.map((item, i) => (
            <View
              key={item}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: i < whyContact.length - 1 ? 12 : 0,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.gold,
                  marginTop: 8,
                  marginRight: 10,
                }}
              />
              <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, flex: 1, lineHeight: 22 }]}>{item}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
