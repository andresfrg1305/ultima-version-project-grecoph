// src/lib/firebase/server.ts
import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { sanitizeForClient } from "@/utils/serialize";

let app: admin.app.App | null = null;

const serviceAccount = {
  projectId: "gestionaph",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7yFqeMLICW262\nC9M3+pCHga2b5SZg94sP24L/gX1uREI3xWmFYUq/kyRgmyf9rULXvnL7FO2EnU9v\nY8HYWAhGJ7Io+YrmcYJeq1QXkZFS7nl7DdimsnkOM707jWj2ZNaOdyh7ZDc2BD6M\nSQr6soGetjFTYwtu1v1e4U9x9vH8ILTf3PnnYYGmwFAThGv7k2H/+usq76hVNio0\nl+G64g0LXUQqU+Fk/cjbUOC4obMgegmPECRip37eHi6gGf1ovkXpsrwbKfT2BTFR\nETXtftTwwYUOzeSedIXaMJgkAH7njMHrsCR46g5S997+vJmx2w1Syq+WNEnIn5Pj\nL0ubt4PXAgMBAAECggEAFzIrG3JZctgXh25Tg400kECREPpP8NdzOpy7hFNbCqVs\n5pXAsKSxhpOnATX5TSk7YgoZCvHtWx3Rg6l3dwF82CmsJMqagVfRKl+Qji7BnFRv\n9ibiNclDEeGLRRF1P0Z6iHOosQFSnp4Mmeil7gzh3RiVZD8OWP0+pBtB5IqEHsg2\n+t9PWKOPBMJmgKM5qJF2HSgUVXI1rY//b60TeGntmZOOkrVOcSMH9/Oj5lOopBdO\nZtNHqB0ODOGEk55hGM8D7VR5vUgZ4MrzDytbqiDLYj0x5B4Mkk4kkk02etX/i0B2\nXoYw6HZnMI87/PPrSdocLgHm+0+tfj5imA6BZkFNGQKBgQD1qKlQhbg8eV1yswxK\n9XEuTaARGXSca+DUB5oAWBla4q1WUs7UCM/k2di/ilHtC9MoMvn+RnmQ054iVCW3\n1nc4bBCdeECBZDKm4JdlnHN9ExPUQItAmsZ4tj2gdq9USpOgY3l/M270zsJNXFHD\nwmtEh80tEEqtHCye+c207kqorwKBgQDDr/2Yl3Az0oFzhPBJAFfH0BLtPxxNNA1A\nzyrXzfi+8zlzXAmj/uTKuV3TCvCjcjVvTxmIdZ3yiI+ns4Dj5jtUQEHPpqoLE48o\na/DMdYWsrSrE9IaDLdNu2xDntMPNRX1DBU9ofPPkkNQ7udo//RXBCqzniNEYTebP\nlUcrW7TRWQKBgQCR/SiZzM3fSnTJbDRa+5/GV6VPZCRTrRyQhO/1UmXHCDzgtxdp\nFM+PfhL8SVREnilfk2PTw8gM1GX+mqlLpi11n2sEWelju8sKNyBh52cOpl67XZwj\nyZc3N35KNR4e5q7yuwsCF+vRmmoIFVwWDR04PcgmBq+KTtsJowSniJFfywKBgEFq\nT4f299cbA5MuWXTN3Io7EFimxDs6r0N+/X9upzyN6iKaHc7oomryVF78RT0eLKas\n9ogbaVVuOTeCVg/ZIvQjFtznheh1/WEx1ClFEA6NRMLaSy0G4KsqKBiM4Pd5x0nk\nOIthWdaKY6gjlMXXQLJrcyljHyLUx9eUu1nPKj7hAoGAYdK6+XjI9riVUKlpQP1n\nYePNR55xX0l/l75NnxMRXK3oNgjTz9Us3AfGNm4a2pjBEYJCgq+ZvH2Ye8klmfEZ\nbkRekv9c7obZ88AtoqlQNLBoHRtwJO9Krq2SuZeFAoo24cmay6FVBTsRJMb4UcPu\nOIlpnGkQUQHdVpRTuFLtlTc=\n-----END PRIVATE KEY-----\n",
  clientEmail: "firebase-adminsdk-fbsvc@gestionaph.iam.gserviceaccount.com"
};

if (!admin.apps.length) {
  try {
    console.log("admin:", admin);
    console.log("admin.credential:", admin.credential);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK", error);
  }
} else {
  app = admin.app();
}

export const db = app ? admin.firestore() : null;
export const auth = app ? admin.auth() : null;

export async function getUserProfile(uid: string) {
  if (!db) return null;

  try {
    const userDoc = await db.collection('profiles').doc(uid).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data();
    return sanitizeForClient({ id: uid, ...data });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}
