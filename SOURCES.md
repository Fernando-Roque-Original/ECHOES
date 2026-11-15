# Fontes e proveniência

Consulta de assets e fatos: 13–14 de novembro de 2026. Todos os arquivos abaixo foram baixados de hosts oficiais da NASA e são servidos localmente pelo app.

## Fatos históricos

| Fato usado no app | Valor |
|---|---|
| Pouso em Meridiani Planum | 25/01/2004 UTC; noite de 24/01/2004 no horário do Pacífico |
| Duração planejada | Aproximadamente 90 sols marcianos, cerca de 92 dias terrestres |
| Operação | Mais de 14 anos |
| Distância percorrida | 45,16 km |
| Último contato recebido | 10/06/2018, sol 5111 |
| Anúncio do fim da missão | 13/02/2019 |
| Descoberta central | Minerais e rochas associados a ambientes antigos com água |

Fontes primárias:

- NASA Science — Opportunity: <https://science.nasa.gov/mission/mer-opportunity/>
- NASA/JPL — fim da missão: <https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end/>
- NASA Science — último dado recebido: <https://science.nasa.gov/resource/opportunitys-last-message/>
- NASA Science — imagens finais: <https://science.nasa.gov/resource/opportunity-rovers-final-mars-images/>
- NASA Science — sol marciano: <https://www.nasa.gov/missions/mer/nasa-celebrates-decade-of-mars-exploration-by-spirit-opportunity/>

## Assets baixados e usados

### Modelo 3D do rover

- Página: <https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/>
- Arquivo direto: <https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/gltf_files/24883_MER_static.glb>
- Local: `public/assets/artifacts/opportunity-rover.glb`
- Formato: GLB, aproximadamente 11,36 MB, 12 texturas embutidas
- Crédito: NASA/JPL-Caltech

### Textura 3D de Marte

- Fonte: NASA Mars Trek, camada Viking VIS Global Color Mosaic (`Mars_Viking_MDIM21_ClrMosaic_global_232m`)
- Portal: <https://trek.nasa.gov/mars/>
- Metadados da camada: <https://trek.nasa.gov/mars/TrekWS/rest/cat/metadata/fgdc/html?label=Mars_Viking_MDIM21_ClrMosaic_global_232m>
- Base WMTS: <https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm>
- Mosaico de origem reunido no nível de zoom 3 (16 × 8 tiles de 256 px; 4096 × 2048 px).
- Mapa de cor local: `public/assets/maps/mars-viking-mdim-color-2k.jpg`, JPEG 2048 × 1024, 717 KB. Reamostrado do mosaico da NASA para uso em tempo real no globo.
- Mapas de relevo locais: `public/assets/maps/mars-viking-mdim-normal-1k.jpg` e `public/assets/maps/mars-viking-mdim-roughness-1k.jpg`, ambos JPEG 1024 × 512 (396 KB e 8 KB).
- Derivação: os mapas normal e de rugosidade foram gerados localmente a partir da luminância e das variações de albedo do mosaico para resposta visual de poeira e relevo. Não são produtos científicos independentes nem um DEM.
- Crédito: NASA/JPL/USGS — Viking MDIM 2.1.
- A textura legada `public/assets/maps/mars-texture-nasa.jpg` (NASA 3D Resources, 1440 × 720) foi mantida como referência, mas não é mais carregada pelo componente.

### Mapa da rota final

- Página: <https://science.nasa.gov/photojournal/opportunitys-final-traverse-map/>
- Arquivo direto: <https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia23/pia23178/PIA23178.jpg>
- Local: `public/assets/maps/opportunity-traverse-nasa.jpg`
- ID: PIA23178
- Crédito: NASA/JPL-Caltech/University of Arizona

### Último dado recebido

- Página: <https://science.nasa.gov/resource/opportunitys-last-message/>
- Arquivo direto: <https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/2/22339_PIA22929-web.jpg>
- Local: `public/assets/images/opportunity-last-message.jpg`
- ID: PIA22929
- Crédito: NASA/JPL-Caltech
- Uso: evidência do último dado transmitido, em 10/06/2018. Não é tratado como mensagem escrita nem como foto atual do rover.

