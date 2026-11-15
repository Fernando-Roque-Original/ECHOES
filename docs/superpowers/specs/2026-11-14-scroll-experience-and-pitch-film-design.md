# After the Signal — Experiência Scroll e Filme de Pitch

**Data:** 2026-11-14  
**Status:** aprovado em 14/11/2026; implementação em andamento

## 1. Intenção

O After the Signal deve deixar de parecer uma sequência de telas e passar a
funcionar como uma única experiência cinematográfica. O sistema solar é a porta
de entrada, Marte e a Lua são os dois mundos visitáveis, e o scroll conduz a
câmera da órbita até o interior de cada história.

A mesma linguagem visual e narrativa deve sustentar um filme de pitch de três
minutos, em português, sem slides. O filme apresenta a transformação que o
produto propõe: uma criança crescida longe dos grandes centros passa de
observadora de notícias sobre a NASA a alguém capaz de explorar, entender e
questionar um arquivo científico real.

O Opportunity é a primeira história porque materializa a tese do projeto:
uma missão planejada para 90 dias continuou enviando dados por mais de 14 anos.
O sinal terminou; o conhecimento e a curiosidade continuaram.

## 2. Público e posicionamento

**Público principal:** crianças e jovens de escolas públicas, especialmente entre
8 e 14 anos, seus professores e famílias.

**Faixa de projeto:** a experiência será escrita para leitura confortável por
volta de 10 a 11 anos, dentro do público de 9 a 13 anos. Professores e famílias
podem mediar, mas a criança deve conseguir avançar sozinha.

**Público secundário:** adolescentes e adultos interessados em astronomia, além
de escolas, bibliotecas, museus e redes municipais que possam usar a experiência
como material de apoio.

**Personagem do filme:** uma criança e uma escola pública do interior são
representativas, não documentais. A criança não é uma pessoa real, não representa
uma escola específica e não sustenta alegações factuais. O filme deve identificar
a situação como ilustrativa em algum momento discreto, evitar depoimentos e não
usar a personagem para sugerir pobreza, abandono ou ausência de futuro. A
intenção é representar potencial e acesso, não comprovar um caso individual.

**Posicionamento:**

> O After the Signal transforma o arquivo científico da NASA em uma experiência
> interativa que faz crianças de escolas públicas explorarem histórias reais do
> espaço.

**Assinatura:**

> Arquivos reais. Curiosidade de criança. Histórias que não terminam.

**Frase de encerramento:**

> O sinal termina. A luz continua.

## 3. Tese narrativa

1. Toda criança já olhou para o céu, mas nem toda criança encontra uma porta para
   entrar nele.
2. A NASA produziu histórias extraordinárias, mas grande parte desse conhecimento
   está dispersa em documentos, imagens e arquivos técnicos.
3. O After the Signal transforma esse arquivo em uma experiência que uma criança
   consegue usar sozinha.
4. O Opportunity é a prova: uma máquina planejada para 90 dias continuou por mais
   de 14 anos e encontrou evidências de ambientes antigos com água em Marte.
5. Quando a criança explora, pergunta e entende, ela deixa de apenas admirar a
   ciência e começa a se imaginar fazendo ciência.

## 4. Objetivos

- Fazer o sistema solar dominar a primeira impressão e ser imediatamente
  reconhecido como uma experiência interativa, não como uma landing page.
- Reduzir a competição visual: remover textos pequenos, legendas decorativas e
  controles que não participam da história principal.
- Criar uma navegação contínua por scroll, sem trocar de página entre órbita,
  planeta, mapa, rover, evidência e legado.
- Permitir seleção clara de Marte e da Lua, com foco, aproximação e retorno.
- Contar a história do Opportunity em uma sequência visual compreensível para
  crianças, mantendo precisão histórica e proveniência.
- Criar uma jornada compacta da Lua para que a seleção não termine em promessa.
- Produzir um filme de três minutos, em português, que apresente problema,
  solução, demonstração, transformação e impacto sem slides.
- Preservar acessibilidade, reduzir movimento, fallback sem WebGL e navegação por
  teclado.

