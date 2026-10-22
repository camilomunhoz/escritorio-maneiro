# Plano de Implementação Incremental

Este documento descreve as etapas de construção da aplicação, divididas em fases técnicas consecutivas, autocontidas e verificáveis. O objetivo é mitigar riscos de alucinação, assegurar a aderência integral aos requisitos dos áudios e consolidar uma arquitetura estável baseada em componentes reutilizáveis.

---

## Estrutura de Fases

```
[Fase 1: Infraestrutura e Fundação de Design]
      |
[Fase 2: Motor de Estado Único e Dados Simulados]
      |
[Fase 3: Desktop Host e Modos de Visualização (Drawer)]
      |
[Fase 4: Fluxo de Onboarding Completo]
      |
[Fase 5: Módulo Home, Barra de Nível e Metas Diárias]
      |
[Fase 6: Módulo de Jogos e Mecânica de Liberação Síncrona]
      |
[Fase 7: Módulo de Saúde, Calibração e Visão Computacional]
      |
[Fase 8: Módulo Social, Recomendações e Convites Reais]
      |
[Fase 9: Quadro de Medalhas, Menu Hambúrguer e Configurações]
      |
[Fase 10: Polimento Visual, Testes e Revisão de Integridade]
```

---

## Fase 1: Infraestrutura e Fundação de Design

### Objetivos
- Configurar o ambiente do projeto (Vite + React ou aplicação modular moderna) com suporte completo a Tailwind CSS.
- Definir tokens de design calmantes (paleta dessaturada, tipografia limpa, escalas de cinza quente e sem tons vibrantes).
- Configurar iconografia linear SVG sem emojis.

### Entregas
- `tailwind.config.js` com paleta e dimensões customizadas (modos 350x500, 750x500, 350x50).
- Estrutura base de pastas (`components/ui/`, `components/modules/`, `services/`, `types/`, `hooks/`).
- Tipos TypeScript / modelos de dados padronizados.

### Critério de Aceite e Verificação
- Execução limpa sem erros de compilação (`npm run dev`).
- Tokens de cor e tipografia aplicáveis via classes sem estilizações arbitrárias inline.

---

## Fase 2: Motor de Estado Único (Single Source of Truth) e Dados Simulados

### Objetivos
- Estabelecer o gerenciamento de estado global no cliente utilizando `localStorage` como camada de persistência.
- Implementar o gerador de dados corporativos (seed de colegas de trabalho do escritório).

### Entregas
- `services/storageService.ts`: Leitura e gravação atômica com esquemas bem definidos.
- `services/mockDataService.ts`: Geração de 15 a 25 colaboradores com nomes, departamentos, avatares coloridos, status de atividade, pontuações e interesses.
- Estado inicial do usuário tester com identificação fixa (simulando autenticação SSO concluída).

### Critério de Aceite e Verificação
- Ao recarregar a aplicação, as alterações realizadas persistem intactas no `localStorage`.
- Em ambiente limpo (sem dados prévios), a rotina popula automaticamente a base de colegas sem falhas de nulidade.

---

## Fase 3: Desktop Simulado em Tela Cheia e Componente Drawer

### Objetivos
- Construir o ambiente simulado de área de trabalho (Fake Desktop) ocupando a totalidade da tela (`100vw x 100vh`) com suporte a modo Full Screen imersivo para os testers.
- Incluir barra de tarefas simulada no rodapé contendo relógio do sistema e área de notificações (tray) no canto inferior direito.
- Desenvolver o container flutuante (Drawer) posicionado no canto inferior direito, ancorado logo acima da bandeja do sistema.
- Implementar as transições de tamanho animadas (Normal: 350x500px, Expandido: 750x500px, Compacto: 350x50px).

### Entregas
- Componente `DesktopContainer.tsx`: plano de fundo corporativo minimalista, barra de tarefas fake com relógio e botão de alternância para o modo Fullscreen (`requestFullscreen`).
- Componente `DrawerHost.tsx`: container do drawer com animações de transição suaves (Tailwind transition / Motion) e controle de abertura/fechamento.
- Controles visuais de alternância de modos (Normal / Expandido / Compacto) para facilitar a validação.

### Critério de Aceite e Verificação
- O protótipo pode ser colocado em tela cheia com um clique ou atalho F11, ocultando a barra do navegador.
- Redimensionamento sem deformação de conteúdo ou quebra de transbordamento (overflow).
- Transição suave entre os modos normal e expandido mantendo a ancoragem no canto inferior direito.

---

## Fase 4: Fluxo de Onboarding Completo

### Objetivos
- Desenvolver a esteira de onboarding exibida no primeiro acesso do usuário tester.

