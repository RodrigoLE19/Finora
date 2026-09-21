import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CategoriasResponse } from "../../models/category.models";



@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/categorias';

    obtenerCategorias() {
        return this.http.get<CategoriasResponse>(
            this.apiUrl
        );
    }
}