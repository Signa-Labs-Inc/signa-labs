import { db } from '@/index';
import { plans, planPrices } from '@/db/schema/tables';
import { sql } from 'drizzle-orm';

const seedPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with the basics and build your skills.',
    features: {
      exercises: { limit: 1, window: 'day' },
      paths: { limit: 1, window: 'week' },
      aiGenerations: { limit: 1, window: 'day' },
      submissions: { limit: 5, window: 'day' },
    },
    displayFeatures: [
      '5 code submissions per day',
      'Community exercises',
      'Basic code feedback',
      '1 AI-generated exercise per day',
      'Progress tracking',
    ],
    sortOrder: 0,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Unlimited practice with advanced AI-powered feedback.',
    features: {
      exercises: { limit: 10, window: 'day' },
      paths: { limit: 3, window: 'week' },
      aiGenerations: { limit: 10, window: 'day' },
      submissions: { limit: 50, window: 'day' },
    },
    displayFeatures: [
      '50 code submissions per day',
      'Advanced AI feedback & explanations',
      '10 AI-generated exercises per day',
      'Learning paths',
      'Priority support',
      'Detailed performance analytics',
      'Export progress reports',
    ],
    sortOrder: 1,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and organizations that learn together.',
    features: {
      exercises: { limit: -1, window: 'day' },
      paths: { limit: -1, window: 'day' },
      aiGenerations: { limit: -1, window: 'day' },
      submissions: { limit: -1, window: 'day' },
    },
    displayFeatures: [
      'Everything in Pro',
      'Team dashboard & leaderboards',
      'Custom exercise collections',
      'Admin & role management',
      'SSO / SAML authentication',
      'Dedicated account manager',
      'Invoice billing',
    ],
    sortOrder: 2,
  },
];

// ⚠️  PLACEHOLDER IDs are filtered out at checkout and pricing page display.
// Replace with real Stripe Price IDs from Stripe Dashboard or create plans via admin portal.
const seedPrices = [
  {
    planId: 'pro',
    stripePriceId: 'PLACEHOLDER_PRO_MONTHLY',
    currency: 'usd',
    interval: 'month',
    isActive: false, // Inactive until a real Stripe Price ID is set
  },
  {
    planId: 'pro',
    stripePriceId: 'PLACEHOLDER_PRO_YEARLY',
    currency: 'usd',
    interval: 'year',
    isActive: false, // Inactive until a real Stripe Price ID is set
  },
];

export async function seedPlansAndPrices() {
  console.log('Seeding plans...');

  for (const plan of seedPlans) {
    await db
      .insert(plans)
      .values(plan)
      .onConflictDoUpdate({
        target: plans.id,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          features: sql`excluded.features`,
          displayFeatures: sql`excluded.display_features`,
          sortOrder: sql`excluded.sort_order`,
        },
      });
  }

  console.log(`Seeded ${seedPlans.length} plans`);

  console.log('Seeding plan prices...');
  console.log(
    '⚠️  Replace PLACEHOLDER_PRO_MONTHLY and PLACEHOLDER_PRO_YEARLY with real Stripe Price IDs'
  );

  for (const price of seedPrices) {
    await db.insert(planPrices).values(price).onConflictDoNothing();
  }

  console.log(`Seeded ${seedPrices.length} plan prices`);
}

// Run directly: npx tsx src/db/seeds/plans.ts
if (require.main === module) {
  seedPlansAndPrices()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
