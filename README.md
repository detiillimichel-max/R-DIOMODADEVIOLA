# R-DIOMODADEVIOLA

Player e rádio dedicado exclusivamente à moda de viola.

## Estrutura inicial

- `index.html` — estrutura da interface do player.
- `style.css` — identidade visual responsiva.
- `app.js` — controles iniciais de reprodução e playlist.
- `manifest.json` — configuração inicial do PWA.

## Integrações planejadas

- Audius: catálogo e reprodução de músicas disponíveis na API.
- Jamendo: catálogo de músicas conforme disponibilidade e licenciamento.
- Rádio 24 horas: possibilidade futura mediante uma URL de transmissão autorizada.

## Variáveis configuradas na Vercel

- `AUDIUS_API_KEY`
- `AUDIUS_API_SECRET`
- `JAMENDO_CLIENT_ID`

> As credenciais não devem ser colocadas diretamente no código público do navegador. A integração das APIs será implementada com atenção à proteção de segredos e às regras de uso/licenciamento dos conteúdos.
