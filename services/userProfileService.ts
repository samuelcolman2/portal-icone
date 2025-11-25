
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  get,
  onValue,
  ref,
  remove,
  set,
  update,
} from 'firebase/database';
import { firestore, realtimeDb } from '../firebase';
import type { CustomUser, UserRole } from '../types';

const DEFAULT_ROLE: UserRole = 'user';
const PENDING_ROLE: UserRole = 'pendente';
const MAX_BASE64_LENGTH = 1024 * 1024; // ~1MB
const PHOTO_COLLECTION = 'userPhotos';

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const realtimeSafeKey = (email: string) =>
  normalizeEmail(email).replace(/\./g, ',').replace(/[#$\[\]]/g, '_');
const legacyRealtimeKey = (email: string) =>
  normalizeEmail(email).replace(/[.#$/\[\]]/g, '_');

const getPhotoDocRef = (email: string) =>
  doc(firestore, PHOTO_COLLECTION, normalizeEmail(email));

type RealtimeProfile = {
  role: UserRole;
  displayName: string;
  isActive: boolean;
};

const migrateLegacyKeyIfNeeded = async (
  email: string,
  newKey: string,
) => {
  const legacyKey = legacyRealtimeKey(email);
  if (legacyKey === newKey) {
    return null;
  }

  const legacyRef = ref(realtimeDb, `users/${legacyKey}`);
  const legacySnap = await get(legacyRef);
  if (!legacySnap.exists()) {
    return null;
  }

  const legacyData = legacySnap.val();
  await remove(legacyRef);
  return legacyData ?? null;
};

const ensureRealtimeProfile = async (
  user: CustomUser,
): Promise<RealtimeProfile> => {
  if (!user.email) {
    return {
      role: user.role ?? DEFAULT_ROLE,
      displayName: user.displayName ?? '',
      isActive: user.isActive ?? true,
    };
  }

  const key = realtimeSafeKey(user.email);
  const userRef = ref(realtimeDb, `users/${key}`);
  let snapshot = await get(userRef);

  const basePayload = {
    email: normalizeEmail(user.email),
    displayName: user.displayName ?? '',
    photoDocPath: `${PHOTO_COLLECTION}/${normalizeEmail(user.email)}`,
    isActive: user.isActive ?? true,
  };

  if (!snapshot.exists()) {
    const legacyData = await migrateLegacyKeyIfNeeded(user.email, key);
    // Alterado aqui: Novos usuários recebem DEFAULT_ROLE ('user') diretamente,
    // em vez de PENDING_ROLE ('pendente').
    const role =
      (legacyData?.role as UserRole) ??
      DEFAULT_ROLE;
      
    const isActive =
      typeof legacyData?.isActive === 'boolean'
        ? legacyData.isActive
        : true;

    const payload = {
      ...basePayload,
      ...(legacyData ?? {}),
      role,
      isActive,
      createdAt: legacyData?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    await set(userRef, payload);
    return {
      role,
      displayName: payload.displayName || '',
      isActive,
    };
  }

  const current = snapshot.val() ?? {};
  const role: UserRole = current.role || DEFAULT_ROLE;
  const updates: Record<string, unknown> = {};

  if (!current.role) updates.role = DEFAULT_ROLE;
  if (!current.photoDocPath)
    updates.photoDocPath = basePayload.photoDocPath;
  if (typeof current.isActive !== 'boolean') updates.isActive = true;
  if (user.displayName && current.displayName !== user.displayName) {
    updates.displayName = user.displayName;
  }

  if (Object.keys(updates).length) {
    updates.updatedAt = Date.now();
    await update(userRef, updates);
  }

  return {
    role,
    displayName:
      (updates.displayName as string) ??
      current.displayName ??
      user.displayName ??
      '',
    isActive:
      (updates.isActive as boolean) ??
      current.isActive ??
      true,
  };
};

const fetchPhotoData = async (email: string) => {
  if (!email) return null;
  const snapshot = await getDoc(getPhotoDocRef(email));
  if (!snapshot.exists()) return null;
  return (snapshot.data()?.photoData as string) ?? null;
};

const fetchPhotoByPath = async (photoDocPath?: string | null) => {
  if (!photoDocPath) return null;
  const segments = photoDocPath.split('/').filter(Boolean);
  if (!segments.length) return null;
  const snapshot = await getDoc(doc(firestore, ...segments));
  if (!snapshot.exists()) return null;
  return (snapshot.data()?.photoData as string) ?? null;
};

export const ensureUserProfileDocument = async (
  user: CustomUser,
): Promise<CustomUser> => {
  if (!user.email) {
    return { ...user, role: user.role ?? DEFAULT_ROLE };
  }

  const profile = await ensureRealtimeProfile(user);
  const photoData = await fetchPhotoData(user.email);

  return {
    ...user,
    role: profile.role,
    displayName: profile.displayName || user.displayName,
    photoURL: photoData ?? user.photoURL,
    isActive: profile.isActive,
  };
};

export const persistUserPhoto = async (
  email: string,
  photoDataUrl: string | null,
) => {
  if (!email) return;
  if (photoDataUrl && photoDataUrl.length > MAX_BASE64_LENGTH) {
    throw new Error(
      'A imagem final ainda possui mais de 1MB. Tente uma foto menor.',
    );
  }

  await setDoc(
    getPhotoDocRef(email),
    {
      photoData: photoDataUrl ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const key = realtimeSafeKey(email);
  await update(ref(realtimeDb, `users/${key}`), {
    photoDocPath: `${PHOTO_COLLECTION}/${normalizeEmail(email)}`,
    updatedAt: Date.now(),
  });
};

export const updateUserRole = async (
  email: string,
  role: UserRole,
): Promise<UserRole> => {
  if (!email) {
    throw new Error('Informe o email do usuário.');
  }

  const key = realtimeSafeKey(email);
  await update(ref(realtimeDb, `users/${key}`), {
    email: normalizeEmail(email),
    role,
    updatedAt: Date.now(),
  });

  return role;
};

export const updateUserAccess = async (
  email: string,
  isActive: boolean,
) => {
  if (!email) {
    throw new Error('Informe o email do usuário.');
  }

  const key = realtimeSafeKey(email);
  await update(ref(realtimeDb, `users/${key}`), {
    email: normalizeEmail(email),
    isActive,
    updatedAt: Date.now(),
  });
};

type AccessStatus = {
  hasAccess: boolean;
  reason: 'revoked' | 'pending' | null;
};

export const listenToUserAccess = (
  email: string,
  callback: (status: AccessStatus) => void,
) => {
  if (!email) return () => {};
  const key = realtimeSafeKey(email);
  const userRef = ref(realtimeDb, `users/${key}`);
  const unsubscribe = onValue(userRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({ hasAccess: false, reason: 'revoked' });
      return;
    }

    const data = snapshot.val() ?? {};
    const isActive = data.isActive !== false;
    const role: UserRole = (data.role as UserRole) ?? DEFAULT_ROLE;

    if (!isActive) {
      callback({ hasAccess: false, reason: 'revoked' });
      return;
    }

    if (role === PENDING_ROLE) {
      callback({ hasAccess: false, reason: 'pending' });
      return;
    }

    callback({ hasAccess: true, reason: null });
  });
  return unsubscribe;
};

export const listenToUsers = (
  callback: (users: CustomUser[]) => void,
) => {
  const usersRef = ref(realtimeDb, 'users');
  const unsubscribe = onValue(usersRef, async (snapshot) => {
    const data = snapshot.val() ?? {};
    const entries = Object.entries<Record<string, any>>(data);

    const users = await Promise.all(
      entries.map(async ([key, value]) => {
        const email =
          (value.email as string) ??
          key.replace(/,/g, '.');
        const photoURL = await fetchPhotoByPath(value.photoDocPath);
        return {
          email,
          displayName: (value.displayName as string) ?? email,
          role: (value.role as UserRole) ?? DEFAULT_ROLE,
          photoURL: photoURL ?? null,
          birthday:
            typeof value.birthday === 'string'
              ? (value.birthday as string)
              : undefined,
          isActive: value.isActive !== false,
        } satisfies CustomUser;
      }),
    );

    callback(
      users.sort((a, b) =>
        (a.displayName || '').localeCompare(b.displayName || ''),
      ),
    );
  });

  return unsubscribe;
};
