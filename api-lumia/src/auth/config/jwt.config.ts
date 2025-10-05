import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'sua_chave_secreta_jwt_super_segura_aqui',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));