### Entregas
- Interação de início ao clicar no desktop fake.
- Animação de subida do Drawer com indicador de carregamento (Loader) de 1 segundo para simular inicialização.
- Tela de boas-vindas com nome da aplicação baseado em placeholder configurável.
- Carrossel com 3 telas sequenciais ("Explicação 1", "Explicação 2" e "Explicação 3"), com 3 pontos (dots) de navegação e setas de avançar e retroceder.
- Tela aprofundada de privacidade corporativa (os dots somem, resta a seta de voltar e o botão "Compreendo" na base; texto apaziguador garantindo que dados de pausas e hábitos nunca são acessíveis por chefes ou superiores).
- Transição animada para o modo Expandido (750x500px).
- Tela centralizada "Vamos começar" com botão "Vamos lá".
- Seção de 2 passos (layout em duas colunas: 1/3 à esquerda e 2/3 à direita):
  - Passo 1: Customização de cor do avatar em SVG com paleta suave e botão "Pronto".
  - Passo 2: Simulação de detecção/biometria facial via webcam (com botão ghost "Prefiro realizar depois", moldura ovalada branca sobreposta que fica verde após 2 segundos, marcas de canto com animação de escala e animação de sucesso que revela botão "Prosseguir").
- Retorno animado ao modo Normal (350x500px) com Loader de 3 segundos simulando conexão SSO corporativa (texto superior: "Conectando-se à sua empresa"; texto inferior: aviso de importação de nome e setor).
- Redirecionamento automático para a Home.

### Critério de Aceite e Verificação
- O onboarding ocorre apenas na primeira inicialização (marcador salvo no storage).
- Possibilidade de pular a biometria facial sem travamentos.
- Cores do avatar refletidas imediatamente no estado do usuário.

---

## Fase 5: Módulo Home, Barra de Nível e Metas Diárias

### Objetivos
- Construir o painel principal cotidiano da aplicação no modo Normal.

### Entregas
- Barra de navegação inferior fixa com 5 botões: Home, Jogos, Saúde, Social e Menu Hambúrguer.
- Cabeçalho da Home: avatar do usuário em moldura circular projetada, barra de XP, nível atual e contador de streak diário (foguinhos).
- Seção de 3 metas diárias individuais (uma de Jogos, uma de Saúde e uma Social) com concessão de XP ao concluir.
- Card da meta compartilhada corporativa ("Volta ao Mundo em 30 Dias") exibindo progresso acumulado da empresa.
- Miniatura compacta do Quadro de Medalhas.

### Critério de Aceite e Verificação
- Conclusão de metas atualiza o XP e a barra de nível imediatamente.
- Navegação fluida pela barra inferior.

---

## Fase 6: Módulo de Jogos e Mecânica de Liberação Síncrona

### Objetivos
- Implementar a lógica de ciclo de liberação de 3 em 3 horas para todos os funcionários.
- Desenvolver os 3 minijogos funcionais no modo Expandido.

### Entregas
- Temporizador central sincronizado no storage para abertura de jogos a cada 3h de forma comunitária.
- Estados do botão principal: "Jogar" (quando liberado e pendente), contador regressivo sem revelar o jogo (quando bloqueado) e "Ver placares" (quando já jogado no ciclo).
- Tela expandida de execução de jogo (750x500px):
  - Esquerda (1/3): animação isométrica em loop do avatar em máquina de fliperama/arcade (espelho lúdico sem exibir a tela do jogo).
  - Direita (2/3): tela jogável do minijogo.
- Implementação dos jogos:
  - **Cobrinha (Snake)**: Lógica clássica em canvas/grid.
  - **Pong**: Jogo com aceleração e IA física progressiva.
  - **Termo (Wordle)**: Jogo de adivinhação de palavras de 5 letras em português com sorteio entre 5 palavras pré-cadastradas.
- Leaderboards gerais acumulados e pontuais da rodada após derrota/game over.

### Critério de Aceite e Verificação
- Todos os jogos são 100% jogáveis sem travamentos.
- Registro da pontuação do usuário e comparação imediata com o ranking dos colegas.

---

## Fase 7: Módulo de Saúde, Calibração e Visão Computacional

