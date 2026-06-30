import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInAnonymously,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer,
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Profile, GeneratedDocument, DocumentParams } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/forms');

let cachedAccessToken: string | null = null;

export function getCachedToken(): string | null {
  return cachedAccessToken;
}

export function setCachedToken(token: string | null) {
  cachedAccessToken = token;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Custom error handling function as requested in SKILL.md
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Validate connection to Firestore on initialization
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Info: Firebase client is operating in local/offline-first mode. Data will sync once cloud connectivity is restored.");
    } else {
      // It's normal to get Permission Denied or Not Found since 'test/connection' doesn't exist,
      // but an offline error or project ID mismatch is the actual concern.
      console.log("Firestore connection test result:", error);
    }
  }
}

// PROFILE SERVICE FUNCTIONS
export async function saveProfile(profileData: Omit<Profile, 'userId' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
  const user = auth.currentUser;
  const profilePath = `profiles`;
  const docId = profileData.id;
  const docRef = doc(db, profilePath, docId);
  
  // If no user is logged in, use localStorage fallback
  if (!user) {
    const localProfilesStr = localStorage.getItem('local_profiles') || '[]';
    let localProfiles: Profile[] = JSON.parse(localProfilesStr);
    
    if (profileData.isDefaultUser) {
      localProfiles = localProfiles.map(p => ({
        ...p,
        isDefaultUser: p.id === docId ? true : false
      }));
    }
    if (profileData.isDefaultCompany) {
      localProfiles = localProfiles.map(p => ({
        ...p,
        isDefaultCompany: p.id === docId ? true : false
      }));
    }

    const existingIndex = localProfiles.findIndex(p => p.id === docId);
    const mockTimestamp = {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    } as any;

    if (existingIndex > -1) {
      const updatedProfile = {
        ...localProfiles[existingIndex],
        ...profileData,
        updatedAt: mockTimestamp,
      } as Profile;
      localProfiles[existingIndex] = updatedProfile;
      localStorage.setItem('local_profiles', JSON.stringify(localProfiles));
      return updatedProfile;
    } else {
      const newProfile = {
        ...profileData,
        userId: 'local_guest_user',
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
      } as Profile;
      localProfiles.unshift(newProfile);
      localStorage.setItem('local_profiles', JSON.stringify(localProfiles));
      return newProfile;
    }
  }

  try {
    const now = Timestamp.now();

    // If setting a default, unset other profiles of this user's defaults
    if (profileData.isDefaultUser || profileData.isDefaultCompany) {
      try {
        const q = query(
          collection(db, profilePath),
          where('userId', '==', user.uid)
        );
        const snaps = await getDocs(q);
        const batch = writeBatch(db);
        let listHasChanges = false;
        
        snaps.forEach((d) => {
          if (d.id !== docId) {
            const data = d.data();
            let changed = false;
            const updateObj: any = {};
            if (profileData.isDefaultUser && data.isDefaultUser) {
              updateObj.isDefaultUser = false;
              changed = true;
            }
            if (profileData.isDefaultCompany && data.isDefaultCompany) {
              updateObj.isDefaultCompany = false;
              changed = true;
            }
            if (changed) {
              batch.update(doc(db, profilePath, d.id), updateObj);
              listHasChanges = true;
            }
          }
        });
        if (listHasChanges) {
          await batch.commit();
        }
      } catch (err) {
        console.warn("Could not batch update other profiles' default status on server (offline):", err);
      }
    }

    let existingSnap;
    let fallbackCreatedAt = now;
    let docExists = false;
    try {
      existingSnap = await getDoc(docRef);
      docExists = existingSnap.exists();
      if (docExists) {
        fallbackCreatedAt = existingSnap.data()?.createdAt || now;
      }
    } catch (getErr: any) {
      console.warn("Could not getDoc from server (offline context), falling back to local storage lookup:", getErr);
      const localProfilesStr = localStorage.getItem('local_profiles') || '[]';
      const localProfiles: Profile[] = JSON.parse(localProfilesStr);
      const found = localProfiles.find(p => p.id === docId);
      if (found) {
        docExists = true;
        fallbackCreatedAt = found.createdAt || now;
      }
    }

    const payload: any = {
      ...profileData,
      userId: user.uid,
      updatedAt: now,
    };

    if (docExists) {
      payload.createdAt = fallbackCreatedAt;
      await setDoc(docRef, payload, { merge: true });
    } else {
      payload.createdAt = now;
      await setDoc(docRef, payload);
    }

    // Mirror in local profiles cache
    const localProfilesStr = localStorage.getItem('local_profiles') || '[]';
    let localProfiles: Profile[] = JSON.parse(localProfilesStr);
    const existingIndex = localProfiles.findIndex(p => p.id === docId);
    if (existingIndex > -1) {
      localProfiles[existingIndex] = { ...localProfiles[existingIndex], ...payload };
    } else {
      localProfiles.unshift(payload);
    }
    // Set other profiles' default attributes to false locally
    if (profileData.isDefaultUser) {
      localProfiles = localProfiles.map(p => ({
        ...p,
        isDefaultUser: p.id === docId ? true : false
      }));
    }
    if (profileData.isDefaultCompany) {
      localProfiles = localProfiles.map(p => ({
        ...p,
        isDefaultCompany: p.id === docId ? true : false
      }));
    }
    localStorage.setItem('local_profiles', JSON.stringify(localProfiles));

    return payload as Profile;
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore saveProfile failed due to offline state. Returning localStorage fallback.", error);
      const mockTimestamp = {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      } as any;
      
      const localProfilesStr = localStorage.getItem('local_profiles') || '[]';
      let localProfiles: Profile[] = JSON.parse(localProfilesStr);
      const existingIndex = localProfiles.findIndex(p => p.id === docId);
      let returnedProfile: Profile;
      if (existingIndex > -1) {
        returnedProfile = {
          ...localProfiles[existingIndex],
          ...profileData,
          updatedAt: mockTimestamp,
        } as Profile;
        localProfiles[existingIndex] = returnedProfile;
      } else {
        returnedProfile = {
          ...profileData,
          userId: user.uid,
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
        } as Profile;
        localProfiles.unshift(returnedProfile);
      }
      
      if (profileData.isDefaultUser) {
        localProfiles = localProfiles.map(p => ({
          ...p,
          isDefaultUser: p.id === docId ? true : false
        }));
      }
      if (profileData.isDefaultCompany) {
        localProfiles = localProfiles.map(p => ({
          ...p,
          isDefaultCompany: p.id === docId ? true : false
        }));
      }
      localStorage.setItem('local_profiles', JSON.stringify(localProfiles));
      return returnedProfile;
    }
    handleFirestoreError(error, OperationType.WRITE, `${profilePath}/${docId}`);
  }
}

