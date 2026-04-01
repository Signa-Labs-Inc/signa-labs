import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
} from '@react-email/components';
import type { SendEmailPayload } from './email.types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getsigna.io';

const styles = {
  body: { backgroundColor: '#f4f4f5', fontFamily: 'system-ui, -apple-system, sans-serif' },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    margin: '40px auto',
    padding: '32px',
    maxWidth: '480px',
  },
  heading: { fontSize: '22px', fontWeight: '700' as const, color: '#18181b', margin: '0 0 16px' },
  text: { fontSize: '15px', lineHeight: '24px', color: '#3f3f46', margin: '0 0 16px' },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
  },
  footer: { fontSize: '13px', color: '#a1a1aa', margin: '24px 0 0' },
  hr: { borderColor: '#e4e4e7', margin: '24px 0' },
};

function WelcomeEmail({ userName }: { userName?: string }) {
  const greeting = userName ? `Hey ${userName}` : 'Welcome';
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{greeting}, welcome to Signa!</Heading>
          <Text style={styles.text}>
            You now have access to AI-generated exercises, adaptive learning paths, and real-time
            feedback — all designed to help you become a better engineer.
          </Text>
          <Text style={styles.text}>Here are a few things you can do right now:</Text>
          <Text style={styles.text}>
            1. Try an exercise — describe what you want to learn and AI generates it instantly
            <br />
            2. Start a learning path — structured curricula for interview prep, React, SQL, and more
            <br />
            3. Craft your own — generate exercises on any topic you choose
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button style={styles.button} href={`${APP_URL}/discover`}>
              Start Exploring
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Signa — AI-powered exercises that adapt to your skill level.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function FirstCompletionEmail({
  userName,
  exerciseTitle,
}: {
  userName?: string;
  exerciseTitle: string;
}) {
  const greeting = userName ? `Nice work, ${userName}!` : 'Nice work!';
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{greeting}</Heading>
          <Text style={styles.text}>
            You just completed &quot;{exerciseTitle}&quot; — your first exercise on Signa.
            That&apos;s a great start.
          </Text>
          <Text style={styles.text}>
            Keep the momentum going. Try another exercise or start a learning path to build a
            structured practice habit.
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button style={styles.button} href={`${APP_URL}/discover`}>
              Continue Learning
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Signa — AI-powered exercises that adapt to your skill level.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function InactivityNudgeEmail({
  userName,
  lastPathTitle,
}: {
  userName?: string;
  daysSinceActive: number;
  lastPathTitle?: string;
}) {
  const greeting = userName ? `Hey ${userName}` : 'Hey there';
  const cta = lastPathTitle
    ? `Pick up where you left off on "${lastPathTitle}".`
    : 'Pick up where you left off.';

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{greeting}, your progress is waiting</Heading>
          <Text style={styles.text}>
            It&apos;s been a few days since you last practiced on Signa. {cta}
          </Text>
          <Text style={styles.text}>
            Consistency beats intensity — even 15 minutes of practice keeps your skills sharp.
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button style={styles.button} href={`${APP_URL}/dashboard`}>
              Resume Learning
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Signa — AI-powered exercises that adapt to your skill level.
            <br />
            Don&apos;t want these emails? Update your preferences in your profile settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function renderEmail(payload: SendEmailPayload): {
  subject: string;
  react: React.ReactElement;
} {
  switch (payload.data.type) {
    case 'welcome':
      return {
        subject: 'Welcome to Signa!',
        react: <WelcomeEmail userName={payload.data.userName} />,
      };
    case 'first_completion':
      return {
        subject: `Nice work on "${payload.data.exerciseTitle}"!`,
        react: (
          <FirstCompletionEmail
            userName={payload.data.userName}
            exerciseTitle={payload.data.exerciseTitle}
          />
        ),
      };
    case 'inactivity_nudge':
      return {
        subject: 'Your progress is waiting',
        react: (
          <InactivityNudgeEmail
            userName={payload.data.userName}
            daysSinceActive={payload.data.daysSinceActive}
            lastPathTitle={payload.data.lastPathTitle}
          />
        ),
      };
  }
}
