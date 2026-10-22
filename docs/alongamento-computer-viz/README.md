# AlongAI - PoC Guia de Alongamento com Visão Computacional

Aplicação Web client-side (SPA) interativa para guiar e validar exercícios de alongamento físico em tempo real utilizando a webcam do usuário, detecção de pose corporal via **MediaPipe Pose Landmarker** e gamificação baseada em alvos dinâmicos.

---

## 🎯 Funcionalidades Implementadas

1. **Fase 2: Calibração Anatômica Inicial (T-Pose):**
   - Fluxo estruturado em máquina de estados:
     `[ Início ] ──> [ Passo 1: Enquadramento ] ──> [ Passo 2: T-Pose (2s) ] ──> [ Trava Alvos ] ──> [ Jogo ]`
   - **Passo 1: Verificação de Enquadramento:** Valida se ombros (11, 12) e quadris (23, 24) possuem visibilidade $> 0.85$ e estão dentro da área segura sem corte nas bordas.
   - **Passo 2: Amostragem em Postura Neutra / T-Pose (2s ~ 60 frames):**
     Calcula o comprimento anatômico real dos braços por soma de segmentos:
     $$\text{Comprimento Braço Esq.} = \Vert\mathbf{p}_{11} - \mathbf{p}_{13}\Vert + \Vert\mathbf{p}_{13} - \mathbf{p}_{15}\Vert$$
     $$\text{Comprimento Braço Dir.} = \Vert\mathbf{p}_{12} - \mathbf{p}_{14}\Vert + \Vert\mathbf{p}_{14} - \mathbf{p}_{16}\Vert$$
     Calcula envergadura métrica em tempo real via `worldLandmarks` (ex: 68 cm por braço, 1.72 m de envergadura).
   - **Passo 3: Projeção Fixa dos Alvos (Trava Alvos):**
     $$\text{Distância Alvo} = \text{Comprimento do Braço} \times \text{Fator de Dificuldade}$$
     *(onde Fator de Dificuldade é ajustável entre 0.85 e 1.15, padrão 0.95)*.
   - **Alvos Estáticos no Canvas:** As coordenadas tornam-se fixas e estáticas para a série, eliminando o efeito de "alvo móvel" e forçando a extensão corporal real.
   - Botão de **Recalibrar** acessível no HUD e nas configurações a qualquer momento.

2. **Visão Computacional 100% Client-Side:**
   - Integração com `@mediapipe/tasks-vision` via WebAssembly (WASM).
   - Aceleração por **GPU** com fallback transparente para CPU.
   - Modelo: `pose_landmarker_lite.task` em modo de execução `VIDEO`.
   - Câmera espelhada (`scaleX(-1)`) no Canvas para experiência natural estilo espelho.

3. **Mapeamento de Landmarks (MediaPipe):**
   - Ponto 11: Ombro Esquerdo (`LEFT_SHOULDER`)
   - Ponto 12: Ombro Direito (`RIGHT_SHOULDER`)
   - Ponto 13 / 14: Cotovelo Esquerdo / Direito (renderização de esqueleto)
   - Ponto 15: Punho Esquerdo (`LEFT_WRIST`)
   - Ponto 16: Punho Direito (`RIGHT_WRIST`)

4. **Filtro de Ruído e Jitter (EMA):**
   - Filtro de Média Móvel Exponencial aplicado aos punhos e ombros:
     $$y_t = \alpha \cdot x_t + (1 - \alpha) \cdot y_{t-1}$$
   - Proteção contra perda súbita de rastreamento / teletransporte com snap imediato.

5. **Gamificação e Loop de Feedback:**
   - Detecção de colisão euclidiana simultânea entre punhos e alvos:
     $$D = \sqrt{(x_{punho} - x_{alvo})^2 + (y_{punho} - y_{alvo})^2} \le R_{alvo}$$
   - Animação de progresso de sustentação no HUD e arcos radiais iluminados sobre os alvos.
   - Pontuação acumulada (+100 pts por repetição concluída).
   - Feedback sonoro sintetizado em tempo real via **Web Audio API** (sem dependência de arquivos externos):
     - Beep de entrada no alvo.
     - Ticks periódicos de sustentação.
     - Fanfarra musical triunfante na conclusão da série.
   - Feedback visual "Excelente! 🎯" em splash animado.

6. **Biblioteca de Posturas e Treino:**
   - **Alongamento Diagonal Superior (Y):** $\alpha = 1.8, \beta = 0.55$
   - **Abertura Lateral em T:** $\alpha = 2.15, \beta = 0.08$
   - **Elevação Vertical Alta (V):** $\alpha = 0.90, \beta = 1.15$
   - **Treino Automático Dinâmico:** Alterna automaticamente entre as posturas após cada acerto.

7. **Tratamento Robusto de Câmera e Fallback:**
   - Mensagens claras na UI para permissão negada (`NotAllowedError`), ausência de câmera (`NotFoundError`) e câmera ocupada (`NotReadableError`).
   - **Modo Simulação Virtual:** Permite testar todo o pipeline de alvos dinâmicos, colisão e pontuação sem precisar de uma webcam conectada.

---

## 🚀 Como Executar

Por ser uma aplicação baseada em ES Modules e Web Workers/WASM, deve ser servida através de um servidor HTTP local:

### Opção 1: Python
```bash
python -m http.server 8080
```
Acesse em seu navegador: `http://localhost:8080`

### Opção 2: Node.js (npx serve ou http-server)
```bash
npx serve .
```

---

## 📁 Estrutura de Arquivos

```
computer-viz/
├── index.html        # Estrutura HTML5 com HUD e controles responsivos
├── css/
│   └── style.css     # Estilização moderna em tema escuro com glassmorphism
├── js/
│   ├── app.js        # Inicialização do MediaPipe, loop de renderização e gamificação
│   ├── audio.js      # Gerador de efeitos sonoros via Web Audio API
│   ├── smoothing.js  # Filtro EMA para redução de ruído nos landmarks
│   └── poses.js      # Parâmetros e presets matemáticos das posturas
└── README.md         # Documentação técnica do projeto
```
