console.log('Testing checkin imports...\n');

try {
  // Test controller import
  const controller = await import('../src/controller/checkin.controller.js');
  console.log('✅ Controller imported:', controller.default ? 'Has default' : 'NO DEFAULT');

  // Test routes import
  const routes = await import('../src/routes/checkin.routes.js');
  console.log('✅ Routes imported:', routes.default ? 'Has default' : 'NO DEFAULT');

  console.log('\n✅ All imports OK!');

} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error(error.stack);
}

process.exit(0);
