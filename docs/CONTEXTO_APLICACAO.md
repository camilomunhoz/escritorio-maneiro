# Contexto da Aplicação: Plataforma Gamificada de Bem-Estar no Trabalho

## 1. Visão Geral e Propósito

A aplicação consiste em uma plataforma desktop gamificada voltada a usuários de escritório submetidos a trabalhos com alta carga cognitiva. O objetivo primordial é oferecer pausas ativas, descontração e incentivo a hábitos saudáveis de forma harmoniosa, integrando o bem-estar diretamente à rotina corporativa sem interromper a produtividade de maneira invasiva.

Trata-se de uma Prova de Conceito (PoC) com caráter altamente prototípico. Determinadas integrações (como processamento pesado de visão computacional, validação de crachás e sincronização externa) contarão com simulações e mockups funcionais para demonstrar a viabilidade da experiência do usuário com fidelidade técnica.

---

## 2. Pilares Fundamentais

A plataforma é sustentada por três pilares de ação e um pilar transversal de colaboração comunitária:

### 2.1. Pilar de Jogos
- **Objetivo**: Proporcionar momentos curtos de descontração sem dispersar a jornada de trabalho.
- **Janela de Liberação**: Os jogos são disponibilizados a cada 3 horas. A liberação é sincronizada e simultânea para todos os colaboradores do escritório, promovendo senso de evento comunitário.
- **Catálogo Inicial de Minijogos**:
  - **Cobrinha (Snake)**: Mecânica clássica com controle em grade (grid).
  - **Pong**: Jogo retrô com aceleração progressiva da bolinha contra uma IA imbatível baseada em cálculos físicos.
  - **Termo (Wordle)**: Desafio de palavras sorteadas a partir de uma base concisa em português (sorteio entre 5 palavras pré-cadastradas).
- **Tela de Jogo Expandida (750x500px)**:
  - **Coluna Esquerda (1/3)**: Animação isométrica em looping do avatar do colaborador jogando em um gabinete de fliperama/arcade (espelho lúdico sem revelar a tela do jogo).
  - **Coluna Direita (2/3)**: Área jogável funcional do minijogo.
- **Leaderboards e Rankings**:
  - Placares globais unificados e filtros específicos por jogo.
  - Leaderboard pontual da rodada exibido imediatamente após o encerramento da partida (derrota/game over).

