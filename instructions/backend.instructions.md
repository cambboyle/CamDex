# Backend Instructions

## Stack

- NestJS 11, TypeORM 0.3, PostgreSQL (Supabase), class-validator
- Bun as runtime/package manager
- Jest for unit and e2e tests

## Module structure

Each domain follows this pattern:

```
src/<domain>/
  <domain>.module.ts       -- imports TypeOrmModule.forFeature([Entity, ...])
  <domain>.service.ts      -- all business logic; inject repositories here
  <domain>.controller.ts   -- thin: validate request → call service → return response
  entities/
    <entity>.entity.ts     -- TypeORM entity with decorators
  dto/
    create-<entity>.dto.ts -- class-validator decorated DTOs
    update-<entity>.dto.ts
```

## Adding a new module

```bash
cd backend
nest generate module <name>
nest generate service <name>
nest generate controller <name>
```

Then register the module in `app.module.ts` imports array.

## Auth guard

`JwtAuthGuard` is applied globally via `APP_GUARD` in `app.module.ts`. All endpoints require auth by default. To make a route public, add a `@Public()` decorator (create one using `SetMetadata`).

To get the current user in a controller:

```ts
@Get('me')
async getMe(@CurrentUser() user: SupabaseJwtPayload) {
  return this.userService.findById(user.sub)
}
```

`user.sub` is the Supabase user UUID — use it as the foreign key to `user_profiles`.

## DTOs

Always use `class-validator` decorators. The global `ValidationPipe` with `whitelist: true` strips unknown fields.

```ts
import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator'

export class CreateUserPokemonDto {
  @IsString()
  formId: string

  @IsOptional()
  @IsString()
  @MaxLength(12)
  nickname?: string

  @IsOptional()
  @IsBoolean()
  isShiny?: boolean
}
```

## Error handling

Throw NestJS HTTP exceptions — the global filter translates them correctly:

```ts
import { NotFoundException, ConflictException } from '@nestjs/common'

if (!pokemon) throw new NotFoundException(`Pokémon ${id} not found`)
if (duplicate) throw new ConflictException('This form is already in your collection')
```

Never throw plain `Error` from services. Never return stack traces in responses.

## TypeORM patterns

```ts
// Repository injection
@InjectRepository(UserPokemon)
private readonly repo: Repository<UserPokemon>

// Upsert (used heavily in the PokéAPI sync)
await this.repo
  .createQueryBuilder()
  .insert()
  .into(PokemonSpecies)
  .values(species)
  .orUpdate(['display_name', 'generation', 'synced_at'], ['national_dex_number'])
  .execute()

// LEFT JOIN for living dex (avoid N+1)
const entries = await this.formRepo
  .createQueryBuilder('form')
  .leftJoinAndSelect('form.species', 'species')
  .leftJoinAndMapOne(
    'form.caught',
    UserPokemon,
    'up',
    'up.form_id = form.id AND up.user_id = :userId',
    { userId },
  )
  .where('form.is_battle_only = false')
  .orderBy('form.living_dex_order', 'ASC')
  .getMany()
```

## PokéAPI sync architecture

The sync service (`pokemon/sync/pokemon-sync.service.ts`) is responsible for populating the database from PokéAPI:

1. Fetch the full species list (`/pokemon-species?limit=10000`)
2. For each species in batches of 20: `GET /pokemon-species/{id}` → extract `varieties[]`
3. For each variety: `GET /pokemon/{name}` → stats, types, sprites, `is_default`
4. For non-default varieties: `GET /pokemon-form/{name}` → `is_battle_only`, `form_name`
5. Filter: exclude `is_battle_only === true` and the hardcoded exclusion list
6. Upsert into `pokemon_species` and `pokemon_forms`

Batch helper:

```ts
async function batchedRequests<T>(
  items: T[],
  batchSize: number,
  delayMs: number,
  fn: (item: T) => Promise<unknown>,
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.allSettled(batch.map(fn))
    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}
```

## Migrations

1. Make changes to entities
2. `bun run migration:generate migrations/<MigrationName>`
3. Review the generated migration file
4. `bun run migration:run`

Never use `synchronize: true` outside of tests.

## Testing

Unit tests mock repositories:

```ts
const mockRepo = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() }
const service = new CollectionService(mockRepo as any)
```

Integration tests use a real test DB (set `TEST_DATABASE_URL` env var) with `synchronize: true` and `dropSchema: true` in `beforeAll`.