## 5. Não objetivos

- Não criar conteúdo completo para todos os planetas. Os demais mundos continuam
  visíveis e em silêncio.
- Não transformar o site em um portal escolar genérico, uma plataforma com login,
  painel de professor ou sistema de turmas.
- Não usar gamificação por pontos, medalhas ou competição.
- Não criar uma sequência de cards ou slides com animações entre eles.
- Não sequestrar o scroll, esconder a barra de rolagem ou impedir saída.
- Não inventar falas, imagens, depoimentos, sentimentos ou “últimas palavras” do
  Opportunity.
- Não apresentar os grupos didáticos do desmonte como peças internas oficiais.
- Não usar IA para gerar imagens que possam ser confundidas com registros reais
  da NASA.
- Não abrir o pitch com rivalidade entre NASA, China ou outra organização.
- Não retratar a criança ou a escola por pena, pobreza ou ausência de futuro.

## 6. Princípios de experiência

1. **Um objeto domina cada viewport.** Planeta, rover, mapa ou imagem ocupam a
   cena antes do texto.
2. **Uma ideia por momento.** Apenas uma frase ou um número grande compete com o
   objeto principal.
3. **Movimento é navegação.** Zoom, aproximação e paralaxe mudam o estado da
   história; não são decoração.
4. **Continuidade física.** O planeta escolhido se transforma na superfície, que
   se transforma no mapa, que se transforma no rover e na evidência.
5. **Interação simples.** A criança entende a próxima ação sem instrução longa.
6. **Controle.** O visitante pode voltar, pular, pausar movimento e usar teclado.
7. **Honestidade.** Conteúdo ilustrativo, reconstrução e dado real são
   identificados quando a distinção importa.

## 7. Arquitetura do site

### 7.1 Visão geral

A experiência principal passa a ser uma única rota com um palco gráfico
persistente. O documento contém seções com alturas de scroll; um `Canvas` WebGL
fixo ou sticky ocupa a tela enquanto o conteúdo HTML marca os momentos da
narrativa.

O progresso do scroll é convertido em posição, escala, foco e opacidade da cena.
A escolha de Marte ou Lua altera o ramo narrativo exibido no mesmo documento, sem
uma nova navegação de página.

Rotas:

- `/` — experiência principal.
- `/?world=mars` — abre diretamente o ramo de Marte depois da ignição.
- `/?world=moon` — abre diretamente o ramo da Lua depois da ignição.
- `/?mode=archive` — versão linear acessível, sem WebGL e sem animação
  dependente de scroll.
- Parâmetros `?scene=` existentes podem ser preservados temporariamente para QA
  das telas antigas, mas não fazem parte da experiência pública final.

O modo arquivo é uma renderização linear do mesmo conteúdo, não uma segunda
experiência visual. Ele não tenta reproduzir o sistema solar interativo; preserva
texto, imagens, fontes, ordem narrativa e todos os controles essenciais.

### 7.2 Sequência principal

#### Ato 0 — Ignição

- Viewport escuro com estrelas quase invisíveis.
- Wordmark pequeno no topo.
- Título grande: **“O sinal termina. A luz continua.”**
- Um único controle dominante: **“Começar”**, com anel orbital luminoso.
- Nenhum parágrafo, status ou legenda visível.
- Ao ativar, acontece uma aceleração curta de estrelas e o scroll avança para a
  órbita.
- Com movimento reduzido, o clique faz um crossfade direto para a órbita.

#### Ato 1 — Órbita

- Sistema solar em tela cheia, com o Sol mais luminoso e os planetas legíveis.
- Câmera levemente inclinada; movimento orbital lento e contínuo.
- Marte e Lua recebem halo, contraste e microparallax próprios.
- Mercúrio, Vênus, Terra, Júpiter, Saturno, Urano e Netuno permanecem visíveis,
  porém silenciosos.
- Não há cards de planeta. O próprio corpo celeste é o alvo.
- Ao passar o ponteiro ou mover o foco de teclado, o mundo ativo cresce
  discretamente, os demais escurecem e seu nome aparece em tipografia grande.
