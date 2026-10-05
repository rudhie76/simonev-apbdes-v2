/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SIMONEV V2 - Pure Google Sheets & Google Drive API Client
 */

export const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_cqJ9Koo996GzUwXP1D3fIXUFa2VKcKIZ2xpb1NESdfvA-38BDEOPDOq9vzDZMthn/exec';

export function getScriptUrl(): string {
  return localStorage.getItem('simonev_script_url') || DEFAULT_SCRIPT_URL;
}

export function setScriptUrl(url: string) {
  localStorage.setItem('simonev_script_url', url.trim());
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Google Sheets API Error [${operationType}] at ${path}:`, error);
}

// 1. Fetch all documents from a specific sheet tab
export async function getDocs(collectionRef: string): Promise<any[]> {
  const scriptUrl = getScriptUrl();
  try {
    const res = await fetch(`${scriptUrl}?sheet=${encodeURIComponent(collectionRef)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    return data.map((item: any) => {
      const parsedItem: Record<string, any> = { ...item };
      Object.keys(parsedItem).forEach(key => {
        const val = parsedItem[key];
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try {
            parsedItem[key] = JSON.parse(val);
          } catch (e) {
            // keep as string
          }
        }
      });
      return parsedItem;
    });
  } catch (err) {
    console.warn(`Failed fetching from Google Sheets tab [${collectionRef}]:`, err);
    throw err;
  }
}

// 2. Save or Update a document in a specific sheet tab
export async function setDoc(docRef: { collectionName: string; id: string }, data: any): Promise<void> {
  const scriptUrl = getScriptUrl();
  try {
    await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'set',
        sheet: docRef.collectionName,
        id: docRef.id,
        data: data
      })
    });
  } catch (err) {
    console.warn(`Failed writing to Google Sheets tab [${docRef.collectionName}]:`, err);
    throw err;
  }
}

// 3. Delete a document from a specific sheet tab
export async function deleteDoc(docRef: { collectionName: string; id: string }): Promise<void> {
  const scriptUrl = getScriptUrl();
  try {
    await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'delete',
        sheet: docRef.collectionName,
        id: docRef.id
      })
    });
  } catch (err) {
    console.warn(`Failed deleting from Google Sheets tab [${docRef.collectionName}]:`, err);
    throw err;
  }
}

export function doc(db: any, collectionName: string, id: string) {
  return { collectionName, id };
}

export function collection(db: any, collectionName: string) {
  return collectionName;
}

export const db = {};

export function onSnapshot(
  collectionRef: string,
  onNext: (snapshot: { empty: boolean; forEach: (fn: (docSnap: { data: () => any }) => void) => void }) => void,
  onError: (error: any) => void
) {
  let isSubscribed = true;

  const fetchData = async () => {
    try {
      const items = await getDocs(collectionRef);
      if (!isSubscribed) return;

      const snapshot = {
        empty: items.length === 0,
        forEach: (fn: (docSnap: { data: () => any }) => void) => {
          items.forEach(item => {
            fn({ data: () => item });
          });
        }
      };

      onNext(snapshot);
    } catch (err) {
      if (isSubscribed) onError(err);
    }
  };

  fetchData();
  const intervalId = setInterval(fetchData, 15000);

  return () => {
    isSubscribed = false;
    clearInterval(intervalId);
  };
}

export async function uploadFileToStorage(file: File, folderName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const base64Data = dataUrl.split(',')[1];
        const scriptUrl = getScriptUrl();

        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            action: 'upload',
            folder: 'Database_Simonev_Uploads',
            fileName: `${folderName}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`,
            mimeType: file.type || 'application/pdf',
            base64Data: base64Data
          })
        });

        const resText = await response.text();
        let resJson: any = {};
        try {
          resJson = JSON.parse(resText);
        } catch (e) {
          console.warn("Google Apps Script upload response was not JSON:", resText);
        }

        const fileUrl = resJson.fileUrl || resJson.url || resJson.downloadUrl || resJson.webContentLink;
        const fileId = resJson.fileId || resJson.id;
        const isSuccess = resJson.status === 'success' || resJson.success === true || resJson.result === 'success' || Boolean(fileUrl || fileId);

        if (isSuccess && fileUrl) {
          resolve(fileUrl);
          return;
        }
        if (isSuccess && fileId) {
          resolve(`https://lh3.googleusercontent.com/d/${fileId}`);
          return;
        }

        console.warn("Apps script upload did not return drive URL, using Base64 data URL fallback", resJson || resText);
        resolve(dataUrl);
      } catch (err) {
        console.warn("Upload to Google Drive via Apps Script failed, using Base64 data URL fallback:", err);
        resolve(dataUrl);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
