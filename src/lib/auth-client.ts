"use client";

import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function loginAndEnsureProfile(email: string, password: string) {
  // Inicia sesión
  const cred = await signInWithEmailAndPassword(auth!, email, password || "");

  const uid = cred.user.uid;
  const ref = doc(db!, "profiles", uid);
  const snap = await getDoc(ref);

  let role: "admin" | "resident";
  if (!snap.exists()) {
    await setDoc(ref, {
      id: uid,
      email: cred.user.email ?? email,
      fullName: cred.user.displayName ?? email.split("@")[0],
      role: "resident",
      phone: "",
      interiorNumber: 0,
      houseNumber: "",
      createdAt: serverTimestamp(),
    });
    role = "resident";
  } else {
    const data = snap.data() as { role?: string };
    role = (data.role ?? "resident") as "admin" | "resident";
  }

  // Establecer cookie de autenticación simple
  try {
    const response = await fetch('/api/set-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, role }),
    });

    if (!response.ok) {
      console.warn('Auth cookie setting failed');
    }
  } catch (error) {
    console.warn('Auth cookie setting error:', error);
  }

  return role;
}

export async function logoutUser() {
  // Limpiar session cookie
  await fetch('/api/logout', {
    method: 'POST',
  });

  // Sign out de Firebase
  await signOut(auth!);
}