- Ao tocar em um mundo bloqueado, mostrar **“Ainda em silêncio”** por tempo
  limitado, sem inventar conteúdo.
- Em mobile, os planetas ativos têm alvos de pelo menos 44 px e podem ser
  selecionados por uma faixa inferior com dois botões grandes: **Marte** e
  **Lua**.

#### Ato 2 — Escolha e mergulho

- Marte ou Lua entra em foco.
- O nome do mundo ocupa a tela por um instante.
- Um segundo gesto — clique, Enter ou continuação natural do scroll — inicia o
  mergulho.
- A câmera avança, a atmosfera/poeira cresce e o planeta preenche o viewport.
- O texto acompanha com uma frase curta, por exemplo: **“Descer em Marte”**.
- O retorno usa o movimento inverso, sem corte seco.

#### Ato 3 — Superfície

- A textura do planeta se dissolve em superfície, poeira e horizonte.
- A primeira informação nasce do ambiente, não de um card.
- Em Marte, o mapa real da rota final surge como uma linha desenhada sobre a
  superfície.
- Em Lua, a superfície cinzenta e as marcas de exploração ocupam a cena.

#### Ato 4 — História de Marte

O ramo de Marte tem cinco batidas:

1. **90 dias.** O plano original.
2. **14 anos.** A missão que continuou.
3. **45,16 km.** A jornada e seus sistemas.
4. **10 de junho de 2018.** A tempestade e o último conjunto de dados.
5. **O que ficou.** Evidências de ambientes antigos com água, aprendizado e
   legado.

Cada batida precisa de uma transformação visual:

- no início, uma linha do tempo de missão se desenha sobre Marte;
- o rover 3D entra em close e, conforme o scroll, abre os grupos didáticos em
  camadas;
- poeira cobre a cena durante a tempestade;
- o último dado recebido aparece como imagem incompleta e ruidosa;
- as esferas de hematita e a imagem da descoberta ocupam a tela;
- o legado volta ao sistema solar com Marte marcado como visitado.

O rover não deve ser apenas um objeto decorativo. A narrativa usa a relação
**peça → função → consequência**:

- painéis solares → poeira → perda de energia;
- câmeras → registro → última imagem recebida;
- rodas → deslocamento → 45,16 km percorridos.

O desmonte é uma sequência de scroll, mas permanece controlável e acessível por
uma lista de camadas equivalente. O texto explica que as camadas são agrupamentos
didáticos de uma malha oficial, não peças internas separáveis.

#### Ato 5 — Compreensão

- Uma pergunta grande, com três respostas e uma única ação.
- Pergunta: **“O que o Opportunity encontrou em Marte?”**
- Resposta correta: **“Evidências de ambientes antigos com água.”**
- Acerto: confirmação visual curta, sem fogos de artifício.
- Erro: mostrar novamente a imagem de hematita e permitir nova tentativa.
- A pergunta é opcional para quem usa o modo arquivo, mas nunca deve parecer uma
  prova escolar.

#### Ato 6 — Legado e retorno

- Três números dominantes: **90 dias planejados**, **14 anos**, **45,16 km**.
- Frase: **“A missão terminou. A descoberta ficou.”**
- A câmera retorna ao sistema solar.
- Marte aparece com uma marca de visita.
- A Lua permanece disponível; os outros mundos continuam em silêncio.
- Última ação: **“Explorar outro mundo”**.

### 7.3 Jornada da Lua

A Lua precisa de uma experiência curta e completa, não de uma tela “em breve”.
Serão três batidas:

1. **1969.** A chegada humana e o valor histórico da missão.
2. **Sem vento.** A superfície preserva marcas; a poeira lunar é um desafio real
   para equipamentos e pessoas.
3. **Próximo passo.** A Lua como lugar de preparação para explorar mais longe.

Usar imagens e fatos oficiais da NASA, com proveniência visível. A jornada não
precisa copiar a profundidade do Opportunity; precisa ter começo, descoberta e
fechamento.

