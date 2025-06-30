import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../common/schemas/user.schema';

// Interfaz para la respuesta paginada de usuarios (sin password)
export interface PaginatedUserResponse {
  data: Omit<User, 'password'>[]; // Aseguramos que no se incluya el password
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async findAll(): Promise<User[]> { // Podría ser deprecada o para uso interno
    return this.userModel.find().select('-password').exec();
  }

  async findAllPaginated(page: number, limit: number): Promise<PaginatedUserResponse> {
    const skip = (page - 1) * limit;
    // Asumimos que no hay filtros complejos para el conteo total de usuarios para un admin
    const totalItems = await this.userModel.countDocuments().exec();
    const totalPages = Math.ceil(totalItems / limit);

    const data = await this.userModel.find()
      .select('-password') // Excluir contraseña
      .sort({ username: 1 }) // Ordenar por nombre de usuario, por ejemplo
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: data.map(user => { // Mapear para asegurar el tipo Omit<User, 'password'> si es necesario
        const { password, ...userWithoutPassword } = user.toObject(); // .toObject() para plain JS object
        return userWithoutPassword;
      }),
      currentPage: page,
      totalPages,
      totalItems
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    // Verificamos que el usuario exista
    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    // Si se está actualizando la contraseña, la encriptamos
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Actualizamos el usuario
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateUserDto, updatedAt: new Date() },
        { new: true }
      )
      .select('-password')
      .exec();
      
    if (!updatedUser) {
      throw new NotFoundException(`No se pudo actualizar el usuario con ID ${id}`);
    }
      
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
  
  /**
   * Cambia la contraseña de un usuario verificando primero la contraseña actual
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    // Obtenemos el usuario con la contraseña (no usamos select('-password') aquí)
    const user = await this.userModel.findById(id).exec();
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    // Verificamos que la contraseña actual sea correcta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }
    
    // Encriptamos la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizamos la contraseña del usuario
    await this.userModel.updateOne(
      { _id: id },
      { password: hashedPassword, updatedAt: new Date() }
    ).exec();
  }
}
