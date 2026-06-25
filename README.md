[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jOw_Hzd7)
# 📦 Almoxarifado — Enfermagem

Aplicativo mobile desenvolvido em **React Native** com **Expo** para controle de estoque de materiais de enfermagem. Permite cadastrar, pesquisar, baixar e excluir materiais, com alertas visuais automáticos para estoque crítico.

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---|---|
| ➕ Cadastro | Adiciona novos materiais com nome e quantidade |
| 🔍 Pesquisa em tempo real | Filtra a lista enquanto o usuário digita |
| 📊 Dashboard | Exibe totais: materiais encontrados, críticos e normais |
| ⚠️ Alerta de estoque crítico | Destaque visual (borda + fundo vermelho) quando quantidade < 10 |
| 📉 Baixar estoque | Registra retiradas com validação de quantidade |
| 🗑 Excluir | Remove material com confirmação via Alert |
| 🔄 Pull to refresh | Atualiza a lista puxando a tela para baixo |
| 🌐 Tratamento de erros | Todos os erros de rede são capturados e exibidos com Alert amigável |

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Aplicativo **Expo Go** no seu celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/almoxarifado-enfermagem.git

# 2. Entre na pasta do projeto
cd almoxarifado-enfermagem

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npx expo start
```

### Executando no dispositivo

1. Abra o **Expo Go** no celular
2. Escaneie o QR code exibido no terminal ou no navegador
3. O app será carregado automaticamente

### Executando no emulador

```bash
# Android
npx expo start --android

# iOS (apenas macOS)
npx expo start --ios
```

---

## 🗂 Estrutura do Projeto

```
almoxarifado-enfermagem/
├── App.js              # Tela principal e toda a lógica do app
├── package.json        # Dependências do projeto
├── app.json            # Configurações do Expo
└── README.md           # Este arquivo
```

---

## 🌐 API

O app utiliza a API mockada no [MockAPI](https://mockapi.io/):

```
https://6a2b3936b687a7d5cbc4f9a4.mockapi.io/Materiais
```

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/Materiais` | Lista todos os materiais |
| POST | `/Materiais` | Cadastra novo material |
| PUT | `/Materiais/:id` | Atualiza quantidade do material |
| DELETE | `/Materiais/:id` | Remove um material |

---

## 🧪 Testes

A função `validarRetirada` é exportada para facilitar testes unitários:

```js
import { validarRetirada } from './App';

validarRetirada(50, 10)  // true
validarRetirada(5, 10)   // false — quantidade maior que estoque
validarRetirada(50, 0)   // false — retirada deve ser > 0
```

---

## 🎨 Design e UX

- **Paleta**: Azul (#0d6efd), Verde (#198754), Vermelho (#dc3545), Laranja (#fd7e14)
- **Estoque crítico** (< 10 unidades): fundo vermelho claro, borda vermelha, badge "⚠ Crítico"
- **Barra de progresso** visual por item
- **Pull-to-refresh** para atualizar sem fechar o app
- **Confirmação** antes de excluir itens
- **Loading indicator** durante cadastro e carregamento

---

## 📱 Screenshots

> _Adicione aqui capturas de tela do aplicativo funcionando._

| Tela Principal | Estoque Crítico | Dashboard |
|---|---|---|
| ![Tela principal](screenshots/tela-principal.png) | ![Estoque crítico](screenshots/estoque-critico.png) | ![Dashboard](screenshots/dashboard.png) |

---

## 📋 Contrato Técnico (Critérios de Avaliação)

| Critério | Implementação |
|---|---|
| `testID="input-busca"` | ✅ TextInput de pesquisa em tempo real |
| `testID="total-itens"` | ✅ Exibe número correto de materiais filtrados |
| `accessibilityLabel="estoque-critico"` | ✅ Aplicado quando `Quantidade < 10` |
| Estilo de alerta visual | ✅ `backgroundColor: '#fff5f5'`, `borderColor: '#ffc9c9'`, `borderLeftColor: vermelho` |
| Try/catch em todas as requisições | ✅ GET, POST, PUT, DELETE com timeout e Alert amigável |
| README com instruções de execução | ✅ Este arquivo |

---

## 🛠 Tecnologias

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Axios](https://axios-http.com/)
- [MockAPI](https://mockapi.io/)

---

## 👩‍💻 Desenvolvido por

Seu Nome — [LinkedIn](https://linkedin.com/in/seu-perfil) • [GitHub](https://github.com/seu-usuario)