Na versão 1, a Lua não terá quiz nem painel de números de legado. Ela termina com
um fechamento curto e a ação **“Explorar outro mundo”**, retornando à órbita.

## 8. Direção visual

### 8.1 Conceito

**Observatório noturno encontra cinema espacial.** A experiência parece um
instrumento científico e um artefato cultural, não um painel escolar.

O “cockpit” não será uma cabine literal nem uma interface cheia de números. Ele
aparece como uma camada discreta de instrumento: bordas, marcas de calibração,
um anel de foco, telemetria mínima e controles essenciais. O sistema solar
continua sendo o objeto mais importante.

### 8.2 Paleta

Manter os tokens existentes e elevar a luminosidade:

| Token | Cor | Uso |
|---|---|---|
| Dusk Over Endeavour | `#101B28` | fundo |
| Basalt Plinth | `#29313A` | superfícies e HUD |
| Oxide Lantern | `#D56F45` | Marte e ação primária |
| Regolith Sand | `#E7CDAA` | texto principal |
| Signal Gold | `#F2C26B` | luz, foco e linha do sinal |
| Quiet Sage | `#9AC2B2` | confirmação e evidência |

Marte deve ser mais quente e luminoso. A Lua deve ter contraste prateado, mas não
virar branco puro. O fundo nunca deve apagar o sistema solar.

### 8.3 Tipografia

- **Bricolage Grotesque Variable:** títulos, números e nomes de mundos.
- **Atkinson Hyperlegible:** corpo, acessibilidade, fontes e legendas.
- Título de abertura desktop: 88–144 px, dependendo do viewport.
- Nome de planeta: 64–120 px.
- Dados: 72–180 px.
- Frases de história: 28–48 px.
- Texto essencial de interface: nunca abaixo de 16 px.
- Microtexto apenas para créditos, proveniência e rótulos acessíveis; nunca para
  explicar a interação principal.

### 8.4 Composição

- Desktop: objeto à direita ou no centro; texto em uma única coluna à esquerda.
- Mobile: objeto ocupa a metade superior; o texto entra por baixo, sem cobrir o
  planeta.
- Controles essenciais ficam nas bordas, com ícones e rótulos acessíveis.
- Nada de grades de cards, sidebars permanentes ou barras de progresso com muitos
  textos.

## 9. Movimento

### 9.1 Gramática

1. **Drift:** planetas e estrelas se movem lentamente mesmo em repouso.
2. **Focus:** o mundo escolhido aumenta, os demais escurecem.
3. **Parallax:** o ponteiro desloca a câmera em poucos graus, com limites.
4. **Dive:** zoom com aceleração e desaceleração; estrelas alongam por um breve
   instante.
5. **Reveal:** superfície, mapa, rover e imagens entram no lugar do planeta.
6. **Layer:** partes do rover se separam com distância e opacidade controladas.
7. **Return:** zoom out com restauração da órbita.

### 9.2 Regras

- O scroll usa o comportamento nativo do navegador. Não haverá biblioteca de
  scroll hijacking nem bloqueio de roda, touch ou teclado.
- Seções `sticky` criam tempo para a câmera sem prender o visitante.
- Um único valor de progresso alimenta a cena WebGL; valores derivados usam
  interpolação e mola.
- Animar apenas transformação e opacidade no DOM; não animar layout.
- Evitar blur de tela cheia, pós-processamento pesado e texturas novas em tempo
  real.
- O ponteiro altera a câmera em no máximo 2–3 graus.
- Entradas de texto usam `opacity` e `translateY` de até 24 px.
- A seleção de mundo usa um pulso curto e um anel, não uma explosão de partículas.
- O mergulho dura entre 1,2 e 1,8 s em movimento normal.
- O retorno dura entre 0,9 e 1,4 s.

### 9.3 Movimento reduzido

- Sem zoom contínuo, parallax, rotação de planetas ou desmonte automático.
- Transições por crossfade curto.
- O conteúdo aparece em blocos lineares, com a mesma informação e os mesmos
  botões.
- O modo arquivo é a referência de conteúdo completo e deve continuar funcional
  se WebGL falhar.

