# TESTES QA - SISTEMA CALÇADOS ARAÚJO

> **Stack:** Next.js + NextAuth + Prisma + PostgreSQL  
> **Ferramenta:** Postman (Coleção exportada no repo)  
> **Autenticação:** `next-auth.session-token` via DevTools → usado em **todas** as rotas protegidas

---

## ROTAS TESTADAS

### .1 GET /api/home

| Campo                 | Valor                                       |
|-----------------------|---------------------------------------------|
| **Método**            | `GET`                                       |
| **URL**               | `http://localhost:3000/api/home`            |
| **Autenticação**      | `Cookie: next-auth.session-token=SEU_TOKEN` |
| **Status**            | `200 OK`                                    |
| **Print**             | `print aqui`                                           |

---

#### Response

```json
{
  "totalPares": 4,
  "valorTotal": "800.00",
  "lowStockCount": 4,
  "lotesHoje": 0,
  "modelosAtivos": 1,
  "alerts": [
    { "message": "Tênis casual MASCULINO tam 36: 1 unid", "urgente": false },
    { "message": "Tênis casual MASCULINO tam 38: 1 unid", "urgente": false },
    { "message": "Tênis casual MASCULINO tam 44: 1 unid", "urgente": false },
    { "message": "Tênis casual MASCULINO tam 43: 1 unid", "urgente": false }
  ],
  "topSemana": [],
  "estoquePorGenero": [
    { "name": "MASCULINO", "value": 4 }
  ],
  "topModelos": [
    { "name": "Tênis casual", "quantidade": 4 }
  ]
}
```

### .2 GET /api/dashboard

| Campo                 | Valor                                       |
|-----------------------|---------------------------------------------|
| **Método**            | `GET`                                       |
| **URL**               | `http://localhost:3000/api/dashboard`       |
| **Autenticação**      | `Cookie: next-auth.session-token=SEU_TOKEN` |
| **Status**            | `200 OK`                                    |
| **Print**             | `print aqui`                                |

---

#### Response

```json
{
  "totalPares": 4,
  "valorTotal": 800,
  "custoTotal": 399.96,
  "lucroProjetado": 400.04,
  "margemLucro": "50.0%",
  "resumoVendas": {
    "totalQuitado": 579.97,
    "totalPendente": 380
  },
  "rankingVendidos": [
    {
      "modelo": "Tênis casual",
      "qtyVendida": 5
    }
  ],
  "lowStockCount": 9,
  "lotesHoje": 0,
  "modelosAtivos": 1,
  "estoquePorGenero": [
    {
      "name": "MASCULINO",
      "value": 4
    }
  ],
  "topModelos": [
    {
      "name": "Tênis casual",
      "quantidade": 4
    }
  ],
  "alerts": []
}
```

### .3 GET /api/clientes

| Campo                 | Valor                                       |
|-----------------------|---------------------------------------------|
| **Método**            | `GET`                                       |
| **URL**               | `http://localhost:3000/api/clientes`        |
| **Autenticação**      | `Cookie: next-auth.session-token=SEU_TOKEN` |
| **Status**            | `200 OK`                                    |
| **Print**             | `print aqui`                                |

---

#### Response

```json
[
  {
    "id": 2,
    "nome": "João Silva",
    "apelido": null,
    "telefone": null,
    "dataNascimento": null,
    "cidade": null,
    "bairro": null,
    "rua": null,
    "criadoEm": "2025-11-08T00:58:25.468Z",
    "ultimaCompra": "2025-11-07T00:00:00.000Z",
    "_count": { "vendas": 1 },
    "ultimaCompraAgregada": "2025-11-07T00:00:00.000Z",
    "totalGasto": 199.97,
    "qtyItensTotal": 1
  },
  {
    "id": 1,
    "nome": "Marcos Eduardo",
    "apelido": null,
    "telefone": "(77) 99122-7182",
    "dataNascimento": null,
    "cidade": null,
    "bairro": null,
    "rua": null,
    "criadoEm": "2025-11-04T00:59:00.106Z",
    "ultimaCompra": "2025-11-04T00:00:00.000Z",
    "_count": { "vendas": 4 },
    "ultimaCompraAgregada": "2025-11-04T00:00:00.000Z",
    "totalGasto": 760,
    "qtyItensTotal": 4
  }
]
```