### Autorretrato do Opportunity

- Página: <https://science.nasa.gov/resource/self-portrait-by-opportunity-mars-rover-in-january-2014/>
- Arquivo direto: <https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/5917_pia17759_JC2_2000-full2.jpg>
- Local: `public/assets/images/opportunity-selfie.jpg`
- ID: PIA17759
- Crédito: NASA/JPL-Caltech/Cornell/ASU
- Data das imagens: 03–06/01/2014 (PIA17759)

### Panorama final

- Página: <https://science.nasa.gov/resource/opportunity-rovers-final-mars-images/>
- Arquivo direto: <https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/p/i/a/PIA-22908-LegacyPan-ANNOTATED-NASA-1.jpg>
- Local: `public/assets/images/opportunity-final-panorama.jpg`
- ID: PIA-22908
- Crédito: NASA/JPL-Caltech/Cornell/ASU

### Esferas de hematita

- Página: <https://science.nasa.gov/resource/berries-on-the-ground/>
- Arquivo direto: <https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/5839_Sol13B_MI_Pancam_Berries-PIA05273-full2.jpg>
- Local: `public/assets/images/opportunity-hematite-berries.jpg`
- ID: PIA05273
- Crédito: NASA/JPL-Caltech/Cornell/USGS

## Referências de contexto

- Mars Trek: <https://trek.nasa.gov/mars/>
- Modelo oficial de Marte, referência não embarcada: <https://science.nasa.gov/resource/planet-mars-3d-model/>
- Próxima história planejada, Apollo 11: <https://science.nasa.gov/resource/apollo-11-landing-site/>
- NSSDCA, catálogo público de missões da NASA: <https://nssdc.gsfc.nasa.gov/>

## Desafio e referências de interação

- NASA Space Apps 2026 — Abandoned but not Forgotten: <https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/>
- ANTI/HYPE — verbete sobre a skill teardown: <https://antihype.com.br/skills/teardown/>
- Nyxera0x — repositório cutaway: <https://github.com/Nyxera0x/cutaway>

Os dois últimos links foram consultados como referência de linguagem de interação: objeto central, separação progressiva, foco por peça, câmera própria e retorno ao estado montado. O projeto não copiou código, assets, modelos, textos ou configurações desses repositórios. A implementação do Opportunity usa exclusivamente o GLB e as fontes oficiais da NASA listadas acima.

## Sistema Solar e céu

Arquivos copiados do projeto local HyperMemoria e usados com atribuição:

| Arquivo local | Origem | Licença |
|---|---|---|
| `public/assets/planets/moon-solarsystemscope.jpg` | Solar System Scope | CC BY 4.0 |
| `public/assets/planets/earth-solarsystemscope.jpg` | Solar System Scope | CC BY 4.0 |
| `public/assets/planets/jupiter-solarsystemscope.jpg` | Solar System Scope | CC BY 4.0 |
| `public/assets/planets/saturn-solarsystemscope.jpg` | Solar System Scope | CC BY 4.0 |
| `public/assets/planets/uranus-solarsystemscope.jpg` | Solar System Scope | CC BY 4.0 |
| `public/assets/planets/neptune-solarsystemscope.jpg` | Solar System Scope | CC BY 4.0 |
| `public/assets/space/milky-way-eso-4096.jpg` | ESO/S. Brunier, panorama da Via Láctea | CC BY 4.0 |

- Texturas planetárias: <https://www.solarsystemscope.com/textures/>
- ESO panorama: <https://www.eso.org/public/images/eso0932a/>
- Licença CC BY 4.0: <https://creativecommons.org/licenses/by/4.0/>

## Diretrizes de uso

- NASA Images and Media Usage: <https://www.nasa.gov/nasa-brand-center/images-and-media/>
- NASA 3D Resources: <https://science.nasa.gov/3d-resources/>

O projeto atribui a NASA como fonte em cada material importante. O logotipo e a insígnia da NASA não são usados como identidade do projeto.

