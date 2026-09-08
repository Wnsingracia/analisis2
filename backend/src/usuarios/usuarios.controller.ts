import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuarioServicio: UsuariosService){}

    // =========================================================================
    // 1. RUTAS PÚBLICAS / MÓDULOS ESPECÍFICOS (Primero las fijas sin parámetros)
    // =========================================================================

    @Get('administradores')
    async obtTodosLosAdministradores() {
        return this.usuarioServicio.obtTodosLosAdministradores();
    }

    @Get('veterinarios')
    async obtTodosLosVeterinarios() {
        return this.usuarioServicio.obtTodosLosVeterinarios();
    }

    @Get('estilistas')
    async obtTodosLosEstilistas() {
        return this.usuarioServicio.obtTodosLosEstilistas();
    }

    @Get('recepcionistas')
    async obtTodosLosRecepcionistas() {
        return this.usuarioServicio.obtTodosLosRecepcionistas();
    }

    // =========================================================================
    // 2. RUTAS PROTEGIDAS CON JWT
    // =========================================================================
    @UseGuards(JwtAuthGuard)    
    @Get('empleados')
    async obtenerTodosLosEmpleados() {
        return this.usuarioServicio.obtenerTodosLosEmpleados();
    }

    @UseGuards(JwtAuthGuard)
@Get('con-tratamientos')
async obtenerCitasConTratamientos() {
    return this.usuarioServicio.obtenerCitasConTratamientos();
}

@UseGuards(JwtAuthGuard)
@Get('mis-pacientes/:idVeterinario')
async obtenerMisPacientes(@Param('idVeterinario') idVeterinario: string) {
  return this.usuarioServicio.obtenerPacientesPorVeterinario(Number(idVeterinario));
}

    // =========================================================================
    // 3. RUTAS CON PARÁMETROS ESPECÍFICOS
    // =========================================================================
    @Get('clientes/:id')
    async obtClientePorId(@Param('id', ParseIntPipe) id: number) {
        return this.usuarioServicio.obtClientePorId(id);
    }

    // =========================================================================
    // 4. RUTAS GENÉRICAS / CAJÓN DE SASTRE (Siempre al final)
    // =========================================================================
    
    // El Get base se movió aquí abajo para que no se coma a 'empleados'
    @Get()
    async obtTodo(){
        return this.usuarioServicio.obtTodo();
    }

    @Get(':id')
    async obtUsuario(@Param('id', ParseIntPipe) id: number){
        return this.usuarioServicio.obtUsuario(id);
    }

    // =========================================================================
    // 5. MÉTODOS POST
    // =========================================================================
    @Post()
    async inserta(@Body() nuevo: any){
        return this.usuarioServicio.inserta(nuevo);
    }

    @Post('login')
    async login(@Body() credenciales: any) {
        return this.usuarioServicio.login(credenciales);
    }
        
    @Post('recuperar-password')
    async solicitarRecuperacion(@Body('correo') correo: string) {
        return this.usuarioServicio.solicitarRecuperacion(correo);
    }

    @Post('reset-password')
    async restablecerContrasenia(@Body('token') token: string, @Body('contrasenia') contrasenia: string) {
        return this.usuarioServicio.restablecerContrasenia(token, contrasenia);
    }
}