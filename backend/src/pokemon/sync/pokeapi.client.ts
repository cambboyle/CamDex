import { Injectable } from '@nestjs/common';

const BASE_URL = 'https://pokeapi.co/api/v2';

@Injectable()
export class PokeApiClient {
  private async fetch<T>(path: string): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`PokéAPI ${res.status}: ${url}`);
    }
    return res.json() as Promise<T>;
  }

  getSpeciesList(limit = 2000): Promise<{ results: { name: string; url: string }[] }> {
    return this.fetch(`/pokemon-species?limit=${limit}`);
  }

  getSpecies(name: string): Promise<PokeApiSpecies> {
    return this.fetch(`/pokemon-species/${name}`);
  }

  getPokemon(name: string): Promise<PokeApiPokemon> {
    return this.fetch(`/pokemon/${name}`);
  }

  getPokemonForm(name: string): Promise<PokeApiForm> {
    return this.fetch(`/pokemon-form/${name}`);
  }
}

export interface PokeApiSpecies {
  id: number;
  name: string;
  order: number;
  generation: { name: string };
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  color: { name: string };
  shape: { name: string } | null;
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

export interface PokeApiForm {
  name: string;
  is_battle_only: boolean;
  is_default: boolean;
}