### .3.1 GET /api/clientes/2

| Campo                 | Valor                                       |
|-----------------------|---------------------------------------------|
| **Método**            | `GET`                                       |
| **URL**               | `http://localhost:3000/api/clientes/2`      |
| **Autenticação**      | `Cookie: next-auth.session-token=SEU_TOKEN` |
| **Status**            | `200 OK`                                    |
| **Print**             | `print aqui`                                |

---

#### Response

```json
{
  "id": 2,
  "nome": "João Silva",
  "apelido": null,
  "telefone": null,
  "dataNascimento": null,
  "cidade": null,
  "bairro": null,
  "rua": null,
  "ultimaCompra": "2025-11-07T00:00:00.000Z",
  "frequenciaCompras": "BAIXA",
  "criadoEm": "2025-11-08T00:58:25.468Z",
  "vendas": [
    {
      "id": 5,
      "produtoId": 2,
      "quantidade": 1,
      "precoVenda": 200,
      "valorTotal": 199.97,
      "entrada": 199.97,
      "formaPagamento": "DINHEIRO",
      "status": "QUITADO",
      "dataVenda": "2025-11-07T00:00:00.000Z",
      "produto": {
        "id": 2,
        "nome": "Teste-555",
        "tamanho": 41,
        "modelo": "Tênis casual",
        "marca": "Nike",
        "genero": "MASCULINO",
        "precoCusto": 99.99,
        "precoVenda": 200,
        "disponivel": false
      },
      "parcelas": []
    }
  ],
  "metricas": {
    "totalGasto": "199.97",
    "totalPago": "199.97",
    "totalPendente": "0.00",
    "taxaCartao": "0.00",
    "numeroCompras": 1,
    "produtosFavoritos": [
      { "nome": "Teste-555", "quantidade": 1 }
    ],
    "parcelasAtrasadas": 0
  }
}
```

### .3.2 PUT /api/clientes/2

| Campo                 | Valor                                       |
|-----------------------|---------------------------------------------|
| **Método**            | `PUT`                                       |
| **URL**               | `http://localhost:3000/api/clientes/2`      |
| **Autenticação**      | `Cookie: next-auth.session-token=SEU_TOKEN` |
| **Content-Type**      | `application/json`                          |
| **Status**            | `200 OK`                                    |
| **Print**             | `print aqui`                                |

---

#### Request Body

```json
{
  "nome": "Teste pae",
  "apelido": "Testando",
  "telefone": "(77) 99199-3352",
  "dataNascimento": "1990-05-15",
  "cidade": "Vitória da Conquista",
  "bairro": "Centro",
  "rua": "Rua dos Tênis, 123"
}
```

#### Response

```json
{
    "id": 2,
    "nome": "Teste pae",
    "apelido": "Testando",
    "telefone": "(77) 99199-3352",
    "dataNascimento": "1990-05-15T00:00:00.000Z",
    "cidade": "Vitória da Conquista",
    "bairro": "Centro",
    "rua": "Rua dos Tênis, 123",
    "ultimaCompra": "2025-11-07T00:00:00.000Z",
    "frequenciaCompras": null,
    "criadoEm": "2025-11-08T00:58:25.468Z"
}
```

### .4 GET /api/estoque

| Campo                 | Valor                                       |
|-----------------------|---------------------------------------------|
| **Método**            | `GET`                                       |
| **URL**               | `http://localhost:3000/api/estoque`         |
| **Autenticação**      | `Cookie: next-auth.session-token=SEU_TOKEN` |
| **Status**            | `200 OK`                                    |
| **Print**             | `print aqui`                                |

---

#### Response

