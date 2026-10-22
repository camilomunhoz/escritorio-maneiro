# Manual de Boas Práticas de Desenvolvimento

Este manual estabelece as diretrizes arquiteturais, normas de código e padrões de engenharia de software obrigatórios para todos os desenvolvedores e agentes inteligentes que colaboram neste projeto.

---

## 1. O Princípio da Fonte Única da Verdade (Single Source of Truth - SSOT)

A máxima deste projeto é a **centralização estrita de estados, regras de negócio e definições de interface**. A duplicação de lógica ou de configurações é expressamente proibida.

### 1.1. Estado da Aplicação
- O estado global da aplicação (dados do usuário, lista de colegas, progresso em jogos, histórico de saúde, conquistas e notificações) deve residir em um único módulo centralizador de dados (`storageService` / `appState`).
- Nenhum componente isolado deve criar versões paralelas de dados ou persistências ad-hoc no `localStorage`.
- Toda mutação deve ocorrer por funções puras de atualização atômica que notificam os inscritos e gravam de forma consistente.

### 1.2. Modelagem e Tipagem de Dados
- Todos os tipos, interfaces e contratos de dados devem ser declarados no diretório `types/` e compartilhados em todo o projeto.
- Evite o uso de tipos genéricos `any`. Declare expressamente a estrutura de cada entidade (exemplo: `User`, `GameScore`, `HealthMetric`, `DailyGoal`, `Medal`).

---

## 2. Componentização Rigorosa e Reutilização

Componentes devem ser concebidos para alta reutilização, coesão e desacoplamento. Não crie blocos monolíticos gigantescos.

### 2.1. Hierarquia de Diretórios de Componentes
```
src/
├── components/
│   ├── ui/               # Componentes atômicos e genéricos de apresentação
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── AvatarSvg.tsx
│   │   ├── Toggle.tsx
│   │   └── Loader.tsx        # Indicador de carregamento suave com suporte a mensagens contextuais
│   │
│   ├── layout/           # Estruturas de envelope e containers de tela
│   │   ├── DesktopContainer.tsx  # Fundo fake do desktop corporativo em tela cheia com barra de tarefas
│   │   ├── DrawerHost.tsx        # Container do drawer ancorado com transições de tamanho animadas
│   │   ├── BottomNav.tsx         # Menu inferior com 5 botões (Home, Jogos, Saúde, Social, Hambúrguer)
│   │   ├── TopHeader.tsx         # Cabeçalho com perfil circular, barra de XP, nível e streak
│   │   └── GodmodePanel.tsx      # Painel discreto de controles de teste (fase extra) no desktop
│   │
│   └── modules/          # Componentes de domínio de cada pilar
│       ├── onboarding/   # Carrossel de explicações, aviso de privacidade, avatar e biometria
│       ├── home/         # 3 metas diárias individuais e meta compartilhada corporativa
│       ├── games/        # Contador regressivo de 3h, Cobrinha, Pong, Termo e Arcade animado
│       ├── health/       # Hidratação (copos vs ml), postura, alongamentos em círculos e pausas
│       ├── social/       # Interesses, recomendações, lista de amigos e convites com ilustração de avatares
│       ├── medals/       # Mostruário compacto e expandido de medalhas com raridades
│       └── settings/     # Troca de interesses, toggle de bloqueio facial e modo férias para streak
```

### 2.2. Regras para Componentes UI Atômicos (`components/ui/`)
1. **Desacoplamento de Domínio**: Componentes da pasta `ui/` não devem ter conhecimento de entidades de negócio como regras de pontos, conexões SSO ou regras de empresas. Devem receber dados via `props` primitivas.
2. **Variantes Predefinidas**: Botões e badges devem expor variantes claras (`variant="primary"`, `variant="ghost"`, `variant="subtle"`), proibindo estilização arbitrária no ponto de consumo.
3. **Padrão de Loaders**: O componente `Loader.tsx` deve prover um indicador sutil e calmo (sem giros frenéticos ou cores estridentes), com suporte a mensagens superiores e inferiores (usado no boot de 1s e na conexão SSO corporativa de 3s).
4. **Acessibilidade e Semântica**: Cada elemento interativo deve ter um identificador semântico legível, suporte a navegação por teclado e atributos `aria` pertinentes.

---

## 3. Diretrizes de Interface e Design System (Tailwind CSS)

