import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { SupabaseJwtPayload } from '../auth.guard'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupabaseJwtPayload => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as SupabaseJwtPayload
  },
)
