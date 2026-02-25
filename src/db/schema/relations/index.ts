import { exerciseAttempts } from '../tables/exercise_attempts';
import { exerciseEnvironments } from '../tables/exercise_environments';
import { exerciseEvents } from '../tables/exercise_events';
import { exerciseFiles } from '../tables/exercise_files';
import { exerciseSubmissions } from '../tables/exercise_submissions';
import { exercises } from '../tables/exercises';
import { notifications } from '../tables/notifications';
import { promptTemplates } from '../tables/prompt_templates';
import { submissionFiles } from '../tables/submission_files';
import { subscriptionSeats } from '../tables/subscription_seats';
import { subscriptions } from '../tables/subscriptions';
import { userLearningStats } from '../tables/user_learning_stats';
import { users } from '../tables/users';
import { defineRelations, defineRelationsPart } from 'drizzle-orm';
import { organizations } from '../tables/organizations';
import { plans } from '../tables/plans';
import { planPrices } from '../tables/plan_prices';
import { usersProfiles } from '../tables/users_profiles';
import { paymentRecords } from '../tables/payment_records';

export const contentRelations = defineRelations(
  {
    users,
    exerciseEnvironments,
    promptTemplates,
    exercises,
    exerciseFiles,
    exerciseAttempts,
    exerciseEvents,
    exerciseSubmissions,
    submissionFiles,
    userLearningStats,
  },
  (r) => ({
    exerciseEnvironments: {
      promptTemplates: r.many.promptTemplates(),
      exercises: r.many.exercises(),
    },
    promptTemplates: {
      environment: r.one.exerciseEnvironments({
        from: r.promptTemplates.environmentId,
        to: r.exerciseEnvironments.id,
      }),
      exercises: r.many.exercises(),
    },
    exercises: {
      creator: r.one.users({
        from: r.exercises.createdBy,
        to: r.users.id,
      }),
      promptTemplate: r.one.promptTemplates({
        from: r.exercises.promptTemplateId,
        to: r.promptTemplates.id,
      }),
      environment: r.one.exerciseEnvironments({
        from: r.exercises.environmentId,
        to: r.exerciseEnvironments.id,
      }),
      files: r.many.exerciseFiles(),
      attempts: r.many.exerciseAttempts(),
    },
    exerciseFiles: {
      exercise: r.one.exercises({
        from: r.exerciseFiles.exerciseId,
        to: r.exercises.id,
      }),
    },
    exerciseAttempts: {
      user: r.one.users({
        from: r.exerciseAttempts.userId,
        to: r.users.id,
      }),
      exercise: r.one.exercises({
        from: r.exerciseAttempts.exerciseId,
        to: r.exercises.id,
      }),
      events: r.many.exerciseEvents(),
      submissions: r.many.exerciseSubmissions(),
    },
    exerciseEvents: {
      attempt: r.one.exerciseAttempts({
        from: r.exerciseEvents.attemptId,
        to: r.exerciseAttempts.id,
      }),
      user: r.one.users({
        from: r.exerciseEvents.userId,
        to: r.users.id,
      }),
    },
    exerciseSubmissions: {
      attempt: r.one.exerciseAttempts({
        from: r.exerciseSubmissions.attemptId,
        to: r.exerciseAttempts.id,
      }),
      user: r.one.users({
        from: r.exerciseSubmissions.userId,
        to: r.users.id,
      }),
      files: r.many.submissionFiles(),
    },
    submissionFiles: {
      submission: r.one.exerciseSubmissions({
        from: r.submissionFiles.submissionId,
        to: r.exerciseSubmissions.id,
      }),
    },
    userLearningStats: {
      user: r.one.users({
        from: r.userLearningStats.userId,
        to: r.users.id,
      }),
    },
  })
);

export const billingRelations = defineRelationsPart(
  {
    organizations,
    users,
    usersProfiles,
    plans,
    planPrices,
    subscriptions,
    subscriptionSeats,
    paymentRecords,
    notifications,
  },
  (r) => ({
    organizations: {
      users: r.many.users(),
      subscriptions: r.many.subscriptions(),
    },
    users: {
      organization: r.one.organizations({
        from: r.users.orgId,
        to: r.organizations.id,
      }),
      profile: r.one.usersProfiles({
        from: r.users.id,
        to: r.usersProfiles.userId,
      }),
      subscriptions: r.many.subscriptions(),
      paymentRecords: r.many.paymentRecords(),
      seatAssignments: r.many.subscriptionSeats(),
      notifications: r.many.notifications(),
    },
    usersProfiles: {
      user: r.one.users({
        from: r.usersProfiles.userId,
        to: r.users.id,
      }),
    },
    plans: {
      prices: r.many.planPrices(),
      subscriptions: r.many.subscriptions(),
    },
    planPrices: {
      plan: r.one.plans({
        from: r.planPrices.planId,
        to: r.plans.id,
      }),
      subscriptions: r.many.subscriptions(),
    },
    subscriptions: {
      user: r.one.users({
        from: r.subscriptions.userId,
        to: r.users.id,
      }),
      organization: r.one.organizations({
        from: r.subscriptions.orgId,
        to: r.organizations.id,
      }),
      plan: r.one.plans({
        from: r.subscriptions.planId,
        to: r.plans.id,
      }),
      planPrice: r.one.planPrices({
        from: r.subscriptions.planPriceId,
        to: r.planPrices.id,
      }),
      seats: r.many.subscriptionSeats(),
      paymentRecords: r.many.paymentRecords(),
    },
    subscriptionSeats: {
      subscription: r.one.subscriptions({
        from: r.subscriptionSeats.subscriptionId,
        to: r.subscriptions.id,
      }),
      user: r.one.users({
        from: r.subscriptionSeats.userId,
        to: r.users.id,
      }),
    },
    paymentRecords: {
      user: r.one.users({
        from: r.paymentRecords.userId,
        to: r.users.id,
      }),
      subscription: r.one.subscriptions({
        from: r.paymentRecords.subscriptionId,
        to: r.subscriptions.id,
      }),
    },
    notifications: {
      user: r.one.users({
        from: r.notifications.userId,
        to: r.users.id,
      }),
    },
  })
);
