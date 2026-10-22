# Fluxo do Usuário: Roteiro Completo de Navegação e Experimentação

Este documento descreve detalhadamente todos os caminhos, ações, transições de tela e estados interativos a serem experimentados pelos usuários e testadores da plataforma.

---

## 1. Mapa de Navegação Geral

```
[Desktop Simulado Minimalista]
       | (Clique em qualquer ponto)
       v
[Drawer Sobe no Canto Inferior Direito - 350x500px]
       |
       +---> [Onboarding Passo 1: Boas-Vindas]
       |        |
       |        v
       +---> [Onboarding Passo 2: Carrossel de 3 Explicações (Pontos + Setas)]
       |        |
       |        v
       +---> [Onboarding Passo 3: Política e Garantia de Privacidade]
       |        | (Clique em "Compreendo" -> Expande para 750x500px)
       |        v
       +---> [Onboarding Passo 4: Transição "Vamos Começar"]
       |        |
       |        v
       +---> [Onboarding Passo 5: Customização de Cor do Avatar (SVG)]
       |        |
       |        v
       +---> [Onboarding Passo 6: Detecção Facial / Biometria (Webcam ou Pular)]
       |        | (Sucesso -> Recolhe para 350x500px)
       |        v
       +---> [Onboarding Passo 7: Carregamento SSO Corporativo (3s)]
                |
                v
       +---------------------------------------------+
       |                    HOME                     |
       +---------------------------------------------+
         |           |           |           |
         v           v           v           v
      [Jogos]     [Saúde]     [Social]    [Menu Hambúrguer]
```

---

## 2. Roteiro Passo a Passo de Ações

### 2.1. Primeiro Acesso e Onboarding

1. **Imersão em Tela Cheia e Ativação no Desktop**:
   - **Modo Tela Cheia**: A aplicação é executada em modo de tela cheia (100vw x 100vh), ocultando barras de navegador para imersão total do testador (com botão acessível no canto superior e suporte ao atalho F11 / Fullscreen API).
   - **Ambiente de Trabalho Simulado**: O fundo exibe uma área de trabalho corporativa minimalista com barra de tarefas no rodapé e área de notificações (tray) no canto inferior direito.
   - **Ação**: O usuário clica em qualquer ponto da área de trabalho ou no ícone da bandeja para acionar o aplicativo.
   - **Resultado**: O drawer sobe no canto inferior direito com animação fluida, apresentando um indicador de carregamento suave durante 1 segundo.

2. **Tela de Boas-Vindas com Nome Placeholder**:
   - **Exibição**: Mensagem acolhedora de introdução ("Bem-vindo ao [Nome do App]"), utilizando um placeholder configurável para o nome da aplicação que ainda será definido.
   - **Ação**: Clique no botão "Começar".

3. **Carrossel Explicativo (3 Etapas com Dots)**:
   - **Exibição**: Três telas sequenciais com os títulos provisórios:
     - Etapa 1: "Explicação 1"
     - Etapa 2: "Explicação 2"
     - Etapa 3: "Explicação 3"
   - **Navegação**: Acompanhadas de três pontos navegáveis (dots) na base com setas de avançar e retroceder à esquerda e à direita.
   - **Ações**: O usuário navega livremente entre as etapas.

4. **Garantia de Privacidade e Segurança**:
   - **Exibição**: Ao final das explicações, os pontos desaparecem. Permanece uma seta para retroceder à esquerda e surge um texto explicativo claro com tom apaziguador: garante que o aplicativo é mantido por empresa terceirizada independente e que os dados de pausas, postura, hábitos e webcam jamais são acessíveis por chefes, gestores ou cargos de liderança corporativa.
   - **Ação**: Clique no botão "Compreendo", alinhado à base junto à seta de voltar.

5. **Expansão para Configuração Pessoal**:
   - **Transição**: O drawer expande horizontalmente de 350px para 750px (mantendo 500px de altura) com animação fluida de motion.
   - **Exibição**: Tela centralizada com o título "Vamos começar" e botão "Vamos lá".
   - **Ação**: Clique em "Vamos lá".

6. **Customização do Avatar (Layout em Duas Colunas)**:
   - **Coluna Esquerda (1/3)**: Opções de customização restritas à seleção de cor dentro de uma paleta suave pré-definida e botão "Pronto" na base.
   - **Coluna Direita (2/3)**: Pictograma minimalista do avatar em SVG, atualizando a cor em tempo real.
   - **Ação**: Escolher a cor desejada e clicar em "Pronto".