## 10. Interface e controles

- **Começar:** único CTA da ignição.
- **Som:** opcional; nunca inicia sem ação do usuário.
- **Acessibilidade:** abre um painel com movimento reduzido, texto ampliado,
  legendas e modo arquivo.
- **Fontes:** proveniência de imagens, modelo, mapa e fatos.
- **Voltar à órbita:** disponível durante a história.
- **Pular para o conteúdo:** primeiro elemento focável.
- **Explorar outro mundo:** retorno ao seletor após o legado.
- Rótulos visuais são grandes; rótulos auxiliares podem existir apenas para
  leitores de tela.

## 11. Conteúdo factual obrigatório

- Planejado para aproximadamente 90 sols, cerca de 92 dias terrestres.
- Operou por mais de 14 anos.
- Percorreu 45,16 km.
- Pousou em Meridiani Planum em 25 de janeiro de 2004 UTC.
- Último contato em 10 de junho de 2018, sol 5111, durante uma tempestade de
  poeira.
- Fim da missão anunciado em 13 de fevereiro de 2019.
- Encontrou evidências de ambientes antigos com água, não água líquida atual.
- O último conjunto de dados é uma imagem incompleta e ruidosa; não é uma
  despedida, mensagem escrita ou “últimas palavras”.

## 12. Filme de pitch

### 12.1 Formato

- Duração: 180 s.
- Master: 1920 × 1080, 30 fps, 5400 frames.
- Entrega principal: H.264/MP4, CRF 18, AAC 48 kHz.
- Legendas queimadas opcionais e arquivo SRT separado.
- Idioma: português do Brasil.
- Produção em projeto separado `video/`, usando Remotion.
- O filme não renderiza o app ao vivo dentro de um iframe. Usa capturas em alta
  resolução do site, imagens oficiais, motion graphics e composição no Remotion.
- Base de produção: skill oficial `remotion-dev/skills` para as APIs e o fluxo
  atuais, complementada por `haidrrrry/claude-remotion-skill` para gramática de
  motion design e revisão visual.
- Capturas do site serão geradas por um script Playwright determinístico do
  projeto, com viewport fixo e frames reproduzíveis.
- A skill Paralect Product Demo fica como opcional para inserts de 10–40 s; não
  será a base do filme de três minutos.
- A suíte completa `digitalsamba/claude-code-video-toolkit` só será adotada se
  locução, trilha ou QC se tornarem um gargalo real.
- A comparação, licenças e justificativa estão em
  `.analysis/video-tools-research.md`.

### 12.2 Regra visual

O filme não terá slides. Tipografia, mapas, imagens e números aparecem dentro da
cena, conectados por movimento de câmera, luz, poeira e a linha do sinal. Uma
frase pode ocupar a tela inteira, mas nunca dentro de um card de apresentação.

### 12.3 Estrutura narrativa

#### 0:00–0:18 — A porta

Cena representativa de uma criança em uma sala com uma projeção de estrelas.
Ela olha para o céu. O texto **“situação ilustrativa”** aparece de forma discreta
uma única vez.

**Direção da personagem:** uma única criança, com aparência de 10 a 12 anos,
curiosa e ativa. Ela observa, testa e explica; nunca aparece como objeto de pena
ou como alguém passivo diante da tecnologia. A mesma personagem reaparece no
início, durante a descoberta e no fechamento para dar continuidade emocional. O
figurino é simples e atemporal, sem estereótipos de pobreza. A escola é acolhedora
e crível, não monumental e não decadente. A representação pode ser filmada ou
ilustrada, desde que o tratamento visual deixe claro que não é um documentário.

Locução:

> Toda criança já olhou para o céu. Mas nem toda criança encontra uma porta para
> entrar nele.

#### 0:18–0:42 — A distância

Documentos técnicos, imagens da NASA e inglês se acumulam em profundidade. A
câmera atravessa esses arquivos até Marte.

Locução:

> A NASA já produziu algumas das histórias mais extraordinárias da humanidade.
> Mas elas vivem em arquivos técnicos, em inglês, difíceis de alcançar.

