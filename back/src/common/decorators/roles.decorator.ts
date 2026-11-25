import { SetMetadata } from '@nestjs/common';
import type { Rol } from '../../auth/rol';

export const ROLES_KEY = 'roles'; // el nombre con el que se guarda la informacion

export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles); // pega esa lista en la ruta o el controller como informacion extra
                    // esto es un decorador propio, recibe uno o varios perfiles