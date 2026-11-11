import { ValidationPipe } from '@nestjs/common'; // trae el pipe que aplica las validaciones 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
  
async function bootstrap() {
  const app = await NestFactory.create(AppModule); // crea la aplicacion por el modulo raiz
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // activa la validacion en todas las rutas. 
  app.enableCors({ origin: process.env.FRONTEND_ORIGIN }); // permite que el fornt le haga peticiones al back
  await app.listen(process.env.PORT ?? 3000); 
}
bootstrap(); 