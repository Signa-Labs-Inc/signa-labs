import 'dotenv/config';
import * as exerciseService from '@/lib/services/exercises/exercises.service';

async function verify() {
  console.log('--- List all exercises ---');
  const all = await exerciseService.listPlatformExercises();
  console.log(`Found ${all.length} exercises`);
  for (const ex of all) {
    console.log(`  [${ex.difficulty}] ${ex.title} (${ex.language})`);
  }

  console.log('\n--- Filter by Python ---');
  const python = await exerciseService.listPlatformExercises({ language: 'python' });
  console.log(`Found ${python.length} Python exercises`);

  console.log('\n--- Filter by medium difficulty ---');
  const medium = await exerciseService.listPlatformExercises({ difficulty: 'medium' });
  console.log(`Found ${medium.length} medium exercises`);

  console.log('\n--- Available tags ---');
  const tags = await exerciseService.getAvailableTags();
  console.log(`Tags: ${tags.join(', ')}`);

  console.log('\n--- Exercise detail ---');
  const detail = await exerciseService.getExerciseDetail(all[0].id);
  console.log(`Title: ${detail.title}`);
  console.log(`Environment: ${detail.environment.displayName}`);
  console.log(`Starter files: ${detail.starterFiles.length}`);
  console.log(`Support files: ${detail.supportFiles.length}`);
  console.log(`Hints available: ${detail.hintCount}`);

  console.log('\n--- Get hint ---');
  const hint = await exerciseService.getExerciseHint(all[0].id, 0);
  console.log(`Hint 1/${hint.total}: ${hint.text}`);

  console.log('\n--- Get solution ---');
  const solution = await exerciseService.getExerciseSolution(all[0].id);
  console.log(`Solution files: ${solution.files.length}`);
  for (const f of solution.files) {
    console.log(`  ${f.filePath} (${f.content.length} chars)`);
  }

  console.log('\n--- NotFoundError test ---');
  try {
    await exerciseService.getExerciseDetail('00000000-0000-0000-0000-000000000000');
  } catch (err) {
    console.log(`Correctly threw: ${(err as Error).message}`);
  }

  console.log('\n✅ All checks passed');
  process.exit(0);
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