### 3.1. Proibições Taxativas
- **Zero Emojis**: O uso de emojis no código, em textos de tela, em comentários ou no chat é rigorosamente proibido. Utilize iconografia vetorial SVG linear refinada.
- **Ausência de Cores Berrantes ou Saturadas**: Evite vermelhos, verdes e azuis primários e agressivos. Utilize exclusivamente a paleta desaturada e serena do projeto.
- **Copywriting Calmo e Acolhedor**: Textos e notificações devem primar por clareza e acolhimento, evitando pontos de exclamação exagerados, humor forçado ou tom de urgência corporativa.

### 3.2. Configuração de Tokens
- Todas as cores, sombras, bordas e transições devem estar registradas em `tailwind.config.js` sob a camada de temas:
  ```js
  // Exemplo de tokens calmos
  theme: {
    extend: {
      colors: {
        calm: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          500: '#6C757D',
          700: '#495057',
          900: '#212529',
        },
        sage: {
          100: '#EBF1ED',
          500: '#6F8A78',
        },
        slateSubtle: {
          500: '#5A6B7C',
        }
      }
    }
  }
  ```
- Não utilize estilizações embutidas no padrão `style={{ color: '#...' }}`. A centralização nos tokens do Tailwind é a garantia de fácil migração para novos design systems futuros.

---

## 4. Gerenciamento de Persistência e Dados Simulados (Mock Data)

- **Persistência**: O wrapper de `localStorage` deve conter tratamento seguro para exceções de cota e serialização/desserialização JSON:
  ```ts
  export function loadState<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }
  ```
- **População Inicial de Dados (Seed)**: A rotina geradora de colegas de trabalho deve produzir dados consistentes (nomes brasileiros compatíveis com o ambiente corporativo, cargos variados, interesses diversificados e avatares com cores harmoniosas).

---

## 5. Simulação de Desktop em Tela Cheia e Dimensões do Drawer

Para garantir a imersão total do testador, a aplicação deve rodar como um desktop corporativo simulado em **tela cheia (Full Screen)**.

### 5.1. O Container do Desktop Simulado (`DesktopContainer.tsx`)
- O container principal deve ocupar `100vw` e `100vh` sem transbordamento externo (`overflow-hidden`).
- Deve prover um botão acessível ou atalho para acionar a Fullscreen API do navegador (`document.documentElement.requestFullscreen()`).
- Contém uma barra de tarefas inferior simulada com relógio e ícone de bandeja (tray) no canto inferior direito.
- Clicar na área de trabalho ou no ícone da bandeja alterna a visibilidade do drawer.

### 5.2. Dimensões Rígidas do Drawer (`DrawerHost.tsx`)
O drawer fica posicionado de forma fixa ou absoluta no canto inferior direito, logo acima da barra de tarefas simulada, com três dimensões fixas:
1. **Modo Normal**: `w-[350px] h-[500px]`
2. **Modo Expandido**: `w-[750px] h-[500px]`
3. **Modo Compacto**: `w-[350px] h-[50px]`

- Nenhum componente filho deve ultrapassar os limites de largura ou altura definidos, exceto através de rolagem interna suave (`overflow-y-auto` com barras de rolagem finas e discretas).
- Animações de transição entre Normal e Expandido devem usar curvas de aceleração suaves (ex.: `transition-all duration-300 ease-in-out`), mantendo a ancoragem firme no canto inferior direito.

---

## 6. Procedimento de Trabalho para Agentes e Desenvolvedores

Antes de criar qualquer nova funcionalidade:
1. **Verificar a Existência de Componentes**: Consulte `components/ui/` para reaproveitar botões, caixas, modais e ícones existentes antes de conceber novas tags visuais.
2. **Planejar a Assinatura de Props**: Mantenha as interfaces limpas, coesas e documentadas.
3. **Validar Contra o Checklist de Regras**:
   - [ ] Não contém emojis em nenhuma parte.
   - [ ] Assegura que o estado foi sincronizado na fonte única de verdade.
   - [ ] As cores seguem a paleta neutra e tranquila.
   - [ ] Funciona perfeitamente nas dimensões de tela especificadas.
   - [ ] Código limpo e comentado de forma técnica e objetiva.

---

## 7. Diretrizes de Validação e Execução para Agentes

- **Proibição do Browser Integrado**: Não utilize o browser integrado / subagente de navegação para validações de interface durante o desenvolvimento.
- **Dispensa de Testes Unitários**: Não crie nem execute suítes de testes unitários ou scripts de teste sintéticos.
- **Validação Direta por Código e Contexto**: Confie na intuição técnica e na análise direta do código-fonte, garantindo tipagem TypeScript estrita sem erros de compilação (`tsc`), consistência arquitetural de componentes e aderência integral às diretrizes documentadas.
