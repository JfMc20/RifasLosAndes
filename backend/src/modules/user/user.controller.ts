import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, HttpException, HttpStatus, UnauthorizedException, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { UserService, PaginatedUserResponse } from './user.service'; // Importar PaginatedUserResponse
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, UserRole } from '../../common/schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard) // Protegemos todas las rutas de usuarios con autenticación
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedUserResponse> {
    // Solo los administradores pueden listar todos los usuarios
    if (req.user.role !== UserRole.ADMIN) {
      throw new HttpException('No tienes permiso para realizar esta acción', HttpStatus.FORBIDDEN);
    }
    const safeLimit = Math.min(limit, 100);
    return this.userService.findAllPaginated(page, safeLimit);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req: any): Promise<User> {
    // Solo permitimos a los administradores o al mismo usuario ver su información
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== id) {
      throw new HttpException('No tienes permiso para realizar esta acción', HttpStatus.FORBIDDEN);
    }

    return this.userService.findById(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: any, @Req() req: any): Promise<User> {
    // Solo permitimos a los administradores o al mismo usuario actualizar su información
    // Pero solo los administradores pueden cambiar roles
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== id) {
      throw new HttpException('No tienes permiso para realizar esta acción', HttpStatus.FORBIDDEN);
    }

    // Si no es admin y está intentando cambiar el rol, prohibimos la acción
    if (req.user.role !== UserRole.ADMIN && updateUserDto.role) {
      throw new HttpException('No tienes permiso para cambiar el rol de usuario', HttpStatus.FORBIDDEN);
    }

    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: any): Promise<{ success: boolean; message: string }> {
    // Solo los administradores pueden eliminar usuarios
    if (req.user.role !== UserRole.ADMIN) {
      throw new HttpException('No tienes permiso para realizar esta acción', HttpStatus.FORBIDDEN);
    }

    // No permitimos que un administrador se elimine a sí mismo
    if (req.user.sub === id) {
      throw new HttpException('No puedes eliminar tu propia cuenta de administrador', HttpStatus.FORBIDDEN);
    }

    await this.userService.remove(id);
    return {
      success: true,
      message: `Usuario con ID ${id} eliminado correctamente`
    };
  }
  
  @Post(':id/change-password')
  async changePassword(
    @Param('id') id: string, 
    @Body() passwordData: { currentPassword: string; newPassword: string },
    @Req() req: any
  ): Promise<{ success: boolean; message: string }> {
    // Solo permitimos al propio usuario o a un administrador cambiar la contraseña
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== id) {
      throw new HttpException('No tienes permiso para realizar esta acción', HttpStatus.FORBIDDEN);
    }
    
    try {
      await this.userService.changePassword(id, passwordData.currentPassword, passwordData.newPassword);
      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new HttpException('Error al cambiar la contraseña', HttpStatus.BAD_REQUEST);
    }
  }
  
  @Put('profile')
  async updateProfile(@Body() profileData: any, @Req() req: any): Promise<User> {
    // El usuario sólo puede actualizar su propio perfil
    try {
      // Usamos el ID del token JWT para saber qué usuario está actualizando su perfil
      const userId = req.user.sub;
      
      // No permitimos cambiar el rol a través de este endpoint
      if (profileData.role && req.user.role !== UserRole.ADMIN) {
        delete profileData.role;
      }
      
      return this.userService.update(userId, profileData);
    } catch (error) {
      throw new HttpException('Error al actualizar el perfil', HttpStatus.BAD_REQUEST);
    }
  }
}
