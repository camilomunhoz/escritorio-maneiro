# Diretrizes de Validação e Execução para Agentes

1. Não utilize o browser integrado / subagente de navegação para validações de interface durante o desenvolvimento.
2. Não realize testes unitários nem gaste esforço em suítes de teste sintéticas.
3. Confie na intuição técnica direta do código-fonte, contexto dos requisitos, tipagem estrita do TypeScript e compilação limpa.
4. Antes de implementar ou alterar qualquer recurso de visão computacional, calibração ou alongamentos guiados (Fase 7), analise obrigatoriamente a PoC de referência em docs/alongamento-computer-viz/ (estrutura em js/app.js, js/poses.js, js/audio.js, js/smoothing.js e index.html), adaptando a dinâmica matemática, cálculos anatômicos e feedback sonoro para a estética suave e regras do projeto.
