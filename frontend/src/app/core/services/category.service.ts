import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CategoriasResponse } from "../../models/category.models";
import { API_URL } from "./api";


@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    private http = inject(HttpClient);
    private apiUrl = `${API_URL}/categorias`;

    obtenerCategorias() {
        return this.http.get<CategoriasResponse>(
            this.apiUrl
        );
    }
}