```json
{
  "data": [
    {
      "id": 4,
      "nome": "Teste-555",
      "genero": "MASCULINO",
      "marca": "Nike",
      "modelo": "Tênis casual",
      "tamanho": 43,
      "quantidade": 1,
      "precoVenda": 200,
      "cor": "Preto",
      "referencia": "TESTE",
      "dataRecebimento": "2025-11-03T00:00:00.000Z",
      "disponivel": true
    },
    {
      "id": 5,
      "nome": "Teste-555",
      "tamanho": 44,
      "quantidade": 1,
      "disponivel": true
    },
    {
      "id": 7,
      "tamanho": 38,
      "quantidade": 1,
      "disponivel": true
    },
    {
      "id": 9,
      "tamanho": 36,
      "quantidade": 1,
      "disponivel": true
    },
    {
      "id": 1,
      "tamanho": 40,
      "quantidade": 0,
      "disponivel": false
    },
    {
      "id": 3,
      "tamanho": 42,
      "quantidade": 0,
      "disponivel": false
    },
    {
      "id": 6,
      "tamanho": 39,
      "quantidade": 0,
      "disponivel": false
    },
    {
      "id": 8,
      "tamanho": 37,
      "quantidade": 0,
      "disponivel": false
    },
    {
      "id": 2,
      "tamanho": 41,
      "quantidade": 0,
      "disponivel": false
    }
  ],
  "totalPages": 1,
  "totalProdutos": 9,
  "valorEstoque": 800,
  "paresTotais": 4,
  "esgotados": 5
}
```

### .7 POST /api/produtos/lote

| Campo                 | Valor                                       |
|-----------------------|---------------------------------------------|
| **Método**            | `POST`                                      |
| **URL**               | `http://localhost:3000/api/produtos/lote`   |
| **Autenticação**      | `Cookie: next-auth.session-token=SEU_TOKEN` |
| **Content-Type**      | `application/json`                          |
| **Status**            | `201 Created`                               |
| **Print**             | `print aqui`                                |

---

#### Request Body

```json
{
  "genericos": {
    "nome": "Tênis Novo",
    "referencia": "REF-001",
    "cor": "Azul",
    "precoVenda": 250,
    "precoCusto": 120,
    "genero": "MASCULINO",
    "modelo": "Tênis esportivo",
    "marca": "Adidas",
    "dataRecebimento": "2025-11-10",
    "lote": "Lote-20251110-777"
  },
  "variacoes": [
    { "tamanho": 38, "quantidade": 2 },
    { "tamanho": 40, "quantidade": 1 },
    { "tamanho": 42, "quantidade": 1 }
  ]
}
```

#### Response

```json
{
    "message": "Lote com 3 itens criado",
    "produtos": [
        {
            "id": 10,
            "nome": "Tênis Novo",
            "tamanho": 38,
            "referencia": "REF-001",
            "cor": "Azul",
            "quantidade": 2,
            "precoCusto": 120,
            "precoVenda": 250,
            "imagem": null,
            "genero": "MASCULINO",
            "modelo": "Tênis esportivo",
            "marca": "Adidas",
            "disponivel": true,
            "lote": "Lote-20251110-777",
            "dataRecebimento": "2025-11-10T00:00:00.000Z",
            "createdAt": "2025-11-11T00:24:50.676Z"
        },
        {
            "id": 11,
            "nome": "Tênis Novo",
            "tamanho": 40,
            "referencia": "REF-001",
            "cor": "Azul",
            "quantidade": 1,
            "precoCusto": 120,
            "precoVenda": 250,
            "imagem": null,
            "genero": "MASCULINO",
            "modelo": "Tênis esportivo",
            "marca": "Adidas",
            "disponivel": true,
            "lote": "Lote-20251110-777",
            "dataRecebimento": "2025-11-10T00:00:00.000Z",
            "createdAt": "2025-11-11T00:24:50.686Z"
        },
        {
            "id": 12,
            "nome": "Tênis Novo",
            "tamanho": 42,
            "referencia": "REF-001",
            "cor": "Azul",
            "quantidade": 1,
            "precoCusto": 120,
            "precoVenda": 250,
            "imagem": null,
            "genero": "MASCULINO",
            "modelo": "Tênis esportivo",
            "marca": "Adidas",
            "disponivel": true,
            "lote": "Lote-20251110-777",
            "dataRecebimento": "2025-11-10T00:00:00.000Z",
            "createdAt": "2025-11-11T00:24:50.688Z"
        }
    ]
}
```