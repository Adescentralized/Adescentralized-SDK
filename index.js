const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const adRoutes = require("./src/routes/adRoutes");
const database = require("./src/models/database");
const stellarService = require("./src/services/stellarService");
const sorobanContractsService = require("./src/services/sorobanContractsService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "http://localhost:3000",
          "http://127.0.0.1:3001",
        ],
        scriptSrcAttr: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        styleSrcAttr: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://127.0.0.1:3001",
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// CORS configurado para permitir incorporação em sites externos
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir qualquer origem para desenvolvimento
      callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
    optionsSuccessStatus: 200,
  })
);

// Middleware adicional para headers CORS específicos
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Logging
app.use(morgan("combined"));

// Parse JSON bodies
app.use(express.json());

// Servir arquivos estáticos (incluindo o SDK)
app.use(express.static(path.join(__dirname, "public")));

// Rotas da API
app.use("/api", adRoutes);

// Rota para servir o SDK JavaScript
app.get("/sdk.js", (req, res) => {
  // Headers específicos para o SDK permitir carregamento cross-origin
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendFile(path.join(__dirname, "public", "sdk.js"));
});

// Rota de health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Erro interno do servidor",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint não encontrado",
  });
});

async function startServer() {
  try {
    // Inicializar o banco de dados
    await database.initialize();
    console.log("✅ Banco de dados inicializado com sucesso");

    // Inicializar o serviço Stellar
    try {
      await stellarService.initialize();
      console.log("✅ Serviço Stellar inicializado");
    } catch (error) {
      console.warn(
        "⚠️  Serviço Stellar não pôde ser inicializado:",
        error.message
      );
      console.warn("⚠️  Pagamentos automáticos estarão desabilitados");
    }

    // Inicializar serviço de contratos Soroban
    try {
      await sorobanContractsService.initialize();
      console.log("✅ Serviço de contratos Soroban inicializado");
    } catch (error) {
      console.warn(
        "⚠️  Serviço Soroban não pôde ser inicializado:",
        error.message
      );
      console.warn("⚠️  Pagamentos via contratos Soroban estarão desabilitados");
    }

    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(
        `📊 Health check disponível em: http://localhost:${PORT}/health`
      );
      console.log(`📦 SDK disponível em: http://localhost:${PORT}/sdk.js`);
      console.log(`🎯 Endpoint de anúncios: http://localhost:${PORT}/api/ad`);
      console.log(`👆 Endpoint de cliques: http://localhost:${PORT}/api/click`);
      console.log(`🔗 Endpoint de cliques Soroban: http://localhost:${PORT}/api/click-soroban`);
      console.log(`📝 Endpoint de impressões: http://localhost:${PORT}/api/impression`);
      console.log(
        `💎 Demo de recompensas: http://localhost:${PORT}/rewards-demo.html`
      );
      console.log(
        `🔗 Demo Soroban: http://localhost:${PORT}/soroban-demo.html`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM recebido, encerrando servidor graciosamente...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT recebido, encerrando servidor graciosamente...");
  process.exit(0);
});

startServer();
