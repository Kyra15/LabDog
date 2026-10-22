import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors } from '../theme';
import { styles } from '../styles/ChatStyle';


interface Provider {
  name: string;
  specialty: string;
  distance: string;
  address: string;
  acceptingNew: boolean;
}

const DEMO = {
  age: 34,
  zip: '10001',
  attachReport: true,
  report: {
    title: 'CBC with Differential',
    date: 'Aug 18, 2026',
    flagged: ['Hemoglobin 10.9 g/dL', 'Ferritin 8 ng/mL'],
  },
  replyDelayMs: 1400,
  providers: [
    { name: 'Dr. Anika Mishra', specialty: 'Primary Care', distance: '0.8 mi', address: '120 W 28th St', acceptingNew: true },
    { name: 'Lee Family Medicine', specialty: 'Primary Care', distance: '1.3 mi', address: '305 8th Ave', acceptingNew: true },
    { name: 'Dr. Sanvi Pandya', specialty: 'Hematology', distance: '2.1 mi', address: '450 1st Ave', acceptingNew: false },
  ] as Provider[],
};

type Params = typeof DEMO;

interface Reply {
  text: string;
  providers?: Provider[];
  usedReport?: boolean;
}

interface ScriptStep {
  suggest: string;
  keywords: string[];
  reply: (p: Params) => Reply;
}

// replies r based off of keywords for this demo
const SCRIPT: ScriptStep[] = [
  {
    suggest: "I've been really tired lately. Who should I see?",
    keywords: ['tired', 'fatigue', 'exhausted', 'energy'],
    reply: () => ({
      text:
        'I can help with that. A few quick questions first:\n\n' +
        '- How long has this been going on?\n' +
        '- Any other symptoms, like shortness of breath, dizziness, or feeling cold?\n' +
        '- Do you have a regular doctor right now?',
    }),
  },
  {
    suggest: "About a month. I get winded on stairs, and I don't have a doctor.",
    keywords: ['month', 'weeks', 'winded', 'stairs', 'breath', 'dizzy'],
    reply: (p) => ({
      usedReport: p.attachReport,
      text:
        (p.attachReport
          ? `Thanks. I also looked at the ${p.report.title} you attached. ` +
            `${p.report.flagged.join(' and ')} were below the printed range, which is worth bringing up.\n\n`
          : 'Thanks, that helps.\n\n') +
        'Who to see:\n' +
        '- Primary care: a good first stop for ongoing tiredness. They look at the whole picture and can order follow-up tests.\n' +
        '- Hematologist (blood specialist): primary care may refer you here if blood results stay out of range.\n\n' +
        'Before your visit:\n' +
        '- Note when you feel most tired and what makes it better or worse\n' +
        '- List any medicines or supplements you take\n' +
        '- Bring your lab report\n\n' +
        'Get help sooner if:\n' +
        "- You have chest pain, faint, or can't catch your breath while resting. Call 911.",
    }),
  },
  {
    suggest: 'Can you find a doctor near me?',
    keywords: ['near', 'nearby', 'find', 'close', 'around', 'provider'],
    reply: (p) => ({
      text: `Here are a few options near ${p.zip}:`,
      providers: p.providers,
    }),
  },
  {
    suggest: 'What should I ask at my appointment?',
    keywords: ['ask', 'question', 'appointment', 'visit'],
    reply: (p) => ({
      text:
        'Good questions to bring:\n' +
        '- What could be making me feel this tired?\n' +
        (p.attachReport
          ? `- What do my ${p.report.flagged.map((f) => f.split(' ')[0].toLowerCase()).join(' and ')} results mean for me?\n`
          : '') +
        '- Do I need any more tests?\n' +
        '- Should I see a specialist?\n' +
        '- Which symptoms mean I should come back sooner?',
    }),
  },
];

const FALLBACK: Reply = {
  text:
    "That's a good question to bring to a doctor. I can help you figure out who to see, " +
    'what to do before your visit, or find providers near you.',
};

interface Message extends Reply {
  id: string;
  role: 'user' | 'assistant';
}

// picks a reply based on keyword match first
function pickStep(text: string, used: Set<number>): number | null {
  const t = text.toLowerCase();
  const matches = SCRIPT.map((s, i) => (s.keywords.some((k) => t.includes(k)) ? i : -1)).filter((i) => i >= 0);
  const fresh = matches.find((i) => !used.has(i));
  if (fresh !== undefined) return fresh;
  if (matches.length > 0) return matches[0];
  const next = SCRIPT.findIndex((_, i) => !used.has(i));
  return next >= 0 ? next : null;
}

