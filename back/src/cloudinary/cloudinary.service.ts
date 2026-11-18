import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
// servicio a cargo de las imagenes. 
@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) { // lo recibe para leer el .env
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,       // Si alguna variable falla, no arranca
    });
  } // lo configuro con las credenciales

  validar(archivo?: Express.Multer.File) {
    if (!archivo?.buffer?.length) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    } // obliga a tener una imagen y la revisa, responde con 400
    const b = archivo.buffer; // los bytes del archivo
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

  subir(archivo: Express.Multer.File, carpeta: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream( // sube los bytes directo desde la memoria, sin guardar un archivo en el disco. 
        {
          resource_type: 'image',
          type: 'upload', 
          public_id: `red-social/${carpeta}/${randomUUID()}`, // el nombre en cloudinary 
          overwrite: false, // para que nucna remplace otra imagen. 
        },
        (error, resultado) => {
          if (error || !resultado) {
            return reject(
              new BadGatewayException('No se pudo subir la imagen'), // avisa que fue un error del servicio externo y no del usuario
            );
          }
          resolve(resultado.secure_url); // si sale bien, se guarda en mongo
        },
      );
      stream.end(archivo.buffer); // envia los bytes
    });
  } // para mandar la imagen a cloudinary
}
