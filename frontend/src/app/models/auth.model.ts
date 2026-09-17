export interface Usuario {
    id_usuario: number;
    nombre: string;
    email:string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    usuario: Usuario;
    token: string;
}

export interface RegisterRequest {
    nombre: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    usuario: Usuario;
}