export async function fetchUserProfiles(): Promise<Profile[]> {
  const user = auth.currentUser;
  if (!user) {
    const localProfilesStr = localStorage.getItem('local_profiles') || '[]';
    return JSON.parse(localProfilesStr);
  }

  const profilesPath = 'profiles';
  try {
    const q = query(
      collection(db, profilesPath),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const list: Profile[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Profile);
    });

    // Sync remote into localStorage cache
    localStorage.setItem('local_profiles', JSON.stringify(list));
    return list;
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore fetchUserProfiles failed due to offline state. Falling back to local cache.");
      const localProfilesStr = localStorage.getItem('local_profiles') || '[]';
      return JSON.parse(localProfilesStr);
    }
    handleFirestoreError(error, OperationType.LIST, profilesPath);
  }
}

export async function deleteProfile(profileId: string): Promise<void> {
  const user = auth.currentUser;
  
  // Mirror in local storage
  const localProfilesStr = localStorage.getItem('local_profiles') || '[]';
  const localProfiles: Profile[] = JSON.parse(localProfilesStr);
  const updatedProfiles = localProfiles.filter(p => p.id !== profileId);
  localStorage.setItem('local_profiles', JSON.stringify(updatedProfiles));

  if (!user) return;

  const profilePath = `profiles`;
  try {
    await deleteDoc(doc(db, profilePath, profileId));
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore deleteProfile offline state, only removed from local cache.");
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, `${profilePath}/${profileId}`);
  }
}