#### 0:42–1:08 — O sinal

Opportunity na superfície. Linha do tempo: 90 dias planejados, 14 anos, 45,16 km.
Tempestade de poeira; a cena escurece; o último dado aparece.

Locução:

> Em 2004, o Opportunity pousou em Marte. A missão estava planejada para 90 dias.
> Ele continuou por mais de 14 anos, percorreu 45,16 quilômetros e encontrou
> evidências de ambientes antigos com água. Em 2018, uma tempestade de poeira
> silenciou seu sinal. A missão terminou. A história, não.

#### 1:08–1:35 — A porta abre

O filme entra no novo site. O sistema solar ocupa a tela; o cursor atravessa os
planetas; Marte é selecionado; o mergulho começa.

Locução:

> O After the Signal transforma esse arquivo em uma experiência que uma criança
> consegue explorar sozinha. Você começa no sistema solar. Escolhe Marte.
> Atravessa o espaço. E desce até o Opportunity.

#### 1:35–2:12 — A descoberta

Capturas reais do site: mapa, rover, camadas, tempestade, imagem final,
evidência e pergunta. A criança toca a tela e observa.

Locução:

> Sem slides. Sem instalar nada. Sem precisar saber inglês. Cada movimento revela
> uma descoberta real. Os painéis explicam a energia. As câmeras mostram o último
> registro. As rodas contam uma jornada de 45 quilômetros.

#### 2:12–2:38 — A transformação

A criança responde à pergunta. A interface confirma. O filme volta para a sala,
agora iluminada pela projeção de Marte.

Locução:

> E quando ela responde o que aprendeu, não está apenas assistindo à ciência.
> Está fazendo as perguntas que a ciência faz.

#### 2:38–2:52 — O impacto

Professores, escola, família e projeção do sistema solar. Mostrar que a
experiência é gratuita, funciona no navegador e não exige laboratório.

Locução:

> Feito para escolas públicas, professores e famílias. Uma história real pode ser
> o começo de um novo cientista.

#### 2:52–3:00 — O legado

Volta ao sistema solar. Marte permanece na órbita. A linha do sinal atravessa a
tela e fecha no nome do projeto.

Locução:

> O Opportunity não foi esquecido. E nenhuma criança precisa ser.
> After the Signal. O sinal termina. A luz continua.

### 12.4 Som

- Locução em português, humana, baixa e próxima.
- Trilha original instrumental, sem dependência de licença externa.
- Textura de rádio e poeira usada como transição, não como efeito constante.
- Nenhum áudio da reunião da equipe será usado como narração final.
- A narração deve estar disponível também em texto e SRT.

## 13. Acessibilidade

- O conteúdo completo existe em HTML no modo arquivo.
- Toda ação de mouse tem equivalente por teclado e toque.
- Não há informação essencial transmitida apenas por cor.
- Todos os botões têm nome acessível e alvo mínimo de 44 px.
- O foco permanece visível sobre o fundo espacial.
- Planetas têm botões equivalentes em uma lista/faixa.
- O quiz tem feedback textual e não depende de áudio.
- Movimento reduzido desativa zoom, parallax, rotação e automação de câmera.
- O vídeo terá legenda e o roteiro estará disponível para leitura.
- Textos pequenos de acessibilidade e créditos não são removidos; apenas saem da
  composição principal.

## 14. Abordagem técnica

- Manter React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, Motion e
  Zustand.
- Não instalar uma biblioteca de scroll suave ou hijacking.
- Criar um novo componente de experiência principal que renderiza o palco
  persistente e as seções narrativas.
- Compartilhar um único `MotionValue` ou referência de progresso entre DOM e
  `useFrame`.
- Reaproveitar o GLB oficial do Opportunity, texturas, mapa, imagens e
  componentes de rover quando possível.
- Isolar a cena WebGL por limites de erro e manter o modo arquivo.
- Preservar o `?demo=1` para ensaio do pitch, adaptando-o ao novo fluxo.
- Não carregar o GLB de 11,36 MB no primeiro viewport. O rover entra sob demanda
  pouco antes do momento narrativo.
