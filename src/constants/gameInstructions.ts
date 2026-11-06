import type { GameType } from '../types';

export interface GameInstructionConfig {
  title: string;
  category: string;
  objective: string;
  controls: string;
  tip: string;
}

export const GAME_INSTRUCTIONS: Record<GameType, GameInstructionConfig> = {
  cobrinha: {
    title: 'Jogo da Cobrinha',
    category: 'Destreza e Reflexos',
    objective: 'Guie a cobrinha pelo tabuleiro e colete frutos saudaveis para crescer e pontuar.',
    controls: 'Teclas direcionais (Setas do teclado ou W, A, S, D).',
    tip: 'Evite colidir com as quatro paredes ou com o proprio corpo.',
  },
  pong: {
    title: 'Ping y Pong',
    category: 'Foco e Coordenacao',
    objective: 'Rebata a bolinha contra a inteligencia artificial corporativa mantendo ralis continuos.',
    controls: 'Mova o cursor verticalmente na area de jogo ou use as setas Cima e Baixo.',
    tip: 'Ralis longos e pontos convertidos multiplicam sua recompensa.',
  },
  termo: {
    title: 'Termo',
    category: 'Vocabulario e Cognicao',
    objective: 'Adivinhe a palavra secreta de 5 letras relacionada a bem-estar em ate 6 tentativas.',
    controls: 'Teclado fisico do computador ou toque nas teclas virtuais.',
    tip: 'Verde: letra certa na posicao exata. Amarelo: letra presente na palavra, em outra posicao.',
  },
};