// DOCUMENT REPO SERVICE FUNCTIONS
export async function saveGeneratedDocToFirebase(docData: {
  id: string;
  type: string;
  title: string;
  params: DocumentParams;
  content: string;
  emailDraft?: string;
  whatsappSummary?: string;
}): Promise<GeneratedDocument> {
  const user = auth.currentUser;
  
  if (!user) {
    const localDocsStr = localStorage.getItem('local_documents') || '[]';
    const localDocs: any[] = JSON.parse(localDocsStr);
    const existingIndex = localDocs.findIndex(d => d.id === docData.id);
    const mockTimestamp = {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    } as any;

    if (existingIndex > -1) {
      const updatedDoc = {
        ...localDocs[existingIndex],
        title: docData.title,
        content: docData.content,
        params: docData.params,
        emailDraft: docData.emailDraft || '',
        whatsappSummary: docData.whatsappSummary || '',
        updatedAt: mockTimestamp,
      };
      localDocs[existingIndex] = updatedDoc;
      localStorage.setItem('local_documents', JSON.stringify(localDocs));
      return updatedDoc as GeneratedDocument;
    } else {
      const newDoc = {
        ...docData,
        emailDraft: docData.emailDraft || '',
        whatsappSummary: docData.whatsappSummary || '',
        userId: 'local_guest_user',
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };
      localDocs.unshift(newDoc);
      localStorage.setItem('local_documents', JSON.stringify(localDocs));
      return newDoc as unknown as GeneratedDocument;
    }
  }

  const docPath = `documents`;
  const docRef = doc(db, docPath, docData.id);
  const now = Timestamp.now();

  try {
    let existingSnap;
    let docExists = false;
    let fallbackCreatedAt = now;
    try {
      existingSnap = await getDoc(docRef);
      docExists = existingSnap.exists();
      if (docExists) {
        fallbackCreatedAt = existingSnap.data()?.createdAt || now;
      }
    } catch (getErr: any) {
      console.warn("Could not check existing document from server (offline context), falling back to local check:", getErr);
      const localDocsStr = localStorage.getItem('local_documents') || '[]';
      const localDocs: any[] = JSON.parse(localDocsStr);
      const found = localDocs.find(d => d.id === docData.id);
      if (found) {
        docExists = true;
        fallbackCreatedAt = found.createdAt || now;
      }
    }

    const payload: any = {
      ...docData,
      emailDraft: docData.emailDraft || '',
      whatsappSummary: docData.whatsappSummary || '',
      userId: user.uid,
      updatedAt: now,
    };

    if (docExists) {
      payload.createdAt = fallbackCreatedAt;
      await setDoc(docRef, payload, { merge: true });
    } else {
      payload.createdAt = now;
      await setDoc(docRef, payload);
    }

    // Mirror in local documents
    const localDocsStr = localStorage.getItem('local_documents') || '[]';
    const localDocs: any[] = JSON.parse(localDocsStr);
    const existingIndex = localDocs.findIndex(d => d.id === docData.id);
    if (existingIndex > -1) {
      localDocs[existingIndex] = { ...localDocs[existingIndex], ...payload };
    } else {
      localDocs.unshift(payload);
    }
    localStorage.setItem('local_documents', JSON.stringify(localDocs));

    return payload as unknown as GeneratedDocument;
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore saveGeneratedDocToFirebase failed due to offline state. Returning localStorage fallback.", error);
      const mockTimestamp = {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      } as any;
      
      const localDocsStr = localStorage.getItem('local_documents') || '[]';
      const localDocs: any[] = JSON.parse(localDocsStr);
      const existingIndex = localDocs.findIndex(d => d.id === docData.id);
      let returnedDoc: any;
      if (existingIndex > -1) {
        returnedDoc = {
          ...localDocs[existingIndex],
          title: docData.title,
          content: docData.content,
          params: docData.params,
          emailDraft: docData.emailDraft || '',
          whatsappSummary: docData.whatsappSummary || '',
          updatedAt: mockTimestamp,
        };
        localDocs[existingIndex] = returnedDoc;
      } else {
        returnedDoc = {
          ...docData,
          emailDraft: docData.emailDraft || '',
          whatsappSummary: docData.whatsappSummary || '',
          userId: user.uid,
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
        };
        localDocs.unshift(returnedDoc);
      }
      localStorage.setItem('local_documents', JSON.stringify(localDocs));
      return returnedDoc as unknown as GeneratedDocument;
    }
    handleFirestoreError(error, OperationType.WRITE, `${docPath}/${docData.id}`);
  }
}

