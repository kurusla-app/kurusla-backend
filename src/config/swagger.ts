import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kurusla Backend API',
      version: '1.0.0',
      description: 'Kurusla mikro-birikim platformu API dökümantasyonu',
      contact: {
        name: 'Taha Buğra Çiçek',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Yerel Geliştirme Sunucusu',
      },
      {
        url: 'https://kurusla-backend.onrender.com',
        description: 'Render Canlı Sunucusu',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/api/**/*.routes.ts', './src/api/**/*.controller.ts'], // Rotaları ve kontrolcüleri tara
};

export const swaggerSpec = swaggerJsdoc(options);
