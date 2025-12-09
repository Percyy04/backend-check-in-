import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Gala Brosis 2025 API',
    description: 'Smart Check-in System API',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  tags: [
    { name: 'Health', description: 'Health check' },
    { name: 'Check-in', description: 'Check-in operations' },
    { name: 'Users', description: 'User management' },
    { name: 'Queue', description: 'Queue management' },
    { name: 'Admin', description: 'Admin operations' },
  ],
  // ... definitions
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

// Auto-assign tags based on URL path
const options = {
  autoTags: true, // ← Enable auto tags
};

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc).then(() => {
  console.log('✅ Swagger generated with auto-tags!');
});
