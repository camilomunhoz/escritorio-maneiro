/**
 * Stretch Pose definitions and dynamic calibration parameters
 * Targets are calculated based on shoulder width (W_shoulder) and torso center (C_torso):
 * Left Target  = C_torso - (alpha * W_shoulder, beta * W_shoulder)
 * Right Target = C_torso + (alpha * W_shoulder, -beta * W_shoulder)
 */

export const POSE_PRESETS = {
  diagonal: {
    id: 'diagonal',
    name: 'Alongamento Diagonal Superior (Y)',
    shortName: 'Diagonal Superior',
    desc: 'Estique ambos os braços para cima e para fora em diagonal (formato de Y).',
    alpha: 1.8,
    beta: 0.55,
    dirLeft: { x: -0.76, y: -0.65 },
    dirRight: { x: 0.76, y: -0.65 },
    icon: '↖↗'
  },
  t_stretch: {
    id: 't_stretch',
    name: 'Abertura Lateral em T',
    shortName: 'Lateral em T',
    desc: 'Abra os braços horizontalmente nas laterais na altura dos ombros, expandindo o peitoral.',
    alpha: 2.15,
    beta: 0.08,
    dirLeft: { x: -1.0, y: -0.05 },
    dirRight: { x: 1.0, y: -0.05 },
    icon: '←→'
  },
  overhead: {
    id: 'overhead',
    name: 'Elevação Vertical Alta',
    shortName: 'Vertical Alto',
    desc: 'Estique os braços para cima da cabeça, alongando toda a coluna e dorsais.',
    alpha: 0.90,
    beta: 1.15,
    dirLeft: { x: -0.22, y: -0.975 },
    dirRight: { x: 0.22, y: -0.975 },
    icon: '↑↑'
  },
  dynamic_auto: {
    id: 'dynamic_auto',
    name: 'Treino Dinâmico Alternado',
    shortName: 'Treino Automático',
    desc: 'Modo contínuo: a cada alongamento sustentado com sucesso, uma nova postura é sorteada!',
    alpha: 1.8,
    beta: 0.55,
    dirLeft: { x: -0.76, y: -0.65 },
    dirRight: { x: 0.76, y: -0.65 },
    icon: '🔄',
    isAuto: true
  }
};

export const AUTO_CYCLE_POSES = ['diagonal', 't_stretch', 'overhead'];
