import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuarioServicio: UsuariosService){}

    // 1. Obtener TODOS los usuarios (datos generales)
    @Get()
    async obtTodo(){
        return this.usuarioServicio.obtTodo();
    }

    // 2. Obtener la lista unificada de administradores
    @Get('administradores')
    async obtTodosLosAdministradores() {
        return this.usuarioServicio.obtTodosLosAdministradores();
    }

    // 3. Obtener la lista unificada de veterinarios
    @Get('veterinarios')
    async obtTodosLosVeterinarios() {
        return this.usuarioServicio.obtTodosLosVeterinarios();
    }

    // 4. Obtener la lista unificada de estilistas
    @Get('estilistas')
    async obtTodosLosEstilistas() {
        return this.usuarioServicio.obtTodosLosEstilistas();
    }

    // 5. Obtener la lista unificada de recepcionistas
    @Get('recepcionistas')
    async obtTodosLosRecepcionistas() {
        return this.usuarioServicio.obtTodosLosRecepcionistas();
    }

    // 6. Obtener un cliente específico con sus datos unificados (Ruta fija arriba del parámetro genérico)
    @Get('clientes/:id')
    async obtClientePorId(@Param('id', ParseIntPipe) id: number) {
        return this.usuarioServicio.obtClientePorId(id);
    }

        @Get('empleados')
async obtenerTodosLosEmpleados() {
    return this.usuarioServicio.obtenerTodosLosEmpleados();
}

    // 7. Obtener un usuario genérico por su ID (Al final de todo)
    @Get(':id')
    async obtUsuario(@Param('id', ParseIntPipe) id: number){
        return this.usuarioServicio.obtUsuario(id);
    }


    // 8. Insertar un usuario
    @Post()
    async inserta(@Body() nuevo: any){
        return this.usuarioServicio.inserta(nuevo);
    }
    @Post('login')
async login(@Body() credenciales: any) {
    return this.usuarioServicio.login(credenciales);
}
    @Post('recuperar-password') // ◄ AQUÍ NO DEBE DECIR 'usuarios/recuperar-password'
    async solicitarRecuperacion(@Body('correo') correo: string) {
        return this.usuarioServicio.solicitarRecuperacion(correo);
    }

    @Post('reset-password')
    async restablecerContrasenia(@Body('token') token: string, @Body('contrasenia') contrasenia: string) {
        return this.usuarioServicio.restablecerContrasenia(token, contrasenia);
    }
}