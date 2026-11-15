# Assets e pendências

## Já presentes

- `public/assets/artifacts/opportunity-rover.glb` — modelo 3D oficial, 11,36 MB.
- `public/assets/maps/mars-texture-nasa.jpg` — textura global de Marte, 1440 × 720.
- `public/assets/maps/opportunity-traverse-nasa.jpg` — mapa real da rota final.
- `public/assets/images/opportunity-last-message.jpg` — último dado recebido.
- `public/assets/images/opportunity-selfie.jpg` — autorretrato real.
- `public/assets/images/opportunity-final-panorama.jpg` — panorama final.
- `public/assets/images/opportunity-hematite-berries.jpg` — evidência mineralógica.
- `public/assets/planets/*.jpg` — texturas de Terra, Lua, Júpiter, Saturno, Urano e Netuno, vindas do HyperMemoria/Solar System Scope. Mercúrio e Vênus usam essas mesmas texturas com tratamento visual bloqueado.
- `public/assets/space/milky-way-eso.jpg` — panorama da Via Láctea do ESO/S. Brunier.
- `public/favicon.svg` — identidade original do projeto.

## Placeholders e ausências deliberadas

- A história Apollo 11 não foi publicada. A Lua é uma representação procedural e o botão mostra “em breve”.
- Não há GLB oficial da Lua no bundle.
- Não há gravação de narração humana. O modo de áudio usa a voz sintetizada do navegador.
- Não há foto atual do Opportunity em 2026. Nenhum render é apresentado como foto atual.
- Não há reprodução da frase “my battery is low and it’s getting dark”, porque ela não foi enviada pelo rover.

## Melhorias pendentes

1. Otimizar `opportunity-rover.glb` com Draco/meshopt e gerar uma versão mobile, preservando o modelo atual como alta qualidade.
2. Migrar textura de Marte para uma fonte global moderna e documentar a projeção e a data.
3. Baixar e integrar o modelo lunar oficial do NASA SVS.
4. Publicar a segunda história: estágio de descida do Eagle / Apollo 11.
5. Ancorar hotspots aos nós nomeados do GLB em vez de coordenadas de tela.
6. Gravar narração em português com integrante da equipe, incluindo transcrição e consentimento.
7. Adicionar legendas fechadas em WebVTT se houver áudio gravado.
8. Fazer code splitting adicional das cenas Three.js para reduzir o bundle inicial.
9. Testar deploy em Safari/iPad e aparelhos Android de baixo desempenho.
10. Adicionar teste visual de regressão ao pipeline CI.

## Configuração de hospedagem

Servir `.glb` com `model/gltf-binary` ou `application/octet-stream`; servir `.jpg` com cache longo e `.html` com `no-cache`. O app é uma SPA estática e não exige backend, conta ou coleta de dados.

