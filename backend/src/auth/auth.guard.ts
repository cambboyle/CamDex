import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import {
  createPublicKey,
  type KeyObject,
  type JsonWebKey as CryptoJsonWebKey,
} from 'crypto';

export interface SupabaseJwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly supabaseUrl: string;
  private readonly jwtSecret: string;
  private publicKeys: KeyObject[] = [];

  constructor(private readonly config: ConfigService) {
    this.supabaseUrl = config.getOrThrow<string>('SUPABASE_URL');
    this.jwtSecret = config.get<string>('SUPABASE_JWT_SECRET') ?? '';
  }

  async onModuleInit() {
    await this.loadJwks();
  }

  private async loadJwks() {
    try {
      const res = await fetch(
        `${this.supabaseUrl}/auth/v1/.well-known/jwks.json`,
      );
      const body = (await res.json()) as { keys: CryptoJsonWebKey[] };
      this.publicKeys = body.keys.map((jwk) =>
        createPublicKey({ key: jwk, format: 'jwk' }),
      );
      this.logger.log(`Loaded ${this.publicKeys.length} public key(s) from JWKS`);
    } catch (err) {
      this.logger.warn(
        `Failed to load JWKS, falling back to symmetric secret: ${String(err)}`,
      );
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Missing authorization token');

    // Try ES256 with each JWKS public key first
    for (const key of this.publicKeys) {
      try {
        const payload = jwt.verify(token, key, {
          algorithms: ['ES256'],
        }) as SupabaseJwtPayload;
        (request as Request & { user: SupabaseJwtPayload }).user = payload;
        return true;
      } catch {
        // Try next key
      }
    }

    // Fall back to HS256 symmetric secret
    if (this.jwtSecret) {
      try {
        const payload = jwt.verify(token, this.jwtSecret, {
          algorithms: ['HS256'],
        }) as SupabaseJwtPayload;
        (request as Request & { user: SupabaseJwtPayload }).user = payload;
        return true;
      } catch {
        // Fall through to throw
      }
    }

    throw new UnauthorizedException('Invalid or expired token');
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