- Usar `prefers-reduced-motion` e o controle interno de acessibilidade.
- Manter o bundle principal controlado; cenas pesadas devem ser divididas por
  importação dinâmica.

## 15. Metas verificáveis

- Sistema solar legível e interativo em até 10 s depois de “Começar” em desktop
  com WebGL.
- Marte e Lua selecionáveis por mouse, toque e teclado.
- A história de Marte e o retorno à órbita funcionam sem recarregar a página.
- `npm test` e `npm run build` passam.
- Nenhum erro de página ou request com falha no QA desktop/mobile.
- Modo arquivo preserva todo o conteúdo essencial.
- Vídeo final tem exatamente 180 s / 5400 frames e legenda legível.
- Nenhum fato listado na seção 11 é contradito em site ou vídeo.
- O visual não usa cards de slide no filme nem microtexto explicativo na cena
  principal.

## 16. Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Scroll longo cansar | Criar pausas visuais e permitir voltar à órbita |
| WebGL pesado em celular | Limitar DPR, partículas e luzes; fallback 2D |
| Perda de acessibilidade | Modo arquivo completo e navegação alternativa |
| História da Lua parecer secundária | Jornada curta, mas com começo e fim reais |
| Filme parecer demonstração de software | Emoção primeiro; UI entra como consequência |
| Excesso de texto voltar | Regra de uma ideia por viewport |
| Uso de imagem que parece real sem ser | Cena representativa marcada e assets oficiais |
| Projeto virar propaganda política | Foco em educação, arquivo público e impacto humano |

## 17. Critérios de aprovação

A implementação só começa depois que o responsável aprovar:

1. a remoção dos textos pequenos da composição principal;
2. a experiência única de scroll com Marte e Lua como mundos visitáveis;
3. a jornada compacta da Lua;
4. a direção de vídeo em português, com personagem representativa;
5. o escopo do filme de três minutos;
6. o uso do modo arquivo como alternativa acessível.

## 18. Decisões deixadas ao construtor

- Estruturar a nova experiência em um componente `ScrollExperience` e reutilizar
  os componentes existentes sempre que isso não recriar a sensação de telas
  separadas.
- Escolher entre Canvas sticky e Canvas fixo conforme o comportamento de scroll
  e a compatibilidade mobile.
- Definir os valores exatos de easing, distâncias de scroll e intensidade de luz
  dentro da gramática descrita.
- Definir a melhor composição de ilustração/asset para a cena representativa do
  filme, desde que não seja apresentada como documentário.
- Usar uma voz temporária de síntese apenas no animatic; a entrega final deve
  usar locução humana ou legendas com o roteiro aprovado.

### 18.1 Decisões assumidas após a revisão do construtor

- **Conteúdo:** a implementação pesquisa e redige os fatos e textos restantes a
  partir de fontes oficiais da NASA, registra tudo em `SOURCES.md` e não publica
  afirmação sem proveniência.
- **Baseline de dispositivo:** Chrome/Edge atual em desktop e Chrome Android em
  aparelho intermediário, viewport móvel de referência em 390 × 844 e conexão
  4G. A versão 1 não promete funcionamento offline.
- **Desempenho:** “interativo em até 10 segundos” significa chegar ao sistema
  solar navegável nesse prazo no baseline acima, sem baixar o GLB do rover no
  primeiro viewport.
- **Fallback:** WebGL indisponível e movimento reduzido usam o mesmo
  `/?mode=archive`, sem criar uma segunda direção visual.
- **Escopo lunar:** três batidas e retorno à órbita; sem quiz ou painel de legado
  na versão 1.
- **Prazo e entrega:** o trabalho segue em duas frentes, site primeiro e filme
  depois. A entrega desta rodada inclui a experiência principal navegável, o
  modo arquivo, correções de QA/testes, planejamento do filme e os documentos de
  pesquisa já produzidos. O master do vídeo depende de assets de personagem,
  locução e trilha que ainda não existem no repositório.