### Objetivos
- Construir as telas de monitoramento passivo e pausas ativas na aba de Saúde.
- Adaptar e integrar a dinâmica, cálculos e máquina de estados da PoC de visão computacional localizada em [docs/alongamento-computer-viz](file:///c:/Users/usuario/Documents/projects/escritorio-divertido/docs/alongamento-computer-viz).

### Referência Técnica Obrigatória
- O agente responsável deve analisar previamente o código de [docs/alongamento-computer-viz](file:///c:/Users/usuario/Documents/projects/escritorio-divertido/docs/alongamento-computer-viz) (estrutura, detecção com MediaPipe Pose, filtro EMA, alvos anatômicos fixos calculados na T-Pose, gamificação com Web Audio API). A estética e os conceitos devem ser adequados aos padrões e componentes do projeto atual.

### Entregas
- Tela inicial expandida de calibração postural e câmera (layout similar à biometria facial, com passos de enquadramento e T-Pose baseados na PoC).
- Widget de Hidratação: opção de contagem por copos ou por volume em mililitros, com simulação de detecção via câmera e input manual. Implementação da regra de constância com espaçamento mínimo de 30 minutos entre registros para validação da meta diária.
- Widget de Ergonomia e Postura: indicador de alinhamento com base na calibração.
- Módulo de Alongamentos Guiados: tela com marcadores circulares virtuais para extensão de braços e recuperação postural, portando o motor de poses e feedback sonoro da PoC.
- Detecção de Pausas: monitoramento de presença à frente da câmera e contabilização de tempo de descanso.

### Critério de Aceite e Verificação
- Alternância funcional entre registro manual e automático de ingestão de água.
- Marcadores de alongamento interativos e responsivos baseados na calibração anatômica da PoC.

---

## Fase 8: Módulo Social, Recomendações e Convites Reais

### Objetivos
- Desenvolver as ferramentas de incentivo a encontros presenciais no escritório.

### Entregas
- Questionário inicial de seleção de tags de interesse com persistência no perfil.
- Mecanismo de recomendação de colegas de trabalho com base na similaridade de tags.
- Lista de amigos com funcionalidade de envio e aprovação de solicitações.
- Modal de envio de convites de atividades presenciais ("Café", "Almoço", "Caminhada ao sol").
- Visualização gráfica do convite ilustrando os dois avatares realizando a atividade em conjunto.
- Boilerplate para validação por aproximação presencial de crachás.

### Critério de Aceite e Verificação
- Solicitações de amizade recusadas não geram mensagens públicas constrangedoras.
- Convites aceitos creditam o progresso na meta social correspondente.

---

## Fase 9: Quadro de Medalhas, Menu Hambúrguer e Configurações

### Objetivos
- Criar a área administrativa, atalho de avatar e o mostruário amplo de conquistas.

### Entregas
- Menu Hambúrguer com indicador visual (badge vermelha) de novidades.
- Caixa de entrada central de notificações com histórico de convites e conquistas.
- Atalho para personalização e troca de cor do Avatar.
- Mostruário de Medalhas (visão ampla com medalhas conquistadas, medalhas em progresso e regras de raridade: bronze, prata, ouro, platina).
- Modal expandido de perfil ao clicar em qualquer colaborador do ranking (com botão "X" de fechamento, avatar, medalhas selecionadas públicas e desdobramento de XP por pilares: Jogos, Saúde e Social, com balanceamento de esforço). Metas diárias individuais mantidas estritamente privadas.
- Painel de Configurações:
  - Refazer interesses de afinidade social.
  - Refazer detecção facial (reabrir calibração com a webcam caso tenha sido negada ou pulada).
  - Toggle para simulação de bloqueio de interface por biometria facial.
  - Modo Férias / Afastamento (congelamento temporário da streak).

### Critério de Aceite e Verificação
- Ativação do modo férias protege a contagem da streak de zerar.
- Badge vermelha do menu desaparece após leitura das notificações.
- Opção de refazer detecção facial reabre o módulo de câmera com sucesso.

---

## Fase 10: Polimento Visual, Auditoria de Regras e Validação Final

### Objetivos
- Revisar a aplicação contra todas as restrições explícitas do projeto.

### Checklist de Auditoria
- [ ] Nenhum emoji utilizado na interface ou no código.
- [ ] Nenhuma cor berrante ou saturada utilizada.
- [ ] Textos e frases com tom de serenidade, sem euforia.
- [ ] Dimensões rigorosamente compatíveis com 350x500px (Normal) e 750x500px (Expandido).
- [ ] Código componentizado com fonte única de verdade (SSOT) e ausência de redundâncias.
- [ ] Persistência completa no `localStorage`.

---

## Fase 11: Painel de Controles de Teste (Godmode) no Desktop (Fase Extra)

### Objetivos
- Disponibilizar um painel discreto de controles de teste (Godmode) na área de trabalho do desktop simulado, permitindo que a banca e os testers manipulem o estado da aplicação sem aguardar tempos reais de ciclo.

### Entregas
- Componente `GodmodePanel.tsx` integrado ao `DesktopContainer.tsx` em formato de gaveta retrátil ou popover discreto.
- Ações rápidas de depuração e avaliação:
  - Bypassar o temporizador de 3 horas dos minijogos e forçar a liberação imediata.
  - Acionar evento simulado de detecção de hidratação (garrafa/copo).
  - Acionar evento simulado de postura inadequada para teste dos alertas ergonômicos.
  - Conceder XP (+100 XP) para testar evolução de nível e badges.
  - Avançar dias ou simular período de ausência para testar a streak e o Modo Férias.
  - Botão de reset rápido do `localStorage` para reexecutar o onboarding.

### Critério de Aceite e Verificação
- O painel não interfere no visual sereno do drawer principal.
- As ações de Godmode alteram o estado global instantaneamente e refletem em tempo real no drawer.
