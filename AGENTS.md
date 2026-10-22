# Diretrizes para Agentes de Desenvolvimento

1. Proibição de Validação com Navegador Integrado:
   Não utilize o browser integrado (browser_subagent ou ferramentas similares de automação de navegador) para validações de interface visual ou testes e2e.

2. Proibição de Testes Unitários:
   Não crie nem execute testes unitários ou suítes de teste sintéticas.

3. Confiabilidade e Intuição Técnica:
   Confie na intuição direta a partir do código, modelo mental dos requisitos, arquitetura de componentes e análise estática do compilador TypeScript.

4. Regra Absoluta contra Emojis:
   Nunca utilize emojis no código, interface, comentários, documentação ou mensagens.

5. Referência Obrigatória para Alongamentos e Visão Computacional:
   Antes de projetar, implementar ou alterar qualquer funcionalidade relacionada a alongamentos guiados, calibração postural e visão computacional (Fase 7), analise obrigatoriamente a PoC em [docs/alongamento-computer-viz](file:///c:/Users/usuario/Documents/projects/escritorio-divertido/docs/alongamento-computer-viz).
   O agente deve analisar o código existente nessa pasta primeiro (em especial js/app.js, js/poses.js, js/audio.js, js/smoothing.js e index.html), compreendendo:
   - A máquina de estados da calibração (enquadramento e postura neutra/T-Pose);
   - O cálculo anatômico de envergadura e a projeção estática dos alvos corporais;
   - O filtro de jitter (EMA) nos landmarks;
   - A detecção de colisão euclidiana e contagem de sustentação com feedback sonoro via Web Audio API;
   - A adaptação necessária da estética e do conceito para a identidade visual do projeto (dimensões do drawer, paleta suave, sem emojis, integração com o estado global da aplicação).
