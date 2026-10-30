import { randomUUID } from 'node:crypto';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';
const timeoutMs = 8 * 60 * 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let cookie = '';

async function call(path, { method = 'GET', body, expected = 200 } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(method === 'POST' && path === '/mysteries' ? { 'Idempotency-Key': randomUUID() } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const setCookies = response.headers.getSetCookie?.() || [];
  if (!cookie && setCookies.length) cookie = setCookies[0].split(';', 1)[0];
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (response.status !== expected) throw new Error(`${method} ${path} returned HTTP ${response.status}; expected ${expected}.`);
  return { response, payload };
}

async function main() {
  const health = await call('/health');
  if (health.payload?.data?.database !== 'connected') throw new Error(`Database health is ${health.payload?.data?.database || 'unknown'}.`);

  const accepted = await call('/mysteries', {
    method: 'POST',
    expected: 202,
    body: {
      title: 'Workflow verification case',
      scenario: 'At a private archive open evening, a rare signal ledger disappears from a locked room. Three staff members had access, and the alarm records a brief gap.',
      category: 'General Mystery',
      difficulty: 'Medium',
      suspectCount: 3
    }
  });
  const mysteryId = accepted.payload?.data?.mysteryId;
  if (!mysteryId) throw new Error('Creation response did not contain a mystery ID.');

  const deadline = Date.now() + timeoutMs;
  let status;
  do {
    await sleep(1200);
    const current = await call(`/mysteries/${mysteryId}/status`);
    status = current.payload?.data?.status;
    if (status === 'failed') throw new Error('Gemini generation job failed. See the backend log for its safe diagnostic code.');
  } while (status !== 'completed' && Date.now() < deadline);
  if (status !== 'completed') throw new Error('Timed out waiting for case generation.');

  const publicResponse = await call(`/mysteries/${mysteryId}`);
  const mystery = publicResponse.payload?.data;
  const publicJson = JSON.stringify(mystery);
  if (!mystery || !Array.isArray(mystery.suspects) || !Array.isArray(mystery.evidence)) throw new Error('Public case response is incomplete.');
  if (publicJson.includes('culpritId') || publicJson.includes('profileImagePrompt') || publicJson.includes('"solution"') || publicJson.includes('"reveals"') || publicJson.includes('"mediaPrompt"')) throw new Error('Public case response contains private solution or generation fields.');
  const lockedResult = await call(`/mysteries/${mysteryId}/result`, { expected: 404 });
  if (lockedResult.payload?.error?.code !== 'RESULT_NOT_AVAILABLE') throw new Error('The result endpoint was not locked before accusation.');

  const note = await call(`/mysteries/${mysteryId}/notes`, { method: 'POST', expected: 201, body: { content: 'Compare the alarm gap to the archive timeline.' } });
  const noteId = note.payload?.data?.id;
  if (!noteId) throw new Error('Note creation did not return a note ID.');
  await call(`/mysteries/${mysteryId}/notes`);
  await call(`/notes/${noteId}`, { method: 'PATCH', body: { content: 'Updated verification note.' } });

  const second = await call(`/mysteries/${mysteryId}/suspects`);
  const selectedSuspectId = second.payload?.data?.[0]?.id;
  if (!selectedSuspectId) throw new Error('No suspect was returned for accusation.');
  await call(`/mysteries/${mysteryId}/accusations`, { method: 'POST', expected: 201, body: { selectedSuspectId } });
  await call(`/mysteries/${mysteryId}/accusations`, { method: 'POST', expected: 409, body: { selectedSuspectId } });
  const result = await call(`/mysteries/${mysteryId}/result`);
  if (!result.payload?.data?.culprit?.id || !result.payload?.data?.explanation) throw new Error('Post-accusation result did not reveal the stored solution.');

  const secondSession = `mystery_session=${encodeURIComponent(`${randomUUID()}.invalid-signature`)}`;
  const foreignResponse = await fetch(`${baseUrl}/mysteries/${mysteryId}`, { headers: { Cookie: secondSession } });
  if (foreignResponse.status !== 404) throw new Error(`A separate session could access the case (HTTP ${foreignResponse.status}).`);

  await call(`/notes/${noteId}`, { method: 'DELETE' });
  console.info(JSON.stringify({
    result: 'passed',
    database: 'connected',
    generatedCase: true,
    suspectCount: mystery.suspects.length,
    evidenceCount: mystery.evidence.length,
    publicSolutionFieldsAbsent: true,
    notesCrud: true,
    accusationOneTimeOnly: true,
    resultRequiresAccusation: true,
    sessionIsolation: true
  }));
}

main().catch((error) => {
  console.error(`Workflow smoke failed: ${error.message}`);
  process.exitCode = 1;
});