### 2.2. Pilar de Saúde e Ergonomia
- **Objetivo**: Monitoramento passivo, acolhedor e integração com hábitos fisiológicos saudáveis.
- **Detecção e Monitoramento via Webcam (Visão Computacional)**:
  - **Hidratação com Intervalo de Constância**: Reconhecimento do gesto de aproximar copo ou garrafa da boca, gerando notificação automática para confirmar e registrar o consumo de água. Permite registro manual para quem não utiliza a câmera e opção de contagem simplificada por copos/vezes ou registro volumétrico em mililitros. A regra da meta diária exige ingestões espaçadas (por exemplo, 4 vezes ao dia sem contabilizar ingestões com intervalo inferior a 30 minutos).
  - **Ergonomia e Postura**: Etapa inicial de calibração em que o usuário assume sua postura ideal. O sistema monitora pontos anatômicos (ombros, inclinação cervical e tronco curvado), respeitando a distância focal da câmera para evitar falsos positivos.
  - **Alongamentos Guiados**: Orientações de pausas ativas na mesma interface de calibração, com marcadores visuais (círculos) na tela para que o colaborador estenda os braços e neutralize anomalias posturais recorrentes. A base conceitual, dinâmica matemática (T-Pose, calibração anatômica, filtro EMA, alvos e sustentação) e efeitos de áudio Web Audio API estão implementados como PoC de referência prioritária em [docs/alongamento-computer-viz](file:///c:/Users/usuario/Documents/projects/escritorio-divertido/docs/alongamento-computer-viz), devendo ser analisados antes da implementação e adaptados aos padrões visuais e ao layout do app.
  - **Detecção de Pausas**: Reconhecimento da ausência do usuário à frente da mesa de trabalho, contabilizando automaticamente períodos de caminhada e desconexão.

### 2.3. Pilar Social e Conexão Real
- **Objetivo**: Fomentar interações presenciais no ambiente de trabalho, estimulando conversas entre equipes e setores distintos.
- **Mapeamento de Interesses**: Seleção inicial de tags de interesses (tecnologia, literatura, música, culinária, café, caminhada, etc.), utilizada para recomendações qualitativas por afinidade (editável a qualquer momento nas configurações).
- **Relações e Convites**:
  - Envio de solicitações de amizade (rejeições silenciosas sem feedback público para preservar o conforto social).
  - Envio de convites presenciais estruturados ("Tomar um café", "Almoçar juntos", "Tomar um sol", "Pausa para conversar").
  - Interface do convite exibe os avatares de ambos os colaboradores realizando a atividade em ilustração vetorial.
- **Validação Antifraude**: Estrutura preparada para validação por aproximação física (simulação de leitura por crachás corporativos ou sensores de proximidade de rede).

### 2.4. Gamificação Compartilhada e Metas
- **Metas Diárias Individuais**: Três missões diárias exclusivas (uma de cada pilar: Jogos, Saúde, Social), concedendo pontos de experiência (XP). Não são passíveis de auditoria por terceiros para proteger a privacidade.
- **Meta Compartilhada Global**: Desafio corporativo unificado (exemplo: "Volta ao Mundo em 30 Dias"), somando dados simulados de passos e conexões como Strava e aplicativos de saúde para alcançar marcos coletivos.

---

## 3. Identidade Visual e Filosofia de Design

- **Diretriz de Tom**: Ambiente de calma, acolhimento e comunidade.
- **Restrições Estritas**:
  - Proibido o uso de cores berrantes, estridentes ou neon.
  - Proibido o uso de emojis na interface ou no código.
  - Proibido o uso de textos eufóricos ou excessivamente entusiasmados.
- **Elementos Visuais**:
  - Paleta suave (tons terrosos, verdes dessaturados, azuis acinzentados, neutros quentes).
  - Tipografia limpa, moderna e altamente legível.
  - Iconografia linear, refinada e sutil.
- **Framework de Estilização**: Tailwind CSS, configurado de forma estritamente modular para facilitar futura mudança de tema ou adoção de design system proprietário.

---

## 4. Estrutura da Interface, Dimensões e Simulação de Desktop em Tela Cheia

A aplicação é concebida como um protótipo web imersivo em **tela cheia (Full Screen - 100vw x 100vh)**, com suporte nativo à Fullscreen API (`document.documentElement.requestFullscreen()`) e atalho visual/teclado para imersão total do testador.

### 4.1. O Ambiente de Desktop Simulado (Fake Desktop)
- **Plano de Fundo (Wallpaper)**: Interface visual minimalista e elegante de um sistema operacional corporativo, situando o usuário dentro do seu ambiente de trabalho no computador.
- **Barra de Tarefas Simulada (Fake Taskbar)**: Rodapé com design discreto contendo horário atualizado do sistema e área de notificações / bandeja (system tray) no canto inferior direito.
- **Comportamento de Drawer**: O aplicativo emerge do canto inferior direito (imediatamente acima da área de tray da barra de tarefas), exatamente como utilitários nativos de desktop.
- **Gatilho de Abertura**: O usuário pode iniciar ou alternar a visibilidade do drawer clicando em qualquer ponto do desktop ou no ícone correspondente na bandeja da barra de tarefas.
- **Modo Tela Cheia**: Controle discreto no topo ou atalho F11 para habilitar o modo tela cheia no navegador, eliminando barras de endereço e garantindo a experiência idêntica à de um desktop real.

### 4.2. Dimensões do Drawer

| Modo de Visualização | Largura | Altura | Propósito |
| :--- | :--- | :--- | :--- |
| **Normal (Padrão)** | 350 px | 500 px | Navegação cotidiana, acompanhamento de metas, leitura de status e navegação rápida. |
| **Expandido** | 750 px | 500 px | Onboarding avançado, execução de minijogos, calibração de câmera e perfis detalhados. |
| **Compacto** | 350 px | 50 px | Barra de status reduzida fixada na parte inferior (módulo com regras em refinamento). |

Transições entre os modos Normal e Expandido devem conter animações suaves de motion (interpolação fluida de largura e reposicionamento ancorado no canto inferior direito).

---

## 5. Avatar e Personalização

- **Conceito**: Mascote minimalista com representação vetorial SVG (silhueta/busto estilizado).
- **Escopo de Customização**:
  - Restrito a paleta predefinida de cores (tonalidades suaves).
  - Sem cosméticos pagos, skins comerciais ou economia transacional fictícia de itens decorativos.
- **Comportamento**: Atua como um companheiro de jornada, ilustrando convites sociais e entregando notificações contextuais.

---

## 6. Sistema de Medalhas e Nivelamento

- **Quadro de Medalhas**:
  - Miniatura compacta na Home (abaixo da barra de nível e streak).
  - Seção dedicada com mostruário de medalhas conquistadas, medalhas ativas em progresso e catálogo de marcos com raridades (Bronze, Prata, Ouro, Platina).
- **Progressão e Experiência (XP)**:
  - Barra de XP unificada no topo com indicador de streak contínuo (dias consecutivos de uso).
  - No perfil expandido, detalhamento da evolução dividida proporcionalmente entre Jogos, Saúde e Social, equilibrando a dificuldade inerente de cada categoria.

---

## 7. Persistência de Dados e Contexto Prototípico

- **Persistência**: Todos os estados, perfis, conquistas, configurações e históricos de jogo residem no `localStorage` do navegador do cliente.
- **Base Populacional**: Rotina automática de geração de colaboradores virtuais pertencentes ao mesmo escritório corporativo (nomes, cargos, avatares, status de atividade e pontuações mockadas) para garantir sensação de vitalidade e ambiente compartilhado desde a primeira execução.
- **Autenticação Simulada**: Acesso padronizado com perfil único do colaborador tester (sem necessidade de cadastro ou inputs de login), emulando um fluxo SSO integrado à empresa.
- **Resiliência da Webcam e Retentativa**: Caso a permissão da câmera seja recusada pelo navegador ou pelo usuário, a aplicação segue imediatamente o fluxo equivalente ao botão "fazer mais tarde", sem travar a experiência. O painel de Configurações disponibiliza a qualquer momento a opção de reiniciar a solicitação e refazer a biometria facial.

---

## 8. Controles de Teste no Desktop (Godmode)

Para viabilizar a avaliação completa por parte da banca avaliadora e testers sem a obrigatoriedade de esperar os tempos reais de cada rotina (como as janelas de 3 horas dos minijogos ou as pausas de 30 minutos de hidratação), o desktop simulado conta com um painel discreto de controles de teste (Godmode):
- **Forçar Liberação de Minijogo**: Libera imediatamente a próxima partida de Cobrinha, Pong ou Termo sem aguardar as 3 horas de ciclo.
- **Simular Detecção de Hidratação / Postura**: Emite notificações de consumo de água ou anomalia postural sob demanda.
- **Avançar / Congelar Streak**: Permite simular passagem de dias, alternar o Modo Férias e testar o congelamento de streak.
- **Injetar Pontos de XP**: Adiciona experiência aos pilares para validar a progressão de níveis e o desbloqueio de medalhas.
- **Reset de Dados**: Limpa o `localStorage` e reexecuta o seed inicial de colaboradores virtuais.
- **Fase de Construção**: Este painel é implementado como a última fase extra do plano de desenvolvimento.
