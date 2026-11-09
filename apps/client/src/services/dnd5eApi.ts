const DND5E_BASE_URL = 'https://www.dnd5eapi.co/api';

export interface ApiNamedResource {
  index: string;
  name: string;
  url: string;
}

export interface ApiListResponse {
  count: number;
  results: ApiNamedResource[];
}

export const fetchDndRaces = async (): Promise<ApiNamedResource[]> => {
  const response = await fetch(`${DND5E_BASE_URL}/races`);
  if (!response.ok) {
    throw new Error('Error al obtener la lista de razas de dnd5eapi.co');
  }
  const data: ApiListResponse = await response.json();
  return data.results;
};

export const fetchDndClasses = async (): Promise<ApiNamedResource[]> => {
  const response = await fetch(`${DND5E_BASE_URL}/classes`);
  if (!response.ok) {
    throw new Error('Error al obtener la lista de clases de dnd5eapi.co');
  }
  const data: ApiListResponse = await response.json();
  return data.results;
};