export async function fetchUserDocuments(): Promise<GeneratedDocument[]> {
  const user = auth.currentUser;
  if (!user) {
    const localDocsStr = localStorage.getItem('local_documents') || '[]';
    return JSON.parse(localDocsStr);
  }

  const docPath = 'documents';
  try {
    const q = query(
      collection(db, docPath),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const list: GeneratedDocument[] = [];
    snapshot.forEach((d) => {
      const raw = d.data();
      list.push(raw as GeneratedDocument);
    });

    // Mirror list in localStorage for offline caching
    localStorage.setItem('local_documents', JSON.stringify(list));
    return list;
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore fetchUserDocuments failed due to offline state. Returning localStorage fallback.");
      const localDocsStr = localStorage.getItem('local_documents') || '[]';
      return JSON.parse(localDocsStr);
    }
    handleFirestoreError(error, OperationType.LIST, docPath);
  }
}

export async function deleteDocumentFromFirebase(docId: string): Promise<void> {
  const user = auth.currentUser;
  
  // Mirror in local documents
  const localDocsStr = localStorage.getItem('local_documents') || '[]';
  const localDocs: any[] = JSON.parse(localDocsStr);
  const updatedDocs = localDocs.filter(d => d.id !== docId);
  localStorage.setItem('local_documents', JSON.stringify(updatedDocs));

  if (!user) return;

  const docPath = `documents`;
  try {
    await deleteDoc(doc(db, docPath, docId));
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore deleteDocument offline state, only removed from local cache.");
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, `${docPath}/${docId}`);
  }
}

export async function saveFormIntakeToFirebase(intake: any): Promise<void> {
  const user = auth.currentUser;
  
  // Mirror in localStorage first
  const localFormsStr = localStorage.getItem('local_forms') || '[]';
  const localForms: any[] = JSON.parse(localFormsStr);
  const existingIndex = localForms.findIndex(f => f.formId === intake.formId);
  if (existingIndex > -1) {
    localForms[existingIndex] = { ...localForms[existingIndex], ...intake };
  } else {
    localForms.unshift(intake);
  }
  localStorage.setItem('local_forms', JSON.stringify(localForms));

  if (!user) return;

  const formsPath = `forms`;
  try {
    const formRef = doc(db, formsPath, intake.formId);
    await setDoc(formRef, {
      ...intake,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore saveFormIntakeToFirebase offline state, only saved to local cache.");
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, `${formsPath}/${intake.formId}`);
  }
}

export async function fetchUserFormIntakes(): Promise<any[]> {
  const user = auth.currentUser;
  if (!user) {
    const localFormsStr = localStorage.getItem('local_forms') || '[]';
    return JSON.parse(localFormsStr);
  }

  const formsPath = 'forms';
  try {
    const q = query(
      collection(db, formsPath),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push(d.data());
    });

    // Mirror list in localStorage for offline caching
    localStorage.setItem('local_forms', JSON.stringify(list));

    return list.sort((a, b) => {
      const dateA = new Date(a.dateCreated || 0).getTime();
      const dateB = new Date(b.dateCreated || 0).getTime();
      return dateB - dateA;
    });
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore fetchUserFormIntakes failed due to offline state. Returning localStorage fallback.");
      const localFormsStr = localStorage.getItem('local_forms') || '[]';
      const list = JSON.parse(localFormsStr);
      return list.sort((a, b) => {
        const dateA = new Date(a.dateCreated || 0).getTime();
        const dateB = new Date(b.dateCreated || 0).getTime();
        return dateB - dateA;
      });
    }
    handleFirestoreError(error, OperationType.LIST, formsPath);
  }
}

