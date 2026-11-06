import React from 'react';
import { useApp } from '../../context/AppContext';
import { AvatarSvg, type AvatarSvgProps } from './AvatarSvg';
import { DEFAULT_BODY_ID, DEFAULT_FACE_ID } from '../../data/avatarRegistry';

export interface UserAvatarProps extends Omit<AvatarSvgProps, 'color' | 'bodyId' | 'faceId'> {
  userId?: string;
  user?: {
    id?: string;
    userId?: string;
    avatarColor?: string;
    avatarBody?: string;
    avatarFace?: string;
    [key: string]: any;
  } | null;
  color?: string;
  bodyId?: string;
  faceId?: string;
  noFace?: boolean;
}

/**
 * Componente canonico de apresentacao de avatar para usuarios e colegas de trabalho.
 * Resolve de forma centralizada e reativa a identidade visual completa (cor, corpo e rosto)
 * consultando o estado global (AppContext):
 * - Se for o usuario logado, sempre reflete a versao mais recente editada.
 * - Se for um colega cadastrado, recupera o corpo e rosto configurados no registro.
 * - Suporta fallbacks confiaveis para registros estaticos, mocks ou IDs customizados.
 */
export const UserAvatar: React.FC<UserAvatarProps> = React.memo(({
  userId,
  user,
  color,
  bodyId,
  faceId,
  ...avatarProps
}) => {
  const { state } = useApp();

  const targetId = userId || user?.userId || user?.id;

  let resolvedColor = color || user?.avatarColor;
  let resolvedBodyId = bodyId || user?.avatarBody;
  let resolvedFaceId = faceId || user?.avatarFace;

  // Resolucao dinamica a partir do estado global:
  // Se for o usuario logado, sempre sincroniza com a versao mais recente
  if (targetId && state?.user && targetId === state.user.id) {
    resolvedColor = state.user.avatarColor || resolvedColor || '#6D8B75';
    resolvedBodyId = state.user.avatarBody || resolvedBodyId || DEFAULT_BODY_ID;
    resolvedFaceId = state.user.avatarFace || resolvedFaceId || DEFAULT_FACE_ID;
  } else if (targetId && (!resolvedColor || !resolvedBodyId || !resolvedFaceId) && state?.coworkers) {
    // Evita varredura desnecessaria se as propriedades visuais ja foram fornecidas
    const coworker = state.coworkers.find(c => c.id === targetId);
    if (coworker) {
      resolvedColor = coworker.avatarColor || resolvedColor || '#5A6B7C';
      resolvedBodyId = coworker.avatarBody || resolvedBodyId || DEFAULT_BODY_ID;
      resolvedFaceId = coworker.avatarFace || resolvedFaceId || DEFAULT_FACE_ID;
    }
  }

  // Garantia absoluta de preenchimento para evitar avatar em branco ou desconfigurado
  resolvedColor = resolvedColor || '#6D8B75';
  resolvedBodyId = resolvedBodyId || DEFAULT_BODY_ID;
  resolvedFaceId = resolvedFaceId || DEFAULT_FACE_ID;

  return (
    <AvatarSvg
      color={resolvedColor}
      bodyId={resolvedBodyId}
      faceId={resolvedFaceId}
      {...avatarProps}
    />
  );
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
