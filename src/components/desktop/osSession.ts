export const GILBERT_OS_AUTH_KEY = 'gilbert_os_authenticated';
export const GILBERT_OS_LAST_ACTIVITY_KEY = 'gilbert_os_last_activity';
export const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hora de inatividade

/**
 * Determina se o computador deve passar pela sequencia de inicializacao
 * (tela preta com logo GilbertOS + tela de login).
 * Ocorre se nao estiver autenticado ou se tiver passado mais de 1 hora da ultima atividade.
 */
export function shouldBootGilbertOS(): boolean {
  try {
    const isAuth = localStorage.getItem(GILBERT_OS_AUTH_KEY) === 'true';
    const lastActivityStr = localStorage.getItem(GILBERT_OS_LAST_ACTIVITY_KEY);

    if (!isAuth || !lastActivityStr) {
      return true;
    }

    const lastActivity = Number(lastActivityStr);
    if (isNaN(lastActivity)) {
      return true;
    }

    const now = Date.now();
    return now - lastActivity > ONE_HOUR_MS;
  } catch {
    return true;
  }
}

/**
 * Registra o timestamp atual de atividade no localStorage.
 */
export function recordGilbertOSActivity(): void {
  try {
    localStorage.setItem(GILBERT_OS_LAST_ACTIVITY_KEY, Date.now().toString());
  } catch {
    // Ignora possiveis falhas de quota ou navegacao privada
  }
}

/**
 * Marca o usuario como autenticado no GilbertOS.
 */
export function setGilbertOSAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      localStorage.setItem(GILBERT_OS_AUTH_KEY, 'true');
      recordGilbertOSActivity();
    } else {
      localStorage.removeItem(GILBERT_OS_AUTH_KEY);
      localStorage.removeItem(GILBERT_OS_LAST_ACTIVITY_KEY);
    }
  } catch {
    // Ignora possiveis falhas de storage
  }
}

/**
 * Limpa todos os dados locais e reinicia o sistema do zero.
 */
export function resetAndRebootGilbertOS(): void {
  try {
    localStorage.clear();
  } catch {
    // Continua para o reload mesmo se falhar
  }
  window.location.reload();
}