7. **Biometria Facial / Detecção de Presença (Layout em Duas Colunas)**:
   - **Coluna Esquerda (1/3)**: Texto em tópicos justificando o uso técnico: validar quem está no computador (evitar que outros façam atividades no lugar do colaborador) e viabilizar bloqueio da interface contra bisbilhoteiros.
   - **Coluna Direita (2/3)**: Solicitação de acesso à webcam com botão "Realizar detecção facial" e botão ghost secundário "Prefiro realizar depois" (permitindo pular e realizar mais tarde pelo menu).
   - **Caminho A (Aceite)**: Concede acesso à câmera -> Moldura ovalada branca sobreposta ao rosto -> Marcadores nos quatro cantos com animação contínua de escala (scale) simulando varredura -> Após 2 segundos, a moldura ovalada torna-se verde -> Esconde a câmera e exibe animação de sucesso com botão "Prosseguir" logo abaixo.
   - **Caminho B (Pular)**: Usuário clica em "Prefiro realizar depois" -> Avança imediatamente para a etapa seguinte.
   - **Caminho C (Permissão Negada)**: Se o navegador ou o usuário bloquear o acesso à câmera, a aplicação trata o evento de forma transparente, seguindo exatamente o mesmo fluxo do Caminho B ("Prefiro realizar depois"), ficando a opção de reiniciar a detecção facial disponível no painel de Configurações.

8. **Conexão SSO e Finalização do Onboarding**:
   - **Transição**: A interface recolhe de volta para o tamanho Normal (350x500px).
   - **Exibição**: Indicador de carregamento (Loader) centralizado exibido durante 3 segundos de espera simulada.
   - **Textos Contextuais**:
     - *Acima do Loader*: "Conectando-se à sua empresa"
     - *Abaixo do Loader*: "Importando seus dados cadastrais (nome e departamento) via SSO para preparar seu perfil de trabalho."
   - **Resultado**: Após os 3 segundos, o usuário é direcionado automaticamente para a Home.

---

### 2.2. Aba Principal (Home)

- **Cabeçalho do Colaborador**:
  - Avatar do usuário em moldura circular com leve projeção vertical.
  - Barra de experiência (XP) e indicador de nível atual.
  - Contador de streak consecutivo com indicador de consistência.
- **Minhas Metas Diárias (3 Missões)**:
  - Meta de Jogos: Ex. "Participe de 1 sessão de minijogo hoje".
  - Meta de Saúde: Ex. "Beba água 4 vezes ao longo do turno".
  - Meta Social: Ex. "Envie 1 convite para uma pausa de café".
  - **Ação**: Ao clicar em uma meta concluída, o usuário coleta XP e a barra de nível avança.
- **Meta Compartilhada Corporativa**:
  - Exibição do progresso colaborativo da empresa (ex. "Volta ao Mundo em 30 Dias: 14.850 km de 40.075 km concluídos").
- **Miniatura do Quadro de Medalhas**:
  - Atalho compacto para visualização rápida das últimas conquistas. Clique direciona para o Quadro de Medalhas expandido.
- **Menu de Navegação Inferior (5 Abas)**:
  - Botões: [Home], [Jogos], [Saúde (Coração)], [Social], [Menu Hambúrguer].

---

### 2.3. Aba de Jogos

- **Verificação de Ciclo (Janela de 3 Horas)**:
  - **Cenário 1 - Jogo Bloqueado (Fora da Janela)**: Exibe contador regressivo (ex. "Próximo jogo em: 01h 42m") sem revelar o título do jogo.
  - **Cenário 2 - Jogo Disponível e Não Jogado**: Botão destacado "Jogar Agora".
  - **Cenário 3 - Jogo Já Concluído no Ciclo**: Botão "Ver Placares".
- **Execução do Jogo (Modo Expandido 750x500px)**:
  - **Coluna Esquerda (1/3)**: Animação isométrica em loop do avatar controlando um arcade/fliperama.
  - **Coluna Direita (2/3)**: Área jogável:
    - *Cobrinha*: Movimentação por setas ou WASD, coletando pontos no grid.
    - *Pong*: Controle da raquete pelo mouse ou teclado contra IA física progressiva.
    - *Termo*: Grade de 5 letras com teclado virtual para descoberta da palavra do dia.
- **Encerramento da Partida**:
  - A tela do jogo se recolhe, revelando o placar da rodada, pontos conquistados e posição imediata no ranking.
  - Botão "Voltar" retorna ao menu da aba de Jogos no formato Normal.
- **Leaderboards e Rankings**:
  - Abas de filtragem: [Geral Acumulado], [Cobrinha], [Pong], [Termo].
  - Clique no card de qualquer colega abre a visualização detalhada de perfil do usuário.

---

### 2.4. Aba de Saúde

- **Calibração Postural Inicial (Apenas no Primeiro Acesso)**:
  - Solicita postura de referência e distância da câmera no formato Expandido. Concluída a calibração, retorna para a tela normal de Saúde.
- **Painel de Hidratação**:
  - Alternador de modalidade: Contagem por Copos (ex. 4/8 copos) ou Volume em Mililitros (ex. 1.200 / 2.000 ml).
  - Simulação de detecção por câmera: Notificação sugerida "Identificamos uma garrafa de água. Deseja confirmar o registro?".
  - Botão manual de incremento de consumo (+1 copo ou +250ml).
