# Design — The Long Light

## Direção

After the Signal não simula um centro de controle. É um museu noturno de história natural, com vitrines acesas, placas de acervo e uma linha de luz que registra o caminho de uma missão.

O Opportunity é tratado como um objeto de museu: pequeno diante de Marte, mas iluminado como o centro da sala. A metáfora é fotografia de longa exposição — o sinal termina, o rastro de conhecimento continua.

Frase de direção: **“O sinal termina. A luz continua.”**

## Tokens principais

| Token | Cor | Uso |
|---|---|---|
| Dusk Over Endeavour | `#101B28` | Fundo principal |
| Basalt Plinth | `#29313A` | Superfícies e vitrine |
| Oxide Lantern | `#D56F45` | Marte, ação primária, luz quente |
| Regolith Sand | `#E7CDAA` | Texto principal e placas |
| Signal Gold | `#F2C26B` | Fio do sinal, progresso e foco luminoso |
| Quiet Sage | `#9AC2B2` | Evidência verificada |

O foco acessível usa anel duplo claro/escuro, não depende do ouro sobre laranja.

## Tipografia

- **Bricolage Grotesque Variable** — títulos, números e placas. Personalidade de engenharia humana, sem estética corporativa.
- **Atkinson Hyperlegible** — corpo, controles, legendas e créditos. Escolhida por legibilidade funcional e formas distintas.

## Layout

Desktop: composição horizontal cinematográfica, com um campo atmosférico, um objeto e uma placa. O texto fica ancorado à esquerda ou em uma placa sólida; não há grades de cards idênticos.

Mobile: o objeto ocupa a metade superior, a narrativa vira uma base de expositor vertical e os controles permanecem com pelo menos 44 px.

## Assinatura

O **Fio do Sinal** aparece como progresso no topo, como rastro no mapa e como linha de encerramento no legado. A cor nunca é a única informação: cada estado tem texto ou ícone.

## Movimento

- Abertura: entrada única e orquestrada.
- Planetas: rotação lenta; nenhuma órbita de interface.
- Aproximação: 1,35 s no modo demo e 1,9 s no modo normal, com botão para pular.
- Capítulos: crossfade curto e mudança de conteúdo, sem bloquear entrada.
- Reduced motion: sem rotação, zoom ou pulso; a passagem é um crossfade de aproximadamente 150–420 ms.

## Desmonte e corte

- O objeto central vem primeiro. A separação é uma ação opcional, nunca um autoplay que esconde o Opportunity antes de a criança entender o que está vendo.
- O controle de separação oferece leitura contínua e botões diretos: **Montar**, **Abrir tudo** e **Tour guiado**.
- A seleção pode acontecer pelas superfícies do modelo ou por uma lista de camadas com nomes e estado `aria-pressed`.
- A câmera aproxima o grupo selecionado, mas mantém contexto suficiente para comparar a camada com o rover inteiro.
- O destaque usa luz neutra e redução de opacidade das demais superfícies. A cor da camada aparece na interface, não como uma tinta que apaga a textura oficial.
- O esquema 2D permite explicar o que o GLB não contém: um corte ilustrativo do corpo, com nota explícita de que posição e aparência internas não representam engenharia real.
- O tour só começa por ação do usuário, pausa ao selecionar uma camada e fica indisponível com movimento reduzido.

**Regra de honestidade:** o arquivo da NASA é uma malha única com nove grupos de material. As seis camadas do desmonte são agrupamentos didáticos; não são peças removíveis, tolerâncias, fiação ou um manual de desmontagem.

## Acessibilidade

- Texto essencial não depende de áudio.
- Narração só começa depois de o usuário ligar o som.
- Hotspots têm lista de botões equivalente.
- A história e o quiz funcionam sem WebGL.
- Navegação por Tab, Enter/Espaço e Escape.
- Contraste alto, fontes ampliáveis, foco visível, skip link e alternativas de imagem.
- Proveniência visível em cada material importante.

