# After the Signal

**O sinal termina. A luz continua.**

Museu espacial interativo para crianças de 8 a 13 anos sobre o rover **Opportunity**, uma máquina real que ultrapassou em muito o tempo planejado em Marte. A experiência combina planetas em 3D, aproximação cinematográfica, um mapa cartográfico real, um modelo 3D oficial do rover, hotspots, quatro capítulos narrados visualmente, evidência histórica, pergunta de compreensão e uma tela final de legado.

## Executar

Requisitos: Node.js 20+ e npm. O projeto foi validado com Node 24 e npm 11.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite. Para gerar e servir a versão estática:

```bash
npm run build
npm run preview
```

## Verificações

```bash
npm test
npm run build
```

O teste de jornada usa o fallback sem WebGL. Para a inspeção visual automatizada em Chrome:

```bash
# terminal 1
npm run dev

# terminal 2
npm run qa
```

O script `scripts/qa.mjs` usa o Chrome instalado em `C:\Program Files\Google\Chrome\Application\chrome.exe`, percorre a história inteira, captura desktop/mobile/reduced motion e registra erros de página e requests com falha em `.qa/`.

## Rotas de demonstração

- `/?demo=1`: ativa o cronômetro de 90 segundos e pré-carrega os assets da história. O áudio continua desligado.
- `/?scene=approach`
- `/?scene=map`
- `/?scene=artifact`
- `/?scene=story`
- `/?scene=evidence`
- `/?scene=legacy`

Os parâmetros `scene` são atalhos para QA e ensaio. O fluxo normal é sempre `home → approach → map → artifact → story → evidence → legacy`.

## O que está implementado

- Máquina de estados determinística com Zustand e retorno válido em todas as telas.
- Home com um Sistema Solar 3D: Marte e a Lua liberados, sete mundos em silêncio e identificados por “?” sem conteúdo inventado.
- Fundo espacial com panorama da Via Láctea do ESO/S. Brunier.
- Aproximação de câmera com corte cinematográfico, `Pular aproximação`, fallback para 2D e redução de movimento.
- Mapa real da rota final do Opportunity, crédito NASA, marcador acessível e cartão da missão.
- Modelo GLB oficial de Spirit/Opportunity carregado sob demanda, com fallback por foto real.
- Desmonte 3D educacional do GLB oficial: separação por camadas, clique nas superfícies, foco de câmera e tour guiado.
- Esquema 2D ilustrativo com peças, filtros por sistema e corte didático do corpo; o desenho não é tratado como engenharia oficial.
- Três hotspots com texto simples e links para fontes: rodas, painéis solares e câmeras.
- Quatro capítulos navegáveis, transcrição sempre presente, narração opcional por voz do navegador e controles de pausa.
- Último registro real identificado como dado recebido, não como mensagem escrita ou “últimas palavras”.
- Pergunta de compreensão com feedback, explicação e nova tentativa.
- Tela de legado com dados-chave da missão e caminho para a próxima história.
- Painel “O que é real aqui?” com classificação e links de proveniência.
- Estados honestos para a Lua/Apollo 11: nova história em breve.
- Acessibilidade: navegação por teclado, foco visível, alvos mínimos de 44 px, texto ampliável, legendas, movimento reduzido, skip link e alternativas textuais aos objetos 3D.
- Layout responsivo validado em 390 × 844, 1366 × 768 e 1440 × 1000.

## Assets reais integrados

| Uso no app | Arquivo local | Origem |
|---|---|---|
| Modelo do Opportunity | `public/assets/artifacts/opportunity-rover.glb` | NASA/JPL-Caltech, Spirit and Opportunity 3D Model |
| Textura de Marte na esfera 3D | `public/assets/maps/mars-texture-nasa.jpg` | NASA/JPL-Caltech, NASA 3D Resources |
| Mapa da rota final | `public/assets/maps/opportunity-traverse-nasa.jpg` | NASA/JPL-Caltech/University of Arizona, PIA23178 |
| Último dado recebido | `public/assets/images/opportunity-last-message.jpg` | NASA/JPL-Caltech, PIA22929 |
| Autorretrato do Opportunity | `public/assets/images/opportunity-selfie.jpg` | NASA/JPL-Caltech/Cornell/ASU, PIA17759 |
| Panorama final | `public/assets/images/opportunity-final-panorama.jpg` | NASA/JPL-Caltech/Cornell/ASU, PIA-22908 |
| Esferas de hematita | `public/assets/images/opportunity-hematite-berries.jpg` | NASA/JPL-Caltech/Cornell/USGS, PIA05273 |
| Textura da Lua e planetas bloqueados | `public/assets/planets/*.jpg` | Solar System Scope, CC BY 4.0, via HyperMemoria |
| Panorama da Via Láctea | `public/assets/space/milky-way-eso-4096.jpg` | ESO/S. Brunier, CC BY 4.0 |

O modelo do rover é o GLB oficial de alta resolução, com texturas embutidas e aproximadamente 11,36 MB. Ele é baixado apenas na tela do artefato. As texturas da Lua e dos planetas bloqueados vêm do acervo licenciado do HyperMemoria, com atribuição visível em “O que é real aqui?”.

O projeto não usa uma gravação de voz da NASA. A opção “Ouvir este capítulo” usa `SpeechSynthesis` do navegador, em português, e é sempre acompanhada pelo texto. Nenhum áudio começa sem ação do usuário.

Consulte [SOURCES.md](SOURCES.md), [ASSETS_TODO.md](ASSETS_TODO.md) e [docs/DESIGN.md](docs/DESIGN.md).

## Limitações conhecidas

- A história da Lua/Apollo 11 não foi publicada. O botão abre um estado “em breve”, sem tela quebrada.
- Os hotspots são sobreposições alinhadas visualmente ao modelo; ainda não estão ancorados a nós nomeados do GLB.
- O GLB oficial é uma malha única organizada por nove materiais. O desmonte os agrupa em seis camadas visuais; não existem, no arquivo, peças internas separáveis nem uma sequência real de montagem.
- A Lua não usa um GLB oficial. Marte usa textura oficial em uma esfera 3D, não o GLB de Marte.
- Não existem arquivos de narração locais; a voz depende da disponibilidade de `SpeechSynthesis` no navegador.
- O bundle principal inclui Three.js e supera 500 kB antes de gzip. O build passa, mas code splitting adicional das cenas 3D é uma otimização futura.
- O modo demo pré-carrega o rover para o pitch; em conexões lentas, a tela do artefato ainda pode mostrar o estado positivo de carregamento.
- O arquivo GLB exige que a hospedagem estática sirva `.glb` como `model/gltf-binary` ou `application/octet-stream`.

## Elegibilidade do Space Apps

O briefing condiciona a elegibilidade ao início oficial do hackathon. A sessão de implementação começou em **13 de novembro de 2026** no fuso do ambiente; a verificação final, o build e o QA foram executados em **14 de novembro de 2026**, quando o relógio local já indicava a data de início citada no briefing. A equipe deve confirmar com os organizadores como o histórico de desenvolvimento e os timestamps de submissão serão avaliados, e preservar apenas o material permitido pelas regras do evento.

After the Signal é um projeto independente de hackathon. Não é um produto oficial da NASA e não implica endosso da agência.

