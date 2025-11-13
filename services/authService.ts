import type { SignUpData, SignInData, CustomUser, ConfirmResetData, UpdateProfileData } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ensureUserProfileDocument, persistUserPhoto } from './userProfileService';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

if (!APPS_SCRIPT_URL) {
    throw new Error('Missing VITE_APPS_SCRIPT_URL environment variable.');
}

/**
 * Hashes a string using SHA-256.
 * @param str The string to hash.
 * @returns A promise that resolves to the hex-encoded hash.
 */
async function sha256(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}


/**
 * Handles the response from the Apps Script, parsing JSON and checking for errors.
 */
async function handleResponse(response: Response) {
    if (!response.ok) {
        throw new Error(`A resposta da rede não foi bem-sucedida (status: ${response.status})`);
    }
    const text = await response.text();

    if (text.toLowerCase().includes("<html")) {
        console.error("Received HTML response instead of JSON:", text);
        throw new Error('O script retornou uma página inesperada. Verifique as permissões de acesso do script.');
    }

    try {
        const data = JSON.parse(text);
        if (data.ok === false) {
            // Provide a more specific error message for a common backend configuration issue.
            if (data.msg && data.msg.includes("Ação POST inválida")) {
                console.error("Backend error:", data.msg);
                throw new Error("Erro de configuração do servidor: A ação solicitada não está implementada no script do Google Apps. Verifique se a função 'doPost' lida com todas as ações necessárias (como 'updateProfile').");
            }
            throw new Error(data.msg || 'Ocorreu um erro desconhecido no backend.');
        }
        return data;
    } catch (e) {
        console.error("Failed to parse JSON response or invalid response structure:", text, e);
        if (e instanceof Error) {
           throw e;
        }
        throw new Error('Resposta inválida do servidor.');
    }
}

/**
 * Performs a POST request to the Apps Script backend.
 * Uses 'text/plain' to avoid CORS preflight issues. The backend's doPost
 * function should parse the body with JSON.parse(e.postData.contents).
 */
async function postToAppsScript(payload: object): Promise<any> {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
        });
        return handleResponse(response);
    } catch (error) {
        if (error instanceof TypeError) {
             throw new Error('Falha na comunicação com o servidor. Verifique se o backend está configurado para aceitar requisições (CORS) e se a função doPost está implementada no Google Apps Script.');
        }
        throw error;
    }
}

/**
 * Creates a new user account via Apps Script and RTDB using POST.
 * The backend is expected to handle the 'signUp' action in a doPost function.
 */
export const signUp = async ({ name, email, password, birthday }: SignUpData): Promise<CustomUser> => {
    const passwordHash = await sha256(password);
    const data = await postToAppsScript({
        action: 'signUp',
        name,
        email,
        passwordHash,
        birthday,
    });
    
    if (!data.user) {
      throw new Error(data.msg || "Ocorreu um erro ao criar a conta.");
    }
    const enriched = await ensureUserProfileDocument(data.user);
    if (enriched.isActive === false) {
      throw new Error('Seu acesso está suspenso. Procure um administrador.');
    }
    return enriched;
};

/**
 * Signs in a user via Apps Script and RTDB using POST.
 * The backend is expected to handle the 'signIn' action in a doPost function.
 */
export const signIn = async ({ email, password }: SignInData): Promise<CustomUser> => {
    const passwordHash = await sha256(password);
    const data = await postToAppsScript({
        action: 'signIn',
        email,
        passwordHash,
    });
    if (!data.user) {
      throw new Error(data.msg || "Ocorreu um erro ao fazer login.");
    }
    const enriched = await ensureUserProfileDocument(data.user);
    if (enriched.isActive === false) {
      throw new Error('Seu acesso está suspenso. Procure um administrador.');
    }
    return enriched;
};

/**
 * Updates a user's profile information.
 */
export const updateProfile = async (updateData: UpdateProfileData): Promise<CustomUser> => {
    const payload: any = {
        action: 'updateProfile',
        email: updateData.email,
    };
    
    let hasUpdate = false;
    // Use 'in' operator to check for presence, allowing for empty strings or null values to be sent
    if ('displayName' in updateData) {
        payload.displayName = updateData.displayName;
        hasUpdate = true;
    }
    if ('photoURL' in updateData) {
        payload.photoURL = updateData.photoURL;
        hasUpdate = true;
    }
    if ('birthday' in updateData) {
        payload.birthday = updateData.birthday;
        hasUpdate = true;
    }
    if ('cpf' in updateData) {
        payload.cpf = updateData.cpf;
        hasUpdate = true;
    }
    
    if (!hasUpdate) {
        throw new Error("Nenhuma informação foi enviada para atualização.");
    }

    const data = await postToAppsScript(payload);
    if (!data.user) {
        throw new Error(data.msg || "Ocorreu um erro ao atualizar o perfil.");
    }

    if ('photoURL' in payload) {
        await persistUserPhoto(updateData.email, payload.photoURL ?? null);
    }

    return ensureUserProfileDocument(data.user);
};


/**
 * Sends a password reset code to the user's email via Apps Script using GET.
 */
export const requestPasswordReset = async (email: string): Promise<string> => {
    const params = new URLSearchParams({
        action: 'requestReset',
        email,
    });
    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
    const data = await handleResponse(response);
    return data.msg;
};

/**
 * Confirms the password reset with a code and new password via Apps Script using GET.
 */
export const confirmPasswordReset = async ({ email, code, newPassword }: ConfirmResetData): Promise<string> => {
    const params = new URLSearchParams({
        action: 'confirmReset',
        email,
        code,
        newPassword, // Backend expects plaintext and will hash it
    });
    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
    const data = await handleResponse(response);
    return data.msg;
};

/**
 * Logs the user out by clearing local session data and signing out from Firebase.
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out from Firebase:", error);
  }
  localStorage.removeItem('currentUser');
};
