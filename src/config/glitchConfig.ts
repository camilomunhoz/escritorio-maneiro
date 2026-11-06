/**
 * Parametros de configuracao do efeito de Glitch do Desktop
 * Edite os valores abaixo livremente para ajustar a aparencia e o comportamento do efeito.
 */
export const GLITCH_CONFIG = {
  // Duracao total do efeito na tela em milissegundos
  durationMs: 200,

  // Ativa ou desativa o tremor fisico da janela / tela inteira
  enableShake: true,

  // Intensidade maxima do deslocamento do tremor em pixels
  shakeIntensityPx: 3,

  // Intensidade da rotacao angular no tremor em graus
  shakeRotationDeg: 0.3,

  // Ativa ou desativa a aberracao cromatica (separacao de canais RGB)
  enableRgbSplit: true,

  // Deslocamento horizontal dos canais ciano/magenta em pixels
  rgbSplitOffsetPx: 10,

  // Ativa ou desativa as scanlines horizontais (linhas estilo monitor CRT)
  enableScanlines: true,

  // Opacidade das scanlines (entre 0 e 1)
  scanlinesOpacity: 0.4,

  // Ativa ou desativa o flash luminoso de contraste
  enableColorFlash: true,

  // Opacidade do flash luminoso (entre 0 e 1)
  flashOpacity: 0.1,

  // Numero de fatias horizontais aleatorias que cortam a tela
  sliceCount: 20,

  // Deslocamento horizontal maximo das fatias (em porcentagem)
  sliceMaxShiftPercent: 5,

  // Cores de interferencia do glitch
  colors: {
    cyan: 'rgba(0, 240, 255, 0.01)',
    magenta: 'rgba(255, 0, 90, 0.01)',
    flash: 'rgba(255, 255, 255, 0.1)',
  },
};

