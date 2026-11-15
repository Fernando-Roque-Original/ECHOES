# After the Signal — filme de pitch

Filme promocional em Remotion para uma apresentação de três minutos. O projeto
não é um deck: cada ideia é encenada com câmera, luz, arquivo, tipografia,
motion design e movimento contínuo.

## Master atual

- Arquivo: `out/after-the-signal.mp4`.
- H.264, 1920 × 1080, 30 fps, 180 segundos, AAC estéreo a 48 kHz.
- Cinco movimentos narrativos e 19 cenas tipadas.
- Narração em português do Brasil e trilha já integradas ao vídeo.
- Fechamento com a frase, o produto e a assinatura da equipe **ECHOES**.
- Legendas com cobertura de 0 a 5400 frames e exportação SRT.

O master de referência foi renderizado e validado com `ffprobe`, revisão de
frames e os testes automatizados da timeline. Antes de publicação comercial,
confirmar a licença do Remotion e o direito de uso da voz sintética escolhida.

## Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Espaço e memória suficientes para renderizar 5400 frames em 1080p.
- Chromium usado pelo Remotion para renderização.
- Confirmação da licença do Remotion para a equipe e para a forma de publicação.

As dependências do filme ficam somente em `video/package.json` e
`video/package-lock.json`.

## Preparação

Os assets oficiais e as fontes não são duplicados no Git. O script copia apenas
os arquivos necessários de `public/` e `node_modules/` para `video/public/`.

```powershell
cd "C:\Users\ferna\Desktop\03 - Projetos e Código\Hackthoon\video"
npm install
npm run prepare-assets
npm run export:srt
```

## Comandos

```powershell
npm run dev
npm run typecheck
npm test
npm run still
npm run render
```

- `dev`: abre o Remotion Studio.
- `typecheck`: valida TypeScript sem gerar arquivos.
- `test`: verifica duração, movimentos, cenas e legenda.
- `still`: gera um frame de controle em `out/poster.png`.
- `render`: gera o master `out/after-the-signal.mp4`.
- `prepare-assets`: copia imagens e fontes necessárias para `public/`.
- `export:srt`: gera `captions/after-the-signal.srt` a partir de
  `src/data/captions.ts`.

## Estrutura

- `src/timeline.ts`: fonte única de movimentos, cenas, frames e timecodes.
- `src/PitchFilm.tsx`: composição das cenas e trilhas de legenda/animatic.
- `src/scenes/`: encenação dos cinco movimentos.
- `src/data/facts.ts`: fatos canônicos do Opportunity.
- `src/data/assets.ts`: caminhos e créditos dos assets.
- `src/data/captions.ts`: locução textual, busca por frame e estrutura SRT.
- `SCRIPT.md`: roteiro de direção com locução, tela, assets e créditos.
- `scripts/prepare-public-assets.mjs`: preparação local sem dependências.
- `scripts/export-captions.mjs`: exportação SRT sem dependências.

## Direção e limites editoriais

- A criança e a escola são **situação ilustrativa**, nunca documentário ou
  depoimento.
- A personagem é ativa e curiosa; não há enquadramento de pena, pobreza ou
  ausência de futuro.
- O filme não inventa fala, despedida, solidão ou voz para o Opportunity.
- O último dado é sempre descrito como imagem incompleta e ruidosa.
- A descoberta é “evidências de ambientes antigos com água”, nunca água líquida
  no presente.
- Imagens da NASA mantêm proveniência e não sugerem endosso da agência.

## Áudio do master

- Locução: `pt-BR-ThalitaMultilingualNeural`, em português do Brasil.
- Cache de geração: `.cache/narration/`.
- Faixas integradas: `public/audio/narration.wav`,
  `public/audio/music-bed.wav` e `public/audio/mix.wav`.
- Mix de referência: aproximadamente -16,19 LUFS e -2,24 dBTP.

O áudio original da reunião é referência de direção e não entra no filme.

## Antes de publicar

- Confirmar a licença do Remotion para o formato de publicação previsto.
- Confirmar o direito de uso da voz sintética e da trilha.
- Revisar o master em reprodução real, incluindo legendas e área segura.
- Manter os créditos NASA/JPL e a nota de que a agência não endossa o projeto.

## Créditos

NASA/JPL-Caltech e instituições parceiras para Opportunity, panorama, mapa,
autorretrato, último dado e esferas de hematita. Texturas planetárias de Solar
System Scope, CC BY 4.0. Via Láctea de ESO/S. Brunier, CC BY 4.0. A proveniência
completa permanece em `../SOURCES.md` e em `SCRIPT.md`.