export async function deleteFormIntakeFromFirebase(formId: string): Promise<void> {
  const user = auth.currentUser;
  
  // Mirror in local list first
  const localFormsStr = localStorage.getItem('local_forms') || '[]';
  const localForms: any[] = JSON.parse(localFormsStr);
  const updatedForms = localForms.filter(f => f.formId !== formId);
  localStorage.setItem('local_forms', JSON.stringify(updatedForms));

  if (!user) return;

  const formsPath = `forms`;
  try {
    await deleteDoc(doc(db, formsPath, formId));
  } catch (error: any) {
    if (error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('Internet connection') ||
      error.message.includes('network') ||
      error.message.includes('get document because the client is offline')
    )) {
      console.warn("Firestore deleteFormIntake offline state, only removed from local cache.");
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, `${formsPath}/${formId}`);
  }
}


// SYNC HANDLER: Syncs local un-authenticated user data into newly authenticated Firebase cloud profile
export async function syncLocalDataToFirebase(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  // Sync Profiles
  const localProfilesStr = localStorage.getItem('local_profiles');
  if (localProfilesStr) {
    try {
      const localProfiles: Profile[] = JSON.parse(localProfilesStr);
      for (const p of localProfiles) {
        // Strip guest metadata to force save in Cloud
        const { userId, createdAt, updatedAt, ...cleanProfile } = p;
        await saveProfile(cleanProfile);
      }
      localStorage.removeItem('local_profiles');
    } catch (e) {
      console.error("Failed to sync local profiles to Firebase:", e);
    }
  }

  // Sync Documents
  const localDocsStr = localStorage.getItem('local_documents');
  if (localDocsStr) {
    try {
      const localDocs: any[] = JSON.parse(localDocsStr);
      for (const doc of localDocs) {
        await saveGeneratedDocToFirebase({
          id: doc.id,
          type: doc.type,
          title: doc.title,
          params: doc.params,
          content: doc.content,
          emailDraft: doc.emailDraft,
          whatsappSummary: doc.whatsappSummary,
        });
      }
      localStorage.removeItem('local_documents');
    } catch (e) {
      console.error("Failed to sync local documents to Firebase:", e);
    }
  }
}

// AUTH HANDLERS
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    // Trigger synchronization of offline fallback data on successful Cloud login
    try {
      await syncLocalDataToFirebase();
    } catch (syncErr) {
      console.warn("Soft warning: Sync of local data failed during Google Authentication.", syncErr);
    }
    return result.user;
  } catch (error: any) {
    console.error("Google Auth failed:", error);
    const errMsg = error?.message || String(error);
    const errCode = error?.code || errMsg;
    
    let friendlyMessage = errMsg;
    if (errCode.includes("cancelled-popup-request") || errMsg.includes("cancelled-popup-request")) {
      friendlyMessage = "A sign-in popup request arose but was cancelled or overwritten by a duplicate request. Please avoid double-clicking the button and wait for the Google login window to load. If the issue persists, please refresh the page.";
    } else if (errCode.includes("popup-closed-by-user") || errMsg.includes("popup-closed-by-user")) {
      friendlyMessage = "The authentication popup was closed by the user before completing the sign-in. Please try again and complete the login in the pop-up window.";
    } else if (errCode.includes("popup-blocked") || errMsg.includes("popup-blocked") || errCode.includes("blocked-by-popup-blocker") || errMsg.includes("blocked-by-popup-blocker")) {
      friendlyMessage = "The sign-in popup was blocked by your browser. Please check your browser's address bar to 'Allow Popups' for this site, or try opening this application in a new window/tab to login successfully.";
    }
    
    throw new Error(friendlyMessage);
  }
}

export async function loginAnonymously(): Promise<User> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    // If Admin restricted anonymous auth, throw gracefully to let calling context fall back
    console.warn("Anonymous sign in disabled/failed; continuing in local guest mode:", error);
    throw error;
  }
}

export async function logOutUser(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
}