- **Indicador Postural e Ergonomia**:
  - Exibição gráfica do percentual de boa postura durante o expediente.
- **Pausas Ativas e Alongamentos Guiados**:
  - Botão para iniciar alongamento -> Expande a tela e orienta movimentos através de círculos visuais na tela.
- **Detecção de Pausas**:
  - Contabilização de saídas da estação de trabalho registradas pela câmera.

---

### 2.5. Aba Social

- **Seleção de Interesses (Primeiro Acesso)**:
  - Modal com grade de tags (Café, Leitura, Caminhada, Programação, Jogos de Tabuleiro, Cinema, etc.).
  - Gravação de perfil com aviso de que os interesses podem ser editados a qualquer momento.
- **Painel de Amigos e Conexões**:
  - Lista de colegas conectados com status de disponibilidade no escritório.
  - Campo de busca e botão "Adicionar Colega". Solicitações enviadas aguardam resposta (rejeições não emitem avisos).
- **Envio de Convites Reais**:
  - Botão "Convidar" ao lado de um colega.
  - Modal de escolha: "Pausa do Café", "Almoçar Juntos", "Conversar no Sol", "Caminhada de 10 min".
  - Notificação para o destinatário contendo ilustração vetorial com ambos os avatares.
- **Boilerplate de Validação Presencial**:
  - Marcador de presença conjunta validado por simulação de aproximação física.

---

### 2.6. Menu Hambúrguer, Avatar, Medalhas e Configurações

- **Indicador de Novidades (Badge Vermelha)**:
  - Ponto indicador vermelho no ícone do menu hambúrguer quando houver itens não lidos (nova medalha, nova notificação, convite pendente).
- **Opções Acessíveis no Menu**:
  1. **Caixa de Entrada**: Lista cronológica de notificações e histórico de convites recebidos com status de leitura.
  2. **Quadro de Medalhas Completo**: Mostruário com medalhas conquistadas (destacadas), medalhas em progresso (com barra percentual) e catalogo por raridade (Bronze, Prata, Ouro, Platina).
  3. **Personalização do Avatar**: Permite reabrir a tela de escolha de cores do avatar a qualquer momento.
   4. **Painel de Configurações**:
     - *Editar Interesses*: Reabrir a grade de seleção de tags para refazer o perfil de afinidade.
     - *Refazer Detecção Facial*: Permite reabrir a calibração com a webcam caso tenha sido pulada ou negada no onboarding.
     - *Bloqueio Facial por Biometria*: Toggle simulado para habilitar trava de interface quando o usuário se afastar da tela.
     - *Modo Férias / Afastamento*: Toggle de proteção da streak para congelar a sequência sem perder o histórico durante ausências ou folgas.

---

### 2.7. Visualização Expandida de Perfil (Próprio e de Colegas)

- **Acesso**: Ao clicar no card de qualquer colega nos Leaderboards ou na Lista Social, ou ao clicar no próprio perfil para expandir:
  - Modal com botão "X" de fechamento no canto superior.
  - Exibe avatar customizado, nome e departamento corporativo.
  - **Barra de Nível e XP com Desdobramento por Pilar**:
    - Barra de XP geral somando todas as atividades.
    - Desdobramento proporcional do progresso individual nas 3 categorias: XP de Jogos, XP de Saúde e XP Social.
    - Sistema equilibrado de cálculo de experiência (reconhecendo que interações sociais exigem maior esforço do que minijogos periódicos).
  - Contador de streak diário.
  - Mostruário com as medalhas escolhidas pelo colaborador para exibição pública.
  - **Privacidade Assegurada**: As metas diárias individuais nunca são exibidas a terceiros, evitando sensação de invasão e mantendo a experiência acolhedora.

---

### 2.8. Painel de Controles de Teste no Desktop (Godmode)

- **Localização**: Ícone discreto posicionado no canto superior do desktop fake simulado (acessível sem poluir a interface do drawer).
- **Ações Disponíveis para Avaliadores e Testers**:
  - *Liberar Próximo Minijogo*: Bypassa o contador de 3 horas e habilita o botão "Jogar Agora" imediatamente.
  - *Simular Notificação de Hidratação*: Dispara aviso de copo/garrafa detectada para testar o fluxo de confirmação.
  - *Simular Alerta Postural*: Aciona evento de postura incorreta para validação dos avisos de ergonomia.
  - *Injetar Experiência (+100 XP)*: Concede XP rápido para testar progressão de níveis e desbloqueio de medalhas.
  - *Avançar / Congelar Dias*: Simula passagem de dias para testar incremento ou proteção de streak no Modo Férias.
  - *Reset de Fábrica*: Restaura o `localStorage` para o estado de primeiro acesso (onboarding).
