export interface Categoria {
    id_categoria: number;
    nombre: string;
    tipo: 'INGRESO' | 'GASTO';
}

export interface CategoriasResponse {
    categorias: Categoria[];
}