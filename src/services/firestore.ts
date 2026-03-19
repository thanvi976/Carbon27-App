import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Assessment, CarbonUser, Organisation } from '../types';
import type { LevelName } from '../constants/levels';

export async function upsertUser(uid: string, data: Partial<CarbonUser>) {
  const ref = doc(db, 'users', uid);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
      createdAt: (data as any).createdAt ?? serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUser(uid: string): Promise<CarbonUser | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as CarbonUser) : null;
}

export async function recordAssessment(params: {
  uid: string;
  score: number;
  level: LevelName;
  badges: CarbonUser['badges'];
  responses: CarbonUser['responses'];
}) {
  const ref = collection(db, 'assessments');
  const createdAt = new Date().toISOString();
  const docRef = await addDoc(ref, { ...params, createdAt, serverCreatedAt: serverTimestamp() });
  return { id: docRef.id, createdAt };
}

export async function getLatestAssessments(uid: string, count = 20): Promise<Assessment[]> {
  const q = query(collection(db, 'assessments'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(count));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Assessment));
}

export async function createOrganisation(params: { name: string; adminUid: string; inviteCode: string }) {
  const ref = collection(db, 'organisations');
  const createdAt = new Date().toISOString();
  const docRef = await addDoc(ref, {
    ...params,
    members: [params.adminUid],
    createdAt,
    serverCreatedAt: serverTimestamp(),
  });
  return { id: docRef.id, createdAt };
}

export async function joinOrganisation(params: { uid: string; inviteCode: string }) {
  const q = query(collection(db, 'organisations'), where('inviteCode', '==', params.inviteCode.toUpperCase()), limit(1));
  const snaps = await getDocs(q);
  const orgDoc = snaps.docs[0];
  if (!orgDoc) throw new Error('Organisation not found');

  const org = { id: orgDoc.id, ...(orgDoc.data() as any) } as Organisation;
  const orgRef = doc(db, 'organisations', org.id);
  const members = Array.from(new Set([...(org.members ?? []), params.uid]));
  await updateDoc(orgRef, { members });
  await updateDoc(doc(db, 'users', params.uid), { orgId: org.id });
  return org.id;
}

export async function getOrganisation(orgId: string): Promise<Organisation | null> {
  const ref = doc(db, 'organisations', orgId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as Organisation) : null;
}

export async function getOrganisationLeaderboard(orgId: string) {
  // Simple leaderboard: fetch members array then get their user docs.
  const org = await getOrganisation(orgId);
  if (!org) return [];
  const members = org.members ?? [];
  const results: { uid: string; name: string; score: number }[] = [];
  for (const uid of members) {
    try {
      const u = await getUser(uid);
      if (u) results.push({ uid, name: u.name ?? u.email ?? 'Member', score: u.score ?? 0 });
    } catch {
      // ignore per-member failures
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.map((r, idx) => ({ ...r, rank: idx + 1 }));
}

