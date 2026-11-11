import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  validar(archivo?: Express.Multer.File) {
    if (!archivo?.buffer?.length) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }
    const b = archivo.buffer;
    const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    const png = b
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp =
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP';
    if (!jpeg && !png && !webp) {
      throw new BadRequestException(
        'Solo se admiten imágenes JPEG, PNG o WebP',
      );
    }
  }

  subir(archivo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => { 
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          type: 'upload',
          public_id: `red-social/perfiles/${randomUUID()}`,
          overwrite: false,
        },
        (error, resultado) => {
          if (error || !resultado) {
            return reject(
              new BadGatewayException('No se pudo subir la imagen'),
            );
          }
          resolve(resultado.secure_url);
        },
      );
      stream.end(archivo.buffer);
    }); 
    
  }
}