export default function ChatScreen(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [thinking, setThinking] = useState<boolean>(false);
  const [attached, setAttached] = useState<boolean>(DEMO.attachReport);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const listRef = useRef<FlatList<Message>>(null);

  const params: Params = { ...DEMO, attachReport: attached };

  const send = (raw: string): void => {
    const text = raw.trim();
    if (!text || thinking) return;
    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setThinking(true);

    const step = pickStep(text, used);
    const reply = step === null ? FALLBACK : SCRIPT[step].reply(params);
    if (step !== null) setUsed((prev) => new Set(prev).add(step));

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', ...reply }]);
      setThinking(false);
    }, DEMO.replyDelayMs);
  };

  const reset = (): void => {
    if (thinking) return;
    setMessages([]);
    setUsed(new Set());
    setInput('');
  };

  const suggestions = SCRIPT.filter((_, i) => !used.has(i)).map((s) => s.suggest);

  const renderProvider = (p: Provider): React.JSX.Element => (
    <View key={p.name} style={styles.providerCard}>
      <Text style={styles.providerName}>{p.name}</Text>
      <Text style={styles.providerMeta}>
        {p.specialty} · {p.distance} · {p.address}
      </Text>
      <View style={styles.providerFooter}>
        <View style={[styles.badge, p.acceptingNew ? styles.badgeOpen : styles.badgeWait]}>
          <Text style={styles.badgeText}>{p.acceptingNew ? 'Accepting new patients' : 'Waitlist'}</Text>
        </View>
        <View style={styles.providerActions}>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="call-outline" size={18} color={colors.navy} />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="navigate-outline" size={18} color={colors.navy} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }): React.JSX.Element => {
    const mine = item.role === 'user';
    return (
      <View style={[styles.bubbleRow, mine ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
        <View style={[styles.bubble, mine ? styles.bubbleUser : styles.bubbleAssistant]}>
          {item.usedReport && (
            <View style={styles.usingReport}>
              <Ionicons name="document-text-outline" size={13} color={colors.sage} />
              <Text style={styles.usingReportText}>Using {DEMO.report.title}</Text>
            </View>
          )}
          <Text style={[styles.bubbleText, mine ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
            {item.text}
          </Text>
          {item.providers && (
            <View style={styles.providerList}>
              {item.providers.map(renderProvider)}
            </View>
          )}
        </View>
      </View>
    );
  };

  const emptyState = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Ask LabDog</Text>
      <Text style={styles.emptyBody}>
        Tell me what's going on and I'll help you figure out what kind of doctor to see, what you can
        do before your visit, and who's nearby.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistant</Text>
        <TouchableOpacity style={styles.headerButton} onPress={reset} activeOpacity={0.8}>
          <Text style={styles.headerButtonText}>New chat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contextBar}>
        <TouchableOpacity
          style={[styles.contextChip, attached && styles.contextChipOn]}
          onPress={() => setAttached((a) => !a)}
          activeOpacity={0.8}
        >
          <Ionicons name={attached ? 'attach' : 'add'} size={14} color={attached ? colors.white : colors.navy} />
          <Text style={[styles.contextChipText, attached && styles.contextChipTextOn]} numberOfLines={1}>
            {attached ? `${DEMO.report.title} · ${DEMO.report.date.slice(0, 6)}` : 'Attach a report'}
          </Text>
        </TouchableOpacity>
        <View style={styles.contextChip}>
          <Ionicons name="location-outline" size={14} color={colors.navy} />
          <Text style={styles.contextChipText}>{DEMO.zip}</Text>
        </View>
        <View style={styles.contextChip}>
          <Text style={styles.contextChipText}>Age {DEMO.age}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={emptyState}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
          }}
          ListFooterComponent={
            thinking ? (
              <View style={styles.thinkingRow}>
                <ActivityIndicator size="small" color={colors.navy} />
                <Text style={styles.thinkingText}>Thinking...</Text>
              </View>
            ) : undefined
          }
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Describe what's going on..."
            placeholderTextColor="rgba(61, 64, 91, 0.45)"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || thinking) && styles.sendButtonDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || thinking}
            activeOpacity={0.8}
            accessibilityLabel="Send message"
          >
            <Ionicons name="arrow-up" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>Not medical advice or a diagnosis. In an emergency, call 911.</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}